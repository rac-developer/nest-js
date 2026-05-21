require('dotenv').config();
const { PrismaClient } = require('../generated/prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

async function main() {
  console.log('DATABASE_URL:', process.env.DATABASE_URL);
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });
  
  console.log('Connecting...');
  await prisma.$connect();
  console.log('Connected!');
  
  await prisma.$disconnect();
  await pool.end();
}

main().catch(err => {
  console.error('Caught error:', err);
});
