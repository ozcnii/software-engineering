import { IsIn } from 'class-validator';
import { SOLVING_ALGORITHMS, SolvingAlgorithmValue } from '../domain/maze-types';

export class SolveLabyrinthDto {
  @IsIn(SOLVING_ALGORITHMS, { message: 'Invalid solving algorithm' })
  algorithm!: SolvingAlgorithmValue;
}
