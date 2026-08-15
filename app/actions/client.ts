"use server";

import { prisma } from '@/lib/prisma';
export interface ClientProfile {
  id: string;
  nome: string;
  email: string | null;
  telefone: string | null;
  dataNascimento: string | null;
  tipoPele: string | null;
  objetivoPrincipal: string | null;
  alergias: string | null;
  avatarUrl: string | null;
  dataCadastro?: Date | string | null;
}

export async function getClientById(id: string): Promise<ClientProfile | null> {
  const client = await prisma.cliente.findUnique({
    where: { id }
  });
  return client;
}

export async function updateClientAction(id: string, data: Partial<ClientProfile>) {
  const updateData: any = { ...data };
  if (updateData.dataCadastro && typeof updateData.dataCadastro === 'string') {
    updateData.dataCadastro = new Date(updateData.dataCadastro);
  }
  await prisma.cliente.update({
    where: { id },
    data: updateData
  });
  return { success: true };
}

export async function getAllClientsList() {
  const clients = await prisma.cliente.findMany({
    include: { agendamentos: { orderBy: { date: 'desc' } } }
  });
  
  return clients.map((c: any) => ({
    id: c.id,
    name: c.nome,
    phone: c.telefone || "",
    avatar: c.avatarUrl || "",
    initials: c.nome.substring(0,2).toUpperCase(),
    lastVisit: c.agendamentos.length > 0 ? new Date(c.agendamentos[0].date + 'T12:00:00').toLocaleDateString('pt-BR') : "Sem visitas",
    nextAppointment: "Sem agendamentos",
    isVip: false,
    memberSince: `Paciente desde ${new Date(c.dataCadastro).getFullYear()}`,
    totalVisits: c.agendamentos.length,
    lifetimeValue: "R$ 0",
    recentTreatments: c.agendamentos.slice(0,2).map((a: any) => ({ name: a.service, date: new Date(a.date + 'T12:00:00').toLocaleDateString('pt-BR'), colorClass: "bg-primary" })),
    progressPhotos: []
  }));
}

export async function createClientAction(data: { nome: string; telefone?: string; email?: string }) {
  const cliente = await prisma.cliente.create({
    data: {
      nome: data.nome,
      telefone: data.telefone || null,
      email: data.email || null,
    }
  });
  return { success: true, id: cliente.id };
}

export async function deleteClientAction(id: string) {
  const client = await prisma.cliente.findUnique({
    where: { id },
    include: { agendamentos: true }
  });
  
  if (client) {
    const { deleteAppointment } = await import('./clinic');
    for (const app of client.agendamentos) {
      await deleteAppointment(app.id);
    }
    
    await prisma.cliente.delete({
      where: { id }
    });
  }
  return { success: true };
}
