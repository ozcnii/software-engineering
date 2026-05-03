import { SetMetadata } from '@nestjs/common';
import type { PublicUserRole } from '../../users/users.service';

export const ROLES_KEY = 'roles';

export const Roles = (...roles: PublicUserRole[]) => SetMetadata(ROLES_KEY, roles);
