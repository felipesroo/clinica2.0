"use server";

import { prisma } from '../../lib/prisma';

import { syncEventToGoogle, deleteEventFromGoogle, fetchExternalGoogleEvents } from '../../lib/googleCalendar';
import { sendWhatsAppMessage } from '../../lib/whatsapp';
import { reverterBaixaAgendamento } from './inventory';

export async function syncGoogleCalendarAction() {
  return await getAppointments();
}

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
      date: a.date ? a.date.split('T')[0] : "",
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
      // Fetch from 2 months ago to 6 months in the future
      const timeMin = new Date(today.getFullYear(), today.getMonth() - 2, 1).toISOString();
      const timeMax = new Date(today.getFullYear(), today.getMonth() + 6, 0).toISOString();
      
      const googleEvents = await fetchExternalGoogleEvents(timeMin, timeMax);
      
      const timeMinDate = new Date(timeMin).toISOString().split('T')[0];
      const timeMaxDate = new Date(timeMax).toISOString().split('T')[0];
      const remoteGoogleIds = new Set(googleEvents.map((e: any) => e.googleEventId || e.id).filter(Boolean));
      
      // 1. Delete local events that were explicitly removed from Google Calendar
      const deletedIds = new Set<string>();
      for (const local of localAppointments) {
        if (local.googleEventId && local.date >= timeMinDate && local.date <= timeMaxDate) {
          if (!remoteGoogleIds.has(local.googleEventId)) {
            await prisma.agendamento.delete({ where: { id: local.id } });
            deletedIds.add(local.id);
          }
        }
      }
      
      const activeLocalAppointments = localAppointments.filter((a: any) => !deletedIds.has(a.id));
      const newAgendamentos: any[] = [];

      // 2. Process all Google Events: Update existing OR Insert new
      for (const e of googleEvents) {
        const gEventId = (e as any).googleEventId || (e as any).id;
        if (!gEventId || !e.start || !e.end) continue;

        const isAllDay = !e.start.includes('T');
        let dateStr: string;
        let startTimeStr: string;
        let duration = 60;

        if (isAllDay) {
          dateStr = e.start.split('T')[0];
          startTimeStr = "09:00";
          duration = 60;
        } else {
          const startDate = new Date(e.start);
          const endDate = new Date(e.end);
          dateStr = startDate.toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' });
          startTimeStr = startDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo' });
          duration = Math.max(Math.round((endDate.getTime() - startDate.getTime()) / 60000), 15);
        }

        // Clean up title: extract service and patient name
        let rawTitle = (e.summary || "Agendamento Google").replace(/\*/g, '').trim();
        let patientName = rawTitle;
        let service = "Google Agenda";
        
        if (rawTitle.includes(' - ')) {
          const parts = rawTitle.split(' - ');
          service = parts[0].trim();
          patientName = parts.slice(1).join(' - ').trim();
        }

        // Check if event already exists in local DB
        const existingLocal = activeLocalAppointments.find((a: any) => a.googleEventId === gEventId);

        if (existingLocal) {
          // If date, time, duration or service was edited in Google Calendar -> UPDATE local DB!
          const dateChanged = existingLocal.date !== dateStr;
          const timeChanged = existingLocal.startTime !== startTimeStr;
          const durationChanged = existingLocal.duration !== duration;
          const serviceChanged = service !== "Google Agenda" && existingLocal.service !== service;

          if (dateChanged || timeChanged || durationChanged || serviceChanged) {
            await prisma.agendamento.update({
              where: { id: existingLocal.id },
              data: {
                date: dateStr,
                startTime: startTimeStr,
                duration: duration,
                ...(serviceChanged ? { service } : {})
              }
            });

            existingLocal.date = dateStr;
            existingLocal.startTime = startTimeStr;
            existingLocal.duration = duration;
            if (serviceChanged) existingLocal.service = service;
          }
        } else {
          // New event created directly on Google Calendar -> Create in local DB
          let cliente = await prisma.cliente.findFirst({ where: { nome: patientName } });
          if (!cliente) {
            cliente = await prisma.cliente.create({ data: { nome: patientName } });
          }

          try {
            const ag = await prisma.agendamento.create({
              data: {
                date: dateStr,
                startTime: startTimeStr,
                duration: duration,
                service: service,
                clienteId: cliente.id,
                googleEventId: gEventId,
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
      }

      return [...activeLocalAppointments, ...newAgendamentos].sort((a, b) => new Date(`${a.date}T${a.startTime}`).getTime() - new Date(`${b.date}T${b.startTime}`).getTime());
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
