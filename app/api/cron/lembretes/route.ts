import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { sendWhatsAppMessage } from '../../../../lib/whatsapp';

// GET /api/cron/lembretes — Sends "day before" reminder to all patients with appointments tomorrow
// Anti-duplicidade: envia apenas para agendamentos que ainda NÃO receberam o lembrete de véspera (lembreteVesperaEnviado: false)
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get('secret');
  const force = searchParams.get('force') === 'true';
  const expectedSecret = process.env.CRON_SECRET || 'aura-cron-secret-2026';
  
  if (secret !== expectedSecret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const config = await prisma.configuracao.findUnique({ where: { id: '1' } });

  if (!config || !config.msgLembreteAtiva) {
    return NextResponse.json({ message: 'Lembrete de véspera desativado nas configurações.', sent: 0 });
  }

  // Tomorrow's date string YYYY-MM-DD in America/Sao_Paulo timezone
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' });

  // Apenas agendamentos que ainda NÃO receberam o lembrete de véspera
  const agendamentos = await prisma.agendamento.findMany({
    where: {
      date: tomorrowStr,
      ...(force ? {} : { lembreteVesperaEnviado: false }),
    },
    include: { cliente: true },
  });

  let sent = 0;
  const errors: string[] = [];

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

    const result = await sendWhatsAppMessage(telefone, message);
    if (result.success) {
      // Marcar agendamento como notificado para NUNCA enviar duplicado
      await prisma.agendamento.update({
        where: { id: ag.id },
        data: { lembreteVesperaEnviado: true }
      });
      sent++;
    } else {
      errors.push(`${ag.cliente?.nome || 'Paciente'}: ${result.error}`);
    }
  }

  return NextResponse.json({
    message: `Lembretes de véspera processados para ${tomorrowStr}.`,
    total: agendamentos.length,
    sent,
    errors,
  });
}
