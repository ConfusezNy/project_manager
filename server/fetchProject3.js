const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
    try {
        const p = await prisma.project.findUnique({
            where: { project_id: 3 },
            include: { ProjectAdvisor: true }
        });
        console.log("PROJECT DATA:", JSON.stringify(p, null, 2));
    } catch(e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}
main();
