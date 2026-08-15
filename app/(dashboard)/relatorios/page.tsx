"use client";

import { useState, useEffect } from "react";
import { getReportsData } from "../../actions/reports";

export default function RelatoriosPage() {
  const [periodo, setPeriodo] = useState("Este Mês");
  const [chartView, setChartView] = useState("Mês");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const res = await getReportsData(periodo);
      setData(res);
      setLoading(false);
    }
    loadData();
  }, [periodo]);

  const formatter = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-8">
        <div>
          <h2 className="font-serif text-2xl md:text-3xl font-bold text-primary">Relatórios e Desempenho</h2>
          <p className="text-sm md:text-base text-on-surface-variant mt-1">Visão geral financeira e analítica da clínica.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <select 
            value={periodo} 
            onChange={(e) => setPeriodo(e.target.value)}
            className="bg-surface-container-low border-none rounded-xl text-sm font-medium px-4 py-2.5 shadow-sm focus:ring-1 focus:ring-primary text-on-surface cursor-pointer w-full sm:w-auto"
          >
            <option value="Este Mês">Este Mês</option>
            <option value="Último Mês">Último Mês</option>
            <option value="Este Ano">Este Ano</option>
            <option value="Todos">Todo o Período</option>
          </select>
          <button className="flex items-center justify-center gap-2 bg-primary-container text-on-primary-container px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-primary-fixed transition-colors shadow-sm w-full sm:w-auto">
            <span className="material-symbols-outlined text-[18px]">download</span>
            Exportar
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        <>
          {/* Metrics Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1 */}
            <div className="bg-surface-container-lowest/60 backdrop-blur-sm border border-white/40 shadow-sm p-6 rounded-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary-fixed/30 rounded-full blur-2xl -mr-10 -mt-10 transition-transform group-hover:scale-110"></div>
              <div className="flex justify-between items-start relative z-10">
                <div>
                  <p className="text-sm font-medium text-on-surface-variant mb-1">Receita Total ({periodo})</p>
                  <h3 className="font-serif text-2xl font-bold text-on-background">{formatter.format(data.receitaTotal)}</h3>
                </div>
                <div className="p-2 bg-tertiary-container rounded-lg text-on-tertiary-container">
                  <span className="material-symbols-outlined">trending_up</span>
                </div>
              </div>
            </div>

            {/* Card 2 */}
            <div className="bg-surface-container-lowest/60 backdrop-blur-sm border border-white/40 shadow-sm p-6 rounded-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-secondary-fixed/30 rounded-full blur-2xl -mr-10 -mt-10 transition-transform group-hover:scale-110"></div>
              <div className="flex justify-between items-start relative z-10">
                <div>
                  <p className="text-sm font-medium text-on-surface-variant mb-1">Ticket Médio</p>
                  <h3 className="font-serif text-2xl font-bold text-on-background">{formatter.format(data.ticketMedio)}</h3>
                </div>
                <div className="p-2 bg-primary-container rounded-lg text-on-primary-container">
                  <span className="material-symbols-outlined">payments</span>
                </div>
              </div>
            </div>

            {/* Card 3 */}
            <div className="bg-surface-container-lowest/60 backdrop-blur-sm border border-white/40 shadow-sm p-6 rounded-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-tertiary-fixed/30 rounded-full blur-2xl -mr-10 -mt-10 transition-transform group-hover:scale-110"></div>
              <div className="flex justify-between items-start relative z-10">
                <div>
                  <p className="text-sm font-medium text-on-surface-variant mb-1">Total de Pacientes</p>
                  <h3 className="font-serif text-2xl font-bold text-on-background">{data.totalPacientes}</h3>
                </div>
                <div className="p-2 bg-secondary-container rounded-lg text-on-secondary-container">
                  <span className="material-symbols-outlined">person</span>
                </div>
              </div>
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Chart */}
            <div className="bg-surface-container-lowest/60 backdrop-blur-sm border border-white/40 shadow-sm p-6 rounded-2xl lg:col-span-2 flex flex-col justify-between">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-serif text-2xl font-semibold text-primary">Receita Mensal (Este Ano)</h3>
              </div>

              {/* SVG Line Chart */}
              <div className="w-full h-64 relative flex flex-col justify-between">
                <div className="relative flex-1 w-full">
                  <svg className="w-full h-full overflow-visible" viewBox="0 0 700 200" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="gradientPrimary" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#6c5a56" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="#6c5a56" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>

                    {/* Grid lines */}
                    <line x1="0" y1="20" x2="700" y2="20" stroke="#e3e2e0" strokeOpacity="0.6" strokeDasharray="4 4" />
                    <line x1="0" y1="60" x2="700" y2="60" stroke="#e3e2e0" strokeOpacity="0.6" strokeDasharray="4 4" />
                    <line x1="0" y1="100" x2="700" y2="100" stroke="#e3e2e0" strokeOpacity="0.6" strokeDasharray="4 4" />
                    <line x1="0" y1="140" x2="700" y2="140" stroke="#e3e2e0" strokeOpacity="0.6" strokeDasharray="4 4" />
                    <line x1="0" y1="180" x2="700" y2="180" stroke="#e3e2e0" strokeOpacity="0.8" />

                    {/* Dynamic Path based on monthlyRevenue */}
                    <path
                      d={`M 0 ${180 - (Math.min(data.monthlyRevenue[0] || 0, 15000) / 15000) * 160} ` + 
                         data.monthlyRevenue.map((val: number, i: number) => {
                           if(i===0) return '';
                           const x = (700 / 11) * i;
                           const normalizedVal = Math.min(val || 0, 15000); // capped for visual scaling
                           const y = 180 - (normalizedVal / 15000) * 160;
                           return `L ${x} ${y} `;
                         }).join('')}
                      fill="none"
                      stroke="#6c5a56"
                      strokeWidth="3"
                    />

                    {/* Points */}
                    {data.monthlyRevenue.map((val: number, i: number) => {
                      const x = (700 / 11) * i;
                      const normalizedVal = Math.min(val || 0, 15000);
                      const y = 180 - (normalizedVal / 15000) * 160;
                      return (
                        <g key={i} className="group/pt cursor-pointer">
                          <circle cx={x} cy={y} r="5" fill="#faf9f6" stroke="#6c5a56" strokeWidth="2" />
                          <title>{formatter.format(val)}</title>
                        </g>
                      );
                    })}
                  </svg>
                </div>

                {/* X Axis Labels */}
                <div className="flex justify-between text-[10px] text-outline font-medium mt-2">
                  <span>Jan</span><span>Fev</span><span>Mar</span><span>Abr</span>
                  <span>Mai</span><span>Jun</span><span>Jul</span><span>Ago</span>
                  <span>Set</span><span>Out</span><span>Nov</span><span>Dez</span>
                </div>
              </div>
            </div>

            {/* Secondary Chart / List */}
            <div className="bg-surface-container-lowest/60 backdrop-blur-sm border border-white/40 shadow-sm p-6 rounded-2xl flex flex-col justify-between">
              <h3 className="font-serif text-2xl font-semibold text-primary mb-6">Tratamentos Populares</h3>
              <div className="flex-1 space-y-5">
                {data.tratamentosPopulares.length > 0 ? (
                  data.tratamentosPopulares.map((item: any, i: number) => {
                    const colors = ["bg-primary", "bg-tertiary", "bg-secondary-fixed-dim", "bg-outline"];
                    return (
                      <div key={i}>
                        <div className="flex justify-between items-end mb-1.5">
                          <span className="text-sm font-medium text-on-background truncate pr-2 max-w-[200px]">{item.nome}</span>
                          <span className="text-xs font-semibold text-on-surface-variant">{item.percentage}%</span>
                        </div>
                        <div className="w-full bg-surface-variant/60 rounded-full h-2">
                          <div className={`${colors[i % colors.length]} h-2 rounded-full transition-all duration-500`} style={{ width: `${item.percentage}%` }}></div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-sm text-on-surface-variant">Nenhum dado no período.</p>
                )}
              </div>
            </div>
          </div>

          {/* Table / Mobile Cards Section */}
          <div className="bg-surface-container-lowest/60 backdrop-blur-sm border border-white/40 shadow-sm rounded-2xl overflow-hidden p-4 sm:p-0">
            <div className="p-2 sm:p-6 border-b border-outline-variant/30 flex justify-between items-center mb-2 sm:mb-0">
              <h3 className="font-serif text-xl sm:text-2xl font-semibold text-primary">Desempenho da Equipe</h3>
            </div>

            {/* Mobile Card */}
            <div className="block sm:hidden space-y-3">
              <div className="bg-surface-container-low border border-outline-variant/30 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden border border-outline-variant bg-primary-container flex items-center justify-center text-primary font-bold">
                      J
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-on-background">Dra. Jordane Ferreira Faria</h4>
                      <span className="px-2 py-0.5 bg-primary-fixed/50 text-on-primary-fixed rounded-full text-[10px] font-medium">Biomédica Esteta</span>
                    </div>
                  </div>
                  <div className="flex text-secondary-container">
                    <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                    <span className="text-xs font-bold text-on-surface ml-1">5.0</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-outline-variant/20 text-xs">
                  <div>
                    <span className="text-on-surface-variant block">Atendimentos</span>
                    <span className="font-semibold text-on-surface">{data.totalAtendimentos}</span>
                  </div>
                  <div>
                    <span className="text-on-surface-variant block">Receita Gerada</span>
                    <span className="font-bold text-primary">{formatter.format(data.receitaTotal)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Desktop Table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-surface-container-low/50">
                  <tr>
                    <th className="p-4 text-xs font-medium text-on-surface-variant uppercase tracking-wider">Profissional</th>
                    <th className="p-4 text-xs font-medium text-on-surface-variant uppercase tracking-wider">Cargo</th>
                    <th className="p-4 text-xs font-medium text-on-surface-variant uppercase tracking-wider">Atendimentos</th>
                    <th className="p-4 text-xs font-medium text-on-surface-variant uppercase tracking-wider">Receita Gerada</th>
                    <th className="p-4 text-xs font-medium text-on-surface-variant uppercase tracking-wider">Avaliação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/20">
                  <tr className="hover:bg-surface-variant/30 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full overflow-hidden border border-outline-variant bg-primary-container flex items-center justify-center text-primary font-bold">
                          J
                        </div>
                        <span className="text-sm font-medium text-on-background">Dra. Jordane Ferreira Faria</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 bg-primary-fixed/50 text-on-primary-fixed rounded-full text-xs font-medium">Biomédica Esteta</span>
                    </td>
                    <td className="p-4 text-sm text-on-surface-variant">{data.totalAtendimentos}</td>
                    <td className="p-4 text-sm font-medium text-on-background">{formatter.format(data.receitaTotal)}</td>
                    <td className="p-4">
                      <div className="flex text-secondary-container">
                        <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                        <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                        <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                        <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                        <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
