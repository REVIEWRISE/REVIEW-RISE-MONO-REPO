import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

// Use the master postgres credentials from docker-compose
const connectionString = 'postgresql://postgres:password@localhost:5432/reviewrise_db';

async function run() {
    const pool = new Pool({ connectionString });
    const adapter = new PrismaPg(pool);
    const prisma = new PrismaClient({ adapter });

    try {
        console.log('Dropping jobTitle column temporarily...');
        await prisma.$executeRaw`ALTER TABLE "User" DROP COLUMN IF EXISTS "jobTitle"`;

        console.log('Dropping twoFactorEnabled column temporarily...');
        await prisma.$executeRaw`ALTER TABLE "User" DROP COLUMN IF EXISTS "twoFactorEnabled"`;

        console.log('Dropping twoFactorSecret column temporarily...');
        await prisma.$executeRaw`ALTER TABLE "User" DROP COLUMN IF EXISTS "twoFactorSecret"`;

        console.log('Successfully dropped columns to resolve Prisma drift');
    } catch (e) {
        console.error('Failed to update User table:', e);
    } finally {
        await prisma.$disconnect();
        await pool.end();
    }
}

run();
