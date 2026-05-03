import {
  EntryMode,
  GenerationAlgorithm,
  Labyrinth,
  LabyrinthTheme,
  Prisma,
} from '@prisma/client';
import { ApiError } from '../../shared/errors/api-error';
import { computeDifficulty } from './domain/difficulty';
import { assertIntegrityGrid } from './domain/grid-validation';
import {
  EntryModeValue,
  GenerationAlgorithmValue,
  LabyrinthThemeValue,
  MazeGrid,
} from './domain/maze-types';

export interface LabyrinthListItemResponse {
  id: string;
  name: string;
  width: number;
  height: number;
  theme: LabyrinthThemeValue;
  generationAlgorithm: GenerationAlgorithmValue;
  entryMode: EntryModeValue;
  difficulty: number;
  createdAt: string;
}

export interface LabyrinthDetailResponse extends LabyrinthListItemResponse {
  grid: MazeGrid;
  entry: {
    row: number;
    col: number;
  };
  exit: {
    row: number;
    col: number;
  };
}

export function toLabyrinthListItem(record: Labyrinth): LabyrinthListItemResponse {
  return {
    id: record.id,
    name: record.name,
    width: record.width,
    height: record.height,
    theme: toApiTheme(record.theme),
    generationAlgorithm: toApiGenerationAlgorithm(record.generationAlgorithm),
    entryMode: toApiEntryMode(record.entryMode),
    difficulty: computeDifficulty(record.width, record.height),
    createdAt: record.createdAt.toISOString(),
  };
}

export function toLabyrinthDetail(record: Labyrinth): LabyrinthDetailResponse {
  const pair = assertIntegrityGrid(record.grid, record.width, record.height);

  if (!pair) {
    throw ApiError.dataIntegrity();
  }

  return {
    ...toLabyrinthListItem(record),
    grid: record.grid as MazeGrid,
    entry: pair.entry,
    exit: pair.exit,
  };
}

export function toPrismaTheme(theme: LabyrinthThemeValue) {
  return theme.toUpperCase() as LabyrinthTheme;
}

export function toPrismaGenerationAlgorithm(algorithm: GenerationAlgorithmValue) {
  return algorithm.toUpperCase() as GenerationAlgorithm;
}

export function toPrismaEntryMode(entryMode: EntryModeValue) {
  return entryMode.toUpperCase() as EntryMode;
}

export function gridToJson(grid: MazeGrid): Prisma.InputJsonValue {
  return grid;
}

function toApiTheme(theme: LabyrinthTheme): LabyrinthThemeValue {
  return theme.toLowerCase() as LabyrinthThemeValue;
}

function toApiGenerationAlgorithm(
  algorithm: GenerationAlgorithm,
): GenerationAlgorithmValue {
  return algorithm.toLowerCase() as GenerationAlgorithmValue;
}

function toApiEntryMode(entryMode: EntryMode): EntryModeValue {
  return entryMode.toLowerCase() as EntryModeValue;
}
