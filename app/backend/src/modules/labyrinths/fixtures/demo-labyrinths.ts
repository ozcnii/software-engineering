import {
  EntryModeValue,
  GenerationAlgorithmValue,
  LabyrinthThemeValue,
  MazeGrid,
} from '../domain/maze-types';

export interface DemoLabyrinthFixture {
  name: string;
  width: number;
  height: number;
  theme: LabyrinthThemeValue;
  generationAlgorithm: GenerationAlgorithmValue;
  entryMode: EntryModeValue;
  grid: MazeGrid;
}

export const DEMO_LABYRINTHS: DemoLabyrinthFixture[] = [
  {
    name: 'Классический 11x11',
    width: 11,
    height: 11,
    theme: 'winter',
    generationAlgorithm: 'prim',
    entryMode: 'auto',
    grid: createSnakeFixture(11, 11),
  },
  {
    name: 'Большой лабиринт',
    width: 21,
    height: 15,
    theme: 'summer',
    generationAlgorithm: 'kruskal',
    entryMode: 'auto',
    grid: createSnakeFixture(21, 15),
  },
  {
    name: 'Тёмные катакомбы',
    width: 15,
    height: 15,
    theme: 'autumn',
    generationAlgorithm: 'prim',
    entryMode: 'auto',
    grid: createSnakeFixture(15, 15),
  },
  {
    name: 'Мини 7x7',
    width: 7,
    height: 7,
    theme: 'spring',
    generationAlgorithm: 'kruskal',
    entryMode: 'auto',
    grid: createSnakeFixture(7, 7),
  },
];

function createSnakeFixture(width: number, height: number): MazeGrid {
  const grid: MazeGrid = Array.from({ length: height }, () =>
    Array.from({ length: width }, () => 'wall'),
  );

  for (let row = 1; row < height - 1; row += 2) {
    for (let col = 1; col < width - 1; col += 1) {
      grid[row][col] = 'path';
    }

    if (row + 2 < height) {
      const connectorCol = row % 4 === 1 ? width - 2 : 1;
      grid[row + 1][connectorCol] = 'path';
    }
  }

  grid[0][1] = 'entry';
  grid[height - 1][width - 2] = 'exit';

  return grid;
}
