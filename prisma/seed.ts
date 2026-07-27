import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Ensures the single app user exists. No sample cards —
 * the collection starts empty and grows from real uploads.
 */
async function main() {
  const user = await prisma.user.upsert({
    where: { email: "demo@cardfolio.app" },
    update: {},
    create: {
      email: "demo@cardfolio.app",
      name: "Collector",
    },
  });

  const deleted = await prisma.card.deleteMany({
    where: { userId: user.id },
  });

  console.log(
    `Database ready. User ${user.email}. Cleared ${deleted.count} card(s). Collection is empty.`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
