import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

export async function GET() {
  try {
    // Execute DDL statements individually to ensure full execution in PostgreSQL
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

    // 1. Seed or Update Configuracao (Clinic Profile & WAHA)
    const config = await prisma.configuracao.upsert({
      where: { id: "1" },
      update: {
        nomeFantasia: "Clínica da Dra. Jordane Ferreira Faria",
        razaoSocial: "Dra. Jordane Ferreira Faria Estética Avançada",
        wahaUrl: "http://waha:3000",
        wahaSessionName: "default",
        msgConfirmacaoAtiva: true,
        msgLembreteAtiva: true,
        msgLembrete2hAtiva: true,
      },
      create: {
        id: "1",
        nomeFantasia: "Clínica da Dra. Jordane Ferreira Faria",
        razaoSocial: "Dra. Jordane Ferreira Faria Estética Avançada",
        wahaUrl: "http://waha:3000",
        wahaSessionName: "default",
        msgConfirmacaoAtiva: true,
        msgLembreteAtiva: true,
        msgLembrete2hAtiva: true,
      }
    });

    // 2. Seed Procedimentos
    const defaultProcedures = [
      { id: 'p1', nome: 'Capilar', duracao: 60, preco: 350, cor: 'bg-primary' },
      { id: 'p2', nome: 'Botox', duracao: 45, preco: 950, cor: 'bg-primary' },
      { id: 'p3', nome: 'Preenchimento', duracao: 60, preco: 1200, cor: 'bg-primary' },
      { id: 'p4', nome: 'Limpeza de Pele', duracao: 60, preco: 250, cor: 'bg-primary' },
      { id: 'p5', nome: 'PDRN', duracao: 45, preco: 800, cor: 'bg-primary' },
      { id: 'p6', nome: 'Microagulhamento', duracao: 60, preco: 450, cor: 'bg-primary' },
      { id: 'p7', nome: 'Aplicação de Vitaminas', duracao: 30, preco: 300, cor: 'bg-primary' },
    ];

    for (const proc of defaultProcedures) {
      const exists = await prisma.procedimento.findFirst({ where: { nome: proc.nome } });
      if (!exists) {
        await prisma.procedimento.create({ data: proc });
      }
    }

    // 3. Seed Estoque (Products)
    const defaultProducts = [
      { id: 'pr1', nome: 'Botox', categoria: 'Toxinas', quantidade: 150, unidade: 'ui', status: 'Em Estoque' },
      { id: 'pr2', nome: 'Limpeza de Pele', categoria: 'Geral', quantidade: 51, unidade: 'un.', status: 'Em Estoque' },
      { id: 'pr3', nome: 'Ácido Hialurônico', categoria: 'Preenchedores', quantidade: 10, unidade: 'un.', status: 'Em Estoque' },
    ];

    for (const prod of defaultProducts) {
      const exists = await prisma.estoqueProduto.findFirst({ where: { nome: prod.nome } });
      if (!exists) {
        await prisma.estoqueProduto.create({ data: prod });
      }
    }

    // 4. Seed Patients
    const mainPatients = [
      { id: 'c1', nome: 'FELIPE SOARES RIBEIRO DE OLIVEIRA', telefone: '62994437642' },
      { id: 'c2', nome: 'Dra. Jordane Faria', telefone: '556281863740' },
      { id: 'c3', nome: 'Danielle varizes e limpeza de pele', telefone: '' },
      { id: 'c4', nome: 'Pollyanna botox', telefone: '' },
      { id: 'c5', nome: 'Arthur botox', telefone: '' },
      { id: 'c6', nome: 'Thyessa Lorrane Pereira Reis', telefone: '' },
      { id: 'c7', nome: 'Rômulo capilar', telefone: '' }
    ];

    for (const p of mainPatients) {
      const exists = await prisma.cliente.findFirst({ where: { nome: p.nome } });
      if (!exists) {
        await prisma.cliente.create({ data: p });
      }
    }

    const totalProcs = await prisma.procedimento.count();
    const totalClients = await prisma.cliente.count();
    const totalProducts = await prisma.estoqueProduto.count();

    return NextResponse.json({
      success: true,
      message: "Tabelas criadas e dados inicializados com sucesso no PostgreSQL!",
      stats: {
        config: config.nomeFantasia,
        procedimentos: totalProcs,
        clientes: totalClients,
        produtos: totalProducts,
      }
    });

  } catch (err: any) {
    console.error("Erro ao inicializar banco de dados:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
