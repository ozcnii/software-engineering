import type { Request } from 'express';
import type { PublicUser, PublicUserRole } from '../users/users.service';

export const AUTH_COOKIE_NAME = 'labyrinth_auth';

export interface JwtPayload {
  sub: string;
  login: string;
  role: PublicUserRole;
}

export type RequestWithUser = Request & {
  user?: PublicUser;
  cookies: Record<string, string | undefined>;
};
