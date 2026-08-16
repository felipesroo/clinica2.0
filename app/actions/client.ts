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

/**
 * Intelligent helper to find an existing client or create a new one without duplicates.
 * Matches by:
 * 1. Phone number (normalized to digits, checks last 8-9 digits).
 * 2. Email (case-insensitive).
 * 3. Name (case-insensitive with trimming).
 */
export async function findOrCreateClient(params: {
  nome: string;
  telefone?: string | null;
  email?: string | null;
}) {
  const rawName = (params.nome || "").trim();
  const rawPhone = (params.telefone || "").trim();
  const rawEmail = (params.email || "").trim();
  const cleanPhone = rawPhone.replace(/\D/g, "");

  // 1. Check by phone number if valid (digits >= 8)
  if (cleanPhone.length >= 8) {
    const lastDigits = cleanPhone.slice(-8);
    const existingByPhone = await prisma.cliente.findFirst({
      where: {
        telefone: { contains: lastDigits }
      }
    });

    if (existingByPhone) {
      const updates: any = {};
      if (rawPhone && existingByPhone.telefone !== rawPhone) {
        updates.telefone = rawPhone;
      }
      if (rawEmail && !existingByEmailSafe(existingByPhone.email, rawEmail)) {
        updates.email = rawEmail;
      }
      if (rawName && (existingByPhone.nome === "Google Agenda" || existingByPhone.nome.toLowerCase() === rawName.toLowerCase())) {
        updates.nome = rawName;
      }
      if (Object.keys(updates).length > 0) {
        return await prisma.cliente.update({
          where: { id: existingByPhone.id },
          data: updates
        });
      }
      return existingByPhone;
    }
  }

  // 2. Check by email if provided
  if (rawEmail) {
    const existingByEmail = await prisma.cliente.findFirst({
      where: {
        email: { equals: rawEmail, mode: 'insensitive' }
      }
    });
    if (existingByEmail) {
      if (rawPhone && !existingByEmail.telefone) {
        await prisma.cliente.update({
          where: { id: existingByEmail.id },
          data: { telefone: rawPhone }
        });
      }
      return existingByEmail;
    }
  }

  // 3. Check by name (case-insensitive exact match)
  if (rawName) {
    const existingByName = await prisma.cliente.findFirst({
      where: {
        nome: { equals: rawName, mode: 'insensitive' }
      }
    });

    if (existingByName) {
      if (rawPhone && (!existingByName.telefone || existingByName.telefone.replace(/\D/g, "").length < 8)) {
        await prisma.cliente.update({
          where: { id: existingByName.id },
          data: { telefone: rawPhone }
        });
      }
      return existingByName;
    }
  }

  // 4. Create new client if no match found
  return await prisma.cliente.create({
    data: {
      nome: rawName || "Paciente",
      telefone: rawPhone || null,
      email: rawEmail || null,
    }
  });
}

function existingByEmailSafe(currentEmail: string | null, newEmail: string) {
  if (!newEmail) return true;
  if (!currentEmail) return false;
  return currentEmail.toLowerCase() === newEmail.toLowerCase();
}

/**
 * Merges duplicate client records into single canonical records.
 * Reassigns all Agendamento, ClienteFoto, and ClienteProntuario relations to the primary record.
 */
export async function mergeDuplicateClientsAction() {
  try {
    const allClients = await prisma.cliente.findMany({
      include: {
        agendamentos: true,
        fotos: true,
        prontuarios: true,
      }
    });

    // Group clients by normalized name and/or phone
    const nameGroups = new Map<string, typeof allClients>();

    for (const client of allClients) {
      const cleanName = client.nome.trim().toLowerCase().replace(/\s+/g, " ");
      const cleanPhone = (client.telefone || "").replace(/\D/g, "");
      
      const key = cleanName || (cleanPhone.length >= 8 ? `phone_${cleanPhone.slice(-8)}` : `id_${client.id}`);
      
      if (!nameGroups.has(key)) {
        nameGroups.set(key, []);
      }
      nameGroups.get(key)!.push(client);
    }

    let duplicatesRemoved = 0;
    let groupsMerged = 0;

    for (const [, group] of nameGroups.entries()) {
      if (group.length <= 1) continue;

      groupsMerged++;
      
      // Sort group: prefer the one with the most appointments/prontuarios, or oldest dataCadastro
      group.sort((a, b) => {
        const scoreA = a.agendamentos.length * 3 + a.prontuarios.length * 2 + a.fotos.length + (a.telefone ? 2 : 0) + (a.email ? 1 : 0);
        const scoreB = b.agendamentos.length * 3 + b.prontuarios.length * 2 + b.fotos.length + (b.telefone ? 2 : 0) + (b.email ? 1 : 0);
        if (scoreB !== scoreA) return scoreB - scoreA;
        return new Date(a.dataCadastro).getTime() - new Date(b.dataCadastro).getTime();
      });

      const primary = group[0];
      const duplicates = group.slice(1);

      // Consolidate data into primary
      const updates: any = {};
      for (const dup of duplicates) {
        if (!primary.telefone && dup.telefone) updates.telefone = dup.telefone;
        if (!primary.email && dup.email) updates.email = dup.email;
        if (!primary.avatarUrl && dup.avatarUrl) updates.avatarUrl = dup.avatarUrl;
        if (!primary.dataNascimento && dup.dataNascimento) updates.dataNascimento = dup.dataNascimento;
        if (!primary.tipoPele && dup.tipoPele) updates.tipoPele = dup.tipoPele;
        if (!primary.objetivoPrincipal && dup.objetivoPrincipal) updates.objetivoPrincipal = dup.objetivoPrincipal;
        if (!primary.alergias && dup.alergias) updates.alergias = dup.alergias;

        // Reassign all related records to primary
        await prisma.agendamento.updateMany({
          where: { clienteId: dup.id },
          data: { clienteId: primary.id }
        });

        await prisma.clienteFoto.updateMany({
          where: { clienteId: dup.id },
          data: { clienteId: primary.id }
        });

        await prisma.clienteProntuario.updateMany({
          where: { clienteId: dup.id },
          data: { clienteId: primary.id }
        });

        // Delete duplicate client
        await prisma.cliente.delete({
          where: { id: dup.id }
        });

        duplicatesRemoved++;
      }

      if (Object.keys(updates).length > 0) {
        await prisma.cliente.update({
          where: { id: primary.id },
          data: updates
        });
      }
    }

    return { success: true, groupsMerged, duplicatesRemoved };
  } catch (err: any) {
    console.error("Failed to merge duplicate clients:", err);
    return { success: false, error: err.message };
  }
}

export async function getAllClientsList() {
  const clients = await prisma.cliente.findMany({
    include: { agendamentos: { orderBy: { date: 'desc' } } },
    orderBy: { nome: 'asc' }
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
  const cliente = await findOrCreateClient({
    nome: data.nome,
    telefone: data.telefone || null,
    email: data.email || null,
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
