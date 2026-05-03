import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Prisma, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { ApiError } from '../../shared/errors/api-error';
import { PublicUser, UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtPayload } from './jwt.types';

interface AuthResult {
  user: PublicUser;
  token: string;
}

@Injectable()
export class AuthService {
  private readonly passwordSaltRounds = 10;

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async registerPlayer(dto: RegisterDto): Promise<AuthResult> {
    const existingUser = await this.usersService.findByLogin(dto.login);

    if (existingUser) {
      throw ApiError.loginAlreadyExists();
    }

    const passwordHash = await this.hashPassword(dto.password);
    const user = await this.createPlayerUser({
      login: dto.login,
      passwordHash,
    });

    return {
      user,
      token: await this.createToken(user),
    };
  }

  async login(dto: LoginDto): Promise<AuthResult> {
    const userRecord = await this.usersService.findByLogin(dto.login);

    if (!userRecord) {
      throw ApiError.invalidCredentials();
    }

    const passwordMatches = await bcrypt.compare(dto.password, userRecord.passwordHash);

    if (!passwordMatches) {
      throw ApiError.invalidCredentials();
    }

    const user = this.usersService.toPublicUser(userRecord);

    return {
      user,
      token: await this.createToken(user),
    };
  }

  async getCurrentUser(token?: string): Promise<PublicUser> {
    if (!token) {
      throw ApiError.unauthorized();
    }

    let payload: JwtPayload;

    try {
      payload = await this.jwtService.verifyAsync<JwtPayload>(token);
    } catch {
      throw ApiError.unauthorized();
    }

    const user = await this.usersService.findById(payload.sub);

    if (!user) {
      throw ApiError.unauthorized();
    }

    return user;
  }

  private hashPassword(password: string) {
    return bcrypt.hash(password, this.passwordSaltRounds);
  }

  private async createPlayerUser(input: { login: string; passwordHash: string }) {
    try {
      return await this.usersService.createUser({
        login: input.login,
        passwordHash: input.passwordHash,
        role: UserRole.PLAYER,
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw ApiError.loginAlreadyExists();
      }

      throw error;
    }
  }

  private createToken(user: PublicUser) {
    const payload: JwtPayload = {
      sub: user.id,
      login: user.login,
      role: user.role,
    };

    return this.jwtService.signAsync(payload);
  }
}
