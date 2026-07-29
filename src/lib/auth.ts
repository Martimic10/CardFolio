import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export class UnauthorizedError extends Error {
  constructor(message = "Unauthorized") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

/**
 * Resolve the signed-in Clerk user to our Postgres User row (upsert on first sign-in).
 */
export async function getAppUser() {
  const { userId } = await auth();
  if (!userId) {
    throw new UnauthorizedError();
  }

  const clerkUser = await currentUser();
  const email =
    clerkUser?.primaryEmailAddress?.emailAddress ??
    clerkUser?.emailAddresses[0]?.emailAddress ??
    `${userId}@users.cardfolio.app`;
  const name =
    [clerkUser?.firstName, clerkUser?.lastName].filter(Boolean).join(" ") ||
    clerkUser?.username ||
    null;

  const byClerk = await prisma.user.findUnique({
    where: { clerkUserId: userId },
  });
  if (byClerk) {
    return prisma.user.update({
      where: { id: byClerk.id },
      data: {
        email,
        name: name ?? byClerk.name,
      },
    });
  }

  const byEmail = await prisma.user.findUnique({ where: { email } });
  if (byEmail) {
    return prisma.user.update({
      where: { id: byEmail.id },
      data: {
        clerkUserId: userId,
        name: name ?? byEmail.name,
      },
    });
  }

  return prisma.user.create({
    data: {
      clerkUserId: userId,
      email,
      name,
      plan: "free",
    },
  });
}

export async function requireAppUser() {
  try {
    return await getAppUser();
  } catch (error) {
    if (error instanceof UnauthorizedError) throw error;
    throw error;
  }
}
