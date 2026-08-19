import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { sendWhatsAppMessage } from '../../../../lib/whatsapp';

// GET /api/cron/agenda-pessoal
// Dispara todos os dias às 08:00 o resumo completo dos atendimentos do dia para o WhatsApp pessoal da Dra. Jordane (62991346756)
// Apenas envia caso existam agendamentos para o dia.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get('secret');
  const expectedSecret = process.env.CRON_SECRET || 'aura-cron-secret-2026';
  if (secret !== expectedSecret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const config = await prisma.configuracao.findUnique({ where: { id: '1' } });
  if (!config || config.agendaPessoalAtiva === false) {
    return NextResponse.json({ message: 'Lembrete de agenda pessoal desativado nas configurações.', sent: false });
  }

  const targetPhone = config.telefonePessoalDoutora || '62991346756';

  // Obter data atual no fuso horário oficial de Brasília
  const todayStr = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' });
  const [ano, mes, dia] = todayStr.split('-');
  const dataFormatada = `${dia}/${mes}/${ano}`;

  // Buscar todos os agendamentos do dia
  const agendamentos = await prisma.agendamento.findMany({
    where: { date: todayStr },
    include: { cliente: true },
  });

  // Caso NÃO tenha agendamentos no dia, não incomoda com mensagem
  if (agendamentos.length === 0) {
    return NextResponse.json({
      message: `Nenhum agendamento para hoje (${dataFormatada}). Nenhuma mensagem disparada.`,
      total: 0,
      sent: false,
    });
  }

  // Ordenar cronologicamente por horário de início
  const agendamentosOrdenados = agendamentos.sort((a, b) => a.startTime.localeCompare(b.startTime));

  // Montar lista detalhada de pacientes
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

  // Disparar via WAHA para o número pessoal
  const resultado = await sendWhatsAppMessage(targetPhone, mensagem);

  if (resultado.success) {
    return NextResponse.json({
      message: `Agenda do dia enviada com sucesso para Dra. Jordane (${targetPhone}).`,
      data: dataFormatada,
      total: agendamentos.length,
      sent: true,
    });
  } else {
    return NextResponse.json({
      error: `Falha ao enviar agenda do dia: ${resultado.error}`,
      data: dataFormatada,
      total: agendamentos.length,
      sent: false,
    }, { status: 500 });
  }
}
