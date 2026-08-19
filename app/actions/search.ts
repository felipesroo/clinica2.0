"use server";
import { prisma } from '@/lib/prisma';

export async function globalSearch(query: string) {
  if (!query || query.trim().length < 2) {
    return { pacientes: [], agendamentos: [] };
  }

  const searchTerm = query.trim();

  // Search Pacientes
  const pacientesRaw = await prisma.cliente.findMany({
    where: {
      OR: [
        { nome: { contains: searchTerm, mode: 'insensitive' } },
        { telefone: { contains: searchTerm, mode: 'insensitive' } },
      ]
    },
    take: 5
  });

  const pacientes = pacientesRaw.map((p: any) => ({
    id: p.id,
    nome: p.nome,
    email: p.email,
    telefone: p.telefone,
    avatarUrl: p.avatarUrl,
    dataCadastro: p.dataCadastro?.toISOString() ?? null,
    dataNascimento: p.dataNascimento,
    tipoPele: p.tipoPele,
    objetivoPrincipal: p.objetivoPrincipal,
    alergias: p.alergias,
  }));

  // Search Agendamentos
  const agendamentosRaw = await prisma.agendamento.findMany({
    where: {
      OR: [
        { service: { contains: searchTerm, mode: 'insensitive' } },
        { date: { contains: searchTerm, mode: 'insensitive' } },
        {
          cliente: {
            nome: { contains: searchTerm, mode: 'insensitive' }
          }
        }
      ]
    },
    include: { cliente: true },
    take: 5,
    orderBy: { date: 'desc' }
  });

  const agendamentos = agendamentosRaw.map((a: any) => ({
    id: a.id,
    date: a.date,
    startTime: a.startTime,
    duration: a.duration,
    service: a.service,
    status: a.status,
    googleEventId: a.googleEventId,
    valor: a.valor,
    formaPagamento: a.formaPagamento,
    numeroParcelas: a.numeroParcelas,
    clienteId: a.clienteId,
    cliente: a.cliente ? {
      id: a.cliente.id,
      nome: a.cliente.nome,
      email: a.cliente.email,
      telefone: a.cliente.telefone,
      avatarUrl: a.cliente.avatarUrl,
      dataCadastro: a.cliente.dataCadastro?.toISOString() ?? null,
    } : null,
  }));

  return { pacientes, agendamentos };
}
