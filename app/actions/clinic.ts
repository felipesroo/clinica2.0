"use server";

import { prisma } from '../../lib/prisma';

import { syncEventToGoogle, deleteEventFromGoogle, fetchExternalGoogleEvents } from '../../lib/googleCalendar';
import { sendWhatsAppMessage } from '../../lib/whatsapp';
import { reverterBaixaAgendamento } from './inventory';

export async function getAppointments() {
  try {
    const agendamentos = await prisma.agendamento.findMany({
      include: {
        cliente: true,
      }
    });

    const localAppointments = agendamentos.map((a: any) => ({
      id: a.id,
      patientName: a.cliente.nome,
      patientPhone: a.cliente.telefone || "",
      service: a.service,
      date: a.date,
      startTime: a.startTime,
      duration: a.duration,
      googleEventId: a.googleEventId,
      clienteId: a.clienteId,
      valor: a.valor,
      formaPagamento: a.formaPagamento,
      numeroParcelas: a.numeroParcelas,
    }));

    try {
    const today = new Date();
    // Fetch from 1 month ago to 3 months in the future
    const timeMin = new Date(today.getFullYear(), today.getMonth() - 1, 1).toISOString();
    const timeMax = new Date(today.getFullYear(), today.getMonth() + 3, 0).toISOString();
    
    const googleEvents = await fetchExternalGoogleEvents(timeMin, timeMax);
    
    // Filter out events that already exist in our DB
    const localGoogleIds = new Set(localAppointments.map((a: any) => a.googleEventId).filter(Boolean));

    // Delete local events that were removed from Google Calendar
    const timeMinDate = new Date(timeMin).toISOString().split('T')[0];
    const timeMaxDate = new Date(timeMax).toISOString().split('T')[0];
    const remoteGoogleIds = new Set(googleEvents.map((e: any) => e.googleEventId || e.id).filter(Boolean));
    
    const deletedIds = new Set<string>();
    for (const local of localAppointments) {
      if (local.googleEventId && local.date >= timeMinDate && local.date <= timeMaxDate) {
        if (!remoteGoogleIds.has(local.googleEventId)) {
          await prisma.agendamento.delete({ where: { id: local.id } });
          deletedIds.add(local.id);
        }
      }
    }
    
    const validLocalAppointments = localAppointments.filter((a: any) => !deletedIds.has(a.id));

    const newAgendamentos = [];

    // ONLY import NEW events that have an asterisk (*) in their title
    const eventsToImport = googleEvents.filter((e: any) => e.summary && e.summary.includes('*') && !localGoogleIds.has(e.googleEventId || e.id));

    for (const e of eventsToImport) {
      const startInput = e.start;
      const endInput = e.end;
      if (!startInput || !endInput) continue;

      const startDate = new Date(startInput);
      const endDate = new Date(endInput);
      
      const dateStr = startDate.toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' });
      const startTimeStr = startDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo' });
      const duration = Math.round((endDate.getTime() - startDate.getTime()) / 60000);

      // Simple heuristic: "Service - Patient Name"
      let rawTitle = (e.summary || "Paciente do Google").replace(/\*/g, '').trim();
      let patientName = rawTitle;
      let service = "Google Agenda";
      
      if (rawTitle.includes(' - ')) {
        const parts = rawTitle.split(' - ');
        service = parts[0].trim();
        patientName = parts.slice(1).join(' - ').trim();
      }

      let cliente = await prisma.cliente.findFirst({ where: { nome: patientName } });
      if (!cliente) {
        cliente = await prisma.cliente.create({ data: { nome: patientName } });
      }

      try {
        const ag = await prisma.agendamento.create({
          data: {
            date: dateStr,
            startTime: startTimeStr,
            duration: duration || 60,
            service: service,
            clienteId: cliente.id,
            googleEventId: (e as any).googleEventId || (e as any).id,
          },
          include: { cliente: true }
        });

        newAgendamentos.push({
          id: ag.id,
          patientName: ag.cliente.nome,
          patientPhone: ag.cliente.telefone || "",
          service: ag.service,
          date: ag.date,
          startTime: ag.startTime,
          duration: ag.duration,
          googleEventId: ag.googleEventId,
          clienteId: ag.clienteId,
          valor: ag.valor,
          formaPagamento: ag.formaPagamento,
          numeroParcelas: ag.numeroParcelas,
        });
      } catch (insertErr) {
        console.error("Failed to insert google event", e.summary, insertErr);
      }
    }

    return [...validLocalAppointments, ...newAgendamentos].sort((a, b) => new Date(`${a.date}T${a.startTime}`).getTime() - new Date(`${b.date}T${b.startTime}`).getTime());
  } catch (err) {
    console.error("Failed to merge external Google events", err);
    return localAppointments;
  }
  } catch (outerErr) {
    console.error("Failed to fetch appointments from DB:", outerErr);
    return [];
  }
}

export async function createAppointment(data: {
  patientName: string;
  patientPhone?: string;
  service: string;
  date: string;
  startTime: string;
  duration: number;
  valor?: string;
  formaPagamento?: string;
  numeroParcelas?: number;
}) {
  // Try to find the client first, if not create one
  let cliente = await prisma.cliente.findFirst({
    where: { nome: data.patientName }
  });

  if (!cliente) {
    cliente = await prisma.cliente.create({
      data: {
        nome: data.patientName,
        telefone: data.patientPhone || null,
      }
    });
  } else if (data.patientPhone && data.patientPhone !== cliente.telefone) {
    // Update phone if it was changed in the form
    cliente = await prisma.cliente.update({
      where: { id: cliente.id },
      data: { telefone: data.patientPhone }
    });
  }

  const agendamento = await prisma.agendamento.create({
    data: {
      date: data.date,
      startTime: data.startTime,
      duration: data.duration,
      service: data.service,
      clienteId: cliente.id,
      valor: data.valor,
      formaPagamento: data.formaPagamento,
      numeroParcelas: data.numeroParcelas,
    }
  });

  const googleEventId = await syncEventToGoogle({
    ...data,
    patientName: cliente.nome,
  });

  if (googleEventId) {
    await prisma.agendamento.update({
      where: { id: agendamento.id },
      data: { googleEventId }
    });
  }

  // WAHA Notification
  if (cliente.telefone) {
    console.log(`[WAHA] createAppointment: Triggering WAHA notification for client ${cliente.nome} (${cliente.telefone})`);
    try {
      const { getSettings } = await import('./settings');
      const config = await getSettings();
      console.log(`[WAHA] createAppointment: Settings fetched, msgConfirmacaoAtiva is ${config.msgConfirmacaoAtiva}`);
      if (config.msgConfirmacaoAtiva) {
        const [ano, mes, dia] = data.date.split('-');
        const dataFormatada = `${dia}/${mes}/${ano}`;
        const message = config.msgConfirmacaoTexto
          .replace(/{nome}/g, cliente.nome.split(' ')[0])
          .replace(/{servico}/g, data.service)
          .replace(/{data}/g, dataFormatada)
          .replace(/{hora}/g, data.startTime);
        
        console.log(`[WAHA] createAppointment: Sending message to ${cliente.telefone}: ${message}`);
        sendWhatsAppMessage(cliente.telefone, message).then((res) => {
           console.log(`[WAHA] createAppointment: sendWhatsAppMessage result:`, res);
        }).catch(console.error);
      }
    } catch (err) {
      console.error("Failed to send WhatsApp confirmation", err);
    }
  } else {
    console.log(`[WAHA] createAppointment: No phone number provided for client ${cliente.nome}, skipping WAHA.`);
  }

  return { success: true, id: agendamento.id };
}

export async function updateAppointment(data: {
  id: string;
  patientName: string;
  patientPhone?: string;
  service: string;
  date: string;
  startTime: string;
  duration: number;
  valor?: string;
  formaPagamento?: string;
  numeroParcelas?: number;
}) {
  let cliente = await prisma.cliente.findFirst({
    where: { nome: data.patientName }
  });

  if (!cliente) {
    cliente = await prisma.cliente.create({
      data: {
        nome: data.patientName,
        telefone: data.patientPhone || null,
      }
    });
  } else if (data.patientPhone && data.patientPhone !== cliente.telefone) {
    // Update phone if it was changed in the form
    cliente = await prisma.cliente.update({
      where: { id: cliente.id },
      data: { telefone: data.patientPhone }
    });
  }

  const existing = await prisma.agendamento.findUnique({ where: { id: data.id } });

  const agendamento = await prisma.agendamento.update({
    where: { id: data.id },
    data: {
      date: data.date,
      startTime: data.startTime,
      duration: data.duration,
      service: data.service,
      cliente: { connect: { id: cliente.id } },
      valor: data.valor,
      formaPagamento: data.formaPagamento,
      numeroParcelas: data.numeroParcelas,
    }
  });

  const googleEventId = await syncEventToGoogle({
    ...data,
    patientName: cliente.nome,
    googleEventId: existing?.googleEventId
  });

  if (googleEventId && googleEventId !== existing?.googleEventId) {
    await prisma.agendamento.update({
      where: { id: data.id },
      data: { googleEventId }
    });
  }

  return { success: true };
}

export async function deleteAppointment(id: string) {
  const existing = await prisma.agendamento.findUnique({ where: { id } });
  
  // Restore stock and delete movements before deleting the appointment
  await reverterBaixaAgendamento(id);
  
  await prisma.agendamento.delete({
    where: { id }
  });

  if (existing?.googleEventId) {
    await deleteEventFromGoogle(existing.googleEventId);
  }

  return { success: true };
}
