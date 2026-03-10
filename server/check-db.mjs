import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    console.log('=== ProjectAdvisor records ===');
    const pas = await prisma.projectAdvisor.findMany({
        include: {
            Project: { select: { projectname: true, status: true } },
            Users: { select: { users_id: true, firstname: true, lastname: true, role: true } },
        },
    });
    console.table(pas.map(pa => ({
        projectAdvisor_id: pa.projectAdvisor_id,
        project_id: pa.project_id,
        projectname: pa.Project?.projectname,
        project_status: pa.Project?.status,
        advisor_id: pa.advisor_id,
        advisor_name: `${pa.Users?.firstname} ${pa.Users?.lastname}`,
        advisor_role: pa.advisor_role,
        pa_status: pa.status,
    })));

    console.log('\n=== Projects with status ===');
    const projects = await prisma.project.findMany({
        select: { project_id: true, projectname: true, status: true, team_id: true }
    });
    console.table(projects);
}

main().catch(console.error).finally(() => prisma.$disconnect());
