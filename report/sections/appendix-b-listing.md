## ПРИЛОЖЕНИЕ Б

### Листинг модулей программы

В настоящем приложении приведён исходный код модулей, реализующих основные алгоритмы обработки данных системы «Лабиринт»: алгоритмы генерации лабиринта методом Прима и методом Краскала, волновой алгоритм поиска пути и алгоритм прохождения методом правой руки. Листинги соответствуют схемам алгоритмов, приведённым в разделе 2.6 настоящей пояснительной записки. Исходный код написан на языке TypeScript и расположен в каталоге `app/backend/src/modules/labyrinths/domain/algorithms/` серверной части системы.

#### Б.1 Модуль `prim.generator.ts` – генерация лабиринта методом Прима

Функция `generatePrimMaze` реализует основной поток алгоритма, схема которого приведена в подразделе 2.6.1. Вызов `createWalledGrid` соответствует этапу 1 (инициализация сетки лабиринта), вызовы `randomRoom`, `markRoom` и `addFrontiers` – этапу 2 (выбор стартовой «комнаты» и формирование начального списка фронтиров), цикл `while (frontiers.length > 0)` – этапу 3 (обработка списка фронтиров с пробиванием стен и добавлением новых фронтиров), возврат сетки `grid` – этапу 4 (завершение работы алгоритма).

```ts
import { Coordinate, MazeGrid } from '../maze-types';

interface Frontier {
  wall: Coordinate;
  target: Coordinate;
}

const DIRECTIONS = [
  { row: -2, col: 0 },
  { row: 2, col: 0 },
  { row: 0, col: -2 },
  { row: 0, col: 2 },
];

export function generatePrimMaze(width: number, height: number): MazeGrid {
  const grid = createWalledGrid(width, height);
  const visited = new Set<string>();
  const frontiers: Frontier[] = [];
  const start = randomRoom(width, height);

  markRoom(grid, visited, start);
  addFrontiers(width, height, start, visited, frontiers);

  while (frontiers.length > 0) {
    const index = randomIndex(frontiers.length);
    const frontier = frontiers.splice(index, 1)[0];
    const targetKey = key(frontier.target);

    if (visited.has(targetKey)) {
      continue;
    }

    grid[frontier.wall.row][frontier.wall.col] = 'path';
    markRoom(grid, visited, frontier.target);
    addFrontiers(width, height, frontier.target, visited, frontiers);
  }

  return grid;
}

function createWalledGrid(width: number, height: number): MazeGrid {
  return Array.from({ length: height }, () =>
    Array.from({ length: width }, () => 'wall'),
  );
}

function randomRoom(width: number, height: number): Coordinate {
  return {
    row: randomOdd(height),
    col: randomOdd(width),
  };
}

function randomOdd(limit: number) {
  const rooms = Math.floor((limit - 1) / 2);

  return randomIndex(rooms) * 2 + 1;
}

function markRoom(grid: MazeGrid, visited: Set<string>, room: Coordinate) {
  visited.add(key(room));
  grid[room.row][room.col] = 'path';
}

function addFrontiers(
  width: number,
  height: number,
  room: Coordinate,
  visited: Set<string>,
  frontiers: Frontier[],
) {
  for (const direction of DIRECTIONS) {
    const target = {
      row: room.row + direction.row,
      col: room.col + direction.col,
    };

    if (!isRoomInside(width, height, target) || visited.has(key(target))) {
      continue;
    }

    frontiers.push({
      wall: {
        row: room.row + direction.row / 2,
        col: room.col + direction.col / 2,
      },
      target,
    });
  }
}

function isRoomInside(width: number, height: number, room: Coordinate) {
  return room.row > 0 && room.col > 0 && room.row < height - 1 && room.col < width - 1;
}

function key(coordinate: Coordinate) {
  return `${coordinate.row}:${coordinate.col}`;
}

function randomIndex(length: number) {
  return Math.floor(Math.random() * length);
}
```

#### Б.2 Модуль `kruskal.generator.ts` – генерация лабиринта методом Краскала

```ts
import { Coordinate, MazeGrid } from '../maze-types';

interface Edge {
  a: Coordinate;
  b: Coordinate;
  wall: Coordinate;
}

export function generateKruskalMaze(width: number, height: number): MazeGrid {
  const grid = createWalledGrid(width, height);
  const rooms = collectRooms(width, height);
  const parent = new Map<string, string>();
  const edges = collectEdges(width, height);

  for (const room of rooms) {
    grid[room.row][room.col] = 'path';
    parent.set(key(room), key(room));
  }

  shuffle(edges);

  for (const edge of edges) {
    const aRoot = find(parent, key(edge.a));
    const bRoot = find(parent, key(edge.b));

    if (aRoot === bRoot) {
      continue;
    }

    parent.set(aRoot, bRoot);
    grid[edge.wall.row][edge.wall.col] = 'path';
  }

  return grid;
}

function createWalledGrid(width: number, height: number): MazeGrid {
  return Array.from({ length: height }, () =>
    Array.from({ length: width }, () => 'wall'),
  );
}

function collectRooms(width: number, height: number) {
  const rooms: Coordinate[] = [];

  for (let row = 1; row < height; row += 2) {
    for (let col = 1; col < width; col += 2) {
      rooms.push({ row, col });
    }
  }

  return rooms;
}

function collectEdges(width: number, height: number) {
  const edges: Edge[] = [];

  for (let row = 1; row < height; row += 2) {
    for (let col = 1; col < width; col += 2) {
      if (col + 2 < width) {
        edges.push({
          a: { row, col },
          b: { row, col: col + 2 },
          wall: { row, col: col + 1 },
        });
      }

      if (row + 2 < height) {
        edges.push({
          a: { row, col },
          b: { row: row + 2, col },
          wall: { row: row + 1, col },
        });
      }
    }
  }

  return edges;
}

function find(parent: Map<string, string>, value: string): string {
  const current = parent.get(value);

  if (!current || current === value) {
    return value;
  }

  const root = find(parent, current);
  parent.set(value, root);

  return root;
}

function shuffle<T>(items: T[]) {
  for (let index = items.length - 1; index > 0; index -= 1) {
    const random = Math.floor(Math.random() * (index + 1));
    const item = items[index];
    items[index] = items[random];
    items[random] = item;
  }
}

function key(coordinate: Coordinate) {
  return `${coordinate.row}:${coordinate.col}`;
}
```

#### Б.3 Модуль `bfs.solver.ts` – волновой алгоритм поиска пути

Функция `solveBfs` реализует основной поток алгоритма, схема которого приведена в подразделе 2.6.2. Инициализация очереди, множества посещённых клеток и карты предков соответствует этапу 1 (инициализация структур данных), цикл `while (queue.length > 0)` с обходом проходимых соседей через `getPassableNeighbors` – этапу 2 (обход клеток лабиринта в ширину), вызов вспомогательной функции `reconstructPath` – этапу 3 (восстановление найденного пути), возврат `null` после опустошения очереди – этапу 4 (обработка случая отсутствия пути).

```ts
import { getPassableNeighbors, key } from '../grid-validation';
import { Coordinate, MazeGrid, sameCoordinate } from '../maze-types';

export function solveBfs(grid: MazeGrid, entry: Coordinate, exit: Coordinate) {
  const queue: Coordinate[] = [entry];
  const visited = new Set<string>([key(entry)]);
  const previous = new Map<string, Coordinate>();

  while (queue.length > 0) {
    const current = queue.shift()!;

    if (sameCoordinate(current, exit)) {
      return reconstructPath(previous, entry, exit);
    }

    for (const next of getPassableNeighbors(grid, current)) {
      const nextKey = key(next);

      if (visited.has(nextKey)) {
        continue;
      }

      visited.add(nextKey);
      previous.set(nextKey, current);
      queue.push(next);
    }
  }

  return null;
}

function reconstructPath(
  previous: Map<string, Coordinate>,
  entry: Coordinate,
  exit: Coordinate,
) {
  const path: Coordinate[] = [exit];
  let current = exit;

  while (!sameCoordinate(current, entry)) {
    const parent = previous.get(key(current));

    if (!parent) {
      return null;
    }

    path.push(parent);
    current = parent;
  }

  return path.reverse();
}
```

#### Б.4 Модуль `right-hand.solver.ts` – алгоритм прохождения методом правой руки

```ts
import { isPassable, key } from '../grid-validation';
import { Coordinate, MazeGrid, sameCoordinate } from '../maze-types';

type Direction = 'up' | 'right' | 'down' | 'left';

const DELTAS: Record<Direction, Coordinate> = {
  up: { row: -1, col: 0 },
  right: { row: 0, col: 1 },
  down: { row: 1, col: 0 },
  left: { row: 0, col: -1 },
};

const RIGHT_TURN: Record<Direction, Direction> = {
  up: 'right',
  right: 'down',
  down: 'left',
  left: 'up',
};

const LEFT_TURN: Record<Direction, Direction> = {
  up: 'left',
  left: 'down',
  down: 'right',
  right: 'up',
};

const BACK_TURN: Record<Direction, Direction> = {
  up: 'down',
  down: 'up',
  left: 'right',
  right: 'left',
};

export function solveRightHand(grid: MazeGrid, entry: Coordinate, exit: Coordinate) {
  let position = entry;
  let direction = directionIntoMaze(grid, entry);
  const path: Coordinate[] = [entry];
  const visitedStates = new Set<string>();

  while (true) {
    if (sameCoordinate(position, exit)) {
      return path;
    }

    const stateKey = `${key(position)}:${direction}`;

    if (visitedStates.has(stateKey)) {
      return null;
    }

    visitedStates.add(stateKey);

    const nextDirection = chooseNextDirection(grid, position, direction);

    if (!nextDirection) {
      return null;
    }

    direction = nextDirection;
    position = move(position, direction);
    path.push(position);
  }
}

function chooseNextDirection(
  grid: MazeGrid,
  position: Coordinate,
  direction: Direction,
): Direction | null {
  const candidates = [
    RIGHT_TURN[direction],
    direction,
    LEFT_TURN[direction],
    BACK_TURN[direction],
  ];

  return (
    candidates.find((candidate) => isPassable(grid, move(position, candidate))) ?? null
  );
}

function directionIntoMaze(grid: MazeGrid, entry: Coordinate): Direction {
  if (entry.row === 0) {
    return 'down';
  }

  if (entry.row === grid.length - 1) {
    return 'up';
  }

  if (entry.col === 0) {
    return 'right';
  }

  return 'left';
}

function move(position: Coordinate, direction: Direction): Coordinate {
  const delta = DELTAS[direction];

  return {
    row: position.row + delta.row,
    col: position.col + delta.col,
  };
}
```

#### Б.5 Вспомогательные модули

Модули алгоритмов, листинги которых приведены выше, опираются на два вспомогательных модуля, расположенных в том же каталоге `app/backend/src/modules/labyrinths/domain/`.

Модуль `maze-types.ts` содержит общие типы данных, используемые во всех алгоритмах: тип координаты клетки `Coordinate` с полями `row` и `col`, тип сетки лабиринта `MazeGrid` как двумерного массива значений `'wall'`, `'path'`, `'entry'` и `'exit'`, а также вспомогательную функцию `sameCoordinate`, проверяющую совпадение двух координат.

Модуль `grid-validation.ts` содержит вспомогательные функции работы с сеткой лабиринта: функцию `key`, формирующую строковый ключ координаты для использования в множествах и словарях, функцию `isPassable`, проверяющую, что заданная клетка находится внутри сетки и является проходом, и функцию `getPassableNeighbors`, возвращающую список проходимых соседних клеток текущей клетки по четырём направлениям.
