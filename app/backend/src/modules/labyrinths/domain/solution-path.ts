import { Coordinate, SolvingAlgorithmValue } from './maze-types';

export class SolutionPath {
  constructor(
    readonly algorithm: SolvingAlgorithmValue,
    readonly path: Coordinate[],
  ) {}

  get steps() {
    return this.path.length - 1;
  }

  toResponse() {
    return {
      algorithm: this.algorithm,
      path: this.path,
      steps: this.steps,
    };
  }
}
