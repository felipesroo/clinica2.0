"use client";

import { useState, useMemo, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useClinic, Appointment } from "../../contexts/ClinicContext";
import { getProcedimentos, ProcedimentoData } from "../../actions/procedures";
import { getEstoque, EstoqueProdutoData, registrarBaixaAgendamento, getMovimentacoesPorAgendamento, sincronizarBaixaAgendamento } from "../../actions/inventory";

const HOURS = Array.from({ length: 14 }, (_, i) => i + 8); // 08:00 to 21:00

function AgendamentosContent() {
  const searchParams = useSearchParams();
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [showClientSuggestions, setShowClientSuggestions] = useState(false);
  const [selectedView, setSelectedView] = useState<"dia" | "semana" | "mes" | "lista">("dia");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedMonthDate, setSelectedMonthDate] = useState<string>(
    new Date().toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' })
  );
  
  // Selected day for mobile week view
  const [selectedWeekDayStr, setSelectedWeekDayStr] = useState<string>(
    new Date().toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' })
  );

  // List view search & filter
  const [listSearch, setListSearch] = useState("");
  const [listFilter, setListFilter] = useState<"todos" | "hoje" | "semana" | "futuros">("todos");
  
  const [procedimentos, setProcedimentos] = useState<ProcedimentoData[]>([]);
  const [estoque, setEstoque] = useState<EstoqueProdutoData[]>([]);
  const [dbClients, setDbClients] = useState<any[]>([]);

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

  useEffect(() => {
    getProcedimentos().then(data => setProcedimentos(data)).catch(console.error);
    getEstoque().then(data => setEstoque(data.filter(p => p.quantidade > 0))).catch(console.error);
    import('../../actions/client').then(m => m.getAllClientsList().then(c => setDbClients(c))).catch(console.error);
    
    if (searchParams.get("novo") === "true") {
      setIsBookingModalOpen(true);
    }
  }, [searchParams]);

  const todayStr = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' });

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
    const top = (h - startHour) * 88 + (m * 1.46);
    const height = Math.max((app.duration || 60) * 1.46, 38);
    
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
      const padding = view === 'dia' ? 8 : 2; 
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
      const now = new Date();
      setCurrentDate(now);
      setSelectedMonthDate(now.toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' }));
      setSelectedWeekDayStr(now.toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' }));
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

  const totalMonthAppointments = useMemo(() => {
    const currentMonthPrefix = currentDate.toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' }).slice(0, 7);
    return appointments.filter(a => a.date.startsWith(currentMonthPrefix)).length;
  }, [appointments, currentDate]);

  const filteredListAppointments = useMemo(() => {
    let list = [...appointments];
    
    if (listFilter === "hoje") {
      list = list.filter(a => a.date === todayStr);
    } else if (listFilter === "semana") {
      const weekDates = weekDays.map(d => d.toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' }));
      list = list.filter(a => weekDates.includes(a.date));
    } else if (listFilter === "futuros") {
      list = list.filter(a => a.date >= todayStr);
    }

    if (listSearch.trim()) {
      const q = listSearch.toLowerCase();
      list = list.filter(a => 
        a.patientName.toLowerCase().includes(q) || 
        a.service.toLowerCase().includes(q) ||
        (a.patientPhone && a.patientPhone.includes(q))
      );
    }

    return list.sort((a, b) => new Date(`${a.date}T${a.startTime}`).getTime() - new Date(`${b.date}T${b.startTime}`).getTime());
  }, [appointments, listFilter, listSearch, todayStr, weekDays]);

  const openNewAppointmentModal = (defaultDate?: string) => {
    setEditingAppointment(null);
    setFormData({ 
      patientName: "", 
      patientPhone: "",
      service: "", 
      date: defaultDate || currentDate.toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' }), 
      startTime: "09:00",
      valor: "",
      formaPagamento: "",
      numeroParcelas: 1
    });
    setProdutosUsados([]);
    setSessoesAdicionais([]);
    setIsBookingModalOpen(true);
  };

  return (
    <div className="space-y-4 sm:space-y-6 md:space-y-8 max-w-[1440px] mx-auto pb-12 sm:pb-16 px-1 sm:px-0">
      {/* Top Header Section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-serif text-xl sm:text-2xl md:text-3xl text-on-background font-semibold">
              Cronograma & Agendamentos
            </h1>
            <span className="hidden sm:inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
              {totalMonthAppointments} este mês
            </span>
          </div>
          <p className="text-xs sm:text-sm text-on-surface-variant mt-0.5 line-clamp-1 sm:line-clamp-none">
            Gerencie o tempo da clínica, otimize as agendas e garanta um fluxo perfeito de pacientes.
          </p>
        </div>
        
        <button 
          onClick={() => openNewAppointmentModal()}
          className="w-full sm:w-auto px-4 sm:px-6 py-2.5 rounded-xl bg-gradient-to-r from-primary-container to-primary-fixed text-on-primary-fixed text-sm font-medium hover:shadow-md active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-sm"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          Novo Agendamento
        </button>
      </div>

      {/* Main Calendar Card */}
      <div className="bg-surface-container-lowest/70 backdrop-blur-sm border border-outline-variant/30 shadow-sm rounded-2xl overflow-hidden flex flex-col h-[calc(100dvh-230px)] min-h-[520px] md:h-[780px]">
        
        {/* Navigation & View Controls Bar */}
        <div className="p-2.5 sm:p-4 md:p-5 border-b border-outline-variant/30 flex flex-col sm:flex-row justify-between items-center gap-2.5 sm:gap-3 bg-surface-container-lowest/80">
          {/* Date Picker Buttons & Month Name */}
          <div className="flex items-center justify-between sm:justify-start gap-2 sm:gap-3 w-full sm:w-auto">
            <div className="flex items-center bg-surface-container/60 rounded-xl p-0.5 sm:p-1 border border-outline-variant/20 shadow-xs">
              <button 
                onClick={() => navigateDate("prev")}
                className="p-1.5 sm:p-2 hover:bg-surface-container-high active:bg-surface-container-highest rounded-lg transition-colors text-on-surface-variant"
                title="Anterior"
                aria-label="Anterior"
              >
                <span className="material-symbols-outlined text-[18px] sm:text-[20px]">chevron_left</span>
              </button>
              <button 
                onClick={() => navigateDate("today")}
                className="px-2.5 sm:px-3.5 py-1 text-xs sm:text-sm font-medium text-on-surface hover:bg-surface-container-high rounded-lg transition-colors"
              >
                Hoje
              </button>
              <button 
                onClick={() => navigateDate("next")}
                className="p-1.5 sm:p-2 hover:bg-surface-container-high active:bg-surface-container-highest rounded-lg transition-colors text-on-surface-variant"
                title="Próximo"
                aria-label="Próximo"
              >
                <span className="material-symbols-outlined text-[18px] sm:text-[20px]">chevron_right</span>
              </button>
            </div>
            
            <h2 className="font-serif text-sm sm:text-lg md:text-xl text-primary font-semibold capitalize truncate">
              {monthName}
            </h2>
          </div>

          {/* View Switcher Tabs (Responsive Segmented Control) */}
          <div className="grid grid-cols-4 sm:flex items-center gap-1 w-full sm:w-auto bg-surface-container/60 p-1 rounded-xl border border-outline-variant/20">
            {(["dia", "semana", "mes", "lista"] as const).map((view) => (
              <button 
                key={view}
                onClick={() => setSelectedView(view)}
                className={`py-1 sm:py-1.5 px-2 sm:px-4 rounded-lg text-xs sm:text-sm font-medium transition-all text-center capitalize ${
                  selectedView === view 
                    ? "bg-primary text-on-primary shadow-xs" 
                    : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container"
                }`}
              >
                {view}
              </button>
            ))}
          </div>
        </div>

        {/* View Container */}
        <div className="flex-1 overflow-auto relative bg-surface-container-lowest/20 flex flex-col">
          
          {/* ========================================================================= */}
          {/* VIEW: DIA (Day View) */}
          {/* ========================================================================= */}
          {selectedView === "dia" && (
            <div className="flex flex-1 min-w-[290px] sm:min-w-full">
              {/* Sticky Time Column */}
              <div className="w-12 sm:w-16 flex-shrink-0 border-r border-outline-variant/30 sticky left-0 bg-surface-container-lowest/90 backdrop-blur-md z-20 select-none">
                <div className="h-10 sm:h-12 border-b border-outline-variant/30"></div>
                {HOURS.map(hour => (
                  <div key={hour} className="h-[88px] relative border-b border-outline-variant/20">
                    <span className="absolute -top-2.5 right-1.5 sm:right-2 text-[10px] sm:text-xs text-on-surface-variant font-medium">
                      {hour.toString().padStart(2, '0')}:00
                    </span>
                  </div>
                ))}
              </div>

              {/* Day Grid */}
              <div className="flex-1 relative">
                {/* Day Header */}
                <div className="h-10 sm:h-12 border-b border-outline-variant/30 flex items-center justify-between px-3 sm:px-6 bg-surface-container-lowest/60 sticky top-0 z-10">
                  <h3 className="font-medium text-xs sm:text-sm text-on-surface capitalize">
                    {currentDate.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
                  </h3>
                  <span className="text-[11px] text-on-surface-variant bg-surface-container/70 px-2 py-0.5 rounded-md">
                    {appointments.filter(app => app.date === currentDate.toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' })).length} agendamentos
                  </span>
                </div>

                <div className="relative">
                  {HOURS.map(h => (
                    <div key={h} className="h-[88px] border-b border-outline-variant/10 relative">
                      <div className="absolute top-1/2 left-0 right-0 border-t border-dashed border-outline-variant/10"></div>
                    </div>
                  ))}
                  
                  {appointments
                    .filter(app => app.date === currentDate.toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' }))
                    .map((app, _, arr) => (
                    <div 
                      key={app.id}
                      onClick={() => handleApptClick(app)}
                      className={`absolute left-1 right-2 sm:left-2 sm:right-4 rounded-xl border p-2 sm:p-2.5 overflow-hidden shadow-xs transition-all group ${
                        app.isExternal 
                          ? 'bg-surface-container-highest border-outline-variant/40 cursor-default' 
                          : 'bg-secondary-container/90 border-secondary/30 hover:shadow-md cursor-pointer hover:z-30 active:scale-[0.99]'
                      }`}
                      style={getBlockStyle(app, arr, 'dia')}
                    >
                      <div className={`absolute top-0 left-0 w-1.5 h-full rounded-l-xl ${app.isExternal ? 'bg-outline-variant' : 'bg-secondary'}`}></div>
                      <div className="pl-1">
                        <div className="flex items-center justify-between gap-1">
                          <p className={`text-xs font-semibold truncate ${app.isExternal ? 'text-on-surface-variant' : 'text-on-secondary-container'}`}>
                            {app.patientName}
                          </p>
                          <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded shrink-0 ${app.isExternal ? 'bg-outline-variant/30 text-on-surface-variant' : 'bg-secondary/15 text-on-secondary-container font-medium'}`}>
                            {app.startTime}
                          </span>
                        </div>
                        <p className={`text-[10px] sm:text-[11px] truncate mt-0.5 ${app.isExternal ? 'text-on-surface-variant/80' : 'text-on-secondary-container/80'}`}>
                          {app.service}
                        </p>
                        {app.valor && (
                          <span className="inline-block text-[9px] sm:text-[10px] font-medium text-secondary mt-1">
                            R$ {app.valor}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* VIEW: SEMANA (Week View - Scrollable on mobile with day selector) */}
          {/* ========================================================================= */}
          {selectedView === "semana" && (
            <div className="flex flex-col flex-1">
              {/* Mobile Quick Day Selector Strip */}
              <div className="flex sm:hidden overflow-x-auto gap-1.5 p-2 bg-surface-container-lowest/80 border-b border-outline-variant/30 custom-scrollbar sticky top-0 z-20">
                {weekDays.map((day, idx) => {
                  const dayStr = day.toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' });
                  const isSelected = selectedWeekDayStr === dayStr;
                  const dayAppsCount = appointments.filter(a => a.date === dayStr).length;
                  return (
                    <button
                      key={idx}
                      onClick={() => setSelectedWeekDayStr(dayStr)}
                      className={`flex-1 min-w-[50px] py-1.5 px-2 rounded-xl text-center flex flex-col items-center gap-0.5 border transition-all ${
                        isSelected 
                          ? 'bg-primary text-on-primary border-primary shadow-xs' 
                          : 'bg-surface-container/50 text-on-surface-variant border-outline-variant/20 hover:bg-surface-container'
                      }`}
                    >
                      <span className="text-[10px] uppercase font-medium">
                        {day.toLocaleDateString('pt-BR', { weekday: 'narrow' })}
                      </span>
                      <span className="text-xs font-bold">
                        {day.getDate()}
                      </span>
                      {dayAppsCount > 0 && (
                        <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-on-primary' : 'bg-primary'}`}></span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Week Matrix */}
              <div className="flex flex-1 overflow-x-auto">
                {/* Time column */}
                <div className="w-12 sm:w-16 flex-shrink-0 border-r border-outline-variant/30 sticky left-0 bg-surface-container-lowest/90 backdrop-blur-md z-20 select-none">
                  <div className="h-10 sm:h-12 border-b border-outline-variant/30"></div>
                  {HOURS.map(hour => (
                    <div key={hour} className="h-[88px] relative border-b border-outline-variant/20">
                      <span className="absolute -top-2.5 right-1.5 sm:right-2 text-[10px] sm:text-xs text-on-surface-variant font-medium">
                        {hour.toString().padStart(2, '0')}:00
                      </span>
                    </div>
                  ))}
                </div>

                {/* Columns for each day */}
                <div className="flex flex-1 min-w-[580px] sm:min-w-[700px] md:min-w-full">
                  {weekDays.map((day, idx) => {
                    const dayStr = day.toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' });
                    const isToday = dayStr === todayStr;
                    return (
                      <div 
                        key={idx} 
                        className={`flex-1 min-w-[95px] sm:min-w-0 relative border-r border-outline-variant/30 last:border-r-0 ${
                          selectedWeekDayStr === dayStr ? 'bg-primary/5 sm:bg-transparent' : ''
                        }`}
                      >
                        {/* Day Header */}
                        <div className="h-10 sm:h-12 border-b border-outline-variant/30 flex flex-col items-center justify-center bg-surface-container-lowest/60 sticky top-0 z-10">
                          <span className="text-[10px] text-on-surface-variant uppercase font-medium">
                            {day.toLocaleDateString('pt-BR', { weekday: 'short' })}
                          </span>
                          <span className={`text-xs sm:text-sm font-semibold ${
                            isToday 
                              ? 'w-5 h-5 sm:w-6 sm:h-6 bg-primary text-on-primary rounded-full flex items-center justify-center text-[11px] sm:text-xs' 
                              : 'text-on-surface'
                          }`}>
                            {day.getDate()}
                          </span>
                        </div>

                        {/* Hour Slots */}
                        <div className="relative">
                          {HOURS.map(h => (
                            <div key={h} className="h-[88px] border-b border-outline-variant/10"></div>
                          ))}

                          {appointments
                            .filter(app => app.date === dayStr)
                            .map((app, _, arr) => (
                            <div 
                              key={app.id}
                              onClick={() => handleApptClick(app)}
                              className={`absolute left-0.5 right-0.5 sm:left-1 sm:right-1 rounded-lg border p-1 sm:p-1.5 overflow-hidden shadow-xs transition-all ${
                                app.isExternal
                                  ? 'bg-surface-container-highest border-outline-variant/30 cursor-default'
                                  : 'bg-tertiary-container border-tertiary/30 hover:shadow-md cursor-pointer hover:z-30 active:scale-[0.98]'
                              }`}
                              style={getBlockStyle(app, arr, 'semana')}
                            >
                              <div className={`absolute top-0 left-0 w-1 h-full rounded-l-lg ${app.isExternal ? 'bg-outline-variant' : 'bg-tertiary'}`}></div>
                              <p className={`text-[10px] sm:text-xs font-semibold truncate leading-tight pl-1 ${app.isExternal ? 'text-on-surface-variant' : 'text-on-tertiary-container'}`}>
                                {app.patientName}
                              </p>
                              <p className={`text-[9px] sm:text-[10px] truncate leading-tight pl-1 mt-0.5 ${app.isExternal ? 'text-on-surface-variant/80' : 'text-on-tertiary-container/80'}`}>
                                {app.service}
                              </p>
                              <span className="text-[8px] sm:text-[9px] font-mono text-tertiary block pl-1">
                                {app.startTime}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* VIEW: MÊS (Month View + Touch-friendly Day Drawer) */}
          {/* ========================================================================= */}
          {selectedView === "mes" && (
            <div className="flex-1 flex flex-col h-full bg-surface-container-lowest/50">
              {/* Header days */}
              <div className="grid grid-cols-7 border-b border-outline-variant/30 bg-surface-container-lowest/90 sticky top-0 z-10">
                {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((day, dIdx) => (
                  <div key={day} className="py-2 sm:py-3 text-center text-[10px] sm:text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                    <span className="sm:hidden">{["D", "S", "T", "Q", "Q", "S", "S"][dIdx]}</span>
                    <span className="hidden sm:inline">{day}</span>
                  </div>
                ))}
              </div>
              
              {/* Month Grid */}
              <div className="flex-1 grid grid-cols-7 grid-rows-5 lg:grid-rows-6">
                {(() => {
                  const year = currentDate.getFullYear();
                  const month = currentDate.getMonth();
                  
                  const firstDayOfMonth = new Date(year, month, 1);
                  const lastDayOfMonth = new Date(year, month + 1, 0);
                  
                  const startingDayOfWeek = firstDayOfMonth.getDay();
                  const totalDays = lastDayOfMonth.getDate();
                  const totalCells = (startingDayOfWeek + totalDays) > 35 ? 42 : 35;
                  
                  const cells = [];
                  for (let i = 0; i < totalCells; i++) {
                    const dayNumber = i - startingDayOfWeek + 1;
                    const isCurrentMonth = dayNumber > 0 && dayNumber <= totalDays;
                    const dateObj = new Date(year, month, dayNumber);
                    const dateStr = dateObj.toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' });
                    const isToday = dateStr === todayStr;
                    const isSelected = dateStr === selectedMonthDate;
                    const dayApps = appointments.filter(app => app.date === dateStr);
                    
                    cells.push(
                      <div 
                        key={i} 
                        onClick={() => setSelectedMonthDate(dateStr)}
                        className={`min-h-[44px] sm:min-h-[90px] md:min-h-[110px] p-0.5 sm:p-1 border-b border-r border-outline-variant/20 flex flex-col gap-0.5 cursor-pointer transition-all ${
                          !isCurrentMonth ? 'bg-surface-container-lowest/20 opacity-30' : ''
                        } ${isSelected ? 'bg-primary-container/25 ring-2 ring-primary ring-inset' : 'hover:bg-surface-container/30'}`}
                      >
                        <div className={`text-[10px] sm:text-xs p-0.5 sm:p-1 text-right font-medium ${isToday ? 'text-primary font-bold' : 'text-on-surface-variant'}`}>
                          {isToday ? (
                            <span className="w-5 h-5 sm:w-6 sm:h-6 inline-flex items-center justify-center bg-primary text-on-primary rounded-full text-[10px] sm:text-[11px] shadow-xs">
                              {dateObj.getDate()}
                            </span>
                          ) : (
                            dateObj.getDate()
                          )}
                        </div>
                        
                        {/* Desktop Pill View */}
                        <div className="hidden sm:flex flex-1 flex-col gap-1 overflow-y-auto max-h-[75px] custom-scrollbar px-1">
                          {dayApps
                            .sort((a, b) => a.startTime.localeCompare(b.startTime))
                            .map(app => (
                              <div 
                                key={app.id}
                                onClick={(e) => { e.stopPropagation(); handleApptClick(app); }}
                                className={`flex-shrink-0 text-[10px] truncate px-1.5 py-0.5 rounded border-l-2 cursor-pointer transition-all ${
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
                        {dayApps.length > 0 && (
                          <div className="flex sm:hidden flex-wrap gap-0.5 justify-center mt-auto pb-1">
                            {dayApps.slice(0, 3).map((a, idx) => (
                              <span key={idx} className={`w-1.5 h-1.5 rounded-full ${a.isExternal ? 'bg-outline-variant' : 'bg-primary'}`}></span>
                            ))}
                            {dayApps.length > 3 && (
                              <span className="text-[8px] font-bold text-primary leading-none">+{dayApps.length - 3}</span>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  }
                  return cells;
                })()}
              </div>

              {/* Selected Day Agenda Drawer below Month View */}
              <div className="p-3 sm:p-4 border-t border-outline-variant/30 bg-surface-container-lowest/95 backdrop-blur-md sticky bottom-0 z-10 shadow-lg">
                <div className="flex items-center justify-between gap-2 mb-2 sm:mb-3">
                  <div className="flex items-center gap-2 truncate">
                    <span className="material-symbols-outlined text-primary text-[18px]">calendar_today</span>
                    <h3 className="font-serif text-xs sm:text-sm md:text-base font-semibold text-primary capitalize truncate">
                      {new Date(selectedMonthDate + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short' })}
                    </h3>
                    <span className="text-[11px] text-on-surface-variant font-medium">
                      ({appointments.filter(a => a.date === selectedMonthDate).length})
                    </span>
                  </div>

                  <button
                    onClick={() => openNewAppointmentModal(selectedMonthDate)}
                    className="text-xs bg-primary text-on-primary px-3 py-1.5 rounded-lg font-medium flex items-center gap-1 hover:bg-primary/90 transition-colors shadow-xs shrink-0"
                  >
                    <span className="material-symbols-outlined text-[16px]">add</span>
                    <span>Agendar</span>
                  </button>
                </div>

                <div className="space-y-1.5 sm:space-y-2 max-h-36 sm:max-h-48 overflow-y-auto pr-1">
                  {appointments.filter(a => a.date === selectedMonthDate).length === 0 ? (
                    <div className="text-center py-3 bg-surface-container/30 rounded-xl border border-dashed border-outline-variant/30">
                      <p className="text-xs text-on-surface-variant">Nenhum agendamento para esta data.</p>
                      <button 
                        onClick={() => openNewAppointmentModal(selectedMonthDate)}
                        className="text-xs text-primary font-medium mt-1 hover:underline inline-flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined text-[14px]">add</span>
                        Criar agendamento agora
                      </button>
                    </div>
                  ) : (
                    appointments
                      .filter(a => a.date === selectedMonthDate)
                      .sort((a, b) => a.startTime.localeCompare(b.startTime))
                      .map(app => (
                        <div 
                          key={app.id} 
                          onClick={() => handleApptClick(app)}
                          className="p-2 sm:p-2.5 bg-surface-container-low border border-outline-variant/30 rounded-xl flex items-center justify-between cursor-pointer hover:border-primary/50 transition-colors active:scale-[0.99]"
                        >
                          <div className="flex items-center gap-2.5 truncate">
                            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-primary-container/40 text-primary flex flex-col items-center justify-center font-bold text-xs shrink-0">
                              <span>{app.startTime}</span>
                            </div>
                            <div className="truncate">
                              <h4 className="text-xs sm:text-sm font-semibold text-on-surface truncate">{app.patientName}</h4>
                              <p className="text-[10px] sm:text-xs text-on-surface-variant truncate">
                                {app.service} {app.valor ? `• R$ ${app.valor}` : ''}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-1 shrink-0 ml-2">
                            {app.patientPhone && (
                              <a
                                href={`https://wa.me/55${app.patientPhone.replace(/\D/g, '')}`}
                                target="_blank"
                                rel="noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="w-8 h-8 rounded-lg bg-tertiary-container/30 text-tertiary flex items-center justify-center hover:bg-tertiary-container transition-colors"
                                title="Enviar WhatsApp"
                              >
                                <span className="material-symbols-outlined text-[18px]">chat</span>
                              </a>
                            )}
                            <span className="material-symbols-outlined text-on-surface-variant text-[18px]">chevron_right</span>
                          </div>
                        </div>
                      ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* VIEW: LISTA (Searchable, filterable list view for mobile) */}
          {/* ========================================================================= */}
          {selectedView === "lista" && (
            <div className="flex-1 p-3 sm:p-5 overflow-y-auto space-y-3 sm:space-y-4">
              {/* Search & Filter Header */}
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 items-stretch sm:items-center justify-between bg-surface-container/40 p-2.5 rounded-xl border border-outline-variant/20">
                <div className="relative flex-1">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">search</span>
                  <input
                    type="text"
                    value={listSearch}
                    onChange={(e) => setListSearch(e.target.value)}
                    placeholder="Buscar por paciente ou procedimento..."
                    className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-surface-container-lowest rounded-lg border border-outline-variant/30 focus:outline-none focus:border-primary text-on-surface"
                  />
                  {listSearch && (
                    <button 
                      onClick={() => setListSearch("")} 
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface"
                    >
                      <span className="material-symbols-outlined text-[16px]">close</span>
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
                  {(["todos", "hoje", "semana", "futuros"] as const).map((filterKey) => (
                    <button
                      key={filterKey}
                      onClick={() => setListFilter(filterKey)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize whitespace-nowrap transition-colors ${
                        listFilter === filterKey
                          ? "bg-primary text-on-primary shadow-xs"
                          : "bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container-high border border-outline-variant/20"
                      }`}
                    >
                      {filterKey}
                    </button>
                  ))}
                </div>
              </div>

              {/* List Content */}
              {filteredListAppointments.length === 0 ? (
                <div className="text-center py-12 bg-surface-container-low/50 rounded-2xl border border-dashed border-outline-variant/30">
                  <span className="material-symbols-outlined text-4xl text-on-surface-variant/40 mb-2">event_busy</span>
                  <p className="text-sm font-medium text-on-surface">Nenhum agendamento encontrado</p>
                  <p className="text-xs text-on-surface-variant mt-0.5">Tente alterar os termos da busca ou os filtros aplicados.</p>
                  <button 
                    onClick={() => openNewAppointmentModal()}
                    className="mt-3 inline-flex items-center gap-1 text-xs bg-primary text-on-primary px-4 py-2 rounded-xl font-medium shadow-xs"
                  >
                    <span className="material-symbols-outlined text-[16px]">add</span>
                    Novo Agendamento
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredListAppointments.map((app) => {
                    const appDate = new Date(app.date + 'T12:00:00');
                    const isToday = app.date === todayStr;
                    return (
                      <div 
                        key={app.id} 
                        onClick={() => handleApptClick(app)}
                        className={`bg-surface-container-lowest border p-3 sm:p-4 rounded-xl flex items-center justify-between cursor-pointer hover:border-primary/50 shadow-xs transition-all active:scale-[0.99] ${
                          isToday ? 'border-primary/40 ring-1 ring-primary/20' : 'border-outline-variant/30'
                        }`}
                      >
                        <div className="flex items-center gap-3 truncate">
                          <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex flex-col items-center justify-center font-bold text-xs shrink-0 ${
                            isToday ? 'bg-primary text-on-primary shadow-xs' : 'bg-primary-container/40 text-primary'
                          }`}>
                            <span>{app.startTime}</span>
                            <span className={`text-[9px] font-normal ${isToday ? 'text-on-primary/80' : 'text-on-surface-variant'}`}>
                              {appDate.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                            </span>
                          </div>
                          
                          <div className="truncate">
                            <div className="flex items-center gap-2">
                              <h4 className="text-xs sm:text-sm font-semibold text-on-surface truncate">{app.patientName}</h4>
                              {isToday && (
                                <span className="text-[9px] bg-primary/10 text-primary font-bold px-1.5 py-0.2 rounded">
                                  HOJE
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] sm:text-xs text-on-surface-variant truncate mt-0.5">
                              {app.service} {app.valor ? `• R$ ${app.valor}` : ''} {app.formaPagamento ? `(${app.formaPagamento})` : ''}
                            </p>
                            {app.patientPhone && (
                              <p className="text-[10px] text-on-surface-variant/70 mt-0.5 flex items-center gap-1">
                                <span className="material-symbols-outlined text-[12px]">phone</span>
                                {app.patientPhone}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0 ml-2">
                          {app.patientPhone && (
                            <a
                              href={`https://wa.me/55${app.patientPhone.replace(/\D/g, '')}`}
                              target="_blank"
                              rel="noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="w-9 h-9 rounded-xl bg-tertiary-container/30 text-tertiary flex items-center justify-center hover:bg-tertiary-container transition-colors"
                              title="Conversar no WhatsApp"
                            >
                              <span className="material-symbols-outlined text-[18px]">chat</span>
                            </a>
                          )}
                          <span className="material-symbols-outlined text-on-surface-variant text-[20px]">chevron_right</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

        </div>
      </div>

      {/* ========================================================================= */}
      {/* BOOKING MODAL / MOBILE BOTTOM SHEET */}
      {/* ========================================================================= */}
      {isBookingModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          {/* Backdrop dismiss */}
          <div className="fixed inset-0" onClick={() => setIsBookingModalOpen(false)} />

          <div className="bg-surface-container-lowest rounded-t-3xl sm:rounded-2xl w-full max-w-lg p-5 sm:p-6 md:p-8 shadow-2xl relative border-t sm:border border-white/20 max-h-[92dvh] sm:max-h-[88vh] overflow-y-auto z-10 animate-in slide-in-from-bottom-6 sm:zoom-in-95 duration-200">
            {/* Mobile Grab Handle */}
            <div className="w-12 h-1 bg-outline-variant/40 rounded-full mx-auto mb-4 sm:hidden"></div>

            {/* Close Button */}
            <button 
              onClick={() => setIsBookingModalOpen(false)}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-surface-container hover:bg-surface-container-high active:bg-surface-container-highest transition-colors text-on-surface-variant"
              aria-label="Fechar"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
            
            <h2 className="font-serif text-xl sm:text-2xl font-semibold text-primary mb-5 sm:mb-6">
              {editingAppointment ? "Editar Agendamento" : "Novo Agendamento"}
            </h2>
            
            <form onSubmit={handleAddAppointment} className="space-y-4 sm:space-y-5">
              {/* Paciente Name Field */}
              <div className="relative">
                <label className="block text-xs font-medium text-on-surface-variant uppercase tracking-wider mb-1">
                  Nome do Paciente *
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
                  onBlur={() => setTimeout(() => setShowClientSuggestions(false), 250)}
                  className="w-full bg-surface-container/60 border-b-2 border-outline focus:border-primary focus:outline-none py-2.5 px-2 text-sm text-on-surface rounded-t-lg transition-colors"
                  placeholder="Nome completo do paciente..."
                />
                
                {/* Autocomplete Dropdown */}
                {showClientSuggestions && formData.patientName.length > 0 && (
                  <div className="absolute top-full left-0 w-full mt-1 bg-surface-container-lowest border border-outline-variant/40 rounded-xl shadow-xl z-50 max-h-48 overflow-y-auto">
                    {dbClients
                      .filter(c => c.name.toLowerCase().includes(formData.patientName.toLowerCase()))
                      .slice(0, 6)
                      .map(client => (
                        <div 
                          key={client.id}
                          className="px-4 py-2.5 text-sm text-on-surface hover:bg-surface-container active:bg-surface-container-high cursor-pointer flex justify-between items-center border-b border-outline-variant/10 last:border-b-0"
                          onMouseDown={() => {
                            setFormData({ ...formData, patientName: client.name, patientPhone: client.phone || "" });
                            setShowClientSuggestions(false);
                          }}
                        >
                          <span className="font-medium truncate">{client.name}</span>
                          {client.phone && (
                            <span className="text-xs text-on-surface-variant bg-surface-container-high px-2 py-0.5 rounded-full shrink-0 ml-2">
                              {client.phone}
                            </span>
                          )}
                        </div>
                      ))}
                  </div>
                )}
              </div>

              {/* WhatsApp Phone field */}
              <div>
                <label className="block text-xs font-medium text-on-surface-variant uppercase tracking-wider mb-1">
                  WhatsApp do Paciente
                </label>
                <div className="relative flex items-center">
                  <span className="material-symbols-outlined absolute left-2 text-[18px] text-on-surface-variant pointer-events-none">phone</span>
                  <input
                    type="tel"
                    value={formData.patientPhone}
                    onChange={(e) => setFormData({ ...formData, patientPhone: e.target.value })}
                    className="w-full bg-surface-container/60 border-b-2 border-outline focus:border-primary focus:outline-none py-2.5 pl-8 pr-28 text-sm text-on-surface rounded-t-lg transition-colors"
                    placeholder="DDD + Número (ex: 11999998888)"
                  />
                  {formData.patientPhone && (
                    <span className="absolute right-2 text-[11px] text-primary font-medium flex items-center gap-1 pointer-events-none bg-primary/10 px-2 py-0.5 rounded-full">
                      <span className="material-symbols-outlined text-[13px]">check_circle</span>
                      Lembretes WAHA
                    </span>
                  )}
                </div>
              </div>

              {/* Service Selection */}
              <div>
                <label className="block text-xs font-medium text-on-surface-variant uppercase tracking-wider mb-1">
                  Procedimento / Tratamento *
                </label>
                <div className="relative">
                  <select
                    required
                    value={formData.service}
                    onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                    className="w-full bg-surface-container/60 border-b-2 border-outline focus:border-primary focus:outline-none py-2.5 px-2 appearance-none text-sm text-on-surface rounded-t-lg transition-colors cursor-pointer"
                  >
                    <option disabled value="">Selecione um procedimento</option>
                    {procedimentos.map(proc => (
                      <option key={proc.id} value={proc.nome}>{proc.nome}</option>
                    ))}
                  </select>
                  <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant">
                    expand_more
                  </span>
                </div>
              </div>

              {/* Date & Time Grid */}
              <div className="grid grid-cols-2 gap-3 sm:gap-4 border-t border-outline-variant/30 pt-3">
                <div>
                  <label className="block text-xs font-medium text-on-surface-variant uppercase tracking-wider mb-1">
                    Data *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full bg-surface-container/60 border-b-2 border-outline focus:border-primary focus:outline-none py-2 px-2 text-sm text-on-surface rounded-t-lg transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-on-surface-variant uppercase tracking-wider mb-1">
                    Horário *
                  </label>
                  <input
                    type="time"
                    required
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="w-full bg-surface-container/60 border-b-2 border-outline focus:border-primary focus:outline-none py-2 px-2 text-sm text-on-surface rounded-t-lg transition-colors"
                  />
                </div>
              </div>

              {/* Produtos Utilizados do Estoque */}
              <div className="border-t border-outline-variant/30 pt-3">
                <label className="block text-xs font-medium text-primary uppercase tracking-wider mb-2">
                  Produtos Utilizados (Baixa no Estoque)
                </label>
                
                {produtosUsados.map((item, index) => {
                  const prodInfo = estoque.find(p => p.id === item.produtoId);
                  return (
                    <div key={index} className="flex items-center gap-2 mb-2 bg-surface-container/40 p-2 rounded-xl border border-outline-variant/20">
                      <span className="flex-1 text-xs sm:text-sm text-on-surface truncate font-medium">
                        {prodInfo?.nome || 'Produto'}
                      </span>
                      
                      {/* Touch Quantity Stepper */}
                      <div className="flex items-center bg-surface-container-highest rounded-lg border border-outline-variant/30">
                        <button
                          type="button"
                          onClick={() => updateProdutoQuantidade(item.produtoId, item.quantidade - 1)}
                          className="w-7 h-7 flex items-center justify-center text-on-surface-variant hover:text-on-surface"
                        >
                          -
                        </button>
                        <span className="w-8 text-center text-xs font-semibold text-on-surface">
                          {item.quantidade}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateProdutoQuantidade(item.produtoId, item.quantidade + 1)}
                          className="w-7 h-7 flex items-center justify-center text-on-surface-variant hover:text-on-surface"
                        >
                          +
                        </button>
                      </div>

                      <button 
                        type="button"
                        onClick={() => removeProdutoUsado(item.produtoId)}
                        className="w-7 h-7 flex items-center justify-center text-error hover:bg-error/10 rounded-lg transition-colors"
                        title="Remover produto"
                      >
                        <span className="material-symbols-outlined text-[18px]">close</span>
                      </button>
                    </div>
                  );
                })}
                
                <div className="relative mt-1.5">
                  <select
                    value=""
                    onChange={(e) => addProdutoUsado(e.target.value)}
                    className="w-full bg-surface-container-low border border-dashed border-outline/50 focus:border-primary focus:outline-none py-2 px-3 appearance-none text-xs sm:text-sm text-on-surface-variant transition-colors cursor-pointer rounded-xl"
                  >
                    <option value="" disabled>+ Selecionar produto do estoque</option>
                    {estoque.map(prod => (
                      <option key={prod.id} value={prod.id}>
                        {prod.nome} ({prod.quantidade} disponíveis)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Retornos & Sessões Futuras */}
              {!editingAppointment && (
                <div className="border-t border-outline-variant/30 pt-3">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-medium text-on-surface-variant uppercase tracking-wider">
                      Sessões Futuras / Retornos
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
                      + Adicionar Retorno
                    </button>
                  </div>

                  {sessoesAdicionais.map((sessao, index) => (
                    <div key={index} className="bg-surface-container/40 p-2.5 rounded-xl border border-outline-variant/30 mb-2 space-y-2">
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
                            placeholder="Título / Procedimento"
                            value={sessao.service}
                            onChange={(e) => {
                              const updated = [...sessoesAdicionais];
                              updated[index].service = e.target.value;
                              setSessoesAdicionais(updated);
                            }}
                            className="w-full bg-surface-container/60 border-b border-outline text-xs p-1.5 text-on-surface focus:outline-none focus:border-primary rounded"
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
                            className="w-full bg-surface-container/60 border-b border-outline text-xs p-1.5 text-on-surface focus:outline-none focus:border-primary rounded"
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
                            className="w-full bg-surface-container/60 border-b border-outline text-xs p-1.5 text-on-surface focus:outline-none focus:border-primary rounded"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Financeiro / Valores */}
              <div className="grid grid-cols-2 gap-3 sm:gap-4 border-t border-outline-variant/30 pt-3">
                <div>
                  <label className="block text-xs font-medium text-on-surface-variant uppercase tracking-wider mb-1">
                    Valor (R$)
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: 250,00"
                    value={formData.valor || ''}
                    onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
                    className="w-full bg-surface-container/60 border-b-2 border-outline focus:border-primary focus:outline-none py-2 px-2 text-sm text-on-surface rounded-t-lg transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-on-surface-variant uppercase tracking-wider mb-1">
                    Pagamento
                  </label>
                  <div className="relative">
                    <select
                      value={formData.formaPagamento || ''}
                      onChange={(e) => setFormData({ ...formData, formaPagamento: e.target.value })}
                      className="w-full bg-surface-container/60 border-b-2 border-outline focus:border-primary focus:outline-none py-2 px-2 appearance-none text-sm text-on-surface rounded-t-lg transition-colors cursor-pointer"
                    >
                      <option value="">Selecione...</option>
                      <option value="PIX">PIX</option>
                      <option value="Cartão de Crédito">Cartão de Crédito</option>
                      <option value="Cartão de Débito">Cartão de Débito</option>
                      <option value="Dinheiro">Dinheiro</option>
                    </select>
                    <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant">
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
                      className="w-full bg-surface-container/60 border-b-2 border-outline focus:border-primary focus:outline-none py-2 px-2 text-sm text-on-surface rounded-t-lg transition-colors"
                    />
                  </div>
                )}
              </div>
              
              {/* Bottom Sticky Action Buttons */}
              <div className="pt-4 border-t border-outline-variant/30 flex items-center justify-between gap-2">
                {editingAppointment ? (
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm("Deseja realmente excluir este agendamento?")) {
                        deleteAppointment(editingAppointment.id);
                        setIsBookingModalOpen(false);
                      }
                    }}
                    className="px-4 py-2.5 text-xs sm:text-sm font-medium text-error hover:bg-error/10 active:bg-error/20 transition-colors rounded-xl flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[16px]">delete</span>
                    <span>Excluir</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsBookingModalOpen(false)}
                    className="px-4 py-2.5 text-xs sm:text-sm font-medium text-on-surface hover:bg-surface-container active:bg-surface-container-high transition-colors rounded-xl"
                  >
                    Cancelar
                  </button>
                )}

                <div className="flex items-center gap-2 ml-auto">
                  {editingAppointment && (
                    <button
                      type="button"
                      onClick={() => setIsBookingModalOpen(false)}
                      className="px-3 sm:px-4 py-2.5 text-xs sm:text-sm font-medium text-on-surface hover:bg-surface-container rounded-xl"
                    >
                      Cancelar
                    </button>
                  )}
                  <button
                    type="submit"
                    className="px-5 sm:px-6 py-2.5 bg-primary text-on-primary text-xs sm:text-sm font-medium hover:bg-primary/90 active:scale-[0.98] transition-all rounded-xl shadow-sm flex items-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-[16px]">check</span>
                    <span>{editingAppointment ? "Salvar Alterações" : "Confirmar Agendamento"}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AgendamentosPage() {
  return (
    <Suspense fallback={
      <div className="p-8 flex items-center justify-center">
        <div className="text-sm font-medium text-on-surface-variant animate-pulse">
          Carregando agendamentos...
        </div>
      </div>
    }>
      <AgendamentosContent />
    </Suspense>
  );
}
