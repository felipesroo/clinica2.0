import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { sendWhatsAppMessage } from '../../../../lib/whatsapp';

// GET /api/cron/lembrete-2h
// Finds all appointments starting in the next 2 hours and sends a reminder.
// Run this route every hour via cron job.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get('secret');
  if (process.env.CRON_SECRET && secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const config = await prisma.configuracao.findUnique({ where: { id: '1' } });
  if (!config || !config.msgLembrete2hAtiva) {
    return NextResponse.json({ message: 'Lembrete de 2h desativado.', sent: 0 });
  }

  // Compute current time in America/Sao_Paulo timezone
  const spNowStr = new Date().toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' });
  const spNow = new Date(spNowStr);
  const currentMinutes = spNow.getHours() * 60 + spNow.getMinutes();
  const todayStr = spNow.toISOString().split('T')[0];

  // Get today's appointments
  const agendamentos = await prisma.agendamento.findMany({
    where: { date: todayStr },
    include: { cliente: true },
  });

  // Filter appointments starting between 90 minutes and 150 minutes from now (2h ±30 min window)
  const matches = agendamentos.filter(ag => {
    const [h, m] = ag.startTime.split(':').map(Number);
    const apptMinutes = h * 60 + m;
    const diff = apptMinutes - currentMinutes;
    return diff >= 75 && diff <= 150; // Catch any appointment starting 1h15m to 2h30m from now
  });

  let sent = 0;
  const errors: string[] = [];

  for (const ag of matches) {
    const telefone = ag.cliente.telefone;
    if (!telefone) continue;

    const [ano, mes, dia] = ag.date.split('-');
    const dataFormatada = `${dia}/${mes}/${ano}`;

    const message = config.msgLembrete2hTexto
      .replace(/{nome}/g, ag.cliente.nome.split(' ')[0])
      .replace(/{servico}/g, ag.service)
      .replace(/{data}/g, dataFormatada)
      .replace(/{hora}/g, ag.startTime);

    const result = await sendWhatsAppMessage(telefone, message);
    if (result.success) {
      sent++;
    } else {
      errors.push(`${ag.cliente.nome}: ${result.error}`);
    }
  }

  return NextResponse.json({
    message: `Lembretes de 2h processados.`,
    total: matches.length,
    sent,
    errors,
  });
}
