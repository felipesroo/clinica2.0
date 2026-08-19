import { prisma } from './prisma';

let schedulerStarted = false;

/**
 * In-App Autonomous Scheduler for WhatsApp and Mobile Push Dispatches.
 * Runs directly inside the Node.js process in America/Sao_Paulo timezone.
 */
export function startInternalScheduler() {
  if (schedulerStarted) return;
  schedulerStarted = true;

  console.log('[Scheduler] ⏰ In-App Autonomous Cron Scheduler initialized.');

  // Run initial check after 10 seconds of startup
  setTimeout(() => {
    runSchedulerTick().catch(console.error);
  }, 10000);

  // Run every 60 seconds
  setInterval(() => {
    runSchedulerTick().catch(console.error);
  }, 60 * 1000);
}

async function runSchedulerTick() {
  try {
    const spNowStr = new Date().toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' });
    const spNow = new Date(spNowStr);
    const hours = spNow.getHours();
    const minutes = spNow.getMinutes();
    const todayStr = spNow.toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' });

    // 1. Lembretes 2h Antes (A cada 15 minutos: :00, :15, :30, :45)
    if (minutes % 15 === 0) {
      await processLembrete2h(todayStr, spNow);
    }

    // 2. Agenda Diária no WhatsApp da Dra. Jordane (Dispara às 08:00 de Brasília)
    if (hours === 8 && minutes === 0) {
      await processAgendaPessoal(todayStr);
    }

    // 3. Lembretes de Véspera (Dispara às 12:00 de Brasília para os pacientes de amanhã)
    if (hours === 12 && minutes === 0) {
      await processLembretesVespera(spNow);
    }
  } catch (err) {
    console.error('[Scheduler] Error in scheduler tick:', err);
  }
}

/**
 * Processa o envio da agenda diária para Dra. Jordane
 */
async function processAgendaPessoal(todayStr: string) {
  try {
    const config = await prisma.configuracao.findUnique({ where: { id: '1' } });
    if (!config || !config.agendaPessoalAtiva) return;

    if (config.agendaPessoalUltimoEnvio === todayStr) {
      return; // Já enviado hoje
    }

    const agendamentos = await prisma.agendamento.findMany({
      where: { date: todayStr },
      include: { cliente: true },
    });

    if (agendamentos.length === 0) return;

    console.log(`[Scheduler] 📋 Disparando agenda diária das 08:00 (${agendamentos.length} atendimentos)...`);
    const { sendWhatsAppMessage } = await import('./whatsapp');
    const { sendPushNotification } = await import('./push');

    const [ano, mes, dia] = todayStr.split('-');
    const dataFormatada = `${dia}/${mes}/${ano}`;
    const targetPhone = config.telefonePessoalDoutora || '62991346756';

    const agendamentosOrdenados = agendamentos.sort((a, b) => a.startTime.localeCompare(b.startTime));
    const listaItens = agendamentosOrdenados.map((ag, index) => {
      const nomePaciente = ag.cliente?.nome || 'Paciente';
      const telPaciente = ag.cliente?.telefone ? ag.cliente.telefone : 'Não informado';
      const servico = ag.service || 'Procedimento';
      const hora = ag.startTime;
      const duracao = ag.duration ? `${ag.duration} min` : '60 min';
      return `*${index + 1}.* ⏰ *${hora}* (${duracao})\n👤 *${nomePaciente}*\n💉 Procedimento: *${servico}*\n📱 Contato: ${telPaciente}`;
    }).join('\n\n');

    const mensagem = `🌸 *Bom dia, Dra. Jordane!* 🌸\n\n` +
      `📋 *Sua Agenda de Hoje (${dataFormatada})*\n` +
      `Total de Atendimentos: *${agendamentos.length}*\n\n` +
      `━━━━━━━━━━━━━━━━━━━━━\n` +
      `${listaItens}\n` +
      `━━━━━━━━━━━━━━━━━━━━━\n\n` +
      `✨ Tenha um excelente dia de atendimentos! 💜`;

    const resultado = await sendWhatsAppMessage(targetPhone, mensagem);
    if (resultado.success) {
      await prisma.configuracao.update({
        where: { id: '1' },
        data: { agendaPessoalUltimoEnvio: todayStr }
      });
      console.log('[Scheduler] ✅ Agenda diária enviada com sucesso para Dra. Jordane.');
    }

    sendPushNotification({
      title: `📋 Agenda de Hoje (${dataFormatada})`,
      body: `Dra. Jordane, você tem ${agendamentos.length} atendimento(s) agendado(s) para hoje.`,
      url: '/agendamentos',
      tag: `agenda-pessoal-${todayStr}`,
    }).catch(console.error);
  } catch (err) {
    console.error('[Scheduler] Failed to process agenda pessoal:', err);
  }
}

/**
 * Processa lembretes de 2h antes para pacientes
 */
async function processLembrete2h(todayStr: string, spNow: Date) {
  try {
    const config = await prisma.configuracao.findUnique({ where: { id: '1' } });
    if (!config || !config.msgLembrete2hAtiva) return;

    const currentMinutes = spNow.getHours() * 60 + spNow.getMinutes();

    const agendamentos = await prisma.agendamento.findMany({
      where: {
        date: todayStr,
        lembrete2hEnviado: false,
      },
      include: { cliente: true },
    });

    const matches = agendamentos.filter(ag => {
      const [h, m] = ag.startTime.split(':').map(Number);
      const apptMinutes = h * 60 + m;
      const diff = apptMinutes - currentMinutes;
      return diff >= 75 && diff <= 150;
    });

    if (matches.length === 0) return;

    console.log(`[Scheduler] ⏰ Disparando ${matches.length} lembrete(s) de 2h...`);
    const { sendWhatsAppMessage } = await import('./whatsapp');
    const { sendPushNotification } = await import('./push');

    for (const ag of matches) {
      const telefone = ag.cliente?.telefone;
      if (!telefone) continue;

      const [ano, mes, dia] = ag.date.split('-');
      const dataFormatada = `${dia}/${mes}/${ano}`;

      const message = config.msgLembrete2hTexto
        .replace(/{nome}/g, (ag.cliente?.nome || 'Paciente').split(' ')[0])
        .replace(/{servico}/g, ag.service)
        .replace(/{data}/g, dataFormatada)
        .replace(/{hora}/g, ag.startTime);

      const res = await sendWhatsAppMessage(telefone, message);
      if (res.success) {
        await prisma.agendamento.update({
          where: { id: ag.id },
          data: { lembrete2hEnviado: true }
        });
        console.log(`[Scheduler] ✅ Lembrete 2h enviado para ${ag.cliente?.nome} (${telefone})`);
      }

      sendPushNotification({
        title: `⏰ Próximo Atendimento às ${ag.startTime}`,
        body: `${ag.cliente?.nome || 'Paciente'} - ${ag.service}`,
        url: '/agendamentos',
        tag: `atendimento-${ag.id}`,
      }).catch(console.error);
    }
  } catch (err) {
    console.error('[Scheduler] Failed to process lembrete 2h:', err);
  }
}

/**
 * Processa lembretes de véspera para pacientes de amanhã
 */
async function processLembretesVespera(spNow: Date) {
  try {
    const config = await prisma.configuracao.findUnique({ where: { id: '1' } });
    if (!config || !config.msgLembreteAtiva) return;

    const tomorrow = new Date(spNow);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' });

    const agendamentos = await prisma.agendamento.findMany({
      where: {
        date: tomorrowStr,
        lembreteVesperaEnviado: false,
      },
      include: { cliente: true },
    });

    if (agendamentos.length === 0) return;

    console.log(`[Scheduler] 📅 Disparando ${agendamentos.length} lembrete(s) de véspera para ${tomorrowStr}...`);
    const { sendWhatsAppMessage } = await import('./whatsapp');

    for (const ag of agendamentos) {
      const telefone = ag.cliente?.telefone;
      if (!telefone) continue;

      const [ano, mes, dia] = ag.date.split('-');
      const dataFormatada = `${dia}/${mes}/${ano}`;

      const message = config.msgLembreteTexto
        .replace(/{nome}/g, (ag.cliente?.nome || 'Paciente').split(' ')[0])
        .replace(/{servico}/g, ag.service)
        .replace(/{data}/g, dataFormatada)
        .replace(/{hora}/g, ag.startTime);

      const res = await sendWhatsAppMessage(telefone, message);
      if (res.success) {
        await prisma.agendamento.update({
          where: { id: ag.id },
          data: { lembreteVesperaEnviado: true }
        });
        console.log(`[Scheduler] ✅ Lembrete véspera enviado para ${ag.cliente?.nome} (${telefone})`);
      }
    }
  } catch (err) {
    console.error('[Scheduler] Failed to process lembretes véspera:', err);
  }
}
