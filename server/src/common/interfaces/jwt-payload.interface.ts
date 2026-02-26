/**
 * JWT Payload class
 * ใช้แทน `any` ใน @CurrentUser() decorator ทุกที่
 * 
 * ⚠️ ต้องเป็น class (ไม่ใช่ interface) เพราะ NestJS ใช้ emitDecoratorMetadata
 * → interface จะถูก erase ตอน compile ทำให้ decorator metadata เสีย
 * 
 * Payload นี้ถูกสร้างจาก JwtStrategy.validate()
 * → ใส่ลงใน request.user โดย Passport.js
 */
export class JwtPayload {
    users_id: string;
    email: string;
    role: 'ADMIN' | 'ADVISOR' | 'STUDENT';
    firstname: string;
    lastname: string;
}
