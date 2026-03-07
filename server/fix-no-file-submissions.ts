import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const result = await prisma.submission.updateMany({
        where: {
            status: 'PENDING',
            Event: { requireFile: false },
        },
        data: {
            status: 'SUBMITTED',
            submittedAt: new Date(),
        },
    });

    console.log(`✅ Fixed ${result.count} submissions (PENDING → SUBMITTED for requireFile=false events)`);
}

main()
    .then(() => prisma.$disconnect())
    .catch((e) => {
        console.error(e);
        prisma.$disconnect();
        process.exit(1);
    });
