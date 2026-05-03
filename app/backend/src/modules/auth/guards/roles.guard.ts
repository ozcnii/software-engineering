import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';
import { ApiError } from '../../../shared/errors/api-error';
import { PublicUserRole, UsersService } from '../../users/users.service';
import { AUTH_COOKIE_NAME, JwtPayload, RequestWithUser } from '../jwt.types';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext) {
    const requiredRoles = this.reflector.getAllAndOverride<PublicUserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const token = request.cookies?.[AUTH_COOKIE_NAME];

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

    request.user = user;

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    if (!requiredRoles.includes(user.role)) {
      throw ApiError.forbidden();
    }

    return true;
  }
}
