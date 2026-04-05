const ALPHABET = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const CODE_LENGTH = 8;

/**
 * Generates a cryptographically random referral code.
 * Uses the Web Crypto API (available in Node.js 19+ and all modern browsers).
 * Produces an 8-character code from the alphanumeric alphabet [0-9A-Z].
 * Total keyspace: 36^8 ≈ 2.8 trillion combinations.
 */
export function generateReferralCode(): string {
  const bytes = new Uint8Array(CODE_LENGTH);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => ALPHABET[b % ALPHABET.length])
    .join("");
}
