import { Injectable } from '@nestjs/common';
import { ApiError } from '../../shared/errors/api-error';
import { Coordinate, MazeGrid, SolvingAlgorithmValue } from '../labyrinths/domain/maze-types';
import { solveBfs } from './domain/bfs.solver';
import { solveDfs } from './domain/dfs.solver';

@Injectable()
export class SolvingService {
  solve(
    algorithm: SolvingAlgorithmValue,
    grid: MazeGrid,
    entry: Coordinate,
    exit: Coordinate,
  ) {
    const path =
      algorithm === 'bfs'
        ? solveBfs(grid, entry, exit)
        : solveDfs(grid, entry, exit);

    if (!path) {
      throw ApiError.pathNotFound();
    }

    return {
      algorithm,
      path,
      steps: path.length - 1,
    };
  }
}
