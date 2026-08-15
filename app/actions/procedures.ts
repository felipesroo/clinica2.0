"use server";

import { prisma } from '@/lib/prisma';
export interface ProcedimentoData {
  id: string;
  nome: string;
  duracao: number;
  preco: number;
  cor: string;
}

export async function getProcedimentos() {
  const procedimentos = await prisma.procedimento.findMany({
    orderBy: { nome: 'asc' }
  });
  return procedimentos;
}

export async function createProcedimento(data: Omit<ProcedimentoData, 'id'>) {
  const procedimento = await prisma.procedimento.create({
    data: {
      nome: data.nome,
      duracao: data.duracao,
      preco: data.preco,
      cor: data.cor
    }
  });
  return { success: true, id: procedimento.id };
}

export async function updateProcedimento(id: string, data: Partial<ProcedimentoData>) {
  await prisma.procedimento.update({
    where: { id },
    data
  });
  return { success: true };
}

export async function deleteProcedimento(id: string) {
  await prisma.procedimento.delete({
    where: { id }
  });
  return { success: true };
}
