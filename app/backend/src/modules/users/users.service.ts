import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient, User, UserRole } from '@prisma/client';

export type PublicUserRole = 'admin' | 'player';

export interface PublicUser {
  id: string;
  login: string;
  role: PublicUserRole;
}

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

  toPublicUser(user: User): PublicUser {
    return {
      id: user.id,
      login: user.login,
      role: user.role === UserRole.ADMIN ? 'admin' : 'player',
    };
  }
}
