import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient, type User as PrismaUser, UserRole } from '@prisma/client';
import type {
  User as SharedUser,
  UserRole as SharedUserRole,
} from '@labyrinth/shared/types/domain';

export type PublicUserRole = SharedUserRole;

export type PublicUser = SharedUser;

@Injectable()
export class UsersService implements OnModuleDestroy {
  private readonly prisma = new PrismaClient();

  async onModuleDestroy() {
    await this.prisma.$disconnect();
  }

  async createUser(input: { login: string; passwordHash: string; role: UserRole }) {
    const user = await this.prisma.user.create({
      data: {
        login: input.login,
        passwordHash: input.passwordHash,
        role: input.role,
      },
    });

    return this.toPublicUser(user);
  }

  async findByLogin(login: string) {
    return this.prisma.user.findUnique({
      where: { login },
    });
  }

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    return user ? this.toPublicUser(user) : null;
  }

  toPublicUser(user: PrismaUser): PublicUser {
    return {
      id: user.id,
      login: user.login,
      role: user.role === UserRole.ADMIN ? 'admin' : 'player',
    };
  }
}
