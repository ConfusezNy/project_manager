import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

/**
 * Roles Guard — ตรวจสอบ role ของ user
 *
 * ต้องใช้คู่กับ JwtAuthGuard เสมอ (เพราะต้องมี user ก่อน):
 * @UseGuards(JwtAuthGuard, RolesGuard)
 * @Roles('ADMIN')
 */
@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) { }

    canActivate(context: ExecutionContext): boolean {
        // อ่าน roles จาก @Roles() decorator
        const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        // ถ้าไม่ได้กำหนด @Roles() → อนุญาตทุก role
        if (!requiredRoles) {
            return true;
        }

        // เทียบ role ของ user กับ roles ที่กำหนด
        const { user } = context.switchToHttp().getRequest();
        return requiredRoles.includes(user.role);
    }
}
