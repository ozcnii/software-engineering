import 'dotenv/config';
import * as bcrypt from 'bcrypt';
import { PrismaClient, UserRole } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const login = (process.env.SEED_ADMIN_LOGIN ?? 'admin').trim().toLowerCase();
  const password = (process.env.SEED_ADMIN_PASSWORD ?? 'admin').trim();

  const existingAdmin = await prisma.user.findUnique({
    where: { login },
  });

  if (existingAdmin) {
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.user.create({
    data: {
      login,
      passwordHash,
      role: UserRole.ADMIN,
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error: unknown) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
