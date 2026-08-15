-- CreateTable
CREATE TABLE "ClienteFoto" (
    "id" TEXT NOT NULL,
    "clienteId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "tipo" TEXT NOT NULL DEFAULT 'Antes',
    "data" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClienteFoto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClienteProntuario" (
    "id" TEXT NOT NULL,
    "clienteId" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "texto" TEXT NOT NULL,
    "data" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClienteProntuario_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ClienteFoto" ADD CONSTRAINT "ClienteFoto_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClienteProntuario" ADD CONSTRAINT "ClienteProntuario_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE CASCADE ON UPDATE CASCADE;
