import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import { execSync } from 'child_process';

export async function GET() {
  try {
    // 0. Ensure PostgreSQL schema tables exist
    try {
      execSync('npx prisma db push --schema=./prisma/schema.prisma --accept-data-loss', { stdio: 'pipe' });
    } catch (pushErr: any) {
      console.error("DB push error in seed route:", pushErr?.message);
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
      { nome: 'Capilar', duracao: 60, preco: 350 },
      { nome: 'Botox', duracao: 45, preco: 950 },
      { nome: 'Preenchimento', duracao: 60, preco: 1200 },
      { nome: 'Limpeza de Pele', duracao: 60, preco: 250 },
      { nome: 'PDRN', duracao: 45, preco: 800 },
      { nome: 'Microagulhamento', duracao: 60, preco: 450 },
      { nome: 'Aplicação de Vitaminas', duracao: 30, preco: 300 },
    ];

    for (const proc of defaultProcedures) {
      const exists = await prisma.procedimento.findFirst({ where: { nome: proc.nome } });
      if (!exists) {
        await prisma.procedimento.create({ data: proc });
      }
    }

    // 3. Seed Estoque (Products)
    const defaultProducts = [
      { nome: 'Botox', categoria: 'Toxinas', quantidade: 150, unidade: 'ui', status: 'Em Estoque' },
      { nome: 'Limpeza de Pele', categoria: 'Geral', quantidade: 50, unidade: 'un.', status: 'Em Estoque' },
      { nome: 'Ácido Hialurônico', categoria: 'Preenchedores', quantidade: 10, unidade: 'un.', status: 'Em Estoque' },
    ];

    for (const prod of defaultProducts) {
      const exists = await prisma.estoqueProduto.findFirst({ where: { nome: prod.nome } });
      if (!exists) {
        await prisma.estoqueProduto.create({ data: prod });
      }
    }

    // 4. Seed Patients
    const mainPatients = [
      { nome: 'FELIPE SOARES RIBEIRO DE OLIVEIRA', telefone: '62994437642' },
      { nome: 'Dra. Jordane Faria', telefone: '556281863740' },
      { nome: 'Danielle varizes e limpeza de pele', telefone: '' },
      { nome: 'Pollyanna botox', telefone: '' },
      { nome: 'Arthur botox', telefone: '' },
      { nome: 'Thyessa Lorrane Pereira Reis', telefone: '' },
      { nome: 'Rômulo capilar', telefone: '' }
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
      message: "Banco de dados inicializado com sucesso!",
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
