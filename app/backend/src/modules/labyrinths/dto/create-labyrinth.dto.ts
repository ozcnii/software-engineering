import { Transform, Type } from 'class-transformer';
import { IsArray, IsIn, IsInt, IsString, Max, Min } from 'class-validator';
import {
  ENTRY_MODES,
  GENERATION_ALGORITHMS,
  LABYRINTH_THEMES,
  EntryModeValue,
  GenerationAlgorithmValue,
  LabyrinthThemeValue,
} from '../domain/maze-types';

export class CreateLabyrinthDto {
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString({ message: 'Название лабиринта обязательно' })
  name!: string;

  @Type(() => Number)
  @IsInt({ message: 'Ширина должна быть целым числом' })
  @Min(7, { message: 'Ширина должна быть не меньше 7' })
  @Max(25, { message: 'Ширина должна быть не больше 25' })
  width!: number;

  @Type(() => Number)
  @IsInt({ message: 'Высота должна быть целым числом' })
  @Min(7, { message: 'Высота должна быть не меньше 7' })
  @Max(25, { message: 'Высота должна быть не больше 25' })
  height!: number;

  @IsIn(LABYRINTH_THEMES, { message: 'Некорректная тема лабиринта' })
  theme!: LabyrinthThemeValue;

  @IsIn(GENERATION_ALGORITHMS, { message: 'Некорректный алгоритм генерации' })
  generationAlgorithm!: GenerationAlgorithmValue;

  @IsIn(ENTRY_MODES, { message: 'Некорректный режим входа и выхода' })
  entryMode!: EntryModeValue;

  @IsArray({ message: 'Сетка лабиринта должна быть массивом' })
  grid!: unknown[];
}
