import { prisma } from './prisma';

export function getDefaultAccount(userId: string) {
  return prisma.account.findFirst({
    where: { userId },
    orderBy: { createdAt: 'asc' },
  });
}
