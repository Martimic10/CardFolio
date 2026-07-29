/**
 * Optional local seed helper. Production users are created on Clerk sign-in.
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log(
    "Seed is a no-op — users are created when they sign in with Clerk.",
  );
  const count = await prisma.user.count();
  console.log(`Users in database: ${count}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
