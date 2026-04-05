import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  const passwordHash = await bcrypt.hash("password123", 12);

  // Create Alice (the referrer)
  const alice = await prisma.user.upsert({
    where: { email: "alice@example.com" },
    update: {},
    create: {
      email: "alice@example.com",
      name: "Alice Johnson",
      passwordHash,
      referralCode: "ALICE001",
    },
  });

  // Create Bob (referred by Alice)
  const bob = await prisma.user.upsert({
    where: { email: "bob@example.com" },
    update: {},
    create: {
      email: "bob@example.com",
      name: "Bob Smith",
      passwordHash,
      referralCode: "BOB00001",
      referredById: alice.id,
    },
  });

  // Create Carol (referred by Alice)
  await prisma.user.upsert({
    where: { email: "carol@example.com" },
    update: {},
    create: {
      email: "carol@example.com",
      name: "Carol Williams",
      passwordHash,
      referralCode: "CAROL001",
      referredById: alice.id,
    },
  });

  // Create Dave (referred by Bob)
  await prisma.user.upsert({
    where: { email: "dave@example.com" },
    update: {},
    create: {
      email: "dave@example.com",
      name: "Dave Brown",
      passwordHash,
      referralCode: "DAVE0001",
      referredById: bob.id,
    },
  });

  // Add some referral clicks for Alice (3 clicks, 2 converted = ~66.7% rate)
  await prisma.referralClick.createMany({
    data: [
      { userId: alice.id, ip: "192.168.1.1" },
      { userId: alice.id, ip: "192.168.1.2" },
      { userId: alice.id, ip: "192.168.1.3" },
    ],
    skipDuplicates: true,
  });

  // Add 1 click for Bob
  await prisma.referralClick.createMany({
    data: [{ userId: bob.id, ip: "10.0.0.1" }],
    skipDuplicates: true,
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
