import { hashPassword, verifyPassword } from "@/lib/password";
import { describe, expect, it } from "vitest";

describe("password — hashPassword / verifyPassword", () => {
  it("hashPassword returns a bcrypt hash string", async () => {
    const hash = await hashPassword("mypassword");
    expect(typeof hash).toBe("string");
    // bcrypt hashes start with $2a$ or $2b$ depending on implementation
    expect(hash).toMatch(/^\$2[ab]\$/);
  });

  it("hashPassword produces different hashes for the same password (salting)", async () => {
    const hash1 = await hashPassword("samepassword");
    const hash2 = await hashPassword("samepassword");
    expect(hash1).not.toBe(hash2);
  });

  it("verifyPassword returns true for the correct password", async () => {
    const hash = await hashPassword("correct-horse-battery-staple");
    const result = await verifyPassword("correct-horse-battery-staple", hash);
    expect(result).toBe(true);
  });

  it("verifyPassword returns false for an incorrect password", async () => {
    const hash = await hashPassword("correct-password");
    const result = await verifyPassword("wrong-password", hash);
    expect(result).toBe(false);
  });

  it("verifyPassword returns false for an empty string against a real hash", async () => {
    const hash = await hashPassword("somepassword");
    const result = await verifyPassword("", hash);
    expect(result).toBe(false);
  });
});
