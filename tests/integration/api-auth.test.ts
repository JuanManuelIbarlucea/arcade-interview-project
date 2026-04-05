import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

const cookieJar = new Map<string, string>();

vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: (name: string) => {
      const value = cookieJar.get(name);
      return value !== undefined ? { name, value } : undefined;
    },
    set: (name: string, value: string) => {
      cookieJar.set(name, value);
    },
    delete: (name: string) => {
      cookieJar.delete(name);
    },
    has: (name: string) => cookieJar.has(name),
  }),
}));

import { POST as signinPost } from "@/app/api/auth/signin/route";
import { POST as signupPost } from "@/app/api/auth/signup/route";
import { prisma } from "@/lib/prisma";
import { SESSION_COOKIE } from "@/lib/session";
import { intTestEmail, wipeIntTestUsers } from "./test-db";
import { NextRequest } from "next/server";

function jsonRequest(url: string, body: unknown): NextRequest {
  return new NextRequest(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("auth API (database)", () => {
  beforeAll(() => {
    if (!process.env.DATABASE_URL) {
      throw new Error("Integration tests require DATABASE_URL (e.g. in .env)");
    }
    if (!process.env.JWT_SECRET) {
      throw new Error("Integration tests require JWT_SECRET (e.g. in .env)");
    }
  });

  afterEach(async () => {
    cookieJar.clear();
    await wipeIntTestUsers();
  });

  describe("POST /api/auth/signup", () => {
    it("creates a user and returns 201 with session cookie", async () => {
      const email = intTestEmail("signup-ok");
      const res = await signupPost(
        jsonRequest("http://localhost/api/auth/signup", {
          email,
          name: "Integration User",
          password: "password123",
        })
      );

      expect(res.status).toBe(201);
      const body = (await res.json()) as { user: { email: string; referralCode: string } };
      expect(body.user.email).toBe(email.toLowerCase());
      expect(body.user.referralCode).toMatch(/^[0-9A-Z]{8}$/);

      const stored = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
      expect(stored).not.toBeNull();
      expect(stored?.name).toBe("Integration User");
      expect(stored?.referredById).toBeNull();

      const session = cookieJar.get(SESSION_COOKIE);
      expect(session).toBeTruthy();
    });

    it("returns 409 when email already exists", async () => {
      const email = intTestEmail("signup-dup");
      const first = await signupPost(
        jsonRequest("http://localhost/api/auth/signup", {
          email,
          name: "First",
          password: "password123",
        })
      );
      expect(first.status).toBe(201);

      const second = await signupPost(
        jsonRequest("http://localhost/api/auth/signup", {
          email,
          name: "Second",
          password: "password123",
        })
      );
      expect(second.status).toBe(409);
      const err = (await second.json()) as { error: string };
      expect(err.error).toContain("already exists");
    });

    it("returns 422 for invalid payload", async () => {
      const res = await signupPost(
        jsonRequest("http://localhost/api/auth/signup", {
          email: "not-an-email",
          name: "Ab",
          password: "short",
        })
      );
      expect(res.status).toBe(422);
    });
  });

  describe("POST /api/auth/signin", () => {
    it("returns 200 and sets session when credentials are valid", async () => {
      const email = intTestEmail("signin-ok");
      const password = "correct-password-123";
      const signup = await signupPost(
        jsonRequest("http://localhost/api/auth/signup", {
          email,
          name: "Signin Target",
          password,
        })
      );
      expect(signup.status).toBe(201);
      cookieJar.clear();

      const res = await signinPost(
        jsonRequest("http://localhost/api/auth/signin", { email, password })
      );
      expect(res.status).toBe(200);
      const body = (await res.json()) as { user: { email: string } };
      expect(body.user.email).toBe(email.toLowerCase());
      expect(cookieJar.get(SESSION_COOKIE)).toBeTruthy();
    });

    it("returns 401 for wrong password", async () => {
      const email = intTestEmail("signin-bad-pass");
      await signupPost(
        jsonRequest("http://localhost/api/auth/signup", {
          email,
          name: "User",
          password: "right-password-12",
        })
      );

      const res = await signinPost(
        jsonRequest("http://localhost/api/auth/signin", {
          email,
          password: "wrong-password-12",
        })
      );
      expect(res.status).toBe(401);
    });

    it("returns 401 for unknown email", async () => {
      const res = await signinPost(
        jsonRequest("http://localhost/api/auth/signin", {
          email: intTestEmail("nobody"),
          password: "any-password-12",
        })
      );
      expect(res.status).toBe(401);
    });
  });

  describe("referral attribution", () => {
    it("sets referredById when refCode is sent in the body", async () => {
      const referrerEmail = intTestEmail("referrer");
      const signupReferrer = await signupPost(
        jsonRequest("http://localhost/api/auth/signup", {
          email: referrerEmail,
          name: "Referrer",
          password: "password123",
        })
      );
      expect(signupReferrer.status).toBe(201);
      const referrerJson = (await signupReferrer.json()) as {
        user: { id: string; referralCode: string };
      };
      const refCode = referrerJson.user.referralCode;

      const newEmail = intTestEmail("referred");
      const signupNew = await signupPost(
        jsonRequest("http://localhost/api/auth/signup", {
          email: newEmail,
          name: "Referred",
          password: "password123",
          refCode,
        })
      );
      expect(signupNew.status).toBe(201);

      const referred = await prisma.user.findUnique({
        where: { email: newEmail.toLowerCase() },
      });
      expect(referred?.referredById).toBe(referrerJson.user.id);
    });
  });
});
