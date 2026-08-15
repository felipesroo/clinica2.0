import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

export async function GET() {
  try {
    const ddlStatements = [
      `CREATE TABLE IF NOT EXISTS "Cliente" (
          "id" TEXT NOT NULL,
          "nome" TEXT NOT NULL,
          "email" TEXT,
          "telefone" TEXT,
          "dataCadastro" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "alergias" TEXT,
          "avatarUrl" TEXT,
          "dataNascimento" TEXT,
          "objetivoPrincipal" TEXT,
          "tipoPele" TEXT,
          CONSTRAINT "Cliente_pkey" PRIMARY KEY ("id")
      );`,
      `CREATE TABLE IF NOT EXISTS "Agendamento" (
          "id" TEXT NOT NULL,
          "date" TEXT NOT NULL,
          "startTime" TEXT NOT NULL,
          "duration" INTEGER NOT NULL DEFAULT 60,
          "service" TEXT NOT NULL,
          "status" TEXT NOT NULL DEFAULT 'AGENDADO',
          "googleEventId" TEXT,
          "valor" TEXT,
          "formaPagamento" TEXT,
          "numeroParcelas" INTEGER,
          "clienteId" TEXT NOT NULL,
          CONSTRAINT "Agendamento_pkey" PRIMARY KEY ("id"),
          CONSTRAINT "Agendamento_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE CASCADE ON UPDATE CASCADE
      );`,
      `CREATE TABLE IF NOT EXISTS "Procedimento" (
          "id" TEXT NOT NULL,
          "nome" TEXT NOT NULL,
          "duracao" INTEGER NOT NULL DEFAULT 60,
          "preco" DOUBLE PRECISION NOT NULL DEFAULT 0,
          "cor" TEXT NOT NULL DEFAULT 'bg-primary',
          CONSTRAINT "Procedimento_pkey" PRIMARY KEY ("id")
      );`,
      `ALTER TABLE "Procedimento" ADD COLUMN IF NOT EXISTS "cor" TEXT NOT NULL DEFAULT 'bg-primary';`,
      `CREATE TABLE IF NOT EXISTS "EstoqueProduto" (
          "id" TEXT NOT NULL,
          "nome" TEXT NOT NULL,
          "categoria" TEXT NOT NULL DEFAULT 'Geral',
          "quantidade" INTEGER NOT NULL DEFAULT 0,
          "unidade" TEXT NOT NULL DEFAULT 'un.',
          "status" TEXT NOT NULL DEFAULT 'Em Estoque',
          "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "atualizadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "EstoqueProduto_pkey" PRIMARY KEY ("id")
      );`,
      `CREATE TABLE IF NOT EXISTS "EstoqueMovimentacao" (
          "id" TEXT NOT NULL,
          "produtoId" TEXT NOT NULL,
          "agendamentoId" TEXT,
          "quantidade" INTEGER NOT NULL,
          "tipo" TEXT NOT NULL,
          "data" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "EstoqueMovimentacao_pkey" PRIMARY KEY ("id"),
          CONSTRAINT "EstoqueMovimentacao_produtoId_fkey" FOREIGN KEY ("produtoId") REFERENCES "EstoqueProduto"("id") ON DELETE CASCADE ON UPDATE CASCADE,
          CONSTRAINT "EstoqueMovimentacao_agendamentoId_fkey" FOREIGN KEY ("agendamentoId") REFERENCES "Agendamento"("id") ON DELETE SET NULL ON UPDATE CASCADE
      );`,
      `CREATE TABLE IF NOT EXISTS "ClienteFoto" (
          "id" TEXT NOT NULL,
          "clienteId" TEXT NOT NULL,
          "url" TEXT NOT NULL,
          "tipo" TEXT NOT NULL DEFAULT 'Antes',
          "data" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "ClienteFoto_pkey" PRIMARY KEY ("id"),
          CONSTRAINT "ClienteFoto_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE CASCADE ON UPDATE CASCADE
      );`,
      `CREATE TABLE IF NOT EXISTS "ClienteProntuario" (
          "id" TEXT NOT NULL,
          "clienteId" TEXT NOT NULL,
          "titulo" TEXT NOT NULL,
          "texto" TEXT NOT NULL,
          "data" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "ClienteProntuario_pkey" PRIMARY KEY ("id"),
          CONSTRAINT "ClienteProntuario_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE CASCADE ON UPDATE CASCADE
      );`,
      `CREATE TABLE IF NOT EXISTS "Configuracao" (
          "id" TEXT NOT NULL DEFAULT '1',
          "nomeFantasia" TEXT NOT NULL DEFAULT 'Clínica da Dra. Jordane Ferreira Faria',
          "razaoSocial" TEXT NOT NULL DEFAULT 'Dra. Jordane Ferreira Faria Estética Avançada',
          "cnpj" TEXT NOT NULL DEFAULT '',
          "inscricaoMun" TEXT NOT NULL DEFAULT '',
          "email" TEXT NOT NULL DEFAULT 'contato@drajordanefaria.com',
          "whatsapp" TEXT NOT NULL DEFAULT '(62) 99443-7642',
          "cep" TEXT NOT NULL DEFAULT '01415-000',
          "endereco" TEXT NOT NULL DEFAULT 'Rua Principal, 1000',
          "logoUrl" TEXT NOT NULL DEFAULT 'https://lh3.googleusercontent.com/aida-public/AB6AXuBJgqUJmq2CmUG03OfG0psHxEYIuhitDO52_gUwk8F8RZg2NQnbEhYfRLGQ5TidI1PQdXk00Xw7I42dbGfhFFQEO4Lu_WoZOLrCp7W_EXOKVCGjHQURkXvvR3DBTBDmMNMWA8d6IrcaGNCrutj-Skz2IYO8lG4mHVB7QbJOSq9toEYP-ZoPJQP2SX4QDMGSF_Yjnau6N9tAR7Ri2JHMYyGKVZnxkW7YzHBC8m-zSDH28mVq8AKWTzzqFA',
          "bairro" TEXT NOT NULL DEFAULT 'Centro',
          "cidade" TEXT NOT NULL DEFAULT 'Goiânia',
          "estado" TEXT NOT NULL DEFAULT 'GO',
          "instagram" TEXT NOT NULL DEFAULT 'instagram.com/drajordanefaria',
          "googleRefreshToken" TEXT,
          "googleCalendarId" TEXT,
          "wahaUrl" TEXT DEFAULT 'http://waha:3000',
          "wahaSessionName" TEXT DEFAULT 'default',
          "msgConfirmacaoAtiva" BOOLEAN NOT NULL DEFAULT true,
          "msgConfirmacaoTexto" TEXT NOT NULL DEFAULT 'Olá, {nome}! Seu agendamento para {servico} no dia {data} às {hora} foi confirmado com sucesso. ✨',
          "msgLembreteAtiva" BOOLEAN NOT NULL DEFAULT true,
          "msgLembreteTexto" TEXT NOT NULL DEFAULT 'Olá, {nome}! Lembramos do seu procedimento de {servico} amanhã ({data}) às {hora}. Podemos confirmar sua presença? 😊',
          "msgHoraLembrete" TEXT NOT NULL DEFAULT '08:00',
          "msgLembrete2hAtiva" BOOLEAN NOT NULL DEFAULT true,
          "msgLembrete2hTexto" TEXT NOT NULL DEFAULT 'Oi, {nome}! Tudo bem? Passando para te lembrar que daqui a pouquinho, às {hora}, você tem o procedimento de {servico}, estou te aguardando!😊',
          "openAiApiKey" TEXT,
          "openAiSystemPrompt" TEXT DEFAULT 'Você é a assistente virtual da Clínica da Dra. Jordane Ferreira Faria. Seja educada, concisa e ajude os pacientes com informações e agendamentos.',
          "aiAgentActive" BOOLEAN NOT NULL DEFAULT false,
          "aiAutoSchedule" BOOLEAN NOT NULL DEFAULT false,
          CONSTRAINT "Configuracao_pkey" PRIMARY KEY ("id")
      );`
    ];

    for (const sql of ddlStatements) {
      try {
        await prisma.$executeRawUnsafe(sql);
      } catch (ddlErr: any) {
        console.error("DDL Exec error:", ddlErr?.message);
      }
    }

    // 1. Configuracao
    const config = await prisma.configuracao.upsert({
      where: { id: "1" },
      update: {
        nomeFantasia: "Dra. Jordane F Faria",
        razaoSocial: "Saúde Estetica",
        wahaUrl: "http://waha:3000",
        wahaSessionName: "default",
        msgConfirmacaoAtiva: true,
        msgLembreteAtiva: true,
        msgLembrete2hAtiva: true,
      },
      create: {
        id: "1",
        nomeFantasia: "Dra. Jordane F Faria",
        razaoSocial: "Saúde Estetica",
        wahaUrl: "http://waha:3000",
        wahaSessionName: "default",
        msgConfirmacaoAtiva: true,
        msgLembreteAtiva: true,
        msgLembrete2hAtiva: true,
      }
    });

    // 2. Procedimentos
    const defaultProcedures = [
  {
    "id": "116eeed1-4d2c-43fd-8e7c-efd82a8dbeef",
    "nome": "Limpeza de Pele",
    "duracao": 60,
    "preco": 0,
    "cor": "bg-primary"
  },
  {
    "id": "29d3c5a8-f9e7-407d-9724-2b9fec134652",
    "nome": "Botox",
    "duracao": 30,
    "preco": 0,
    "cor": "bg-primary"
  },
  {
    "id": "c7da6963-fd9a-4e86-9da5-0521b26a338b",
    "nome": "Preenchimento",
    "duracao": 60,
    "preco": 0,
    "cor": "bg-primary"
  },
  {
    "id": "bddb19a2-a839-48ee-be0c-00f198d3bc07",
    "nome": "Bioestimulador",
    "duracao": 60,
    "preco": 0,
    "cor": "bg-primary"
  },
  {
    "id": "33a7d44b-dede-449b-bfd5-dbde527b27d7",
    "nome": "Capilar",
    "duracao": 40,
    "preco": 0,
    "cor": "bg-primary"
  },
  {
    "id": "b5ddfcbf-3364-4e7a-b6e0-ca22c62344f5",
    "nome": "Varizes",
    "duracao": 60,
    "preco": 0,
    "cor": "bg-primary"
  },
  {
    "id": "2546a890-4658-4c49-ab5d-3879f0e71000",
    "nome": "Fios",
    "duracao": 60,
    "preco": 0,
    "cor": "bg-primary"
  },
  {
    "id": "d9e65d42-a2b7-4a67-a3a8-87cf6a7c0b47",
    "nome": "PDRN",
    "duracao": 40,
    "preco": 0,
    "cor": "bg-primary"
  },
  {
    "id": "e8fb30fe-59f8-4df1-a07f-512a1efce2cb",
    "nome": "Skinbooster",
    "duracao": 40,
    "preco": 0,
    "cor": "bg-primary"
  },
  {
    "id": "3bb5fbfd-74b9-496c-9936-aabe11d26bf2",
    "nome": "Microagulhamento",
    "duracao": 40,
    "preco": 0,
    "cor": "bg-primary"
  },
  {
    "id": "19259c31-9335-4442-928a-2c9b721c3730",
    "nome": "Vitaminas",
    "duracao": 20,
    "preco": 0,
    "cor": "bg-primary"
  },
  {
    "id": "64ef0a7c-afef-4c1f-8223-8b048fcb4a7d",
    "nome": "Enzimas",
    "duracao": 40,
    "preco": 0,
    "cor": "bg-primary"
  },
  {
    "id": "23f6514b-7695-418a-8666-6a12b7a447d1",
    "nome": "peeling químico",
    "duracao": 40,
    "preco": 0,
    "cor": "bg-primary"
  }
];
    for (const proc of defaultProcedures) {
      const exists = await prisma.procedimento.findUnique({ where: { id: proc.id } });
      if (!exists) {
        await prisma.procedimento.create({ data: proc });
      }
    }

    // 3. Estoque
    const defaultProducts = [
  {
    "id": "7451350c-e358-48cf-83e4-7a3440646431",
    "nome": "acido",
    "categoria": "Geral",
    "quantidade": 0,
    "unidade": "un.",
    "status": "Esgotado",
    "criadoEm": "2026-08-12T04:47:41.013Z",
    "atualizadoEm": "2026-08-12T04:48:08.626Z"
  },
  {
    "id": "bf7491d1-7a0b-4d9e-99b8-4af4cd3bb4c9",
    "nome": "limpeza de pele ",
    "categoria": "Geral",
    "quantidade": 51,
    "unidade": "un.",
    "status": "Em Estoque",
    "criadoEm": "2026-08-14T14:58:28.041Z",
    "atualizadoEm": "2026-08-14T14:58:45.397Z"
  },
  {
    "id": "a7cd783c-8995-47ce-9864-10586446bcd4",
    "nome": "Botox",
    "categoria": "Toxinas",
    "quantidade": 150,
    "unidade": "ui",
    "status": "Em Estoque",
    "criadoEm": "2026-08-14T15:00:02.442Z",
    "atualizadoEm": "2026-08-14T15:00:02.442Z"
  }
];
    for (const prod of defaultProducts) {
      const exists = await prisma.estoqueProduto.findUnique({ where: { id: prod.id } });
      if (!exists) {
        await prisma.estoqueProduto.create({
          data: {
            ...prod,
            criadoEm: new Date(prod.criadoEm),
            atualizadoEm: new Date(prod.atualizadoEm),
          }
        });
      }
    }

    // 4. Clientes
    const defaultClients = [
  {
    "id": "03e63b09-3c37-487d-bb2c-91b22a0cc354",
    "nome": "Arthur Miller Siqueira Vaz ",
    "email": "arthurmillerv@hotmail.com",
    "telefone": "62993801457",
    "dataCadastro": "2026-08-13T13:02:09.913Z",
    "alergias": null,
    "avatarUrl": null,
    "dataNascimento": null,
    "objetivoPrincipal": null,
    "tipoPele": null
  },
  {
    "id": "e6f81510-a78a-4656-978e-e2c4f853d4b2",
    "nome": "Ter botox Kelly (Jordane )",
    "email": null,
    "telefone": null,
    "dataCadastro": "2026-08-14T01:09:19.636Z",
    "alergias": null,
    "avatarUrl": null,
    "dataNascimento": null,
    "objetivoPrincipal": null,
    "tipoPele": null
  },
  {
    "id": "47a254fa-f91d-4378-b44c-c0de3d3ec1b6",
    "nome": "Ana Paula capilar Jordane",
    "email": null,
    "telefone": null,
    "dataCadastro": "2026-08-14T01:41:01.200Z",
    "alergias": null,
    "avatarUrl": null,
    "dataNascimento": null,
    "objetivoPrincipal": null,
    "tipoPele": null
  },
  {
    "id": "971f913f-83de-43a5-9d8e-4572123d81b7",
    "nome": "Retorno de botox Jaqueline e Raissa (Jordane)",
    "email": null,
    "telefone": null,
    "dataCadastro": "2026-08-14T01:41:01.215Z",
    "alergias": null,
    "avatarUrl": null,
    "dataNascimento": null,
    "objetivoPrincipal": null,
    "tipoPele": null
  },
  {
    "id": "b32c1513-4d88-45fb-83f1-1e9a5915f82f",
    "nome": "Barbara da Silva Parente",
    "email": null,
    "telefone": null,
    "dataCadastro": "2026-08-14T01:41:01.221Z",
    "alergias": null,
    "avatarUrl": null,
    "dataNascimento": null,
    "objetivoPrincipal": null,
    "tipoPele": null
  },
  {
    "id": "a2e61578-8037-492f-a687-c7afdb8a5656",
    "nome": "Thyessa varizes (Jordane)",
    "email": null,
    "telefone": null,
    "dataCadastro": "2026-08-14T01:41:01.230Z",
    "alergias": null,
    "avatarUrl": null,
    "dataNascimento": null,
    "objetivoPrincipal": null,
    "tipoPele": null
  },
  {
    "id": "7f07ab87-d6f0-46ea-92d6-3649539d23d8",
    "nome": "Giuliano Okelio Santana",
    "email": null,
    "telefone": null,
    "dataCadastro": "2026-08-14T01:41:01.235Z",
    "alergias": null,
    "avatarUrl": null,
    "dataNascimento": null,
    "objetivoPrincipal": null,
    "tipoPele": null
  },
  {
    "id": "b5722c75-09ee-49cd-aef5-54660f3f35fb",
    "nome": "Alessandra Martins Goncalves santana",
    "email": null,
    "telefone": null,
    "dataCadastro": "2026-08-14T01:41:01.247Z",
    "alergias": null,
    "avatarUrl": null,
    "dataNascimento": null,
    "objetivoPrincipal": null,
    "tipoPele": null
  },
  {
    "id": "b794786f-f8dc-4b70-9cdf-2d4b11679f2a",
    "nome": "Rômulo capilar",
    "email": null,
    "telefone": null,
    "dataCadastro": "2026-08-14T01:41:01.271Z",
    "alergias": null,
    "avatarUrl": null,
    "dataNascimento": null,
    "objetivoPrincipal": null,
    "tipoPele": null
  },
  {
    "id": "2ba67769-b505-4120-b61b-92b61f499985",
    "nome": "Francielly preenchimento labial ( Jordane )",
    "email": null,
    "telefone": null,
    "dataCadastro": "2026-08-14T01:41:01.275Z",
    "alergias": null,
    "avatarUrl": null,
    "dataNascimento": null,
    "objetivoPrincipal": null,
    "tipoPele": null
  },
  {
    "id": "bd82cc27-0df9-47e1-9834-58750cc0b921",
    "nome": "Ana paula capilar (jordane )",
    "email": null,
    "telefone": null,
    "dataCadastro": "2026-08-14T01:41:01.279Z",
    "alergias": null,
    "avatarUrl": null,
    "dataNascimento": null,
    "objetivoPrincipal": null,
    "tipoPele": null
  },
  {
    "id": "41aec4c2-6431-4c57-89bd-aaf0cf2eb2aa",
    "nome": "Tatiane varizes ( Jordane)",
    "email": null,
    "telefone": null,
    "dataCadastro": "2026-08-14T01:41:01.283Z",
    "alergias": null,
    "avatarUrl": null,
    "dataNascimento": null,
    "objetivoPrincipal": null,
    "tipoPele": null
  },
  {
    "id": "dcefc1ab-9ab9-4fa7-b809-321313fcb1c7",
    "nome": "Jordana preenchimento queixo 1 ml (Jordane)",
    "email": null,
    "telefone": null,
    "dataCadastro": "2026-08-14T01:41:01.288Z",
    "alergias": null,
    "avatarUrl": null,
    "dataNascimento": null,
    "objetivoPrincipal": null,
    "tipoPele": null
  },
  {
    "id": "83fc1e12-2578-4b01-959d-5c636d99f8c4",
    "nome": "Zenaide varizes (Jordane)",
    "email": null,
    "telefone": null,
    "dataCadastro": "2026-08-14T01:41:01.292Z",
    "alergias": null,
    "avatarUrl": null,
    "dataNascimento": null,
    "objetivoPrincipal": null,
    "tipoPele": null
  },
  {
    "id": "ff8f2f2d-fdc4-4ae2-bf98-6b6a781ffe60",
    "nome": "Thyessa varizes Jordane",
    "email": null,
    "telefone": null,
    "dataCadastro": "2026-08-14T01:41:01.296Z",
    "alergias": null,
    "avatarUrl": null,
    "dataNascimento": null,
    "objetivoPrincipal": null,
    "tipoPele": null
  },
  {
    "id": "80f59df9-ae28-4e54-8b00-8174d44c12fc",
    "nome": "Thyessa Lorrane Pereira Reis",
    "email": null,
    "telefone": null,
    "dataCadastro": "2026-08-14T01:41:01.301Z",
    "alergias": null,
    "avatarUrl": null,
    "dataNascimento": null,
    "objetivoPrincipal": null,
    "tipoPele": null
  },
  {
    "id": "f59252f4-e256-4ed2-a8bd-75a8717d9403",
    "nome": "Rômulo capilar Jordane",
    "email": null,
    "telefone": null,
    "dataCadastro": "2026-08-14T01:41:01.306Z",
    "alergias": null,
    "avatarUrl": null,
    "dataNascimento": null,
    "objetivoPrincipal": null,
    "tipoPele": null
  },
  {
    "id": "337c4a60-caf7-4a5d-b483-5d89264878ef",
    "nome": "Barbara microagulhamento + pdrn (Jordane )",
    "email": null,
    "telefone": null,
    "dataCadastro": "2026-08-14T01:41:01.310Z",
    "alergias": null,
    "avatarUrl": null,
    "dataNascimento": null,
    "objetivoPrincipal": null,
    "tipoPele": null
  },
  {
    "id": "2226db22-48dc-412a-91ec-2b61be3e48db",
    "nome": "Rômulo capilar jordane",
    "email": null,
    "telefone": null,
    "dataCadastro": "2026-08-14T01:41:01.314Z",
    "alergias": null,
    "avatarUrl": null,
    "dataNascimento": null,
    "objetivoPrincipal": null,
    "tipoPele": null
  },
  {
    "id": "3ad0131f-79c6-437c-adc8-0b6935582282",
    "nome": "Regina Maria Medeiros de Almeida Santos",
    "email": null,
    "telefone": null,
    "dataCadastro": "2026-08-14T01:41:01.318Z",
    "alergias": null,
    "avatarUrl": null,
    "dataNascimento": null,
    "objetivoPrincipal": null,
    "tipoPele": null
  },
  {
    "id": "e4cbeea7-31ab-4f36-b6a6-3fa8641187a4",
    "nome": "Regina ( mãe da Daniela) capilar ( Jordane )",
    "email": null,
    "telefone": null,
    "dataCadastro": "2026-08-14T01:41:01.329Z",
    "alergias": null,
    "avatarUrl": null,
    "dataNascimento": null,
    "objetivoPrincipal": null,
    "tipoPele": null
  },
  {
    "id": "72796d06-e537-4d32-ad86-5c73febae068",
    "nome": "Pollyanna botox (Jordane )",
    "email": null,
    "telefone": null,
    "dataCadastro": "2026-08-14T01:41:01.334Z",
    "alergias": null,
    "avatarUrl": null,
    "dataNascimento": null,
    "objetivoPrincipal": null,
    "tipoPele": null
  },
  {
    "id": "49ec093f-4c89-487a-b54b-1e3a80d35377",
    "nome": "Barbara microagulhamento + pdrn (Jordane)",
    "email": null,
    "telefone": null,
    "dataCadastro": "2026-08-14T01:41:01.338Z",
    "alergias": null,
    "avatarUrl": null,
    "dataNascimento": null,
    "objetivoPrincipal": null,
    "tipoPele": null
  },
  {
    "id": "5f635d12-7fea-4cc5-ba93-a2a46a3fae40",
    "nome": "Pollyanne Cinthia Carvalho",
    "email": null,
    "telefone": null,
    "dataCadastro": "2026-08-14T01:41:01.342Z",
    "alergias": null,
    "avatarUrl": null,
    "dataNascimento": null,
    "objetivoPrincipal": null,
    "tipoPele": null
  },
  {
    "id": "18df2098-eb29-459e-a0b7-b73b5bec16e7",
    "nome": "Dany ( Jordane )",
    "email": null,
    "telefone": null,
    "dataCadastro": "2026-08-14T01:41:01.349Z",
    "alergias": null,
    "avatarUrl": null,
    "dataNascimento": null,
    "objetivoPrincipal": null,
    "tipoPele": null
  },
  {
    "id": "716c8927-008b-484d-8c39-7714aae0ffdf",
    "nome": "Arthur botox (Jordane )",
    "email": null,
    "telefone": null,
    "dataCadastro": "2026-08-14T01:41:01.353Z",
    "alergias": null,
    "avatarUrl": null,
    "dataNascimento": null,
    "objetivoPrincipal": null,
    "tipoPele": null
  },
  {
    "id": "419b3237-28f8-4dd4-8c36-466244169055",
    "nome": "Danielle varizes e limpeza de pele (Jordane)",
    "email": null,
    "telefone": null,
    "dataCadastro": "2026-08-14T01:41:01.357Z",
    "alergias": null,
    "avatarUrl": null,
    "dataNascimento": null,
    "objetivoPrincipal": null,
    "tipoPele": null
  },
  {
    "id": "47aaf134-2903-461b-97f6-4497766b9f64",
    "nome": "Romulo capilar (jordane $",
    "email": null,
    "telefone": null,
    "dataCadastro": "2026-08-14T01:41:01.361Z",
    "alergias": null,
    "avatarUrl": null,
    "dataNascimento": null,
    "objetivoPrincipal": null,
    "tipoPele": null
  },
  {
    "id": "68511298-8708-4016-9ad4-46b1e43d86a5",
    "nome": "Regina mãe da Daniela capilar (Jordane)",
    "email": null,
    "telefone": null,
    "dataCadastro": "2026-08-14T01:41:01.366Z",
    "alergias": null,
    "avatarUrl": null,
    "dataNascimento": null,
    "objetivoPrincipal": null,
    "tipoPele": null
  },
  {
    "id": "96a7aebb-566f-40d8-bd91-d56a5acec7c6",
    "nome": "Aline Cianne varizes (Jordane )",
    "email": null,
    "telefone": null,
    "dataCadastro": "2026-08-14T01:41:01.370Z",
    "alergias": null,
    "avatarUrl": null,
    "dataNascimento": null,
    "objetivoPrincipal": null,
    "tipoPele": null
  },
  {
    "id": "bbe102f6-5e4a-42b0-9694-5ec080ccba91",
    "nome": "BOTOX",
    "email": null,
    "telefone": null,
    "dataCadastro": "2026-08-14T01:49:30.314Z",
    "alergias": null,
    "avatarUrl": null,
    "dataNascimento": null,
    "objetivoPrincipal": null,
    "tipoPele": null
  },
  {
    "id": "c032d01c-ab3a-443a-b850-274305f924be",
    "nome": "Rose ret botox",
    "email": null,
    "telefone": null,
    "dataCadastro": "2026-08-14T14:39:08.906Z",
    "alergias": null,
    "avatarUrl": null,
    "dataNascimento": null,
    "objetivoPrincipal": null,
    "tipoPele": null
  },
  {
    "id": "e0a36924-3e4a-44ea-8541-110535960750",
    "nome": "Rose ret de botox (Jordane)",
    "email": null,
    "telefone": null,
    "dataCadastro": "2026-08-14T14:47:03.473Z",
    "alergias": null,
    "avatarUrl": null,
    "dataNascimento": null,
    "objetivoPrincipal": null,
    "tipoPele": null
  },
  {
    "id": "3ae87394-7a36-4506-ac2c-a9e006a71802",
    "nome": "Rose retorno de botox (Jordane)",
    "email": null,
    "telefone": null,
    "dataCadastro": "2026-08-14T14:49:43.100Z",
    "alergias": null,
    "avatarUrl": null,
    "dataNascimento": null,
    "objetivoPrincipal": null,
    "tipoPele": null
  },
  {
    "id": "c350ccfe-fe55-4045-8126-e78b7c8f627c",
    "nome": "FELIPE SOARES RIBEIRO DE OLIVEIRA",
    "email": null,
    "telefone": "62994437642",
    "dataCadastro": "2026-08-15T17:59:07.904Z",
    "alergias": null,
    "avatarUrl": null,
    "dataNascimento": null,
    "objetivoPrincipal": null,
    "tipoPele": null
  }
];
    for (const c of defaultClients) {
      const exists = await prisma.cliente.findUnique({ where: { id: c.id } });
      if (!exists) {
        await prisma.cliente.create({
          data: {
            ...c,
            dataCadastro: new Date(c.dataCadastro),
          }
        });
      }
    }

    // 5. Agendamentos
    const defaultAppointments = [
  {
    "id": "4bac6170-fc40-42f3-b9ee-bba2eeb99804",
    "date": "2026-07-30",
    "startTime": "11:00",
    "duration": 60,
    "service": "Google Agenda",
    "status": "AGENDADO",
    "googleEventId": "3erji522q88ukesjopa38e5tf8",
    "valor": null,
    "formaPagamento": null,
    "numeroParcelas": null,
    "clienteId": "ff8f2f2d-fdc4-4ae2-bf98-6b6a781ffe60"
  },
  {
    "id": "e2c2d5c1-3916-427e-8510-7655baca71d4",
    "date": "2026-07-30",
    "startTime": "13:48",
    "duration": 60,
    "service": "Preenchimento",
    "status": "AGENDADO",
    "googleEventId": "1k37lfhes9lvc288nf6v3joe10",
    "valor": null,
    "formaPagamento": null,
    "numeroParcelas": null,
    "clienteId": "80f59df9-ae28-4e54-8b00-8174d44c12fc"
  },
  {
    "id": "65ed6e03-76e1-4d8c-bc69-19d5dd51eb19",
    "date": "2026-07-31",
    "startTime": "16:00",
    "duration": 60,
    "service": "Google Agenda",
    "status": "AGENDADO",
    "googleEventId": "d9ttpvpr1m4j38ie5mi9o1ioso",
    "valor": null,
    "formaPagamento": null,
    "numeroParcelas": null,
    "clienteId": "f59252f4-e256-4ed2-a8bd-75a8717d9403"
  },
  {
    "id": "6cd06d03-3a7f-4a03-89fe-c0cea0e81c2d",
    "date": "2026-08-03",
    "startTime": "15:00",
    "duration": 60,
    "service": "Google Agenda",
    "status": "AGENDADO",
    "googleEventId": "i47pc890ln17n2b7ols5b83190",
    "valor": null,
    "formaPagamento": null,
    "numeroParcelas": null,
    "clienteId": "337c4a60-caf7-4a5d-b483-5d89264878ef"
  },
  {
    "id": "4052fedd-687a-46f3-816e-ac189b0eb09f",
    "date": "2026-08-07",
    "startTime": "16:30",
    "duration": 60,
    "service": "Google Agenda",
    "status": "AGENDADO",
    "googleEventId": "m897u922u5kqdi7ja0sv18eino",
    "valor": null,
    "formaPagamento": null,
    "numeroParcelas": null,
    "clienteId": "2226db22-48dc-412a-91ec-2b61be3e48db"
  },
  {
    "id": "ffbe4295-34f2-4ea8-b322-b24a6995e14b",
    "date": "2026-08-07",
    "startTime": "17:17",
    "duration": 60,
    "service": "Capilar (5 sessões)",
    "status": "AGENDADO",
    "googleEventId": "3hntu5chfq5i6e0ma220s4db1c",
    "valor": null,
    "formaPagamento": null,
    "numeroParcelas": null,
    "clienteId": "3ad0131f-79c6-437c-adc8-0b6935582282"
  },
  {
    "id": "c837d92e-c6aa-414c-bba7-99dbe368881b",
    "date": "2026-08-07",
    "startTime": "17:17",
    "duration": 60,
    "service": "Capilar (5 sessões)",
    "status": "AGENDADO",
    "googleEventId": "nsr02l11g3i9g5rvlq05vs4btc",
    "valor": null,
    "formaPagamento": null,
    "numeroParcelas": null,
    "clienteId": "3ad0131f-79c6-437c-adc8-0b6935582282"
  },
  {
    "id": "3114d990-73d9-4d5f-bd89-e47f0396c5dc",
    "date": "2026-08-07",
    "startTime": "17:17",
    "duration": 60,
    "service": "Capilar (5 sessões)",
    "status": "AGENDADO",
    "googleEventId": "q2amebo0um3ts223og8gbgov1c",
    "valor": null,
    "formaPagamento": null,
    "numeroParcelas": null,
    "clienteId": "3ad0131f-79c6-437c-adc8-0b6935582282"
  },
  {
    "id": "186c6e4c-8e51-4841-9000-ee8660c54382",
    "date": "2026-08-07",
    "startTime": "17:30",
    "duration": 60,
    "service": "Google Agenda",
    "status": "AGENDADO",
    "googleEventId": "38al0upi3mm43f5dintka3b2ro",
    "valor": null,
    "formaPagamento": null,
    "numeroParcelas": null,
    "clienteId": "e4cbeea7-31ab-4f36-b6a6-3fa8641187a4"
  },
  {
    "id": "422ff862-b1f5-44dc-a4a5-e391ae701553",
    "date": "2026-08-10",
    "startTime": "15:00",
    "duration": 60,
    "service": "Google Agenda",
    "status": "AGENDADO",
    "googleEventId": "jlk1c276rmbv1cdveonrlnufb8",
    "valor": null,
    "formaPagamento": null,
    "numeroParcelas": null,
    "clienteId": "72796d06-e537-4d32-ad86-5c73febae068"
  },
  {
    "id": "8bc8c249-8ffe-48ea-9847-61b4ae2ef3a3",
    "date": "2026-08-10",
    "startTime": "16:00",
    "duration": 60,
    "service": "Google Agenda",
    "status": "AGENDADO",
    "googleEventId": "0enq7ocaahpad4pmlnedavg4ro",
    "valor": null,
    "formaPagamento": null,
    "numeroParcelas": null,
    "clienteId": "49ec093f-4c89-487a-b54b-1e3a80d35377"
  },
  {
    "id": "308084b1-72b4-4234-aa2a-165f7a6556cf",
    "date": "2026-08-10",
    "startTime": "16:41",
    "duration": 60,
    "service": "Botox",
    "status": "AGENDADO",
    "googleEventId": "qju7dctvqqvhfvdv6rb36ti8ho",
    "valor": null,
    "formaPagamento": null,
    "numeroParcelas": null,
    "clienteId": "5f635d12-7fea-4cc5-ba93-a2a46a3fae40"
  },
  {
    "id": "35828b10-3357-4bd5-9e7d-44da6c2e8ec6",
    "date": "2026-08-10",
    "startTime": "16:41",
    "duration": 60,
    "service": "Botox",
    "status": "AGENDADO",
    "googleEventId": "u318r98vtina1oljkqf7ncg4u4",
    "valor": null,
    "formaPagamento": null,
    "numeroParcelas": null,
    "clienteId": "5f635d12-7fea-4cc5-ba93-a2a46a3fae40"
  },
  {
    "id": "e27143d5-80e2-423d-a4ad-e74bf2120a64",
    "date": "Invalid Date",
    "startTime": "Invalid Date",
    "duration": 60,
    "service": "Google Agenda",
    "status": "AGENDADO",
    "googleEventId": "9c5n57keglu8poafue7b46419k",
    "valor": null,
    "formaPagamento": null,
    "numeroParcelas": null,
    "clienteId": "e6f81510-a78a-4656-978e-e2c4f853d4b2"
  },
  {
    "id": "799bc2e8-b06b-4463-b497-1aa63f01e11c",
    "date": "2026-08-11",
    "startTime": "08:00",
    "duration": 300,
    "service": "Google Agenda",
    "status": "AGENDADO",
    "googleEventId": "92tu38fj09iojr0108k2m7vm48",
    "valor": null,
    "formaPagamento": null,
    "numeroParcelas": null,
    "clienteId": "18df2098-eb29-459e-a0b7-b73b5bec16e7"
  },
  {
    "id": "b7eb23cc-5b03-4e31-99e3-f3ccb07bff86",
    "date": "2026-08-13",
    "startTime": "09:00",
    "duration": 60,
    "service": "Google Agenda",
    "status": "AGENDADO",
    "googleEventId": "hbfv9h8dp1l66o8e6uoh443fsk",
    "valor": null,
    "formaPagamento": null,
    "numeroParcelas": null,
    "clienteId": "716c8927-008b-484d-8c39-7714aae0ffdf"
  },
  {
    "id": "368011c8-b857-433a-b7eb-641dc4d8a29c",
    "date": "2026-07-03",
    "startTime": "12:00",
    "duration": 60,
    "service": "Google Agenda",
    "status": "AGENDADO",
    "googleEventId": "4i6em0le5ifl95p1be0sdq6s8c",
    "valor": null,
    "formaPagamento": null,
    "numeroParcelas": null,
    "clienteId": "47a254fa-f91d-4378-b44c-c0de3d3ec1b6"
  },
  {
    "id": "b7c81f4d-3fe6-4cf3-8b95-544653e2ab35",
    "date": "2026-07-03",
    "startTime": "14:30",
    "duration": 60,
    "service": "Google Agenda",
    "status": "AGENDADO",
    "googleEventId": "9fpe0506vpeumolqnl4o1b2evo",
    "valor": null,
    "formaPagamento": null,
    "numeroParcelas": null,
    "clienteId": "971f913f-83de-43a5-9d8e-4572123d81b7"
  },
  {
    "id": "8e79c4e6-1d49-48b1-a8b1-02f6d275f535",
    "date": "2026-07-03",
    "startTime": "15:05",
    "duration": 60,
    "service": "Microagulhamento",
    "status": "AGENDADO",
    "googleEventId": "224hfl218t44d8j0f48g3sl9ro",
    "valor": null,
    "formaPagamento": null,
    "numeroParcelas": null,
    "clienteId": "b32c1513-4d88-45fb-83f1-1e9a5915f82f"
  },
  {
    "id": "e1303629-e270-4928-962a-812eb9a77563",
    "date": "2026-07-03",
    "startTime": "17:31",
    "duration": 60,
    "service": "PDRN",
    "status": "AGENDADO",
    "googleEventId": "fnctrkuknpjd14bo15ogto7t84",
    "valor": null,
    "formaPagamento": null,
    "numeroParcelas": null,
    "clienteId": "b32c1513-4d88-45fb-83f1-1e9a5915f82f"
  },
  {
    "id": "be403ef1-ebad-4f11-917c-0e836a88863c",
    "date": "2026-07-14",
    "startTime": "11:00",
    "duration": 60,
    "service": "Google Agenda",
    "status": "AGENDADO",
    "googleEventId": "8ul82ah84ntnn0q74kqqefmld8",
    "valor": null,
    "formaPagamento": null,
    "numeroParcelas": null,
    "clienteId": "a2e61578-8037-492f-a687-c7afdb8a5656"
  },
  {
    "id": "fc5e97d2-03aa-4a0d-9314-b479c7944d07",
    "date": "2026-07-18",
    "startTime": "13:37",
    "duration": 60,
    "service": "Aplicação de Vitaminas",
    "status": "AGENDADO",
    "googleEventId": "omfjc56599ueek09tba31ipl00",
    "valor": null,
    "formaPagamento": null,
    "numeroParcelas": null,
    "clienteId": "7f07ab87-d6f0-46ea-92d6-3649539d23d8"
  },
  {
    "id": "4296fde9-504f-4180-8008-2dfd5eeced7d",
    "date": "2026-07-18",
    "startTime": "13:50",
    "duration": 60,
    "service": "Botox",
    "status": "AGENDADO",
    "googleEventId": "o9qlaf9e9h54mo9qdp3odb6krs",
    "valor": null,
    "formaPagamento": null,
    "numeroParcelas": null,
    "clienteId": "b5722c75-09ee-49cd-aef5-54660f3f35fb"
  },
  {
    "id": "0143781d-56d9-49d7-8f17-f5a5fda99df4",
    "date": "2026-07-18",
    "startTime": "15:11",
    "duration": 60,
    "service": "PDRN",
    "status": "AGENDADO",
    "googleEventId": "glqpnce2i2k3h8olc1q7ptoh90",
    "valor": null,
    "formaPagamento": null,
    "numeroParcelas": null,
    "clienteId": "b5722c75-09ee-49cd-aef5-54660f3f35fb"
  },
  {
    "id": "0ad78925-73d5-4a94-ad35-55bcbf3726a2",
    "date": "2026-07-18",
    "startTime": "15:11",
    "duration": 60,
    "service": "PDRN",
    "status": "AGENDADO",
    "googleEventId": "j1m07pkbmtmeva0m2be58nfj84",
    "valor": null,
    "formaPagamento": null,
    "numeroParcelas": null,
    "clienteId": "b5722c75-09ee-49cd-aef5-54660f3f35fb"
  },
  {
    "id": "86215ed9-0aed-473a-afe2-73c154db7a68",
    "date": "2026-07-20",
    "startTime": "17:00",
    "duration": 60,
    "service": "Google Agenda",
    "status": "AGENDADO",
    "googleEventId": "hllemhmevbcblqsaeu40g0bo7g",
    "valor": null,
    "formaPagamento": null,
    "numeroParcelas": null,
    "clienteId": "b794786f-f8dc-4b70-9cdf-2d4b11679f2a"
  },
  {
    "id": "b49e4c55-f031-43eb-983a-207a71718669",
    "date": "2026-07-23",
    "startTime": "09:30",
    "duration": 60,
    "service": "Google Agenda",
    "status": "AGENDADO",
    "googleEventId": "24j4s2n9pmkt2vnndrhnrd60lk",
    "valor": null,
    "formaPagamento": null,
    "numeroParcelas": null,
    "clienteId": "2ba67769-b505-4120-b61b-92b61f499985"
  },
  {
    "id": "49d7a40a-ebe3-4146-ac4e-0423688c9055",
    "date": "2026-07-24",
    "startTime": "13:00",
    "duration": 60,
    "service": "Google Agenda",
    "status": "AGENDADO",
    "googleEventId": "954ckf10dt0nrh9oj1o8qcjem4",
    "valor": null,
    "formaPagamento": null,
    "numeroParcelas": null,
    "clienteId": "bd82cc27-0df9-47e1-9834-58750cc0b921"
  },
  {
    "id": "b667c928-885e-4c31-ad30-334da68b3b2f",
    "date": "2026-07-24",
    "startTime": "16:00",
    "duration": 60,
    "service": "Google Agenda",
    "status": "AGENDADO",
    "googleEventId": "fvr1ku48coi8t7pkg97ijs64u8",
    "valor": null,
    "formaPagamento": null,
    "numeroParcelas": null,
    "clienteId": "41aec4c2-6431-4c57-89bd-aaf0cf2eb2aa"
  },
  {
    "id": "6c4767ea-95e2-4ce3-8d63-6eca5d8c0616",
    "date": "2026-07-24",
    "startTime": "17:00",
    "duration": 60,
    "service": "Google Agenda",
    "status": "AGENDADO",
    "googleEventId": "c02ns9r3l27cked8prscvn67ik",
    "valor": null,
    "formaPagamento": null,
    "numeroParcelas": null,
    "clienteId": "dcefc1ab-9ab9-4fa7-b809-321313fcb1c7"
  },
  {
    "id": "6f071f58-eea3-47a5-8e12-32db51a8647b",
    "date": "2026-07-24",
    "startTime": "18:00",
    "duration": 60,
    "service": "Google Agenda",
    "status": "AGENDADO",
    "googleEventId": "b2beq6o6ss99cl2qps2ndrgb7g",
    "valor": null,
    "formaPagamento": null,
    "numeroParcelas": null,
    "clienteId": "83fc1e12-2578-4b01-959d-5c636d99f8c4"
  },
  {
    "id": "bcf4d0f0-2aac-4cfb-b574-8cd68ea65a7e",
    "date": "2026-08-21",
    "startTime": "16:20",
    "duration": 60,
    "service": "Google Agenda",
    "status": "AGENDADO",
    "googleEventId": "irke839f5rhv2mg4arqv1lb8gs",
    "valor": null,
    "formaPagamento": null,
    "numeroParcelas": null,
    "clienteId": "47aaf134-2903-461b-97f6-4497766b9f64"
  },
  {
    "id": "ca5e6287-3669-46f1-abd3-e0679562187d",
    "date": "2026-08-21",
    "startTime": "17:00",
    "duration": 60,
    "service": "Google Agenda",
    "status": "AGENDADO",
    "googleEventId": "v74fv6pg1es6i4ak5uf43cbi6g",
    "valor": null,
    "formaPagamento": null,
    "numeroParcelas": null,
    "clienteId": "68511298-8708-4016-9ad4-46b1e43d86a5"
  },
  {
    "id": "332b81f4-e6f8-49ee-ba03-907f854d0ce3",
    "date": "2026-08-22",
    "startTime": "09:30",
    "duration": 60,
    "service": "Google Agenda",
    "status": "AGENDADO",
    "googleEventId": "ihrjs4h5bjib9cimhfc26qnu0o",
    "valor": null,
    "formaPagamento": null,
    "numeroParcelas": null,
    "clienteId": "96a7aebb-566f-40d8-bd91-d56a5acec7c6"
  },
  {
    "id": "35410a05-c462-421c-ab70-486137c7fcbd",
    "date": "2026-08-17",
    "startTime": "18:30",
    "duration": 60,
    "service": "Limpeza de Pele",
    "status": "AGENDADO",
    "googleEventId": "86lb5kgqoernqolj62onsb3ldg",
    "valor": "",
    "formaPagamento": "",
    "numeroParcelas": null,
    "clienteId": "419b3237-28f8-4dd4-8c36-466244169055"
  },
  {
    "id": "bb29b819-637a-4c0f-a34a-0277fbfbad6a",
    "date": "2026-08-17",
    "startTime": "16:00",
    "duration": 60,
    "service": "Google Agenda",
    "status": "AGENDADO",
    "googleEventId": "vjdo8l2isar07538duhohmf4tc",
    "valor": null,
    "formaPagamento": null,
    "numeroParcelas": null,
    "clienteId": "3ae87394-7a36-4506-ac2c-a9e006a71802"
  },
  {
    "id": "7eddc95e-d349-4c62-9344-dfef75d2ac9a",
    "date": "2026-08-15",
    "startTime": "17:45",
    "duration": 60,
    "service": "Capilar",
    "status": "AGENDADO",
    "googleEventId": "nd40mc6kqt3teb44dn0hhuth74",
    "valor": "",
    "formaPagamento": "",
    "numeroParcelas": 1,
    "clienteId": "c350ccfe-fe55-4045-8126-e78b7c8f627c"
  },
  {
    "id": "e7fdb407-b7eb-4e71-8ff6-2f50f030b4ce",
    "date": "2026-08-17",
    "startTime": "17:45",
    "duration": 60,
    "service": "Retorno - Capilar",
    "status": "AGENDADO",
    "googleEventId": "51qg4rfogh5h38annsebsvb9b0",
    "valor": null,
    "formaPagamento": null,
    "numeroParcelas": null,
    "clienteId": "c350ccfe-fe55-4045-8126-e78b7c8f627c"
  }
];
    for (const a of defaultAppointments) {
      if (!a.date || a.date === 'Invalid Date') continue;
      const exists = await prisma.agendamento.findUnique({ where: { id: a.id } });
      if (!exists) {
        await prisma.agendamento.create({ data: a });
      }
    }

    const totalProcs = await prisma.procedimento.count();
    const totalClients = await prisma.cliente.count();
    const totalProducts = await prisma.estoqueProduto.count();
    const totalAppointments = await prisma.agendamento.count();

    return NextResponse.json({
      success: true,
      message: "Tabelas e TODOS os dados do banco local foram migrados com sucesso para o PostgreSQL!",
      stats: {
        config: config.nomeFantasia,
        procedimentos: totalProcs,
        clientes: totalClients,
        produtos: totalProducts,
        agendamentos: totalAppointments,
      }
    });

  } catch (err: any) {
    console.error("Erro ao inicializar banco de dados:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
