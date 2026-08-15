-- AlterTable
ALTER TABLE "Configuracao" ADD COLUMN     "bairro" TEXT NOT NULL DEFAULT 'Jardins',
ADD COLUMN     "cidade" TEXT NOT NULL DEFAULT 'São Paulo',
ADD COLUMN     "estado" TEXT NOT NULL DEFAULT 'SP',
ADD COLUMN     "instagram" TEXT NOT NULL DEFAULT 'instagram.com/auraaesthetics';
