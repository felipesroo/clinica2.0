"use client";

import { useState, useMemo, useEffect } from "react";
import { useClinic, Appointment } from "../../contexts/ClinicContext";
import { getProcedimentos, ProcedimentoData } from "../../actions/procedures";
import { getEstoque, EstoqueProdutoData, registrarBaixaAgendamento, getMovimentacoesPorAgendamento, sincronizarBaixaAgendamento } from "../../actions/inventory";

const HOURS = Array.from({ length: 14 }, (_, i) => i + 8); // 08:00 to 21:00

// MOCK_CLIENTS removed, fetching dynamically from DB

export default function AgendamentosPage() {
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [showClientSuggestions, setShowClientSuggestions] = useState(false);
  const [selectedView, setSelectedView] = useState<"dia" | "semana" | "mes" | "lista">("dia");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedMonthDate, setSelectedMonthDate] = useState<string>(new Date().toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' }));
  
  const [procedimentos, setProcedimentos] = useState<ProcedimentoData[]>([]);
  const [estoque, setEstoque] = useState<EstoqueProdutoData[]>([]);

  const [dbClients, setDbClients] = useState<any[]>([]);

  useEffect(() => {
    getProcedimentos().then(data => setProcedimentos(data));
    getEstoque().then(data => setEstoque(data.filter(p => p.quantidade > 0)));
    import('../../actions/client').then(m => m.getAllClientsList().then(c => setDbClients(c)));
  }, []);

  const { appointments, addAppointment, updateAppointment, deleteAppointment } = useClinic();
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);

  const [formData, setFormData] = useState({
    patientName: "",
    patientPhone: "",
    service: "",
    date: new Date().toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' }),
    startTime: "09:00",
    valor: "",
    formaPagamento: "",
    numeroParcelas: 1,
  });

  const [produtosUsados, setProdutosUsados] = useState<{produtoId: string, quantidade: number}[]>([]);
  const [sessoesAdicionais, setSessoesAdicionais] = useState<{ date: string; startTime: string; service: string }[]>([]);

  const handleAddAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.patientName || !formData.service) return;
    
    let agendamentoId = "";
    
    if (editingAppointment) {
      agendamentoId = await updateAppointment({
        ...editingAppointment,
        patientName: formData.patientName,
        patientPhone: formData.patientPhone,
        service: formData.service,
        date: formData.date,
        startTime: formData.startTime,
        valor: formData.valor,
        formaPagamento: formData.formaPagamento,
        numeroParcelas: formData.numeroParcelas,
      });
    } else {
      agendamentoId = await addAppointment({
        id: Date.now().toString(),
        patientName: formData.patientName,
        patientPhone: formData.patientPhone,
        service: formData.service,
        date: formData.date,
        startTime: formData.startTime,
        duration: 60,
        valor: formData.valor,
        formaPagamento: formData.formaPagamento,
        numeroParcelas: formData.numeroParcelas,
      });
    }

    if (agendamentoId) {
      if (editingAppointment) {
        await sincronizarBaixaAgendamento(agendamentoId, produtosUsados);
      } else if (produtosUsados.length > 0) {
        await registrarBaixaAgendamento(agendamentoId, produtosUsados);
      }
    }

    if (!editingAppointment && sessoesAdicionais.length > 0) {
      for (const sessao of sessoesAdicionais) {
        if (sessao.date && sessao.startTime) {
          await addAppointment({
            id: Date.now().toString() + Math.random(),
            patientName: formData.patientName,
            patientPhone: formData.patientPhone,
            service: sessao.service || `Retorno - ${formData.service}`,
            date: sessao.date,
            startTime: sessao.startTime,
            duration: 60,
          });
        }
      }
    }
    
    setIsBookingModalOpen(false);
    setEditingAppointment(null);
    setFormData({ 
      patientName: "",
      patientPhone: "",
      service: "", 
      date: new Date().toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' }), 
      startTime: "09:00",
      valor: "",
      formaPagamento: "",
      numeroParcelas: 1,
    });
    setProdutosUsados([]);
    setSessoesAdicionais([]);
    
    // Refresh estoque to reflect usage
    getEstoque().then(data => setEstoque(data.filter(p => p.quantidade > 0)));
  };

  const addProdutoUsado = (produtoId: string) => {
    if (!produtoId) return;
    if (produtosUsados.find(p => p.produtoId === produtoId)) return;
    setProdutosUsados([...produtosUsados, { produtoId, quantidade: 1 }]);
  };

  const removeProdutoUsado = (produtoId: string) => {
    setProdutosUsados(produtosUsados.filter(p => p.produtoId !== produtoId));
  };

  const updateProdutoQuantidade = (produtoId: string, qtd: number) => {
    if (qtd < 1) qtd = 1;
    setProdutosUsados(produtosUsados.map(p => p.produtoId === produtoId ? { ...p, quantidade: qtd } : p));
  };

  const handleApptClick = async (app: Appointment) => {
    if (app.isExternal) return;
    setEditingAppointment(app);
    setFormData({
      patientName: app.patientName,
      patientPhone: app.patientPhone || "",
      service: app.service,
      date: app.date,
      startTime: app.startTime,
      valor: app.valor || "",
      formaPagamento: app.formaPagamento || "",
      numeroParcelas: app.numeroParcelas || 1,
    });
    setSessoesAdicionais([]);
    
    const movs = await getMovimentacoesPorAgendamento(app.id);
    setProdutosUsados(movs);
    
    setIsBookingModalOpen(true);
  };

  const getBlockStyle = (app: Appointment, dayAppointments: Appointment[], view: 'dia' | 'semana') => {
    const [h, m] = app.startTime.split(':').map(Number);
    const startHour = HOURS[0];
    const top = (h - startHour) * 96 + (m * 1.6);
    const height = Math.max((app.duration || 60) * 1.6, 40);
    
    const startMins = h * 60 + m;
    const endMins = startMins + (app.duration || 60);
    
    const overlapping = dayAppointments.filter(other => {
      const [oh, om] = other.startTime.split(':').map(Number);
      const oStart = oh * 60 + om;
      const oEnd = oStart + (other.duration || 60);
      return (oStart < endMins && oEnd > startMins);
    });
    
    overlapping.sort((a, b) => {
       const aStart = parseInt(a.startTime.replace(':',''));
       const bStart = parseInt(b.startTime.replace(':',''));
       if (aStart === bStart) return a.id.localeCompare(b.id);
       return aStart - bStart;
    });
    
    const index = overlapping.findIndex(o => o.id === app.id);
    const total = overlapping.length;
    
    if (total > 1) {
      const pctWidth = 100 / total;
      const padding = view === 'dia' ? 12 : 4; 
      return { 
        top: `${top}px`, 
        height: `${height}px`,
        left: `calc(${index * pctWidth}% + ${padding / 2}px)`,
        width: `calc(${pctWidth}% - ${padding}px)`
      };
    }

    return { top: `${top}px`, height: `${height}px` };
  };

  const navigateDate = (dir: "prev" | "next" | "today") => {
    if (dir === "today") {
      setCurrentDate(new Date());
      return;
    }
    const d = new Date(currentDate);
    if (selectedView === "dia") {
      d.setDate(d.getDate() + (dir === "next" ? 1 : -1));
    } else if (selectedView === "semana") {
      d.setDate(d.getDate() + (dir === "next" ? 7 : -7));
    } else {
      d.setMonth(d.getMonth() + (dir === "next" ? 1 : -1));
    }
    setCurrentDate(d);
  };

  const monthName = currentDate.toLocaleString('pt-BR', { month: 'long', year: 'numeric' });
  const weekDays = useMemo(() => {
    const d = new Date(currentDate);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); 
    d.setDate(diff);
    return Array.from({ length: 6 }, (_, i) => {
      const wDay = new Date(d);
      wDay.setDate(d.getDate() + i);
      return wDay;
    });
  }, [currentDate]);

  return (
    <div className="space-y-6 md:space-y-8 max-w-[1440px] mx-auto pb-16">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl md:text-3xl text-on-background mb-2">
            Cronograma e Agendamentos
          </h1>
          <p className="text-base text-on-surface-variant max-w-2xl">
            Gerencie o tempo da sua clínica, otimize as agendas dos profissionais e garanta um fluxo perfeito de pacientes.
          </p>
        </div>
        <button 
          onClick={() => {
            setEditingAppointment(null);
            setFormData({ 
              patientName: "", 
              patientPhone: "",
              service: "", 
              date: new Date().toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' }), 
              startTime: "09:00",
              valor: "",
              formaPagamento: "",
              numeroParcelas: 1
            });
            setProdutosUsados([]);
            setSessoesAdicionais([]);
            setIsBookingModalOpen(true);
          }}
          className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-primary-container to-primary-fixed text-on-primary-fixed text-sm font-medium hover:shadow-md hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          Novo Agendamento
        </button>
      </div>

      <div className="bg-surface-container-lowest/60 backdrop-blur-sm border border-white/40 shadow-sm rounded-xl overflow-hidden flex flex-col h-[650px] md:h-[800px]">
        <div className="p-3 md:p-6 border-b border-outline-variant/30 flex flex-col sm:flex-row justify-between items-center gap-3 bg-surface-container-lowest/50">
          <div className="flex items-center justify-between sm:justify-start gap-3 w-full sm:w-auto">
            <div className="flex items-center bg-surface-container/50 rounded-lg p-1">
              <button 
                onClick={() => navigateDate("prev")}
                className="p-1.5 hover:bg-surface-container-high rounded-md transition-colors text-on-surface-variant"
              >
                <span className="material-symbols-outlined text-[20px]">chevron_left</span>
              </button>
              <button 
                onClick={() => navigateDate("today")}
                className="px-3 py-1.5 text-sm font-medium text-on-surface hover:bg-surface-container-high rounded-md transition-colors"
              >
                Hoje
              </button>
              <button 
                onClick={() => navigateDate("next")}
                className="p-1.5 hover:bg-surface-container-high rounded-md transition-colors text-on-surface-variant"
              >
                <span className="material-symbols-outlined text-[20px]">chevron_right</span>
              </button>
            </div>
            <h2 className="font-serif text-lg sm:text-xl text-primary capitalize">{monthName}</h2>
          </div>

          <div className="flex items-center justify-center gap-2 w-full sm:w-auto">
            <button 
              onClick={() => setSelectedView("dia")}
              className={`px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all ${selectedView === "dia" ? "bg-primary text-on-primary" : "bg-surface-container/50 text-on-surface-variant hover:bg-surface-container"}`}
            >
              Dia
            </button>
            <button 
              onClick={() => setSelectedView("semana")}
              className={`px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all ${selectedView === "semana" ? "bg-primary text-on-primary" : "bg-surface-container/50 text-on-surface-variant hover:bg-surface-container"}`}
            >
              Semana
            </button>
            <button 
              onClick={() => setSelectedView("mes")}
              className={`px-3 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all ${selectedView === "mes" ? "bg-primary text-on-primary" : "bg-surface-container/50 text-on-surface-variant hover:bg-surface-container"}`}
            >
              Mês
            </button>
            <button 
              onClick={() => setSelectedView("lista")}
              className={`px-3 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all ${selectedView === "lista" ? "bg-primary text-on-primary" : "bg-surface-container/50 text-on-surface-variant hover:bg-surface-container"}`}
            >
              Lista
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto relative bg-surface-container-lowest/30 flex flex-col">
          <div className="flex min-w-[320px] sm:min-w-[700px] md:min-w-full flex-1">
            {/* Time column */}
            {selectedView !== "mes" && selectedView !== "lista" && (
              <div className="w-14 sm:w-16 flex-shrink-0 border-r border-outline-variant/30 sticky left-0 bg-surface-container-lowest/80 backdrop-blur-md z-20">
                <div className="h-12 border-b border-outline-variant/30"></div>
                {HOURS.map(hour => (
                  <div key={hour} className="h-24 relative border-b border-outline-variant/20">
                    <span className="absolute -top-3 right-2 text-xs text-on-surface-variant font-medium">
                      {hour.toString().padStart(2, '0')}:00
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* View content */}
            {selectedView === "dia" ? (
              <div className="flex-1 relative">
                <div className="h-12 border-b border-outline-variant/30 flex items-center justify-center bg-surface-container-lowest/50 sticky top-0 z-10">
                  <h3 className="font-medium text-on-surface">{currentDate.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric' })}</h3>
                </div>
                <div className="relative">
                  {HOURS.map(h => <div key={h} className="h-24 border-b border-outline-variant/10"></div>)}
                  
                  {appointments
                    .filter(app => app.date === currentDate.toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' }))
                    .map((app, _, arr) => (
                    <div 
                      key={app.id}
                      onClick={() => handleApptClick(app)}
                      className={`absolute left-2 right-4 rounded-lg border p-2 overflow-hidden shadow-sm transition-all group ${
                        app.isExternal 
                          ? 'bg-surface-container-highest border-outline-variant/30 cursor-default' 
                          : 'bg-secondary-container border-secondary/30 hover:shadow-md cursor-pointer hover:z-30'
                      }`}
                      style={getBlockStyle(app, arr, 'dia')}
                    >
                      <div className={`absolute top-0 left-0 w-1 h-full rounded-l-lg ${app.isExternal ? 'bg-outline-variant' : 'bg-secondary'}`}></div>
                      <p className={`text-xs font-semibold truncate ${app.isExternal ? 'text-on-surface-variant' : 'text-on-secondary-container'}`}>
                        {app.patientName}
                      </p>
                      <p className={`text-[10px] truncate ${app.isExternal ? 'text-on-surface-variant/80' : 'text-on-secondary-container/80'}`}>{app.service}</p>
                      <p className={`text-[10px] mt-1 ${app.isExternal ? 'text-on-surface-variant/60' : 'text-on-secondary-container/60'}`}>{app.startTime}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : selectedView === "semana" ? (
              weekDays.map((day, idx) => {
                const dayStr = day.toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' });
                return (
                  <div key={idx} className="flex-1 relative border-r border-outline-variant/30 last:border-r-0">
                    <div className="h-12 border-b border-outline-variant/30 flex flex-col items-center justify-center bg-surface-container-lowest/50 sticky top-0 z-10">
                      <span className="text-[10px] text-on-surface-variant uppercase">{day.toLocaleDateString('pt-BR', { weekday: 'short' })}</span>
                      <span className={`text-sm font-medium ${dayStr === new Date().toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' }) ? 'w-6 h-6 bg-primary text-on-primary rounded-full flex items-center justify-center' : 'text-on-surface'}`}>
                        {day.getDate()}
                      </span>
                    </div>
                    <div className="relative">
                      {HOURS.map(h => <div key={h} className="h-24 border-b border-outline-variant/10"></div>)}
                      {appointments
                        .filter(app => app.date === dayStr)
                        .map((app, _, arr) => (
                        <div 
                          key={app.id}
                          onClick={() => handleApptClick(app)}
                          className={`absolute left-1 right-1 rounded-md border p-1.5 overflow-hidden shadow-sm transition-all ${
                            app.isExternal
                              ? 'bg-surface-container-highest border-outline-variant/30 cursor-default'
                              : 'bg-tertiary-container border-tertiary/30 hover:shadow-md cursor-pointer hover:z-30'
                          }`}
                          style={getBlockStyle(app, arr, 'semana')}
                        >
                          <div className={`absolute top-0 left-0 w-0.5 h-full rounded-l-md ${app.isExternal ? 'bg-outline-variant' : 'bg-tertiary'}`}></div>
                          <p className={`text-[10px] font-semibold truncate leading-tight ${app.isExternal ? 'text-on-surface-variant' : 'text-on-tertiary-container'}`}>
                            {app.patientName}
                          </p>
                          <p className={`text-[9px] truncate leading-tight ${app.isExternal ? 'text-on-surface-variant/80' : 'text-on-tertiary-container/80'}`}>{app.service}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })
            ) : selectedView === "mes" ? (
              <div className="flex-1 flex flex-col h-full bg-surface-container-lowest/50">
                {/* Header days */}
                <div className="grid grid-cols-7 border-b border-outline-variant/30 bg-surface-container-lowest/80 sticky top-0 z-10">
                  {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map(day => (
                    <div key={day} className="py-3 text-center text-xs font-medium text-on-surface-variant uppercase tracking-wider">
                      {day}
                    </div>
                  ))}
                </div>
                
                {/* Grid */}
                <div className="flex-1 grid grid-cols-7 grid-rows-5 lg:grid-rows-6">
                  {(() => {
                    const year = currentDate.getFullYear();
                    const month = currentDate.getMonth();
                    
                    const firstDayOfMonth = new Date(year, month, 1);
                    const lastDayOfMonth = new Date(year, month + 1, 0);
                    
                    const startingDayOfWeek = firstDayOfMonth.getDay();
                    const totalDays = lastDayOfMonth.getDate();
                    
                    // Total cells usually 42 (6 weeks) or 35 (5 weeks)
                    const totalCells = (startingDayOfWeek + totalDays) > 35 ? 42 : 35;
                    
                    const cells = [];
                    for (let i = 0; i < totalCells; i++) {
                      const dayNumber = i - startingDayOfWeek + 1;
                      const isCurrentMonth = dayNumber > 0 && dayNumber <= totalDays;
                      const dateObj = new Date(year, month, dayNumber);
                      const dateStr = dateObj.toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' });
                      const isToday = dateStr === new Date().toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' });
                      
                      cells.push(
                        <div 
                          key={i} 
                          onClick={() => setSelectedMonthDate(dateStr)}
                          className={`min-h-[60px] sm:min-h-[110px] p-1 border-b border-r border-outline-variant/20 flex flex-col gap-1 cursor-pointer transition-colors ${
                            !isCurrentMonth ? 'bg-surface-container-lowest/20 opacity-40' : ''
                          } ${dateStr === selectedMonthDate ? 'bg-primary-container/20 ring-2 ring-primary ring-inset' : 'hover:bg-surface-container/30'}`}
                        >
                          <div className={`text-xs p-1 text-right font-medium ${isToday ? 'text-primary' : 'text-on-surface-variant'}`}>
                            {isToday ? (
                              <span className="w-5 h-5 sm:w-6 sm:h-6 inline-flex items-center justify-center bg-primary text-on-primary rounded-full text-[11px]">
                                {dateObj.getDate()}
                              </span>
                            ) : (
                              dateObj.getDate()
                            )}
                          </div>
                          
                          {/* Desktop Pill View */}
                          <div className="hidden sm:flex flex-1 flex-col gap-1 overflow-y-auto max-h-[80px] custom-scrollbar px-1">
                            {appointments
                              .filter(app => app.date === dateStr)
                              .sort((a, b) => a.startTime.localeCompare(b.startTime))
                              .map(app => (
                                <div 
                                  key={app.id}
                                  onClick={(e) => { e.stopPropagation(); handleApptClick(app); }}
                                  className={`flex-shrink-0 text-[10px] truncate px-1.5 py-0.5 rounded-sm border-l-2 cursor-pointer transition-colors ${
                                    app.isExternal 
                                      ? 'bg-surface-container-high text-on-surface-variant border-outline-variant hover:bg-surface-container-highest' 
                                      : 'bg-primary-container/80 text-on-primary-container border-primary hover:bg-primary-container'
                                  }`}
                                  title={`${app.startTime} - ${app.patientName}`}
                                >
                                  {app.startTime} - {app.patientName}
                                </div>
                              ))}
                          </div>

                          {/* Mobile Dot Indicators */}
                          {(() => {
                            const dayApps = appointments.filter(app => app.date === dateStr);
                            if (dayApps.length === 0) return null;
                            return (
                              <div className="flex sm:hidden flex-wrap gap-1 justify-center mt-auto pb-1">
                                {dayApps.slice(0, 3).map((a, idx) => (
                                  <span key={idx} className={`w-1.5 h-1.5 rounded-full ${a.isExternal ? 'bg-outline-variant' : 'bg-primary'}`}></span>
                                ))}
                                {dayApps.length > 3 && (
                                  <span className="text-[9px] font-bold text-primary">+{dayApps.length - 3}</span>
                                )}
                              </div>
                            );
                          })()}
                        </div>
                      );
                    }
                    return cells;
                  })()}
                </div>
              </div>
            ) : (
              /* Lista / Feed View */
              <div className="flex-1 p-4 overflow-y-auto space-y-4">
                <h3 className="font-serif text-lg font-semibold text-primary mb-2">Próximos Agendamentos</h3>
                {appointments.length === 0 ? (
                  <p className="text-sm text-on-surface-variant">Nenhum agendamento encontrado.</p>
                ) : (
                  appointments
                    .sort((a, b) => new Date(`${a.date}T${a.startTime}`).getTime() - new Date(`${b.date}T${b.startTime}`).getTime())
                    .map((app) => (
                      <div 
                        key={app.id} 
                        onClick={() => handleApptClick(app)}
                        className="bg-surface-container-lowest/80 border border-outline-variant/30 p-4 rounded-xl flex items-center justify-between cursor-pointer hover:border-primary/50 shadow-sm transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-primary-container/40 text-primary flex flex-col items-center justify-center font-bold text-xs shrink-0">
                            <span>{app.startTime}</span>
                            <span className="text-[10px] font-normal text-on-surface-variant">{new Date(app.date + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}</span>
                          </div>
                          <div>
                            <h4 className="text-sm font-semibold text-on-surface">{app.patientName}</h4>
                            <p className="text-xs text-on-surface-variant">{app.service} {app.valor ? `• R$ ${app.valor}` : ''}</p>
                            {app.patientPhone && <p className="text-[11px] text-on-surface-variant/70 mt-0.5">{app.patientPhone}</p>}
                          </div>
                        </div>
                        <span className="material-symbols-outlined text-on-surface-variant">chevron_right</span>
                      </div>
                    ))
                )}
              </div>
            )}
          </div>

          {/* Selected Day Agenda Cards below Month View */}
          {selectedView === "mes" && (
            <div className="p-4 border-t border-outline-variant/30 bg-surface-container-lowest/90 backdrop-blur-md sticky bottom-0 z-10">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-serif text-sm sm:text-base font-semibold text-primary capitalize">
                  {new Date(selectedMonthDate + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
                </h3>
                <button
                  onClick={() => {
                    setEditingAppointment(null);
                    setFormData({ 
                      patientName: "", 
                      patientPhone: "",
                      service: "", 
                      date: selectedMonthDate, 
                      startTime: "09:00",
                      valor: "",
                      formaPagamento: "",
                      numeroParcelas: 1
                    });
                    setProdutosUsados([]);
                    setSessoesAdicionais([]);
                    setIsBookingModalOpen(true);
                  }}
                  className="text-xs bg-primary text-on-primary px-3 py-1.5 rounded-full font-medium flex items-center gap-1 hover:bg-primary/90 transition-colors shadow-sm"
                >
                  <span className="material-symbols-outlined text-[16px]">add</span>
                  Agendar neste dia
                </button>
              </div>

              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {appointments.filter(a => a.date === selectedMonthDate).length === 0 ? (
                  <p className="text-xs text-on-surface-variant py-2">Nenhum agendamento nesta data.</p>
                ) : (
                  appointments
                    .filter(a => a.date === selectedMonthDate)
                    .sort((a, b) => a.startTime.localeCompare(b.startTime))
                    .map(app => (
                      <div 
                        key={app.id} 
                        onClick={() => handleApptClick(app)}
                        className="p-3 bg-surface-container-low border border-outline-variant/30 rounded-xl flex items-center justify-between cursor-pointer hover:border-primary/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-primary-container/40 text-primary flex flex-col items-center justify-center font-bold text-xs shrink-0">
                            <span>{app.startTime}</span>
                          </div>
                          <div>
                            <h4 className="text-sm font-semibold text-on-surface">{app.patientName}</h4>
                            <p className="text-xs text-on-surface-variant">{app.service} {app.valor ? `• R$ ${app.valor}` : ''} {app.formaPagamento ? `(${app.formaPagamento})` : ''}</p>
                          </div>
                        </div>
                        <span className="material-symbols-outlined text-on-surface-variant text-[20px]">chevron_right</span>
                      </div>
                    ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Booking Modal */}
      {isBookingModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-2xl w-full max-w-lg p-6 md:p-8 shadow-xl relative border border-white/20 max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => setIsBookingModalOpen(false)}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-surface-container hover:bg-surface-container-high transition-colors text-on-surface-variant"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
            
            <h2 className="font-serif text-2xl font-semibold text-primary mb-6">
              {editingAppointment ? "Editar Agendamento" : "Novo Agendamento"}
            </h2>
            
            <form onSubmit={handleAddAppointment} className="space-y-6">
              <div className="space-y-4">
                <div className="relative">
                  <label className="block text-xs font-medium text-on-surface-variant uppercase tracking-wider mb-1">
                    Nome do Paciente
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.patientName}
                    onChange={(e) => {
                      setFormData({ ...formData, patientName: e.target.value });
                      setShowClientSuggestions(true);
                    }}
                    onFocus={() => setShowClientSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowClientSuggestions(false), 200)}
                    className="w-full bg-surface-container/60 border-b border-outline focus:border-primary focus:ring-0 focus:outline-none py-2 text-sm text-on-surface transition-colors"
                    placeholder="Comece a digitar..."
                  />
                  {showClientSuggestions && formData.patientName.length > 0 && (
                    <div className="absolute top-full left-0 w-full mt-1 bg-surface-container-lowest border border-outline-variant/30 rounded-lg shadow-lg z-10 max-h-40 overflow-y-auto">
                      {dbClients.filter(c => c.name.toLowerCase().includes(formData.patientName.toLowerCase())).map(client => (
                        <div 
                          key={client.id}
                          className="px-4 py-2 text-sm text-on-surface hover:bg-surface-container cursor-pointer flex justify-between items-center"
                          onClick={() => {
                            setFormData({ ...formData, patientName: client.name, patientPhone: client.phone || "" });
                            setShowClientSuggestions(false);
                          }}
                        >
                          <span className="font-medium">{client.name}</span>
                          {client.phone && <span className="text-xs text-on-surface-variant bg-surface-container-high px-2 py-0.5 rounded-full">{client.phone}</span>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Phone field */}
                <div className="relative">
                  <label className="block text-xs font-medium text-on-surface-variant uppercase tracking-wider mb-1">
                    WhatsApp do Paciente
                  </label>
                  <div className="relative flex items-center">
                    <span className="material-symbols-outlined absolute left-0 text-[18px] text-on-surface-variant pointer-events-none">phone</span>
                    <input
                      type="tel"
                      value={formData.patientPhone}
                      onChange={(e) => setFormData({ ...formData, patientPhone: e.target.value })}
                      className="w-full bg-surface-container/60 border-b border-outline focus:border-primary focus:ring-0 focus:outline-none py-2 pl-7 text-sm text-on-surface transition-colors"
                      placeholder="Ex: 11999998888 (com DDD)"
                    />
                    {formData.patientPhone && (
                      <span className="absolute right-0 text-xs text-primary font-medium flex items-center gap-1 pointer-events-none">
                        <span className="material-symbols-outlined text-[14px]">check_circle</span>
                        Receberá disparo
                      </span>
                    )}
                  </div>
                </div>

                <div className="relative">
                  <label className="block text-xs font-medium text-on-surface-variant uppercase tracking-wider mb-1">
                    Serviço / Tratamento
                  </label>
                  <div className="relative">
                    <select
                      required
                      value={formData.service}
                      onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                      className="w-full bg-surface-container/60 border-b border-outline focus:border-tertiary focus:ring-0 focus:outline-none py-2 appearance-none text-sm text-on-surface transition-colors cursor-pointer"
                    >
                      <option disabled value="">Selecione um tratamento</option>
                      {procedimentos.map(proc => (
                        <option key={proc.id} value={proc.nome}>{proc.nome}</option>
                      ))}
                    </select>
                    <span className="material-symbols-outlined absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant">
                      expand_more
                    </span>
                  </div>
                </div>

                {/* Produtos Utilizados (Estoque) */}
                <div className="border-t border-outline-variant/30 pt-4 mt-4">
                  <label className="block text-sm font-medium text-primary mb-2">
                    Produtos Utilizados (Estoque)
                  </label>
                  
                  {produtosUsados.map((item, index) => {
                    const prodInfo = estoque.find(p => p.id === item.produtoId);
                    return (
                      <div key={index} className="flex items-center gap-2 mb-2">
                        <span className="flex-1 text-sm bg-surface-container/50 px-3 py-1.5 rounded-lg text-on-surface truncate">
                          {prodInfo?.nome}
                        </span>
                        <input 
                          type="number"
                          min="1"
                          value={item.quantidade}
                          onChange={(e) => updateProdutoQuantidade(item.produtoId, Number(e.target.value))}
                          className="w-20 bg-surface-container/60 border border-outline/30 rounded-lg py-1 px-2 text-sm text-center"
                        />
                        <button 
                          type="button"
                          onClick={() => removeProdutoUsado(item.produtoId)}
                          className="p-1 text-error hover:bg-error/10 rounded-lg transition-colors"
                        >
                          <span className="material-symbols-outlined text-sm">close</span>
                        </button>
                      </div>
                    );
                  })}
                  
                  <div className="mt-2 relative">
                    <select
                      value=""
                      onChange={(e) => {
                        addProdutoUsado(e.target.value);
                      }}
                      className="w-full bg-surface-container-low border border-dashed border-outline/50 focus:border-primary focus:ring-0 focus:outline-none py-2 px-3 appearance-none text-sm text-on-surface-variant transition-colors cursor-pointer rounded-lg"
                    >
                      <option value="" disabled>+ Adicionar produto do estoque</option>
                      {estoque.map(prod => (
                        <option key={prod.id} value={prod.id}>
                          {prod.nome} ({prod.quantidade} disponíveis)
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 border-t border-outline-variant/30 pt-4 mt-4">
                  <div>
                    <label className="block text-xs font-medium text-on-surface-variant uppercase tracking-wider mb-1">
                      Data
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="w-full bg-surface-container/60 border-b border-outline focus:border-primary focus:ring-0 focus:outline-none py-2 text-sm text-on-surface transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-on-surface-variant uppercase tracking-wider mb-1">
                      Hora
                    </label>
                    <input
                      type="time"
                      required
                      value={formData.startTime}
                      onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                      className="w-full bg-surface-container/60 border-b border-outline focus:border-primary focus:ring-0 focus:outline-none py-2 text-sm text-on-surface transition-colors"
                    />
                  </div>
                </div>

                {/* Retornos & Sessões Futuras */}
                {!editingAppointment && (
                  <div className="border-t border-outline-variant/30 pt-4 mt-4">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-medium text-on-surface-variant uppercase tracking-wider">
                        Agendar Retornos / Sessões Futuras
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          const baseDate = sessoesAdicionais.length > 0 
                            ? new Date(sessoesAdicionais[sessoesAdicionais.length - 1].date + 'T12:00:00')
                            : (formData.date ? new Date(formData.date + 'T12:00:00') : new Date());
                          
                          baseDate.setDate(baseDate.getDate() + 14);
                          const nextDateStr = baseDate.toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' });
                          const defaultService = formData.service ? `Retorno - ${formData.service}` : 'Retorno';

                          setSessoesAdicionais([
                            ...sessoesAdicionais,
                            {
                              date: nextDateStr,
                              startTime: formData.startTime || "09:00",
                              service: defaultService
                            }
                          ]);
                        }}
                        className="text-xs text-primary font-medium flex items-center gap-1 hover:underline cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[16px]">add</span>
                        Adicionar Retorno
                      </button>
                    </div>

                    {sessoesAdicionais.map((sessao, index) => (
                      <div key={index} className="bg-surface-container/40 p-3 rounded-lg border border-outline-variant/30 mb-2 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-primary">Sessão / Retorno #{index + 1}</span>
                          <button
                            type="button"
                            onClick={() => setSessoesAdicionais(sessoesAdicionais.filter((_, i) => i !== index))}
                            className="text-error hover:bg-error/10 p-1 rounded"
                          >
                            <span className="material-symbols-outlined text-[16px]">close</span>
                          </button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          <div className="sm:col-span-1">
                            <input
                              type="text"
                              placeholder="Título / Serviço"
                              value={sessao.service}
                              onChange={(e) => {
                                const updated = [...sessoesAdicionais];
                                updated[index].service = e.target.value;
                                setSessoesAdicionais(updated);
                              }}
                              className="w-full bg-surface-container/60 border-b border-outline text-xs p-1.5 text-on-surface focus:outline-none focus:border-primary"
                            />
                          </div>
                          <div>
                            <input
                              type="date"
                              required
                              value={sessao.date}
                              onChange={(e) => {
                                const updated = [...sessoesAdicionais];
                                updated[index].date = e.target.value;
                                setSessoesAdicionais(updated);
                              }}
                              className="w-full bg-surface-container/60 border-b border-outline text-xs p-1.5 text-on-surface focus:outline-none focus:border-primary"
                            />
                          </div>
                          <div>
                            <input
                              type="time"
                              required
                              value={sessao.startTime}
                              onChange={(e) => {
                                const updated = [...sessoesAdicionais];
                                updated[index].startTime = e.target.value;
                                setSessoesAdicionais(updated);
                              }}
                              className="w-full bg-surface-container/60 border-b border-outline text-xs p-1.5 text-on-surface focus:outline-none focus:border-primary"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-xs font-medium text-on-surface-variant uppercase tracking-wider mb-1">
                      Valor (Opcional)
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: 150,00"
                      value={formData.valor || ''}
                      onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
                      className="w-full bg-surface-container/60 border-b border-outline focus:border-primary focus:ring-0 focus:outline-none py-2 text-sm text-on-surface transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-on-surface-variant uppercase tracking-wider mb-1">
                      Forma de Pag. (Opcional)
                    </label>
                    <div className="relative">
                      <select
                        value={formData.formaPagamento || ''}
                        onChange={(e) => setFormData({ ...formData, formaPagamento: e.target.value })}
                        className="w-full bg-surface-container/60 border-b border-outline focus:border-primary focus:ring-0 focus:outline-none py-2 appearance-none text-sm text-on-surface transition-colors cursor-pointer"
                      >
                        <option value="">Selecione...</option>
                        <option value="Dinheiro">Dinheiro</option>
                        <option value="PIX">PIX</option>
                        <option value="Cartão de Crédito">Cartão de Crédito</option>
                        <option value="Cartão de Débito">Cartão de Débito</option>
                      </select>
                      <span className="material-symbols-outlined absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant">
                        expand_more
                      </span>
                    </div>
                  </div>
                  {formData.formaPagamento === 'Cartão de Crédito' && (
                    <div className="col-span-2 sm:col-span-1">
                      <label className="block text-xs font-medium text-on-surface-variant uppercase tracking-wider mb-1">
                        Parcelas
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={formData.numeroParcelas}
                        onChange={(e) => setFormData({ ...formData, numeroParcelas: Number(e.target.value) })}
                        className="w-full bg-surface-container/60 border-b border-outline focus:border-primary focus:ring-0 focus:outline-none py-2 text-sm text-on-surface transition-colors"
                      />
                    </div>
                  )}
                </div>
              </div>
              
              <div className="mt-8 flex gap-3 justify-end pt-4 border-t border-outline-variant/20">
                <button
                  type="button"
                  onClick={() => setIsBookingModalOpen(false)}
                  className="px-5 py-2.5 text-sm font-medium text-on-surface hover:bg-surface-container transition-colors rounded-xl"
                >
                  Cancelar
                </button>
                {editingAppointment && (
                  <button
                    type="button"
                    onClick={() => {
                      deleteAppointment(editingAppointment.id);
                      setIsBookingModalOpen(false);
                    }}
                    className="px-5 py-2.5 text-sm font-medium text-error hover:bg-error/10 transition-colors rounded-xl mr-auto"
                  >
                    Excluir
                  </button>
                )}
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-primary text-on-primary text-sm font-medium hover:bg-primary/90 transition-colors rounded-xl shadow-sm"
                >
                  {editingAppointment ? "Salvar" : "Confirmar Agendamento"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
