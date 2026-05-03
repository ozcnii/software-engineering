-- CreateEnum
CREATE TYPE "LabyrinthTheme" AS ENUM ('WINTER', 'SUMMER', 'AUTUMN', 'SPRING');

-- CreateEnum
CREATE TYPE "GenerationAlgorithm" AS ENUM ('PRIM', 'KRUSKAL');

-- CreateEnum
CREATE TYPE "EntryMode" AS ENUM ('AUTO', 'MANUAL');

-- CreateTable
CREATE TABLE "Labyrinth" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "width" INTEGER NOT NULL,
    "height" INTEGER NOT NULL,
    "theme" "LabyrinthTheme" NOT NULL,
    "generationAlgorithm" "GenerationAlgorithm" NOT NULL,
    "entryMode" "EntryMode" NOT NULL,
    "grid" JSONB NOT NULL,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Labyrinth_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Labyrinth_createdById_idx" ON "Labyrinth"("createdById");

-- CreateIndex
CREATE INDEX "Labyrinth_deletedAt_createdAt_id_idx" ON "Labyrinth"("deletedAt", "createdAt", "id");

-- CreateIndex
CREATE UNIQUE INDEX labyrinths_active_name_unique
ON "Labyrinth" (lower("name"))
WHERE "deletedAt" IS NULL;

-- AddForeignKey
ALTER TABLE "Labyrinth" ADD CONSTRAINT "Labyrinth_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
