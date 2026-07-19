import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');
  const adminPasswordHash = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@faym.com' },
    update: {},
    create: {
      email: 'admin@faym.com',
      username: 'admin',
      passwordHash: adminPasswordHash,
      role: 'ADMIN',
    },
  });
  console.log(`Created admin user: ${admin.email}`);

  const userPasswordHash = await bcrypt.hash('password123', 10);
  const user = await prisma.user.upsert({
    where: { email: 'john@doe.com' },
    update: {},
    create: {
      email: 'john@doe.com',
      username: 'john_doe',
      passwordHash: userPasswordHash,
      role: 'USER',
    },
  });
  console.log(`Created standard user: ${user.email}`);

  const salesToCreate = [
    { brand: 'brand_1', earning: 40 },
    { brand: 'brand_1', earning: 40 },
    { brand: 'brand_1', earning: 40 },
  ];

  for (const sale of salesToCreate) {
    await prisma.sale.create({
      data: {
        userId: user.id,
        brand: sale.brand,
        earning: sale.earning,
        status: 'PENDING',
      },
    });
  }

  console.log('Created 3 pending sales for john_doe (total ₹120 earnings)');
  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
