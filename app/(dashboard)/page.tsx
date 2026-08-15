"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useClinic } from "../contexts/ClinicContext";
import { useSettings } from "../contexts/SettingsContext";
import { getEstoque, EstoqueProdutoData } from "../actions/inventory";
import { getAllClientsList } from "../actions/client";

export default function DashboardPage() {
  const { settings } = useSettings();
  const { appointments } = useClinic();
  const [estoque, setEstoque] = useState<EstoqueProdutoData[]>([]);
  const [totalClients, setTotalClients] = useState(0);

  useEffect(() => {
    getEstoque().then(setEstoque).catch(console.error);
    getAllClientsList().then(clients => setTotalClients(clients.length)).catch(console.error);
  }, []);

  const todayStr = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' });
  
  const todayAppointments = appointments
    .filter(app => app.date === todayStr)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  // Calculates revenue by summing the numeric part of the 'valor' field
  const totalRevenue = appointments.reduce((sum, app) => {
    if (!app.valor) return sum;
    const numericStr = app.valor.replace(/[^0-9,.-]/g, '').replace(',', '.');
    const val = parseFloat(numericStr);
    return isNaN(val) ? sum : sum + val;
  }, 0);

  const lowStockItems = estoque.filter(item => item.quantidade <= 5);

  return (
    <>
      <div className="mb-10">
        <h2 className="font-serif text-3xl text-primary mb-2">Bom dia, {settings?.nomeFantasia || "Dra. Jordane"}</h2>
        <p className="text-base text-on-surface-variant" suppressHydrationWarning>
          Aqui está a visão geral da clínica para hoje, {new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'America/Sao_Paulo' })}.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Coluna Esquerda (8 cols) */}
        <div className="md:col-span-8 flex flex-col gap-6">
          {/* Agenda de Hoje */}
          <div className="bg-surface-container-lowest/60 backdrop-blur-sm border border-white/40 shadow-sm rounded-[2rem] p-8 flex-1 flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-serif text-xl text-primary flex items-center gap-2">
                <span className="material-symbols-outlined text-tertiary">calendar_clock</span>
                Agenda de Hoje
              </h3>
              <Link href="/agendamentos" className="text-xs text-tertiary hover:text-tertiary-container transition-colors uppercase tracking-widest">VER TUDO</Link>
            </div>
            <div className="space-y-4 flex-1 overflow-y-auto max-h-[400px] pr-2">
              {todayAppointments.length === 0 ? (
                <div className="text-center text-on-surface-variant p-8 bg-surface-container-low rounded-xl">
                  Nenhum agendamento para hoje.
                </div>
              ) : (
                todayAppointments.map((app, idx) => {
                  const hour = parseInt(app.startTime.split(':')[0], 10);
                  const isPast = hour < new Date().getHours();
                  return (
                    <div key={app.id} className={`group flex items-start gap-4 p-4 rounded-xl hover:bg-white/50 transition-colors border border-transparent hover:border-white/60 ${isPast ? 'opacity-60' : ''}`}>
                      <div className="flex flex-col items-center justify-center min-w-[60px] text-primary">
                        <span className="font-serif text-xl font-bold">{app.startTime}</span>
                      </div>
                      <div className={`w-1 h-12 rounded-full mx-2 ${isPast ? 'bg-outline-variant/50' : 'bg-primary'}`}></div>
                      <div className="flex-1">
                        <h4 className="text-base font-medium text-on-surface truncate">{app.patientName}</h4>
                        <p className="text-sm text-on-surface-variant truncate">{app.service}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        {app.isExternal ? (
                          <span className="px-3 py-1 bg-surface-container-highest text-on-surface-variant text-xs rounded-full">Google Agenda</span>
                        ) : (
                          <span className="px-3 py-1 bg-tertiary-container/30 text-tertiary text-xs rounded-full">Agendado</span>
                        )}
                        {app.valor && <span className="text-xs text-primary font-medium">R$ {app.valor}</span>}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Coluna Direita (4 cols) */}
        <div className="md:col-span-4 flex flex-col gap-6">
          {/* Ações Rápidas */}
          <div className="bg-surface-container-lowest/60 backdrop-blur-sm border border-white/40 shadow-sm rounded-[2rem] p-6">
            <h3 className="font-serif text-xl text-primary mb-4">Ações Rápidas</h3>
            <div className="grid grid-cols-2 gap-4">
              <Link href="/agendamentos?novo=true" className="flex flex-col items-center justify-center p-4 rounded-xl bg-surface-container-lowest/50 hover:bg-white transition-all border border-white/40 shadow-sm text-center group">
                <span className="material-symbols-outlined text-primary mb-2 group-hover:scale-110 transition-transform">add_circle</span>
                <span className="text-xs text-on-surface">Novo Agend.</span>
              </Link>
              <Link href="/clientes?novo=true" className="flex flex-col items-center justify-center p-4 rounded-xl bg-surface-container-lowest/50 hover:bg-white transition-all border border-white/40 shadow-sm text-center group">
                <span className="material-symbols-outlined text-tertiary mb-2 group-hover:scale-110 transition-transform">person_add</span>
                <span className="text-xs text-on-surface">Novo Paciente</span>
              </Link>
            </div>
          </div>

          {/* Métricas */}
          <div className="bg-surface-container-lowest/60 backdrop-blur-sm border border-white/40 shadow-sm rounded-[2rem] p-6 flex flex-col gap-4">
            <h3 className="font-serif text-xl text-primary mb-2">Visão Geral</h3>
            <div className="flex justify-between items-end pb-4 border-b border-outline-variant/20">
              <div>
                <p className="text-xs text-on-surface-variant uppercase tracking-wider mb-1">FATURAMENTO TOTAL</p>
                <p className="font-serif text-3xl text-primary">R$ {totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              </div>
            </div>
            <div className="flex justify-between items-end pt-2">
              <div>
                <p className="text-xs text-on-surface-variant uppercase tracking-wider mb-1">TOTAL DE PACIENTES</p>
                <p className="font-serif text-2xl text-on-surface">{totalClients}</p>
              </div>
            </div>
          </div>

          {/* Alertas de Estoque */}
          <div className={`${lowStockItems.length > 0 ? 'bg-error-container/10 border-error-container/30' : 'bg-surface-container-lowest/60 border-white/40'} backdrop-blur-sm border shadow-sm rounded-[2rem] p-6`}>
            <div className="flex items-center gap-2 mb-4">
              <span className={`material-symbols-outlined ${lowStockItems.length > 0 ? 'text-error' : 'text-primary'}`}>
                {lowStockItems.length > 0 ? 'warning' : 'inventory_2'}
              </span>
              <h3 className={`font-serif text-xl ${lowStockItems.length > 0 ? 'text-error' : 'text-primary'}`}>
                {lowStockItems.length > 0 ? 'Alertas de Estoque' : 'Estoque Regular'}
              </h3>
            </div>
            <ul className="space-y-3">
              {lowStockItems.length === 0 ? (
                <li className="text-sm text-on-surface-variant">Nenhum produto com estoque baixo.</li>
              ) : (
                lowStockItems.map(item => (
                  <li key={item.id} className="flex justify-between items-center text-sm text-on-surface">
                    <span className="truncate pr-2">{item.nome}</span>
                    <span className="font-bold text-error shrink-0">{item.quantidade} rest.</span>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}
