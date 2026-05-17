import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { validateGridForPersistence } from '../src/modules/labyrinths/domain/grid-validation';

const prisma = new PrismaClient();
const shouldApply = process.argv.includes('--apply');

async function main() {
  const labyrinths = await prisma.labyrinth.findMany({
    where: {
      deletedAt: null,
    },
    orderBy: {
      createdAt: 'asc',
    },
  });
  const invalid = labyrinths
    .map((labyrinth) => ({
      id: labyrinth.id,
      name: labyrinth.name,
      reason: validateGridForPersistence(
        labyrinth.grid,
        labyrinth.width,
        labyrinth.height,
      ).message,
    }))
    .filter((item) => item.reason);

  if (invalid.length === 0) {
    console.log('No invalid active labyrinths found');
    return;
  }

  console.table(invalid);

  if (!shouldApply) {
    console.log('Dry run only. Re-run with --apply to soft-delete these records.');
    return;
  }

  await prisma.labyrinth.updateMany({
    where: {
      id: {
        in: invalid.map((item) => item.id),
      },
    },
    data: {
      deletedAt: new Date(),
    },
  });

  console.log(`Soft-deleted ${invalid.length} invalid labyrinths`);
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
