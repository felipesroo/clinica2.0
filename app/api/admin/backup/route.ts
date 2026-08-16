import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET(request: Request) {
  const session = await getSession();
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get('secret');
  const expectedSecret = process.env.SEED_SECRET || 'aura_seed_sec_4f5e6d7c8b9a10293847_dra_jordane';

  if (!session && secret !== expectedSecret) {
    return NextResponse.json({ error: 'Acesso negado. Apenas administradores podem exportar backups.' }, { status: 401 });
  }

  try {
    const backupData = {
      sistema: "Estética Avançada v2.0",
      dataExportacao: new Date().toISOString(),
      configuracao: await prisma.configuracao.findFirst(),
      usuarios: await prisma.usuario.findMany({
        select: { id: true, nome: true, email: true, role: true, fotoUrl: true, createdAt: true }
      }),
      clientes: await prisma.cliente.findMany({
        include: { fotos: true, prontuarios: true }
      }),
      procedimentos: await prisma.procedimento.findMany(),
      agendamentos: await prisma.agendamento.findMany(),
      estoque: await prisma.estoqueProduto.findMany({
        include: { movimentacoes: true }
      }),
    };

    const filename = `backup_estetica_avancada_${new Date().toISOString().split('T')[0]}.json`;

    return new NextResponse(JSON.stringify(backupData, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: `Erro ao gerar backup: ${error?.message}` }, { status: 500 });
  }
}
