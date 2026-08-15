-- AlterTable
ALTER TABLE "Agendamento" ADD COLUMN     "googleEventId" TEXT;

-- AlterTable
ALTER TABLE "Configuracao" ADD COLUMN     "googleCalendarId" TEXT,
ADD COLUMN     "googleRefreshToken" TEXT;
