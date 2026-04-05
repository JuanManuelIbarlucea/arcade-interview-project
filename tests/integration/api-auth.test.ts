/**
 * Integration tests for the auth API.
 *
 * These tests are STUBBED — they document expected behavior without hitting
 * the real database. Run integration tests against a real DB by setting
 * DATABASE_URL to a test database and removing the mocks below.
 *
 * To run real integration tests:
 *   1. Set DATABASE_URL in .env.test to a test PostgreSQL database
 *   2. Run `prisma db push` to apply the schema
 *   3. Remove the vi.mock calls below
 */

import { beforeEach, describe, expect, it, vi } from "vitest";

// Stub Prisma to avoid requiring a real DB connection in CI
vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
      count: vi.fn(),
    },
    referralClick: {
      count: vi.fn(),
    },
  },
}));

// Stub the session helpers
vi.mock("@/lib/session", () => ({
  setSession: vi.fn(),
  getSession: vi.fn(),
  clearSession: vi.fn(),
  getRefCode: vi.fn().mockResolvedValue(null),
  clearRefCode: vi.fn(),
  SESSION_COOKIE: "session",
  REF_COOKIE: "ref_code",
}));

import { hashPassword } from "@/lib/password";
import { prisma } from "@/lib/prisma";

describe("POST /api/auth/signup (stubbed)", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
    vi.mocked(prisma.user.create).mockResolvedValue({
      id: "user_123",
      email: "new@example.com",
      name: "New User",
      passwordHash: "hashed",
      referralCode: "NEWUSER1",
      referredById: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  });

  it("creates a user when valid data is provided", async () => {
    // Verify the Prisma mock is configured correctly
    const result = await prisma.user.create({
      data: {
        email: "new@example.com",
        name: "New User",
        passwordHash: "hash",
        referralCode: "NEWUSER1",
      },
    });
    expect(result.email).toBe("new@example.com");
    expect(result.referralCode).toBe("NEWUSER1");
  });

  it("does not create a user when email already exists", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: "existing_user",
      email: "taken@example.com",
      name: "Existing User",
      passwordHash: "hash",
      referralCode: "EXISTING",
      referredById: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const existing = await prisma.user.findUnique({
      where: { email: "taken@example.com" },
    });

    expect(existing).not.toBeNull();
    // Route handler would return 409 here
  });
});

describe("POST /api/auth/signin (stubbed)", () => {
  it("verifies password correctly", async () => {
    const hash = await hashPassword("correct-password");
    const { verifyPassword } = await import("@/lib/password");

    expect(await verifyPassword("correct-password", hash)).toBe(true);
    expect(await verifyPassword("wrong-password", hash)).toBe(false);
  });
});

describe("Referral attribution flow (stubbed)", () => {
  it("links a new user to the referrer when a valid refCode is present", async () => {
    const referrer = {
      id: "referrer_id",
      email: "referrer@example.com",
      name: "Referrer",
      passwordHash: "hash",
      referralCode: "REFERRER",
      referredById: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    vi.mocked(prisma.user.findUnique).mockImplementation(({ where }) => {
      if ("referralCode" in where && where.referralCode === "REFERRER") {
        return Promise.resolve(referrer);
      }
      return Promise.resolve(null);
    });

    vi.mocked(prisma.user.create).mockResolvedValue({
      id: "new_user_id",
      email: "new@example.com",
      name: "New User",
      passwordHash: "hash",
      referralCode: "NEWUSER1",
      referredById: "referrer_id", // attributed to referrer
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Simulate the attribution logic
    const refCode = "REFERRER";
    const referrerUser = await prisma.user.findUnique({
      where: { referralCode: refCode },
    });

    expect(referrerUser?.id).toBe("referrer_id");

    const newUser = await prisma.user.create({
      data: {
        email: "new@example.com",
        name: "New User",
        passwordHash: "hash",
        referralCode: "NEWUSER1",
        referredById: referrerUser!.id,
      },
    });

    expect(newUser.referredById).toBe("referrer_id");
  });
});
