import { IsIn } from 'class-validator';
import { SOLVING_ALGORITHMS, SolvingAlgorithmValue } from '../domain/maze-types';

export class SolveLabyrinthDto {
  @IsIn(SOLVING_ALGORITHMS, { message: 'Некорректный алгоритм поиска пути' })
  algorithm!: SolvingAlgorithmValue;
}
