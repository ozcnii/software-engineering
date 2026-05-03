import { Type } from 'class-transformer';
import { IsIn, IsInt, Max, Min } from 'class-validator';
import {
  ENTRY_MODES,
  GENERATION_ALGORITHMS,
  LABYRINTH_THEMES,
  EntryModeValue,
  GenerationAlgorithmValue,
  LabyrinthThemeValue,
} from '../domain/maze-types';

export class GenerateLabyrinthDto {
  @Type(() => Number)
  @IsInt({ message: 'Width must be an integer' })
  @Min(7, { message: 'Width must be at least 7' })
  @Max(25, { message: 'Width must be at most 25' })
  width!: number;

  @Type(() => Number)
  @IsInt({ message: 'Height must be an integer' })
  @Min(7, { message: 'Height must be at least 7' })
  @Max(25, { message: 'Height must be at most 25' })
  height!: number;

  @IsIn(LABYRINTH_THEMES, { message: 'Invalid theme' })
  theme!: LabyrinthThemeValue;

  @IsIn(GENERATION_ALGORITHMS, { message: 'Invalid generation algorithm' })
  generationAlgorithm!: GenerationAlgorithmValue;

  @IsIn(ENTRY_MODES, { message: 'Invalid entry mode' })
  entryMode!: EntryModeValue;
}
