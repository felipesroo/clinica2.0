"use server";

import { prisma } from '@/lib/prisma';
export interface EstoqueProdutoData {
  id: string;
  nome: string;
  categoria: string;
  quantidade: number;
  unidade: string;
  status: string;
}

export async function getEstoque() {
  const items = await prisma.estoqueProduto.findMany({
    orderBy: { nome: 'asc' }
  });
  return items.map((p: any) => ({
    id: p.id,
    nome: p.nome,
    categoria: p.categoria,
    quantidade: p.quantidade,
    unidade: p.unidade,
    status: p.status,
    criadoEm: p.criadoEm?.toISOString() ?? null,
    atualizadoEm: p.atualizadoEm?.toISOString() ?? null,
  }));
}

export async function createEstoqueProduto(data: Omit<EstoqueProdutoData, 'id' | 'status'>) {
  let status = "Em Estoque";
  if (data.quantidade === 0) status = "Esgotado";
  else if (data.quantidade < 5) status = "Estoque Baixo";

  const prod = await prisma.estoqueProduto.create({
    data: {
      ...data,
      status
    }
  });
  return { success: true, id: prod.id };
}

export async function deleteEstoqueProduto(id: string) {
  await prisma.estoqueProduto.delete({ where: { id } });
  return { success: true };
}

export async function ajustarEstoque(id: string, variacao: number, tipo: "ENTRADA" | "SAIDA") {
  // Transação para garantir consistência
  return await prisma.$transaction(async (tx) => {
    const prod = await tx.estoqueProduto.findUnique({ where: { id } });
    if (!prod) throw new Error("Produto não encontrado");

    const novaQuantidade = prod.quantidade + variacao; // variacao deve ser negativo para SAIDA
    let status = "Em Estoque";
    if (novaQuantidade <= 0) status = "Esgotado";
    else if (novaQuantidade < 5) status = "Estoque Baixo";

    await tx.estoqueProduto.update({
      where: { id },
      data: { quantidade: Math.max(0, novaQuantidade), status }
    });

    await tx.estoqueMovimentacao.create({
      data: {
        produtoId: id,
        quantidade: variacao,
        tipo
      }
    });

    return { success: true };
  });
}

export async function registrarBaixaAgendamento(agendamentoId: string, itens: { produtoId: string, quantidade: number }[]) {
  if (itens.length === 0) return { success: true };

  return await prisma.$transaction(async (tx) => {
    for (const item of itens) {
      if (item.quantidade <= 0) continue;

      const prod = await tx.estoqueProduto.findUnique({ where: { id: item.produtoId } });
      if (!prod) continue;

      const novaQuantidade = prod.quantidade - item.quantidade;
      let status = "Em Estoque";
      if (novaQuantidade <= 0) status = "Esgotado";
      else if (novaQuantidade < 5) status = "Estoque Baixo";

      await tx.estoqueProduto.update({
        where: { id: prod.id },
        data: { quantidade: Math.max(0, novaQuantidade), status }
      });

      await tx.estoqueMovimentacao.create({
        data: {
          produtoId: prod.id,
          quantidade: -item.quantidade,
          tipo: "USO_AGENDAMENTO",
          agendamentoId
        }
      });
    }
    return { success: true };
  });
}

export async function getMovimentacoesPorAgendamento(agendamentoId: string) {
  const movs = await prisma.estoqueMovimentacao.findMany({
    where: { agendamentoId, tipo: "USO_AGENDAMENTO" },
    include: { produto: true }
  });
  
  return movs.map(m => ({
    produtoId: m.produtoId,
    quantidade: Math.abs(m.quantidade)
  }));
}

export async function reverterBaixaAgendamento(agendamentoId: string) {
  return await prisma.$transaction(async (tx) => {
    const movs = await tx.estoqueMovimentacao.findMany({
      where: { agendamentoId, tipo: "USO_AGENDAMENTO" }
    });
    
    for (const mov of movs) {
      const prod = await tx.estoqueProduto.findUnique({ where: { id: mov.produtoId } });
      if (!prod) continue;
      
      const quantidadeDevolvida = Math.abs(mov.quantidade);
      const novaQuantidade = prod.quantidade + quantidadeDevolvida;
      
      let status = "Em Estoque";
      if (novaQuantidade <= 0) status = "Esgotado";
      else if (novaQuantidade < 5) status = "Estoque Baixo";
      
      await tx.estoqueProduto.update({
        where: { id: prod.id },
        data: { quantidade: novaQuantidade, status }
      });
      
      await tx.estoqueMovimentacao.delete({ where: { id: mov.id } });
    }
    
    return { success: true };
  });
}

export async function sincronizarBaixaAgendamento(agendamentoId: string, novosItens: { produtoId: string, quantidade: number }[]) {
  // Revert all existing movements first
  await reverterBaixaAgendamento(agendamentoId);
  
  // Then apply the new ones
  if (novosItens && novosItens.length > 0) {
    await registrarBaixaAgendamento(agendamentoId, novosItens);
  }
  
  return { success: true };
}
