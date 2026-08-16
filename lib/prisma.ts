import { PrismaClient } from '../app/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || "postgresql://admin:adminpassword@localhost:5432/clinica_estetica?schema=public"
});

const adapter = new PrismaPg(pool);

const createPrismaClient = () => new PrismaClient({ adapter });

export const prisma = (globalForPrisma.prisma && (globalForPrisma.prisma as any).usuario)
  ? globalForPrisma.prisma
  : createPrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
