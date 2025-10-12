import { PrismaClient } from '../src/generated/prisma';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Check if admin already exists
  const existingAdmin = await prisma.user.findFirst({
    where: {
      role: 'ADMIN'
    }
  });

  if (existingAdmin) {
    console.log('✅ Admin user already exists:', existingAdmin.email);
    return;
  }

  // Create default admin user
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  const admin = await prisma.user.create({
    data: {
      email: 'admin@certgen.com',
      password: hashedPassword,
      name: 'System Administrator',
      role: 'ADMIN',
      isActive: true
    }
  });

  console.log('✅ Admin user created successfully!');
  console.log('📧 Email:', admin.email);
  console.log('🔑 Password: admin123');
  console.log('⚠️  Please change the default password after first login!');

  // Create a sample regular user
  const userPassword = await bcrypt.hash('user123', 10);
  
  const user = await prisma.user.create({
    data: {
      email: 'user@certgen.com',
      password: userPassword,
      name: 'Sample User',
      role: 'USER',
      isActive: true
    }
  });

  console.log('\n✅ Sample user created successfully!');
  console.log('📧 Email:', user.email);
  console.log('🔑 Password: user123');

  console.log('\n🎉 Database seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
