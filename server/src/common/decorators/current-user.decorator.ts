import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * @CurrentUser() decorator
 * ดึงข้อมูล user จาก JWT payload ที่ Passport decode มาให้
 *
 * ใช้แบบนี้:
 * @Get('my-team')
 * async getMyTeam(@CurrentUser() user: JwtPayload) {
 *   return this.teamsService.getMyTeam(user.users_id);
 * }
 */
export const CurrentUser = createParamDecorator(
    (data: string | undefined, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest();
        const user = request.user;

        // ถ้าระบุ field → return เฉพาะ field นั้น เช่น @CurrentUser('users_id')
        return data ? user?.[data] : user;
    },
);
