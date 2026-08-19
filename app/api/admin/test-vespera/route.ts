import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { sendWhatsAppMessage } from '../../../../lib/whatsapp';

// GET /api/admin/test-vespera
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const phone = searchParams.get('phone') || '62991346756';

    const spNowStr = new Date().toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' });
    const spNow = new Date(spNowStr);
    const tomorrow = new Date(spNow);
    tomorrow.setDate(spNow.getDate() + 1);
    const tomorrowStr = tomorrow.toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' });
    const [ano, mes, dia] = tomorrowStr.split('-');
    const dataFormatada = `${dia}/${mes}/${ano}`;

    // 1. Obter ou criar paciente de teste com o telefone
    let cliente = await prisma.cliente.findFirst({
      where: { telefone: phone }
    });

    if (!cliente) {
      cliente = await prisma.cliente.create({
        data: {
          nome: 'Dra. Jordane Faria',
          telefone: phone,
          email: 'contato@drajordanefaria.com',
        }
      });
    }

    // 2. Criar agendamento para amanhã
    const agendamento = await prisma.agendamento.create({
      data: {
        date: tomorrowStr,
        startTime: '10:30',
        duration: 60,
        service: 'Harmonização Facial (Teste)',
        clienteId: cliente.id,
        lembreteVesperaEnviado: false,
      }
    });

    // 3. Obter configurações do template
    const config = await prisma.configuracao.findUnique({ where: { id: '1' } });
    const template = config?.msgLembreteTexto || 'Oi, {nome}! 😊 Passando para lembrar que amanhã você tem horário de *{servico}* às *{hora}* aqui na Estética Avançada. Até lá! 💜';

    const mensagem = template
      .replace(/{nome}/g, cliente.nome.split(' ')[0])
      .replace(/{servico}/g, agendamento.service)
      .replace(/{data}/g, dataFormatada)
      .replace(/{hora}/g, agendamento.startTime);

    // 4. Disparar via WAHA
    const resultado = await sendWhatsAppMessage(phone, mensagem);

    // 5. Marcar como enviado
    if (resultado.success) {
      await prisma.agendamento.update({
        where: { id: agendamento.id },
        data: { lembreteVesperaEnviado: true }
      });
    }

    return NextResponse.json({
      success: resultado.success,
      phone,
      agendamento: {
        id: agendamento.id,
        data: dataFormatada,
        hora: agendamento.startTime,
        servico: agendamento.service,
        paciente: cliente.nome,
      },
      mensagemEnviada: mensagem,
      resultadoWAHA: resultado,
    });
  } catch (error: any) {
    console.error('Erro no test-vespera:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
