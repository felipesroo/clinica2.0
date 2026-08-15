"use server";
import { prisma } from '@/lib/prisma';
export async function globalSearch(query: string) {
  if (!query || query.trim().length < 2) {
    return { pacientes: [], agendamentos: [] };
  }

  const searchTerm = query.trim();

  // Search Pacientes
  const pacientes = await prisma.cliente.findMany({
    where: {
      OR: [
        { nome: { contains: searchTerm, mode: 'insensitive' } },
        { telefone: { contains: searchTerm, mode: 'insensitive' } },
      ]
    },
    take: 5
  });

  // Search Agendamentos
  const agendamentos = await prisma.agendamento.findMany({
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

  return { pacientes, agendamentos };
}
