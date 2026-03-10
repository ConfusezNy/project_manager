const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const password = await bcrypt.hash('cpe12345', 10);

    const advisors = [
        { titles: 'ผศ.', firstName: 'ภัทรพี', lastName: 'สุนันทพจน์', email: 'patrapee.s@en.rmutt.ac.th' },
        { titles: 'อ.', firstName: 'มาโนช', lastName: 'ประชา', email: 'manoch.p@en.rmutt.ac.th' },
        { titles: 'ผศ.', firstName: 'ณัฐติพงศ์', lastName: 'อุทอง', email: 'nuchtiphong.o@en.rmutt.ac.th' },
        { titles: 'ผศ.ดร.', firstName: 'ศิริชัย', lastName: 'เตรียมลำเลิศ', email: 'sirichai.t@en.rmutt.ac.th' },
        { titles: 'ผศ.', firstName: 'เดชรัต', lastName: 'ใจทวิล', email: 'deachrut.j@en.rmutt.ac.th' },
        { titles: 'อ.', firstName: 'วีระชัย', lastName: 'แย้มวจี', email: 'weerachai.y@en.rmutt.ac.th' },
        { titles: 'ผศ.', firstName: 'เจษฎา', lastName: 'อนันต์ฤทธิ์', email: 'jedsada.a@en.rmutt.ac.th' },
        { titles: 'รศ.', firstName: 'ณชิรัตน์', lastName: 'ราชบุรี', email: 'nachirat.r@en.rmutt.ac.th' },
        { titles: 'ผศ.', firstName: 'สมาตรชัย', lastName: 'จันทรัตน์', email: 'samatachai.j@en.rmutt.ac.th' },
    ];

    for (const a of advisors) {
        try {
            const user = await prisma.users.create({
                data: {
                    ...a,
                    password,
                    role: 'ADVISOR',
                    emailVerified: true,
                },
            });
            console.log(`Created: ${a.titles}${a.firstName} ${a.lastName} (${a.email})`);
        } catch (e) {
            if (e.code === 'P2002') {
                console.log(`Already exists: ${a.email}`);
            } else {
                console.log(`Error for ${a.email}: ${e.message}`);
            }
        }
    }
    await prisma.$disconnect();
}

main();
