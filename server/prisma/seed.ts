import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 เริ่มสร้าง Seed Data...\n');

  // ══════════════════════════════════════════════════════════════════
  // 1. ล้างข้อมูลเดิมทั้งหมด (ลบตามลำดับ FK)
  // ══════════════════════════════════════════════════════════════════
  console.log('🗑️  ล้างข้อมูลเดิม...');
  await prisma.attachment.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.taskAssignment.deleteMany();
  await prisma.task.deleteMany();
  await prisma.submission.deleteMany();
  await prisma.event.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.grade.deleteMany();
  await prisma.projectAdvisor.deleteMany();
  await prisma.project.deleteMany();
  await prisma.teammember.deleteMany();
  await prisma.team.deleteMany();
  await prisma.section_Enrollment.deleteMany();
  await prisma.section.deleteMany();
  await prisma.term.deleteMany();
  await prisma.otpCode.deleteMany();
  await prisma.users.deleteMany();
  console.log('✅ ล้างข้อมูลเดิมเรียบร้อย\n');

  // ══════════════════════════════════════════════════════════════════
  // 2. สร้าง Admin account
  // ══════════════════════════════════════════════════════════════════
  console.log('👤 สร้าง Admin...');
  const adminPasswordHash = bcrypt.hashSync('admin@cpe2024', 10);
  await prisma.users.create({
    data: {
      users_id: 'admin',
      email: 'admin@cpe.rmutt.ac.th',
      passwordHash: adminPasswordHash,
      firstname: 'ผู้ดูแล',
      lastname: 'ระบบ',
      role: 'ADMIN',
    },
  });
  console.log('✅ Admin: admin@cpe.rmutt.ac.th / admin@cpe2024\n');

  // ══════════════════════════════════════════════════════════════════
  // 3. สร้าง Advisor accounts
  // ══════════════════════════════════════════════════════════════════
  console.log('👨‍🏫 สร้างข้อมูลอาจารย์...');
  const advisorPasswordHash = bcrypt.hashSync('12345678f', 10);

  const advisors = [
    {
      users_id: 'patrapee.s',
      email: 'patrapee.s@en.mutt.ac.th',
      titles: 'ผู้ช่วยศาสตราจารย์',
      firstname: 'พัฒณ์รพี',
      lastname: 'สุนันทพจน์',
      tel_number: '025493466',
      expertiseAreas:
        'Computer and Information Technology Skills, Advanced Computer Programming, Database Systems',
    },
    {
      users_id: 'manoch.p',
      email: 'manoch.p@en.rmutt.ac.th',
      titles: 'อาจารย์',
      firstname: 'มาโนช',
      lastname: 'ประชา',
      tel_number: '025493464',
      expertiseAreas:
        'Computer Programming, Theory of Computation, Computer and Information Technology Skills',
    },
    {
      users_id: 'nuchtiphong.o',
      email: 'nuchtiphong.o@en.rmutt.ac.th',
      titles: 'ผู้ช่วยศาสตราจารย์',
      firstname: 'ณัชติพงศ์',
      lastname: 'อูทอง',
      tel_number: '025493464',
      expertiseAreas: 'Advanced Digital System Design, Computer Programming',
    },
    {
      users_id: 'sirichai.t',
      email: 'sirichai.t@en.rmutt.ac.th',
      titles: 'ผู้ช่วยศาสตราจารย์ ดร.',
      firstname: 'ศิริชัย',
      lastname: 'เตรียมล้ำเลิศ',
      tel_number: '025493461',
      expertiseAreas:
        'Object-Oriented Programming, Computer Programming, Computer Information and Technology Skills, English for Engineering',
    },
    {
      users_id: 'deachrut.j',
      email: 'deachrut.j@en.rmutt.ac.th',
      titles: 'ผู้ช่วยศาสตราจารย์',
      firstname: 'เดชรัชต์',
      lastname: 'ใจถวิล',
      tel_number: '025493461',
      expertiseAreas: 'Design Thinking, Server Programming, Computer Programming',
    },
    {
      users_id: 'weerachai.y',
      email: 'weerachai.y@en.rmutt.ac.th',
      titles: 'อาจารย์',
      firstname: 'วีระชัย',
      lastname: 'แย้มวจี',
      tel_number: '025493466',
      expertiseAreas:
        'Computer Network Laboratory, TCP/IP Networks, Computer Security, Computer Engineering Project, Computer Programming, Computer and Information Technology Skills',
    },
    {
      users_id: 'jedsada.a',
      email: 'jedsada.a@en.rmutt.ac.th',
      titles: 'ผู้ช่วยศาสตราจารย์',
      firstname: 'เจษฎา',
      lastname: 'อรุณฤกษ์',
      tel_number: '025493467',
      expertiseAreas:
        'Computer Programming, Computer Architecture and Organization, Computer Hardware Laboratory, Computer and Information Technology Skills',
    },
    {
      users_id: 'nachirat.r',
      email: 'nachirat.r@en.rmutt.ac.th',
      titles: 'รองศาสตราจารย์',
      firstname: 'นชิรัตน์',
      lastname: 'ราชบุรี',
      tel_number: '025493467',
      expertiseAreas:
        'Computer Programming, Data Structure and Algorithms, Mobile Device Programming for Digital Industry, Data Mining',
    },
    {
      users_id: 'samatachai.j',
      email: 'samatachai.j@en.rmutt.ac.th',
      titles: 'ผู้ช่วยศาสตราจารย์',
      firstname: 'สมรรถชัย',
      lastname: 'จันทรัตน์',
      tel_number: '025493467',
      expertiseAreas:
        'Computer Programming, Digital Circuit and Logic Design, Computer Engineering Laboratory, IC3',
    },
    {
      users_id: 'sitti.r',
      email: 'sitti.r@en.rmutt.ac.th',
      titles: 'อาจารย์',
      firstname: 'สิทธิ',
      lastname: 'รักถนอม',
      tel_number: '025493467',
      expertiseAreas:
        'Computer Programming, CPE Pre-Project, Mobile Device Programming for Digital Industry',
    },
    {
      users_id: 'prusayon.n',
      email: 'prusayon.n@en.rmutt.ac.th',
      titles: 'รองศาสตราจารย์ ดร.',
      firstname: 'พฤศยน',
      lastname: 'นินทนาวงศา',
      tel_number: '025493467',
      expertiseAreas:
        'Computer Networks, Data Communications, Computer Programming, Operating Systems, Research Methodology in Electrical Engineering, Wireless Networking, Local Area Networks and Internetworking',
    },
    {
      users_id: 'thanasin.b',
      email: 'thanasin.b@en.rmutt.ac.th',
      titles: 'ผู้ช่วยศาสตราจารย์ ดร.',
      firstname: 'ธนสิน',
      lastname: 'บุญนาม',
      tel_number: '025493467',
      expertiseAreas:
        'Electronics for Computer Engineering, Microcontroller and Interfacing, Internet of Things, Image Processing, Computer Programming',
    },
    {
      users_id: 'pauline.k',
      email: 'pauline.k@en.rmutt.ac.th',
      titles: 'ผู้ช่วยศาสตราจารย์ ดร.',
      firstname: 'ปอลิน',
      lastname: 'กองสุวรรณ',
      tel_number: '025493464',
      expertiseAreas:
        'Computer Programming, Computer and Information Technology Skills, Software Engineering, Preparation for Professional Experience, Cooperative Education, Apprenticeship',
    },
    {
      users_id: 'pitchayapatchaya.s',
      email: 'pitchayapatchaya.S@en.rmutt.ac.th',
      titles: 'ผู้ช่วยศาสตราจารย์ ดร.',
      firstname: 'พิชยพัชยา',
      lastname: 'ศรีคร้าม',
      tel_number: '025493464',
      expertiseAreas: 'Computer Programming, Image Processing',
    },
    {
      users_id: 'pachara.s',
      email: 'pachara.s@en.rmutt.ac.th',
      titles: 'ดร.',
      firstname: 'พชร',
      lastname: 'ศรีมุกข์',
      tel_number: '025493467',
      expertiseAreas: 'Computer Programming, Embedded Systems, Operating Systems',
    },
    {
      users_id: 'anuruk.p',
      email: 'anuruk.p@en.rmutt.ac.th',
      titles: 'ดร.',
      firstname: 'อนุรักษ์',
      lastname: 'พรหมโคตร',
      tel_number: '025493464',
      expertiseAreas: 'Computer Programming',
    },
  ];

  for (const advisor of advisors) {
    await prisma.users.create({
      data: {
        users_id: advisor.users_id,
        email: advisor.email,
        passwordHash: advisorPasswordHash,
        titles: advisor.titles,
        firstname: advisor.firstname,
        lastname: advisor.lastname,
        tel_number: advisor.tel_number,
        expertiseAreas: advisor.expertiseAreas,
        role: 'ADVISOR',
      },
    });
    console.log(`  ✅ ${advisor.titles} ${advisor.firstname} ${advisor.lastname}`);
  }

  console.log(`\n🎉 Seed Data เสร็จสมบูรณ์!`);
  console.log(`   - Admin    : admin@cpe.rmutt.ac.th / admin@cpe2024`);
  console.log(`   - Advisors : ${advisors.length} คน / รหัสผ่าน: 12345678f`);
}

main()
  .catch((e) => {
    console.error('❌ Seed ล้มเหลว:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
