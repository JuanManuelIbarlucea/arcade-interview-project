import { generateReferralCode } from "@/lib/referral";
import { describe, expect, it } from "vitest";

describe("generateReferralCode", () => {
  it("returns a string of exactly 8 characters", () => {
    const code = generateReferralCode();
    expect(code).toHaveLength(8);
  });

  it("only contains alphanumeric characters [0-9A-Z]", () => {
    const code = generateReferralCode();
    expect(code).toMatch(/^[0-9A-Z]{8}$/);
  });

  it("generates unique codes across 1000 calls", () => {
    const codes = new Set<string>();
    for (let i = 0; i < 1000; i++) {
      codes.add(generateReferralCode());
    }
    // With 36^8 ≈ 2.8T possibilities, the probability of ANY collision
    // in 1000 draws is vanishingly small (≈ 1.8e-7). If this fails,
    // the RNG is broken, not unlucky.
    expect(codes.size).toBe(1000);
  });

  it("generates non-empty codes", () => {
    for (let i = 0; i < 10; i++) {
      expect(generateReferralCode()).toBeTruthy();
    }
  });
});
