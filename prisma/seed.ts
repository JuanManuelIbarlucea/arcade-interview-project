import bcrypt from "bcryptjs";
import { prisma } from "../src/lib/prisma";

async function main() {
  console.log("Seeding database...");

  const passwordHash = await bcrypt.hash("password123", 12);

  // Wrap all seed operations in a transaction for atomicity — if any upsert
  // or insert fails the entire seed is rolled back to a clean state.
  await prisma.$transaction(async (tx) => {
    // Create Alice (the referrer)
    const alice = await tx.user.upsert({
      where: { email: "alice@example.com" },
      update: {},
      create: {
        email: "alice@example.com",
        name: "Alice Johnson",
        passwordHash,
        referralCode: "ALICE001",
      },
      select: { id: true },
    });

    // Create Bob (referred by Alice)
    const bob = await tx.user.upsert({
      where: { email: "bob@example.com" },
      update: {},
      create: {
        email: "bob@example.com",
        name: "Bob Smith",
        passwordHash,
        referralCode: "BOB00001",
        referredById: alice.id,
      },
      select: { id: true },
    });

    // Create Carol (referred by Alice)
    await tx.user.upsert({
      where: { email: "carol@example.com" },
      update: {},
      create: {
        email: "carol@example.com",
        name: "Carol Williams",
        passwordHash,
        referralCode: "CAROL001",
        referredById: alice.id,
      },
      select: { id: true },
    });

    // Create Dave (referred by Bob)
    await tx.user.upsert({
      where: { email: "dave@example.com" },
      update: {},
      create: {
        email: "dave@example.com",
        name: "Dave Brown",
        passwordHash,
        referralCode: "DAVE0001",
        referredById: bob.id,
      },
      select: { id: true },
    });

    // Add some referral clicks for Alice (3 clicks, 2 converted = ~66.7% rate)
    await tx.referralClick.createMany({
      data: [
        { userId: alice.id, ip: "192.168.1.1" },
        { userId: alice.id, ip: "192.168.1.2" },
        { userId: alice.id, ip: "192.168.1.3" },
      ],
      skipDuplicates: true,
    });

    // Add 1 click for Bob
    await tx.referralClick.createMany({
      data: [{ userId: bob.id, ip: "10.0.0.1" }],
      skipDuplicates: true,
    });
  });

  console.log("Seed complete!");
  console.log("Demo accounts (password: password123):");
  console.log("  alice@example.com - has 2 referrals, 3 clicks");
  console.log("  bob@example.com   - has 1 referral, 1 click");
  console.log("  carol@example.com - no referrals");
  console.log("  dave@example.com  - no referrals");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
