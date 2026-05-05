import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';
import { ApiError } from '../../shared/errors/api-error';
import { CreateLabyrinthDto } from './dto/create-labyrinth.dto';
import { GenerateLabyrinthDto } from './dto/generate-labyrinth.dto';
import { SolveLabyrinthDto } from './dto/solve-labyrinth.dto';
import {
  validateGridForPersistence,
  validateOddSize,
} from './domain/grid-validation';
import { LabyrinthGame } from './domain/labyrinth-game';
import { Maze } from './domain/maze';
import { MazeGrid } from './domain/maze-types';
import {
  gridToJson,
  toApiEntryMode,
  toApiGenerationAlgorithm,
  toApiTheme,
  toLabyrinthDetail,
  toLabyrinthListItem,
  toPrismaEntryMode,
  toPrismaGenerationAlgorithm,
  toPrismaTheme,
} from './labyrinth.mapper';

interface ListQuery {
  search?: unknown;
  limit?: unknown;
  cursor?: unknown;
}

interface DecodedCursor {
  createdAt: Date;
  id: string;
}

@Injectable()
export class LabyrinthsService implements OnModuleDestroy {
  private readonly prisma = new PrismaClient();

  async onModuleDestroy() {
    await this.prisma.$disconnect();
  }

  generate(dto: GenerateLabyrinthDto) {
    const sizeResult = validateOddSize(dto.width, dto.height);

    if (!sizeResult.valid) {
      throw ApiError.validation({
        width: sizeResult.message ?? 'Некорректная ширина',
        height: sizeResult.message ?? 'Некорректная высота',
      });
    }

    return LabyrinthGame.generate(dto);
  }

  async create(dto: CreateLabyrinthDto, createdById: string) {
    const name = this.validateName(dto.name);
    const sizeResult = validateOddSize(dto.width, dto.height);

    if (!sizeResult.valid) {
      throw ApiError.validation({
        width: sizeResult.message ?? 'Некорректная ширина',
        height: sizeResult.message ?? 'Некорректная высота',
      });
    }

    const gridResult = validateGridForPersistence(dto.grid, dto.width, dto.height);

    if (!gridResult.valid) {
      throw ApiError.validation({
        grid: gridResult.message ?? 'Некорректная сетка лабиринта',
      });
    }

    await this.assertActiveNameIsUnique(name);

    try {
      const labyrinth = await this.prisma.labyrinth.create({
        data: {
          name,
          width: dto.width,
          height: dto.height,
          theme: toPrismaTheme(dto.theme),
          generationAlgorithm: toPrismaGenerationAlgorithm(dto.generationAlgorithm),
          entryMode: toPrismaEntryMode(dto.entryMode),
          grid: gridToJson(dto.grid as MazeGrid),
          createdById,
        },
      });

      return toLabyrinthDetail(labyrinth);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw ApiError.labyrinthNameExists();
      }

      throw error;
    }
  }

  async list(query: ListQuery) {
    const search = this.parseSearch(query.search);
    const limit = this.parseLimit(query.limit);
    const cursor = this.parseCursor(query.cursor);
    const where = this.buildListWhere(search, cursor);
    const records = await this.prisma.labyrinth.findMany({
      where,
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      take: limit + 1,
    });
    const visibleRecords = records.slice(0, limit);
    const nextCursor =
      records.length > limit
        ? this.encodeCursor(visibleRecords[visibleRecords.length - 1])
        : null;

    return {
      items: visibleRecords.map(toLabyrinthListItem),
      nextCursor,
    };
  }

  async detail(id: string) {
    const labyrinth = await this.findActiveById(id);

    return toLabyrinthDetail(labyrinth);
  }

  async delete(id: string) {
    await this.findActiveById(id);
    await this.prisma.labyrinth.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });
  }

  async solve(id: string, dto: SolveLabyrinthDto) {
    const labyrinth = await this.findActiveById(id);
    const maze = Maze.fromPersisted(labyrinth.width, labyrinth.height, labyrinth.grid);

    if (!maze) {
      throw ApiError.dataIntegrity();
    }

    const game = LabyrinthGame.fromPersisted({
      id: labyrinth.id,
      name: labyrinth.name,
      width: labyrinth.width,
      height: labyrinth.height,
      theme: toApiTheme(labyrinth.theme),
      generationAlgorithm: toApiGenerationAlgorithm(labyrinth.generationAlgorithm),
      entryMode: toApiEntryMode(labyrinth.entryMode),
      maze,
    });

    return game.solve(dto.algorithm);
  }

  private validateName(name: string) {
    if (name.length < 1 || name.length > 40) {
      throw ApiError.validation({
        name: 'Название должно быть от 1 до 40 символов',
      });
    }

    return name;
  }

  private async assertActiveNameIsUnique(name: string) {
    const existing = await this.prisma.labyrinth.findFirst({
      where: {
        deletedAt: null,
        name: {
          equals: name,
          mode: 'insensitive',
        },
      },
    });

    if (existing) {
      throw ApiError.labyrinthNameExists();
    }
  }

  private async findActiveById(id: string) {
    const labyrinth = await this.prisma.labyrinth.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });

    if (!labyrinth) {
      throw ApiError.notFound('Лабиринт не найден');
    }

    return labyrinth;
  }

  private parseSearch(rawSearch: unknown) {
    if (rawSearch === undefined) {
      return undefined;
    }

    if (typeof rawSearch !== 'string') {
      throw ApiError.validation({
        search: 'Поисковый запрос должен быть строкой',
      });
    }

    const search = rawSearch.trim();

    if (search.length === 0) {
      return undefined;
    }

    if (search.length > 40) {
      throw ApiError.validation({
        search: 'Поисковый запрос должен быть не длиннее 40 символов',
      });
    }

    return search;
  }

  private parseLimit(rawLimit: unknown) {
    if (rawLimit === undefined) {
      return 20;
    }

    if (typeof rawLimit !== 'string' || !/^\d+$/.test(rawLimit)) {
      throw ApiError.validation({
        limit: 'Лимит должен быть положительным числом',
      });
    }

    const limit = Number(rawLimit);

    if (limit < 1) {
      throw ApiError.validation({
        limit: 'Лимит должен быть не меньше 1',
      });
    }

    return Math.min(limit, 50);
  }

  private parseCursor(rawCursor: unknown): DecodedCursor | null {
    if (rawCursor === undefined) {
      return null;
    }

    if (typeof rawCursor !== 'string' || rawCursor.trim().length === 0) {
      throw ApiError.validation({
        cursor: 'Некорректный курсор',
      });
    }

    try {
      const parsed = JSON.parse(Buffer.from(rawCursor, 'base64').toString('utf8')) as {
        createdAt?: unknown;
        id?: unknown;
      };
      const createdAt =
        typeof parsed.createdAt === 'string' ? new Date(parsed.createdAt) : null;

      if (
        !createdAt ||
        Number.isNaN(createdAt.getTime()) ||
        typeof parsed.id !== 'string' ||
        parsed.id.length === 0
      ) {
        throw new Error('Некорректные данные курсора');
      }

      return {
        createdAt,
        id: parsed.id,
      };
    } catch {
      throw ApiError.validation({
        cursor: 'Некорректный курсор',
      });
    }
  }

  private buildListWhere(search: string | undefined, cursor: DecodedCursor | null) {
    const filters: Prisma.LabyrinthWhereInput[] = [
      {
        deletedAt: null,
      },
    ];

    if (search) {
      filters.push({
        name: {
          contains: search,
          mode: 'insensitive',
        },
      });
    }

    if (cursor) {
      filters.push({
        OR: [
          {
            createdAt: {
              lt: cursor.createdAt,
            },
          },
          {
            createdAt: cursor.createdAt,
            id: {
              lt: cursor.id,
            },
          },
        ],
      });
    }

    return {
      AND: filters,
    };
  }

  private encodeCursor(record: { createdAt: Date; id: string }) {
    return Buffer.from(
      JSON.stringify({
        createdAt: record.createdAt.toISOString(),
        id: record.id,
      }),
      'utf8',
    ).toString('base64');
  }
}
