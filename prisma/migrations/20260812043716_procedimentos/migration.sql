-- CreateTable
CREATE TABLE "Procedimento" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "duracao" INTEGER NOT NULL DEFAULT 60,
    "preco" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "cor" TEXT NOT NULL DEFAULT 'bg-primary',

    CONSTRAINT "Procedimento_pkey" PRIMARY KEY ("id")
);
