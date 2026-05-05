import {
  assertIntegrityGrid,
  findEntryExit,
} from './grid-validation';
import { Coordinate, EntryExitPair, MazeGrid } from './maze-types';

export class Maze {
  constructor(
    readonly width: number,
    readonly height: number,
    private readonly cells: MazeGrid,
  ) {}

  static fromGenerated(width: number, height: number, cells: MazeGrid) {
    return new Maze(width, height, cells);
  }

  static fromPersisted(width: number, height: number, grid: unknown) {
    const pair = assertIntegrityGrid(grid, width, height);

    if (!pair) {
      return null;
    }

    return new Maze(width, height, grid as MazeGrid);
  }

  get grid() {
    return this.cells;
  }

  get entryExit() {
    return findEntryExit(this.cells);
  }

  placeAutoEntryExit() {
    const entryCandidates = this.collectEntryCandidates();
    const exitCandidates = this.collectExitCandidates();
    const entry = this.choose(entryCandidates);
    const exit = this.choose(exitCandidates);

    this.cells[entry.row][entry.col] = 'entry';
    this.cells[exit.row][exit.col] = 'exit';

    return { entry, exit };
  }

  requireEntryExit(): EntryExitPair {
    const pair = this.entryExit;

    if (!pair) {
      throw new Error('Maze entry and exit are missing');
    }

    return pair;
  }

  private collectEntryCandidates() {
    const candidates: Coordinate[] = [];

    for (let col = 1; col < this.cells[0].length - 1; col += 2) {
      if (this.cells[1][col] === 'path') {
        candidates.push({ row: 0, col });
      }
    }

    for (let row = 1; row < this.height - 1; row += 2) {
      if (this.cells[row][1] === 'path') {
        candidates.push({ row, col: 0 });
      }
    }

    return candidates;
  }

  private collectExitCandidates() {
    const candidates: Coordinate[] = [];

    for (let col = 1; col < this.width - 1; col += 2) {
      if (this.cells[this.height - 2][col] === 'path') {
        candidates.push({ row: this.height - 1, col });
      }
    }

    for (let row = 1; row < this.height - 1; row += 2) {
      if (this.cells[row][this.width - 2] === 'path') {
        candidates.push({ row, col: this.width - 1 });
      }
    }

    return candidates;
  }

  private choose<T>(items: T[]) {
    return items[Math.floor(Math.random() * items.length)];
  }
}
