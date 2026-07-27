/** Single-user mode until auth is wired. All app data belongs to this user in SQLite. */
export const APP_USER_EMAIL = "demo@cardfolio.app";
export const APP_USER_NAME = "Collector";

export async function getDemoUserId() {
  const { prisma } = await import("./prisma");

  const user = await prisma.user.upsert({
    where: { email: APP_USER_EMAIL },
    update: {},
    create: {
      email: APP_USER_EMAIL,
      name: APP_USER_NAME,
    },
  });

  return user.id;
}
