import { SetMetadata } from '@nestjs/common';

/**
 * @Roles('ADMIN') หรือ @Roles('ADMIN', 'ADVISOR')
 * กำหนดว่า endpoint นี้เฉพาะ role ไหนเข้าถึงได้
 *
 * ใช้คู่กับ RolesGuard:
 * @UseGuards(JwtAuthGuard, RolesGuard)
 * @Roles('ADMIN')
 * @Post()
 * async create() { ... }
 */
export const ROLES_KEY = 'roles';
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
