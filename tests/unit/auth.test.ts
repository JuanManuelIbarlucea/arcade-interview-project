import { describe, expect, it } from "vitest";

// Set JWT_SECRET before importing auth module
process.env.JWT_SECRET = "test-secret-key-that-is-long-enough-32ch";

import { signToken, verifyToken } from "@/lib/auth";

describe("auth — signToken / verifyToken", () => {
  const payload = { sub: "user_123", email: "test@example.com", name: "Test User" };

  it("signToken returns a JWT string with three segments", async () => {
    const token = await signToken(payload);
    expect(typeof token).toBe("string");
    expect(token.split(".")).toHaveLength(3);
  });

  it("verifyToken returns the original payload for a valid token", async () => {
    const token = await signToken(payload);
    const result = await verifyToken(token);
    expect(result.sub).toBe(payload.sub);
    expect(result.email).toBe(payload.email);
    expect(result.name).toBe(payload.name);
  });

  it("verifyToken throws for a tampered token", async () => {
    const token = await signToken(payload);
    const [header, , sig] = token.split(".");
    const tamperedPayload = btoa(JSON.stringify({ sub: "hacker" }));
    const tampered = `${header}.${tamperedPayload}.${sig}`;
    await expect(verifyToken(tampered)).rejects.toThrow();
  });

  it("verifyToken throws for a completely invalid token string", async () => {
    await expect(verifyToken("not.a.jwt")).rejects.toThrow();
  });

  it("verifyToken throws when JWT_SECRET is wrong", async () => {
    const token = await signToken(payload);

    // Temporarily change secret
    const original = process.env.JWT_SECRET;
    process.env.JWT_SECRET = "a-completely-different-secret-key-32ch";

    await expect(verifyToken(token)).rejects.toThrow();

    process.env.JWT_SECRET = original;
  });
});
