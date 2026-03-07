const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const alterSqls = [
        `ALTER TABLE "Users" ALTER COLUMN users_id TYPE VARCHAR(100)`,
        `ALTER TABLE "Attachment" ALTER COLUMN "uploadedBy_id" TYPE VARCHAR(100)`,
        `ALTER TABLE "Comment" ALTER COLUMN user_id TYPE VARCHAR(100)`,
        `ALTER TABLE "Grade" ALTER COLUMN evaluator_id TYPE VARCHAR(100)`,
        `ALTER TABLE "Grade" ALTER COLUMN student_id TYPE VARCHAR(100)`,
        `ALTER TABLE "Notification" ALTER COLUMN user_id TYPE VARCHAR(100)`,
        `ALTER TABLE "Notification" ALTER COLUMN actor_user_id TYPE VARCHAR(100)`,
        `ALTER TABLE "Submission" ALTER COLUMN "approvedBy" TYPE VARCHAR(100)`,
        `ALTER TABLE "Teammember" ALTER COLUMN user_id TYPE VARCHAR(100)`,
        `ALTER TABLE "ProjectAdvisor" ALTER COLUMN advisor_id TYPE VARCHAR(100)`,
        `ALTER TABLE "TaskAssignment" ALTER COLUMN user_id TYPE VARCHAR(100)`,
        `ALTER TABLE "Task" ALTER COLUMN "authorUserId" TYPE VARCHAR(100)`,
        `ALTER TABLE "Section_Enrollment" ALTER COLUMN users_id TYPE VARCHAR(100)`,
    ];
    for (const sql of alterSqls) {
        try {
            await prisma.$executeRawUnsafe(sql);
            console.log('✅', sql.split('\n')[0].trim());
        } catch (e) {
            console.log('⚠️ Skip (already done or error):', e.message);
        }
    }
    await prisma.$disconnect();
    console.log('\n✅ Done! All columns expanded to VARCHAR(100)');
}

main().catch(console.error);
