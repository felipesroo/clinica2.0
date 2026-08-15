"use server";
import { prisma } from '@/lib/prisma';
export async function getReportsData(periodo: string) {
  const agendamentos = await prisma.agendamento.findMany({
    include: { cliente: true }
  });

  const pacientes = await prisma.cliente.findMany();

  let receitaTotal = 0;
  let agendamentosComValor = 0;

  const serviceCounts: Record<string, number> = {};
  const monthlyRevenue = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  agendamentos.forEach(ag => {
    let isInPeriod = false;
    if (ag.date) {
      const agDate = new Date(ag.date);
      const agYear = agDate.getFullYear();
      const agMonth = agDate.getMonth();

      if (periodo === "Este Mês" && agYear === currentYear && agMonth === currentMonth) isInPeriod = true;
      if (periodo === "Último Mês" && (
          (currentMonth === 0 && agYear === currentYear - 1 && agMonth === 11) ||
          (currentMonth > 0 && agYear === currentYear && agMonth === currentMonth - 1)
      )) isInPeriod = true;
      if (periodo === "Este Ano" && agYear === currentYear) isInPeriod = true;
      if (periodo === "Todos") isInPeriod = true;
    } else {
      isInPeriod = true;
    }

    let val = 0;
    if (ag.valor) {
      val = parseFloat(ag.valor.replace(/[^0-9,.-]/g, '').replace(',', '.'));
      if (isNaN(val)) val = 0;
    }

    if (val > 0) {
      if (isInPeriod) {
        receitaTotal += val;
        agendamentosComValor++;
      }
      if (ag.date) {
        const month = parseInt(ag.date.split('-')[1], 10) - 1;
        if (month >= 0 && month <= 11) {
          monthlyRevenue[month] += val;
        }
      }
    }

    if (isInPeriod && ag.service && ag.service !== "Google Agenda") {
      serviceCounts[ag.service] = (serviceCounts[ag.service] || 0) + 1;
    }
  });

  const ticketMedio = agendamentosComValor > 0 ? receitaTotal / agendamentosComValor : 0;
  
  // Filter new patients in period
  let pacientesNoPeriodo = 0;
  pacientes.forEach(p => {
    // For simplicity, we just count total if we don't have created_at.
    // Assuming we want to show total in the widget since we don't track createdAt strictly everywhere yet.
    pacientesNoPeriodo++;
  });

  const tratamentosPopulares = Object.entries(serviceCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([nome, count]) => {
      const totalServices = Object.values(serviceCounts).reduce((a, b) => a + b, 0);
      const percentage = totalServices > 0 ? (count / totalServices) * 100 : 0;
      return { nome, count, percentage: Math.round(percentage) };
    });

  return {
    receitaTotal,
    ticketMedio,
    totalPacientes: pacientesNoPeriodo,
    monthlyRevenue,
    tratamentosPopulares,
    totalAtendimentos: agendamentos.length
  };
}
