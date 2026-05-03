import { Injectable } from '@nestjs/common';
import { ApiError } from '../../shared/errors/api-error';
import { GenerateLabyrinthDto } from '../labyrinths/dto/generate-labyrinth.dto';
import { validateOddSize } from '../labyrinths/domain/grid-validation';
import { Coordinate, MazeGrid } from '../labyrinths/domain/maze-types';
import { generateKruskalMaze } from './domain/kruskal.generator';
import { generatePrimMaze } from './domain/prim.generator';

@Injectable()
export class GenerationService {
  generate(dto: GenerateLabyrinthDto) {
    const sizeResult = validateOddSize(dto.width, dto.height);

    if (!sizeResult.valid) {
      throw ApiError.validation({
        width: sizeResult.message ?? 'Invalid width',
        height: sizeResult.message ?? 'Invalid height',
      });
    }

    const grid =
      dto.generationAlgorithm === 'prim'
        ? generatePrimMaze(dto.width, dto.height)
        : generateKruskalMaze(dto.width, dto.height);

    const response = {
      width: dto.width,
      height: dto.height,
      theme: dto.theme,
      generationAlgorithm: dto.generationAlgorithm,
      entryMode: dto.entryMode,
      grid,
    };

    if (dto.entryMode === 'manual') {
      return response;
    }

    const pair = placeAutoEntryExit(grid);

    return {
      ...response,
      grid,
      entry: pair.entry,
      exit: pair.exit,
    };
  }
}

function placeAutoEntryExit(grid: MazeGrid) {
  const entryCandidates = collectEntryCandidates(grid);
  const exitCandidates = collectExitCandidates(grid);
  const entry = choose(entryCandidates);
  const exit = choose(exitCandidates);

  grid[entry.row][entry.col] = 'entry';
  grid[exit.row][exit.col] = 'exit';

  return { entry, exit };
}

function collectEntryCandidates(grid: MazeGrid) {
  const height = grid.length;
  const candidates: Coordinate[] = [];

  for (let col = 1; col < grid[0].length - 1; col += 2) {
    if (grid[1][col] === 'path') {
      candidates.push({ row: 0, col });
    }
  }

  for (let row = 1; row < height - 1; row += 2) {
    if (grid[row][1] === 'path') {
      candidates.push({ row, col: 0 });
    }
  }

  return candidates;
}

function collectExitCandidates(grid: MazeGrid) {
  const height = grid.length;
  const width = grid[0].length;
  const candidates: Coordinate[] = [];

  for (let col = 1; col < width - 1; col += 2) {
    if (grid[height - 2][col] === 'path') {
      candidates.push({ row: height - 1, col });
    }
  }

  for (let row = 1; row < height - 1; row += 2) {
    if (grid[row][width - 2] === 'path') {
      candidates.push({ row, col: width - 1 });
    }
  }

  return candidates;
}

function choose<T>(items: T[]) {
  return items[Math.floor(Math.random() * items.length)];
}
