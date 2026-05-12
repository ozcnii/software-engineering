import { ApiError } from '../../../shared/errors/api-error';
import { solveBfs } from './algorithms/bfs.solver';
import { solveRightHand } from './algorithms/right-hand.solver';
import { generateKruskalMaze } from './algorithms/kruskal.generator';
import { generatePrimMaze } from './algorithms/prim.generator';
import { Maze } from './maze';
import {
  EntryModeValue,
  GenerationAlgorithmValue,
  LabyrinthThemeValue,
  SolvingAlgorithmValue,
} from './maze-types';
import { SolutionPath } from './solution-path';

interface LabyrinthGameParams {
  id?: string;
  name?: string;
  width: number;
  height: number;
  theme: LabyrinthThemeValue;
  generationAlgorithm: GenerationAlgorithmValue;
  entryMode: EntryModeValue;
  maze: Maze;
}

interface LabyrinthGameGenerationParams {
  width: number;
  height: number;
  theme: LabyrinthThemeValue;
  generationAlgorithm: GenerationAlgorithmValue;
  entryMode: EntryModeValue;
}

export class LabyrinthGame {
  private constructor(
    readonly id: string | undefined,
    readonly name: string | undefined,
    readonly width: number,
    readonly height: number,
    readonly theme: LabyrinthThemeValue,
    readonly generationAlgorithm: GenerationAlgorithmValue,
    readonly entryMode: EntryModeValue,
    readonly maze: Maze,
  ) {}

  static generate(params: LabyrinthGameGenerationParams) {
    const grid =
      params.generationAlgorithm === 'prim'
        ? generatePrimMaze(params.width, params.height)
        : generateKruskalMaze(params.width, params.height);
    const maze = Maze.fromGenerated(params.width, params.height, grid);
    const game = new LabyrinthGame(
      undefined,
      undefined,
      params.width,
      params.height,
      params.theme,
      params.generationAlgorithm,
      params.entryMode,
      maze,
    );

    return game.generate();
  }

  static fromPersisted(params: LabyrinthGameParams) {
    return new LabyrinthGame(
      params.id,
      params.name,
      params.width,
      params.height,
      params.theme,
      params.generationAlgorithm,
      params.entryMode,
      params.maze,
    );
  }

  generate() {
    const response = {
      width: this.width,
      height: this.height,
      theme: this.theme,
      generationAlgorithm: this.generationAlgorithm,
      entryMode: this.entryMode,
      grid: this.maze.grid,
    };

    if (this.entryMode === 'manual') {
      return response;
    }

    const pair = this.maze.placeAutoEntryExit();

    return {
      ...response,
      grid: this.maze.grid,
      entry: pair.entry,
      exit: pair.exit,
    };
  }

  solve(algorithm: SolvingAlgorithmValue) {
    const pair = this.maze.requireEntryExit();
    const path =
      algorithm === 'wave'
        ? solveBfs(this.maze.grid, pair.entry, pair.exit)
        : solveRightHand(this.maze.grid, pair.entry, pair.exit);

    if (!path) {
      throw ApiError.pathNotFound();
    }

    return new SolutionPath(algorithm, path).toResponse();
  }
}
