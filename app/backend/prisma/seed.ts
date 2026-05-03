import 'dotenv/config';
import * as bcrypt from 'bcrypt';
import {
  EntryMode,
  GenerationAlgorithm,
  LabyrinthTheme,
  Prisma,
  PrismaClient,
  UserRole,
} from '@prisma/client';
import { DEMO_LABYRINTHS } from '../src/modules/labyrinths/fixtures/demo-labyrinths';

const prisma = new PrismaClient();

async function main() {
  const login = (process.env.SEED_ADMIN_LOGIN ?? 'admin').trim().toLowerCase();
  const password = (process.env.SEED_ADMIN_PASSWORD ?? 'admin').trim();

  const existingAdmin = await prisma.user.findUnique({
    where: { login },
  });

  const admin =
    existingAdmin ??
    (await prisma.user.create({
      data: {
        login,
        passwordHash: await bcrypt.hash(password, 10),
        role: UserRole.ADMIN,
      },
    }));

  for (const demo of DEMO_LABYRINTHS) {
    const existingDemo = await prisma.labyrinth.findFirst({
      where: {
        name: demo.name,
      },
    });

    if (existingDemo) {
      continue;
    }

    await prisma.labyrinth.create({
      data: {
        name: demo.name,
        width: demo.width,
        height: demo.height,
        theme: themeMap[demo.theme],
        generationAlgorithm: generationAlgorithmMap[demo.generationAlgorithm],
        entryMode: entryModeMap[demo.entryMode],
        grid: demo.grid as Prisma.InputJsonValue,
        createdById: admin.id,
      },
    });
  }
}

const themeMap = {
  winter: LabyrinthTheme.WINTER,
  summer: LabyrinthTheme.SUMMER,
  autumn: LabyrinthTheme.AUTUMN,
  spring: LabyrinthTheme.SPRING,
};

const generationAlgorithmMap = {
  prim: GenerationAlgorithm.PRIM,
  kruskal: GenerationAlgorithm.KRUSKAL,
};

const entryModeMap = {
  auto: EntryMode.AUTO,
  manual: EntryMode.MANUAL,
};

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error: unknown) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
