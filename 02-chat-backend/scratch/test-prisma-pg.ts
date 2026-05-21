import 'dotenv/config';
import { PrismaClient } from '../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

async function main() {
  console.log('DATABASE_URL:', process.env.DATABASE_URL);
  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
  });
  const prisma = new PrismaClient({ adapter });
  
  console.log('Connecting...');
  await prisma.$connect();
  console.log('Connected! Running query...');
  const users = await prisma.user.findMany();
  console.log('Query successful, users:', users);
  
  await prisma.$disconnect();
}

main().catch(err => {
  console.error('Caught error:', err);
});
