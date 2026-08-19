import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { sendWhatsAppMessage } from '../../../../lib/whatsapp';

// GET /api/cron/lembrete-2h
// Dispara o lembrete de 2 horas antes para pacientes com agendamento próximo.
// Anti-duplicidade: filtra apenas agendamentos com lembrete2hEnviado: false e marca como true após o envio.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get('secret');
  const force = searchParams.get('force') === 'true';
  const expectedSecret = process.env.CRON_SECRET || 'aura-cron-secret-2026';
  
  if (secret !== expectedSecret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const config = await prisma.configuracao.findUnique({ where: { id: '1' } });
  if (!config || !config.msgLembrete2hAtiva) {
    return NextResponse.json({ message: 'Lembrete de 2h desativado nas configurações.', sent: 0 });
  }

  // Compute current time in America/Sao_Paulo timezone
  const spNowStr = new Date().toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' });
  const spNow = new Date(spNowStr);
  const currentMinutes = spNow.getHours() * 60 + spNow.getMinutes();
  // IMPORTANT: Use toLocaleDateString with en-CA for correct Brazil date (not UTC)
  const todayStr = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' });

  // Get today's appointments that have NOT received the 2h reminder yet
  const agendamentos = await prisma.agendamento.findMany({
    where: {
      date: todayStr,
      ...(force ? {} : { lembrete2hEnviado: false }),
    },
    include: { cliente: true },
  });

  // Filter appointments starting between 75 minutes and 150 minutes from now (2h window)
  const matches = agendamentos.filter(ag => {
    const [h, m] = ag.startTime.split(':').map(Number);
    const apptMinutes = h * 60 + m;
    const diff = apptMinutes - currentMinutes;
    return diff >= 75 && diff <= 150;
  });

  let sent = 0;
  const errors: string[] = [];

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

    const result = await sendWhatsAppMessage(telefone, message);
    if (result.success) {
      // Marcar como enviado para evitar qualquer duplicidade em execuções seguintes
      await prisma.agendamento.update({
        where: { id: ag.id },
        data: { lembrete2hEnviado: true }
      });
      sent++;
    } else {
      errors.push(`${ag.cliente?.nome || 'Paciente'}: ${result.error}`);
    }
  }

  return NextResponse.json({
    message: `Lembretes de 2h processados.`,
    total: matches.length,
    sent,
    errors,
  });
}
