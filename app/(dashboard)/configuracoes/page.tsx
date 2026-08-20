"use client";

import { useState, useEffect } from "react";
import { getProcedimentos, createProcedimento, updateProcedimento, deleteProcedimento, ProcedimentoData } from "../../actions/procedures";
import { disconnectGoogleCalendar } from "../../actions/settings";
import { useSettings } from "../../contexts/SettingsContext";

export default function ConfiguracoesPage() {
  const [activeTab, setActiveTab] = useState("procedimentos");
  
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get("tab");
      if (tab && ["automacao", "procedimentos", "integracoes", "geral", "app"].includes(tab)) {
        setActiveTab(tab);
      }
    }
  }, []);

  // Automacao state — loaded from DB via settings context
  const [confirmacaoAtiva, setConfirmacaoAtiva] = useState(true);
  const [confirmacaoTexto, setConfirmacaoTexto] = useState("");
  const [lembreteAtivo, setLembreteAtivo] = useState(true);
  const [lembreteTexto, setLembreteTexto] = useState("");
  const [horaLembrete, setHoraLembrete] = useState("08:00");
  const [lembrete2hAtivo, setLembrete2hAtivo] = useState(true);
  const [lembrete2hTexto, setLembrete2hTexto] = useState("");
  const [agendaPessoalAtiva, setAgendaPessoalAtiva] = useState(true);
  const [telefonePessoalDoutora, setTelefonePessoalDoutora] = useState("62991346756");
  const [triggeringAgendaPessoal, setTriggeringAgendaPessoal] = useState(false);
  const [pushTesting, setPushTesting] = useState(false);
  const [pushTestResult, setPushTestResult] = useState<string | null>(null);
  const [pushPermission, setPushPermission] = useState<string>("default");
  const [automacaoSaving, setAutomacaoSaving] = useState(false);
  const [automacaoSaved, setAutomacaoSaved] = useState(false);
  const [lembreteLog, setLembreteLog] = useState<string | null>(null);
  const [triggeringLembrete, setTriggeringLembrete] = useState(false);
  const [triggeringLembrete2h, setTriggeringLembrete2h] = useState(false);

  // Emojis Support
  const [showEmojiPicker, setShowEmojiPicker] = useState<"confirmacao" | "lembrete" | "lembrete2h" | null>(null);
  const EMOJIS = ["😀","😂","🥰","😍","😎","😊","😉","😇","😘","🤗","🤔","😌","😷","❤️","✨","🔥","🎉","🎈","💉","🩸","💊","🩺","📅","⏰","✅","❌","⚠️","📍","🌸","🦋","💆‍♀️","💅","💄"];

  const handleTestTemplate = async (templateText: string) => {
    if (!wahaPhoneTest) {
      alert("Por favor, preencha o campo 'Seu nº de WhatsApp' lá embaixo na seção WhatsApp (API WAHA) para testar a mensagem!");
      return;
    }
    const mockText = templateText
      .replace(/{nome}/g, "Maria")
      .replace(/{servico}/g, "Preenchimento Labial")
      .replace(/{data}/g, new Date().toLocaleDateString('pt-BR'))
      .replace(/{hora}/g, "14:30");
      
    const { sendWahaTestMessage } = await import('../../actions/settings');
    const res = await sendWahaTestMessage(wahaPhoneTest, mockText);
    if (res.success) {
      alert("Mensagem de teste enviada para " + wahaPhoneTest);
    } else {
      alert("Erro ao enviar: " + res.error);
    }
  };

  // Procedimentos state
  const [procedimentos, setProcedimentos] = useState<ProcedimentoData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [newProcNome, setNewProcNome] = useState("");
  const [newProcDuracao, setNewProcDuracao] = useState(60);
  const [newProcPreco, setNewProcPreco] = useState(0);
  const [editingProc, setEditingProc] = useState<ProcedimentoData | null>(null);
  // WAHA state
  const [wahaUrl, setWahaUrl] = useState("");
  const [wahaSessionName, setWahaSessionName] = useState("");
  // AI State
  const [openAiApiKey, setOpenAiApiKey] = useState("");
  const [openAiSystemPrompt, setOpenAiSystemPrompt] = useState("");
  const [aiAgentActive, setAiAgentActive] = useState(false);
  const [aiAutoSchedule, setAiAutoSchedule] = useState(false);
  const [aiSaving, setAiSaving] = useState(false);
  const [wahaPhoneTest, setWahaPhoneTest] = useState("");
  const [wahaIsSaving, setWahaIsSaving] = useState(false);

  const { settings, updateSettings } = useSettings();
  
  // Populate state when settings load
  useEffect(() => {
    if (settings) {
      setWahaUrl(settings.wahaUrl || "");
      setWahaSessionName(settings.wahaSessionName || "");
      setConfirmacaoAtiva(settings.msgConfirmacaoAtiva);
      setConfirmacaoTexto(settings.msgConfirmacaoTexto);
      setLembreteAtivo(settings.msgLembreteAtiva);
      setLembreteTexto(settings.msgLembreteTexto);
      setHoraLembrete(settings.msgHoraLembrete);
      setLembrete2hAtivo(settings.msgLembrete2hAtiva);
      setLembrete2hTexto(settings.msgLembrete2hTexto);
      setAgendaPessoalAtiva(settings.agendaPessoalAtiva ?? true);
      setTelefonePessoalDoutora(settings.telefonePessoalDoutora || "62991346756");
      setOpenAiApiKey(settings.openAiApiKey || "");
      setOpenAiSystemPrompt(settings.openAiSystemPrompt || "");
      setAiAgentActive(settings.aiAgentActive || false);
      setAiAutoSchedule(settings.aiAutoSchedule || false);
    }
  }, [settings]);
  
  async function loadProcedimentos() {
    setIsLoading(true);
    const data = await getProcedimentos();
    setProcedimentos(data);
    setIsLoading(false);
  }

  useEffect(() => {
    if (activeTab === "procedimentos") {
      loadProcedimentos();
    }
  }, [activeTab]);

  const handleCreateProcedimento = async () => {
    if (!newProcNome.trim()) return;
    await createProcedimento({
      nome: newProcNome,
      duracao: Number(newProcDuracao),
      preco: Number(newProcPreco),
      cor: "bg-primary"
    });
    setNewProcNome("");
    setNewProcDuracao(60);
    setNewProcPreco(0);
    await loadProcedimentos();
  };

  const handleSaveEditProcedimento = async () => {
    if (!editingProc || !editingProc.nome.trim()) return;
    await updateProcedimento(editingProc.id, {
      nome: editingProc.nome,
      duracao: Number(editingProc.duracao),
      preco: Number(editingProc.preco)
    });
    setEditingProc(null);
    await loadProcedimentos();
  };

  const handleDeleteProcedimento = async (id: string) => {
    if (confirm("Tem certeza que deseja excluir?")) {
      await deleteProcedimento(id);
      await loadProcedimentos();
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 max-w-[1440px] mx-auto pb-16 w-full min-w-0">
      {/* Settings Navigation Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-outline-variant/30 pb-4 w-full min-w-0">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 w-full min-w-0 max-w-full custom-scrollbar">
          <button
            onClick={() => setActiveTab("automacao")}
            className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-medium transition-all shrink-0 whitespace-nowrap ${
              activeTab === "automacao"
                ? "bg-primary text-on-primary shadow-sm"
                : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container border border-outline-variant/20"
            }`}
          >
            Fluxos &amp; Automação
          </button>
          <button
            onClick={() => setActiveTab("procedimentos")}
            className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-medium transition-all shrink-0 whitespace-nowrap ${
              activeTab === "procedimentos"
                ? "bg-primary text-on-primary shadow-sm"
                : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container border border-outline-variant/20"
            }`}
          >
            Procedimentos
          </button>
          <button
            onClick={() => setActiveTab("integracoes")}
            className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-medium transition-all shrink-0 whitespace-nowrap ${
              activeTab === "integracoes"
                ? "bg-primary text-on-primary shadow-sm"
                : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container border border-outline-variant/20"
            }`}
          >
            Integrações
          </button>
          <button
            onClick={() => setActiveTab("geral")}
            className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-medium transition-all shrink-0 whitespace-nowrap ${
              activeTab === "geral"
                ? "bg-primary text-on-primary shadow-sm"
                : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container border border-outline-variant/20"
            }`}
          >
            Geral &amp; Clínica
          </button>
          <button
            onClick={() => setActiveTab("app")}
            className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-medium transition-all shrink-0 whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === "app"
                ? "bg-primary text-on-primary shadow-sm"
                : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container border border-outline-variant/20"
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">install_mobile</span>
            <span>Aplicativo (PWA)</span>
          </button>
        </div>

        <button className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-primary text-on-primary text-sm font-medium hover:bg-primary/90 transition-all shadow-sm flex items-center justify-center gap-2">
          <span className="material-symbols-outlined text-[18px]">save</span>
          Salvar Alterações
        </button>
      </div>

      {activeTab === "procedimentos" && (
        <div>
          {/* Header Section */}
          <div className="mb-6">
            <h1 className="font-serif text-2xl md:text-3xl text-primary mb-2">
              Gerenciar Procedimentos
            </h1>
            <p className="text-base text-on-surface-variant max-w-2xl">
              Cadastre os procedimentos realizados na clínica. Eles ficarão disponíveis automaticamente na tela de Agendamentos.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Add Procedure Form */}
            <div className="lg:col-span-4 bg-surface-container-lowest/60 backdrop-blur-sm border border-white/40 shadow-sm rounded-2xl p-6 flex flex-col h-max lg:sticky lg:top-28">
              <h2 className="font-serif text-xl text-primary mb-4">Novo Procedimento</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-on-surface-variant mb-1">Nome do Procedimento</label>
                  <input
                    value={newProcNome}
                    onChange={(e) => setNewProcNome(e.target.value)}
                    type="text"
                    className="w-full bg-surface-container/50 border border-outline-variant/40 rounded-lg px-3 py-2 text-sm text-on-surface focus:outline-none focus:border-primary"
                    placeholder="Ex: Peeling Químico"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-on-surface-variant mb-1">Duração (minutos)</label>
                  <input
                    value={newProcDuracao}
                    onChange={(e) => setNewProcDuracao(Number(e.target.value))}
                    type="number"
                    className="w-full bg-surface-container/50 border border-outline-variant/40 rounded-lg px-3 py-2 text-sm text-on-surface focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-on-surface-variant mb-1">Preço Padrão (R$)</label>
                  <input
                    value={newProcPreco}
                    onChange={(e) => setNewProcPreco(Number(e.target.value))}
                    type="number"
                    step="0.01"
                    className="w-full bg-surface-container/50 border border-outline-variant/40 rounded-lg px-3 py-2 text-sm text-on-surface focus:outline-none focus:border-primary"
                    placeholder="0.00"
                  />
                </div>
                <button
                  onClick={handleCreateProcedimento}
                  className="w-full py-2 bg-primary text-on-primary rounded-xl font-medium text-sm hover:bg-primary/90 transition-colors"
                >
                  Adicionar
                </button>
              </div>
            </div>

            {/* List Procedures */}
            <div className="lg:col-span-8 flex flex-col gap-3">
              {isLoading ? (
                <div className="p-8 text-center text-on-surface-variant bg-surface-container-lowest/60 rounded-2xl">Carregando procedimentos...</div>
              ) : procedimentos.length === 0 ? (
                <div className="p-8 text-center text-on-surface-variant bg-surface-container-lowest/60 rounded-2xl">
                  Nenhum procedimento cadastrado. Adicione o primeiro procedimento ao lado!
                </div>
              ) : (
                procedimentos.map((proc) => (
                  <div key={proc.id} className="bg-surface-container-lowest/60 backdrop-blur-sm border border-white/40 shadow-sm rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div>
                      <h3 className="font-serif text-base sm:text-lg font-semibold text-primary">{proc.nome}</h3>
                      <p className="text-xs sm:text-sm text-on-surface-variant">Duração: {proc.duracao} min {proc.preco > 0 ? `• R$ ${proc.preco.toFixed(2)}` : ''}</p>
                    </div>
                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      <button
                        onClick={() => setEditingProc(proc)}
                        className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary hover:bg-primary/20 transition-colors"
                        title="Editar Procedimento"
                      >
                        <span className="material-symbols-outlined text-[18px]">edit</span>
                      </button>
                      <button
                        onClick={() => handleDeleteProcedimento(proc.id)}
                        className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-error/10 flex items-center justify-center text-error hover:bg-error/20 transition-colors"
                        title="Excluir Procedimento"
                      >
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Edit Procedure Modal */}
          {editingProc && (
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-surface-container-lowest rounded-2xl w-full max-w-md p-6 shadow-xl relative border border-white/20">
                <button 
                  onClick={() => setEditingProc(null)}
                  className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-surface-container hover:bg-surface-container-high transition-colors text-on-surface-variant"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
                <h3 className="font-serif text-xl font-semibold text-primary mb-4">Editar Procedimento</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-on-surface-variant mb-1">Nome do Procedimento</label>
                    <input
                      value={editingProc.nome}
                      onChange={(e) => setEditingProc({ ...editingProc, nome: e.target.value })}
                      type="text"
                      className="w-full bg-surface-container/50 border border-outline-variant/40 rounded-lg px-3 py-2 text-sm text-on-surface focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-on-surface-variant mb-1">Duração (minutos)</label>
                    <input
                      value={editingProc.duracao}
                      onChange={(e) => setEditingProc({ ...editingProc, duracao: Number(e.target.value) })}
                      type="number"
                      className="w-full bg-surface-container/50 border border-outline-variant/40 rounded-lg px-3 py-2 text-sm text-on-surface focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-on-surface-variant mb-1">Preço Padrão (R$)</label>
                    <input
                      value={editingProc.preco}
                      onChange={(e) => setEditingProc({ ...editingProc, preco: Number(e.target.value) })}
                      type="number"
                      step="0.01"
                      className="w-full bg-surface-container/50 border border-outline-variant/40 rounded-lg px-3 py-2 text-sm text-on-surface focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <button onClick={() => setEditingProc(null)} className="px-4 py-2 rounded-xl text-sm text-on-surface hover:bg-surface-container">Cancelar</button>
                    <button onClick={handleSaveEditProcedimento} className="px-5 py-2 bg-primary text-on-primary rounded-xl text-sm font-medium hover:bg-primary/90">Salvar Alterações</button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === "automacao" && (
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="font-serif text-2xl md:text-3xl text-primary mb-2">Central de Automações WhatsApp</h1>
            <p className="text-base text-on-surface-variant max-w-2xl">
              Configure e controle todos os disparos automáticos de mensagens via WAHA para seus pacientes.
            </p>
          </div>

          {/* Variables reference */}
          <div className="bg-surface-container/40 border border-outline-variant/30 rounded-xl px-4 py-3 flex flex-wrap gap-2 items-center">
            <span className="text-xs font-medium text-on-surface-variant mr-1">Variáveis disponíveis:</span>
            {["{nome}", "{servico}", "{data}", "{hora}"].map(v => (
              <span key={v} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-mono font-semibold border border-primary/20">{v}</span>
            ))}
          </div>

          {/* Card: Confirmação de Agendamento */}
          <div className={`rounded-2xl border-2 transition-all duration-300 ${
            confirmacaoAtiva ? 'border-primary/30 bg-surface-container-lowest/80' : 'border-outline-variant/20 bg-surface-container-lowest/40 opacity-60'
          } backdrop-blur-sm shadow-sm p-4 sm:p-6 md:p-8`}>
            <div className="flex items-start justify-between gap-3 mb-6">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                  confirmacaoAtiva ? 'bg-primary/15 text-primary' : 'bg-surface-container-high text-on-surface-variant'
                }`}>
                  <span className="material-symbols-outlined text-xl sm:text-2xl">check_circle</span>
                </div>
                <div>
                  <h2 className="font-serif text-base sm:text-lg text-on-surface font-semibold">Confirmação de Agendamento</h2>
                  <p className="text-xs text-on-surface-variant mt-0.5">Disparado imediatamente quando um novo agendamento é criado</p>
                </div>
              </div>
              {/* Toggle */}
              <button
                onClick={() => setConfirmacaoAtiva(!confirmacaoAtiva)}
                className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  confirmacaoAtiva ? 'bg-primary' : 'bg-surface-container-high'
                }`}
                role="switch"
                aria-checked={confirmacaoAtiva}
              >
                <span className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                  confirmacaoAtiva ? 'translate-x-5' : 'translate-x-0'
                }`} />
              </button>
            </div>
            
            <div className="relative">
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-medium text-on-surface-variant uppercase">Mensagem</label>
                <button 
                  onClick={() => setShowEmojiPicker(showEmojiPicker === 'confirmacao' ? null : 'confirmacao')}
                  disabled={!confirmacaoAtiva}
                  className="text-xl hover:scale-110 transition-transform disabled:opacity-50"
                  title="Inserir Emoji"
                >😀</button>
              </div>
              
              {showEmojiPicker === 'confirmacao' && (
                <div className="absolute right-0 top-8 z-10 bg-surface-container-highest border border-outline-variant/30 shadow-lg rounded-xl p-3 w-64">
                  <div className="grid grid-cols-6 gap-2">
                    {EMOJIS.map(emoji => (
                      <button key={emoji} onClick={() => {
                        setConfirmacaoTexto(prev => prev + emoji);
                        setShowEmojiPicker(null);
                      }} className="text-xl hover:bg-white/20 rounded p-1">{emoji}</button>
                    ))}
                  </div>
                </div>
              )}
              
              <textarea
                value={confirmacaoTexto}
                onChange={e => setConfirmacaoTexto(e.target.value)}
                disabled={!confirmacaoAtiva}
                rows={3}
                className="w-full bg-surface-container/60 border border-outline-variant/40 rounded-xl px-4 py-3 text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary resize-none transition-all disabled:cursor-not-allowed"
                placeholder="Mensagem de confirmação..."
              />
            </div>
            
            <div className="mt-4 flex justify-end">
              <button 
                onClick={() => handleTestTemplate(confirmacaoTexto)}
                disabled={!confirmacaoAtiva}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 text-primary border border-primary/20 text-sm font-medium hover:bg-primary/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <span className="material-symbols-outlined text-[16px]">send_to_mobile</span>
                Testar Layout
              </button>
            </div>
          </div>

          {/* Card: Lembrete de Véspera */}
          <div className={`rounded-2xl border-2 transition-all duration-300 ${
            lembreteAtivo ? 'border-secondary/30 bg-surface-container-lowest/80' : 'border-outline-variant/20 bg-surface-container-lowest/40 opacity-60'
          } backdrop-blur-sm shadow-sm p-4 sm:p-6 md:p-8`}>
            <div className="flex items-start justify-between gap-3 mb-6">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                  lembreteAtivo ? 'bg-secondary/15 text-secondary' : 'bg-surface-container-high text-on-surface-variant'
                }`}>
                  <span className="material-symbols-outlined text-xl sm:text-2xl">bedtime</span>
                </div>
                <div>
                  <h2 className="font-serif text-base sm:text-lg text-on-surface font-semibold">Lembrete de Véspera</h2>
                  <p className="text-xs text-on-surface-variant mt-0.5">Enviado no dia anterior ao procedimento</p>
                </div>
              </div>
              {/* Toggle */}
              <button
                onClick={() => setLembreteAtivo(!lembreteAtivo)}
                className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  lembreteAtivo ? 'bg-secondary' : 'bg-surface-container-high'
                }`}
                role="switch"
                aria-checked={lembreteAtivo}
              >
                <span className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                  lembreteAtivo ? 'translate-x-5' : 'translate-x-0'
                }`} />
              </button>
            </div>
            
            <div className="relative mb-4">
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-medium text-on-surface-variant uppercase">Mensagem</label>
                <button 
                  onClick={() => setShowEmojiPicker(showEmojiPicker === 'lembrete' ? null : 'lembrete')}
                  disabled={!lembreteAtivo}
                  className="text-xl hover:scale-110 transition-transform disabled:opacity-50"
                >😀</button>
              </div>
              
              {showEmojiPicker === 'lembrete' && (
                <div className="absolute right-0 top-8 z-10 bg-surface-container-highest border border-outline-variant/30 shadow-lg rounded-xl p-3 w-64">
                  <div className="grid grid-cols-6 gap-2">
                    {EMOJIS.map(emoji => (
                      <button key={emoji} onClick={() => {
                        setLembreteTexto(prev => prev + emoji);
                        setShowEmojiPicker(null);
                      }} className="text-xl hover:bg-white/20 rounded p-1">{emoji}</button>
                    ))}
                  </div>
                </div>
              )}
              
              <textarea
                value={lembreteTexto}
                onChange={e => setLembreteTexto(e.target.value)}
                disabled={!lembreteAtivo}
                rows={3}
                className="w-full bg-surface-container/60 border border-outline-variant/40 rounded-xl px-4 py-3 text-sm text-on-surface focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary resize-none transition-all disabled:cursor-not-allowed"
                placeholder="Mensagem de lembrete de véspera..."
              />
            </div>
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-sm text-on-surface-variant">schedule</span>
                <label className="text-xs font-medium text-on-surface-variant">Horário de envio</label>
                <input
                  type="time"
                  value={horaLembrete}
                  onChange={e => setHoraLembrete(e.target.value)}
                  disabled={!lembreteAtivo}
                  className="bg-surface-container/60 border border-outline-variant/40 rounded-lg px-3 py-1.5 text-sm text-on-surface focus:outline-none focus:border-secondary disabled:cursor-not-allowed"
                />
              </div>
              <div className="flex items-center gap-2 mt-4 sm:mt-0 ml-auto">
                <button 
                  onClick={() => handleTestTemplate(lembreteTexto)}
                  disabled={!lembreteAtivo}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-secondary/10 text-secondary border border-secondary/20 text-sm font-medium hover:bg-secondary/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <span className="material-symbols-outlined text-[16px]">send_to_mobile</span>
                  Testar Layout
                </button>
                <button
                  disabled={!lembreteAtivo || triggeringLembrete}
                  onClick={async () => {
                    setTriggeringLembrete(true);
                    setLembreteLog(null);
                    try {
                      const res = await fetch('/api/cron/lembretes');
                      const data = await res.json();
                      setLembreteLog(`✅ ${data.sent} de ${data.total} mensagens enviadas para amanhã.${data.errors?.length ? ' ⚠️ ' + data.errors.join(', ') : ''}`);
                    } catch { setLembreteLog('❌ Erro ao disparar lembretes.'); }
                    setTriggeringLembrete(false);
                  }}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-secondary/10 text-secondary border border-secondary/20 text-sm font-medium hover:bg-secondary/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <span className="material-symbols-outlined text-sm">{triggeringLembrete ? 'hourglass_empty' : 'rocket_launch'}</span>
                  {triggeringLembrete ? 'Processando...' : 'Forçar Cron'}
                </button>
              </div>
            </div>
            {lembreteLog && <p className="mt-3 text-xs text-on-surface-variant bg-surface-container/60 rounded-lg px-3 py-2">{lembreteLog}</p>}
          </div>

          {/* Card: Lembrete 2h Antes */}
          <div className={`rounded-2xl border-2 transition-all duration-300 ${
            lembrete2hAtivo ? 'border-tertiary/30 bg-surface-container-lowest/80' : 'border-outline-variant/20 bg-surface-container-lowest/40 opacity-60'
          } backdrop-blur-sm shadow-sm p-4 sm:p-6 md:p-8`}>
            <div className="flex items-start justify-between gap-3 mb-6">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                  lembrete2hAtivo ? 'bg-tertiary/15 text-tertiary' : 'bg-surface-container-high text-on-surface-variant'
                }`}>
                  <span className="material-symbols-outlined text-xl sm:text-2xl">alarm</span>
                </div>
                <div>
                  <h2 className="font-serif text-base sm:text-lg text-on-surface font-semibold">Lembrete 2h Antes</h2>
                  <p className="text-xs text-on-surface-variant mt-0.5">Enviado 2 horas antes do horário do procedimento</p>
                </div>
              </div>
              {/* Toggle */}
              <button
                onClick={() => setLembrete2hAtivo(!lembrete2hAtivo)}
                className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  lembrete2hAtivo ? 'bg-tertiary' : 'bg-surface-container-high'
                }`}
                role="switch"
                aria-checked={lembrete2hAtivo}
              >
                <span className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                  lembrete2hAtivo ? 'translate-x-5' : 'translate-x-0'
                }`} />
              </button>
            </div>
            
            <div className="relative mb-4">
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-medium text-on-surface-variant uppercase">Mensagem</label>
                <button 
                  onClick={() => setShowEmojiPicker(showEmojiPicker === 'lembrete2h' ? null : 'lembrete2h')}
                  disabled={!lembrete2hAtivo}
                  className="text-xl hover:scale-110 transition-transform disabled:opacity-50"
                >😀</button>
              </div>
              
              {showEmojiPicker === 'lembrete2h' && (
                <div className="absolute right-0 top-8 z-10 bg-surface-container-highest border border-outline-variant/30 shadow-lg rounded-xl p-3 w-64">
                  <div className="grid grid-cols-6 gap-2">
                    {EMOJIS.map(emoji => (
                      <button key={emoji} onClick={() => {
                        setLembrete2hTexto(prev => prev + emoji);
                        setShowEmojiPicker(null);
                      }} className="text-xl hover:bg-white/20 rounded p-1">{emoji}</button>
                    ))}
                  </div>
                </div>
              )}
              
              <textarea
                value={lembrete2hTexto}
                onChange={e => setLembrete2hTexto(e.target.value)}
                disabled={!lembrete2hAtivo}
                rows={3}
                className="w-full bg-surface-container/60 border border-outline-variant/40 rounded-xl px-4 py-3 text-sm text-on-surface focus:outline-none focus:border-tertiary focus:ring-1 focus:ring-tertiary resize-none transition-all disabled:cursor-not-allowed"
                placeholder="Mensagem de lembrete 2h antes..."
              />
            </div>
            
            <div className="flex justify-end gap-2">
              <button 
                onClick={() => handleTestTemplate(lembrete2hTexto)}
                disabled={!lembrete2hAtivo}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-tertiary/10 text-tertiary border border-tertiary/20 text-sm font-medium hover:bg-tertiary/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <span className="material-symbols-outlined text-[16px]">send_to_mobile</span>
                Testar Layout
              </button>
              <button
                disabled={!lembrete2hAtivo || triggeringLembrete2h}
              onClick={async () => {
                setTriggeringLembrete2h(true);
                try {
                  const res = await fetch('/api/cron/lembrete-2h');
                  const data = await res.json();
                  setLembreteLog(`✅ Lembrete 2h: ${data.sent} de ${data.total} enviadas.${data.errors?.length ? ' ⚠️ ' + data.errors.join(', ') : ''}`);
                } catch { setLembreteLog('❌ Erro ao disparar lembrete 2h.'); }
                setTriggeringLembrete2h(false);
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-tertiary/10 text-tertiary border border-tertiary/20 text-sm font-medium hover:bg-tertiary/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined text-sm">{triggeringLembrete2h ? 'hourglass_empty' : 'rocket_launch'}</span>
              {triggeringLembrete2h ? 'Processando...' : 'Forçar Cron (2h)'}
            </button>
            </div>
          </div>

          {/* Agenda Pessoal da Dra. Jordane (Diário 08:00) */}
          <div className={`p-6 rounded-2xl border transition-all ${
            agendaPessoalAtiva ? 'border-primary/30 bg-surface-container-lowest/80' : 'border-outline-variant/20 bg-surface-container-lowest/40 opacity-60'
          }`}>
            <div className="flex items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  agendaPessoalAtiva ? 'bg-primary/15 text-primary' : 'bg-surface-container-high text-on-surface-variant'
                }`}>
                  <span className="material-symbols-outlined text-[20px]">person_check</span>
                </div>
                <div>
                  <h3 className="font-semibold text-on-surface text-base">Agenda Diária no WhatsApp da Dra. Jordane (08:00)</h3>
                  <p className="text-xs text-on-surface-variant">
                    Envia todos os dias às 08:00 o resumo dos pacientes, procedimentos e horários do dia no seu WhatsApp pessoal.
                  </p>
                </div>
              </div>
              <button
                type="button"
                role="switch"
                onClick={() => setAgendaPessoalAtiva(!agendaPessoalAtiva)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  agendaPessoalAtiva ? 'bg-primary' : 'bg-surface-container-high'
                }`}
                aria-checked={agendaPessoalAtiva}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                    agendaPessoalAtiva ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3 mb-4">
              <div>
                <label className="block text-xs font-medium text-on-surface-variant mb-1">
                  Seu WhatsApp Pessoal (com DDD):
                </label>
                <input
                  type="text"
                  value={telefonePessoalDoutora}
                  onChange={e => setTelefonePessoalDoutora(e.target.value)}
                  disabled={!agendaPessoalAtiva}
                  placeholder="Ex: 62991346756"
                  className="w-full px-4 py-2 text-sm rounded-xl border border-outline-variant/30 bg-surface-container/30 focus:border-primary focus:ring-1 focus:ring-primary text-on-surface font-mono disabled:opacity-50"
                />
                <p className="text-[11px] text-on-surface-variant/70 mt-1">
                  A mensagem só será enviada se houver agendamentos cadastrados para o dia.
                </p>
              </div>

              <div className="flex items-end justify-end">
                <button
                  type="button"
                  disabled={!agendaPessoalAtiva || triggeringAgendaPessoal}
                  onClick={async () => {
                    setTriggeringAgendaPessoal(true);
                    try {
                      const res = await fetch('/api/cron/agenda-pessoal?secret=aura_cron_sec_7a8b9c2d1e0f3456789a_dra_jordane&force=true');
                      const data = await res.json();
                      if (data.sent) {
                        setLembreteLog(`✅ Agenda enviada com sucesso para ${telefonePessoalDoutora}! (${data.total} atendimentos hoje)`);
                      } else {
                        setLembreteLog(`ℹ️ ${data.message || 'Nenhum agendamento para hoje.'}`);
                      }
                    } catch {
                      setLembreteLog('❌ Erro ao disparar agenda pessoal.');
                    }
                    setTriggeringAgendaPessoal(false);
                  }}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20 text-sm font-medium hover:bg-primary/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <span className="material-symbols-outlined text-sm">{triggeringAgendaPessoal ? 'hourglass_empty' : 'send_to_mobile'}</span>
                  {triggeringAgendaPessoal ? 'Enviando...' : 'Testar Envio da Agenda'}
                </button>
              </div>
            </div>
          </div>

          {/* Save button */}
          <div className="flex flex-col sm:flex-row items-center justify-end gap-4 pt-2">
            {automacaoSaved && (
              <span className="text-sm text-primary flex items-center gap-1.5 animate-fade-in">
                <span className="material-symbols-outlined text-[18px]">check_circle</span>
                Configurações salvas!
              </span>
            )}
            <button
              disabled={automacaoSaving}
              onClick={async () => {
                setAutomacaoSaving(true);
                setAutomacaoSaved(false);
                await updateSettings({
                  msgConfirmacaoAtiva: confirmacaoAtiva,
                  msgConfirmacaoTexto: confirmacaoTexto,
                  msgLembreteAtiva: lembreteAtivo,
                  msgLembreteTexto: lembreteTexto,
                  msgHoraLembrete: horaLembrete,
                  msgLembrete2hAtiva: lembrete2hAtivo,
                  msgLembrete2hTexto: lembrete2hTexto,
                  agendaPessoalAtiva: agendaPessoalAtiva,
                  telefonePessoalDoutora: telefonePessoalDoutora,
                });
                setAutomacaoSaving(false);
                setAutomacaoSaved(true);
                setTimeout(() => setAutomacaoSaved(false), 3000);
              }}
              className="w-full sm:w-auto px-8 py-2.5 bg-primary text-on-primary rounded-xl font-medium text-sm hover:bg-primary/90 transition-colors shadow-sm flex items-center justify-center gap-2 disabled:opacity-60"
            >
              <span className="material-symbols-outlined text-[18px]">save</span>
              {automacaoSaving ? 'Salvando...' : 'Salvar Automações'}
            </button>
          </div>
        </div>
      )}

      

      {activeTab === "integracoes" && (
        <div className="space-y-6">
          <div className="mb-6">
            <h3 className="font-serif text-2xl md:text-3xl text-primary mb-2">Integrações de Aplicativos</h3>
            <p className="text-on-surface-variant text-sm max-w-2xl">Conecte o seu sistema a outras plataformas para automatizar seu fluxo de trabalho.</p>
          </div>

          <div className="bg-surface-container-lowest/60 backdrop-blur-sm border border-white/40 shadow-sm rounded-2xl p-4 sm:p-6 md:p-8">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4 sm:gap-6 justify-between">
              <div className="flex gap-6 items-center">
                <div className="w-16 h-16 rounded-xl bg-surface-container flex items-center justify-center text-on-surface border border-outline-variant/20 shrink-0">
                  <span className="material-symbols-outlined text-[32px] text-tertiary">calendar_month</span>
                </div>
                <div>
                  <h4 className="font-serif text-xl text-primary mb-1">Google Agenda</h4>
                  <p className="text-sm text-on-surface-variant max-w-md">Sincronize automaticamente os agendamentos da clínica com a sua agenda pessoal ou profissional do Google.</p>
                </div>
              </div>
              
              {settings?.googleRefreshToken ? (
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-primary font-medium bg-primary/10 px-4 py-2 rounded-lg">
                    <span className="material-symbols-outlined text-[20px]">check_circle</span>
                    Conectado
                  </div>
                  <button 
                    onClick={async () => {
                      if (confirm("Tem certeza que deseja desconectar sua agenda?")) {
                        await disconnectGoogleCalendar();
                        window.location.reload();
                      }
                    }}
                    className="px-6 py-3 bg-surface-container-high border border-outline-variant/30 text-on-surface rounded-xl font-medium hover:bg-surface-container-highest transition-colors flex items-center gap-2 whitespace-nowrap"
                  >
                    Desconectar
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => window.location.href = '/api/auth/google'}
                  className="px-6 py-3 bg-primary text-on-primary rounded-xl font-medium hover:bg-primary/90 transition-colors flex items-center gap-2 whitespace-nowrap shadow-sm"
                >
                  <span className="material-symbols-outlined text-[20px]">sync</span>
                  Conectar com o Google
                </button>
              )}
            </div>
          </div>

          {/* WAHA Integration */}
          <div className="bg-surface-container-lowest/60 backdrop-blur-sm border border-white/40 shadow-sm rounded-2xl p-8">
            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 rounded-xl bg-surface-container flex items-center justify-center text-on-surface border border-outline-variant/20 shrink-0">
                  <span className="material-symbols-outlined text-[32px] text-tertiary">chat</span>
                </div>
                <div>
                  <h4 className="font-serif text-xl text-primary mb-1">WhatsApp (API WAHA)</h4>
                  <p className="text-sm text-on-surface-variant max-w-md">Configure o envio automático de mensagens via WhatsApp usando o seu container da WAHA.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-on-surface-variant uppercase">URL da API</label>
                  <input
                    type="text"
                    value={wahaUrl}
                    onChange={(e) => setWahaUrl(e.target.value)}
                    placeholder="http://localhost:3000"
                    className="w-full px-4 py-2.5 bg-surface-container-lowest border border-outline-variant/30 rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-on-surface-variant uppercase">Nome da Sessão</label>
                  <input
                    type="text"
                    value={wahaSessionName}
                    onChange={(e) => setWahaSessionName(e.target.value)}
                    placeholder="default"
                    className="w-full px-4 py-2.5 bg-surface-container-lowest border border-outline-variant/30 rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm"
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 items-center pt-2">
                <button
                  onClick={async () => {
                    setWahaIsSaving(true);
                    await updateSettings({ wahaUrl, wahaSessionName });
                    setWahaIsSaving(false);
                    alert("Configurações do WhatsApp salvas com sucesso!");
                  }}
                  disabled={wahaIsSaving}
                  className="px-6 py-2.5 bg-primary text-on-primary rounded-xl font-medium hover:bg-primary/90 transition-colors"
                >
                  {wahaIsSaving ? "Salvando..." : "Salvar WAHA"}
                </button>
                
                <div className="flex-1 w-full sm:w-auto flex flex-col sm:flex-row gap-2 border-l border-outline-variant/30 pl-0 sm:pl-4">
                   <input
                    type="text"
                    value={wahaPhoneTest}
                    onChange={(e) => setWahaPhoneTest(e.target.value)}
                    placeholder="Seu nº de WhatsApp"
                    className="flex-1 px-4 py-2 bg-surface-container-lowest border border-outline-variant/30 rounded-xl focus:outline-none focus:border-tertiary focus:ring-1 focus:ring-tertiary text-sm min-w-[200px]"
                  />
                  <button
                    onClick={async () => {
                      if (!wahaPhoneTest) return alert("Digite um número para testar");
                      const { sendWahaTestMessage } = await import('../../actions/settings');
                      const res = await sendWahaTestMessage(wahaPhoneTest);
                      if (res.success) {
                        alert("Mensagem de teste enviada!");
                        setWahaPhoneTest("");
                      } else {
                        alert("Erro: " + res.error);
                      }
                    }}
                    className="px-4 py-2 bg-tertiary text-on-tertiary rounded-xl font-medium hover:bg-tertiary/90 transition-colors whitespace-nowrap"
                  >
                    Enviar Teste
                  </button>
                </div>
              </div>
            </div>
          </div>
        
<div className="space-y-6 mt-8 pt-8 border-t border-outline-variant/30">
          <div className="mb-6">
            <h1 className="font-serif text-2xl md:text-3xl text-primary mb-2">Agente de IA (OpenAI)</h1>
            <p className="text-base text-on-surface-variant max-w-2xl">
              Configure sua assistente virtual com inteligência artificial para responder pacientes e gerenciar agendamentos via WhatsApp.
            </p>
          </div>

          <div className="bg-surface-container-lowest/60 backdrop-blur-sm border border-white/40 shadow-sm rounded-2xl p-4 sm:p-6 md:p-8 space-y-6 md:space-y-8">
            
            {/* Toggle Status */}
            <div className="flex items-center justify-between border-b border-outline-variant/30 pb-6">
              <div>
                <h2 className="font-serif text-xl text-primary font-semibold">Ativar Assistente Virtual</h2>
                <p className="text-sm text-on-surface-variant mt-1">Quando ativado, a IA interceptará e responderá às mensagens recebidas via WAHA.</p>
              </div>
              <button
                onClick={() => setAiAgentActive(!aiAgentActive)}
                className={`relative inline-flex h-8 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  aiAgentActive ? 'bg-primary' : 'bg-surface-container-high'
                }`}
              >
                <span className={`pointer-events-none inline-block h-7 w-7 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                  aiAgentActive ? 'translate-x-6' : 'translate-x-0'
                }`} />
              </button>
            </div>

            {/* API Key */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-on-background">Chave da API OpenAI (sk-...)</label>
              <input
                type="password"
                value={openAiApiKey}
                onChange={(e) => setOpenAiApiKey(e.target.value)}
                placeholder="sk-proj-..."
                className="w-full bg-surface-container/50 border border-outline-variant/40 rounded-xl px-4 py-3 text-sm text-on-surface focus:outline-none focus:border-primary"
              />
              <p className="text-xs text-on-surface-variant">Esta chave será usada para gerar as respostas. Mantenha em segredo.</p>
            </div>

            {/* Auto Schedule Toggle */}
            <div className="flex items-start justify-between bg-primary/5 border border-primary/20 rounded-xl p-4">
              <div>
                <h3 className="text-sm font-semibold text-primary">Permitir Agendamento Automático?</h3>
                <p className="text-xs text-on-surface-variant mt-1 max-w-lg">
                  Se ativado, a IA verificará sua agenda e criará agendamentos no sistema sozinha de acordo com os pedidos do paciente. 
                  Se desativado, ela apenas tirará dúvidas e pegará os dados para que você agende manualmente.
                </p>
              </div>
              <button
                onClick={() => setAiAutoSchedule(!aiAutoSchedule)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  aiAutoSchedule ? 'bg-primary' : 'bg-surface-container-high'
                }`}
              >
                <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                  aiAutoSchedule ? 'translate-x-5' : 'translate-x-0'
                }`} />
              </button>
            </div>

            {/* System Prompt */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-on-background">Comportamento (Prompt de Sistema)</label>
              <textarea
                value={openAiSystemPrompt}
                onChange={(e) => setOpenAiSystemPrompt(e.target.value)}
                rows={6}
                className="w-full bg-surface-container/50 border border-outline-variant/40 rounded-xl px-4 py-3 text-sm text-on-surface focus:outline-none focus:border-primary resize-none"
                placeholder="Descreva como a IA deve agir, seu tom de voz, regras de atendimento, etc."
              />
            </div>

            {/* Save Button */}
            <div className="flex justify-end pt-4">
              <button
                disabled={aiSaving}
                onClick={async () => {
                  setAiSaving(true);
                  await updateSettings({
                    openAiApiKey,
                    openAiSystemPrompt,
                    aiAgentActive,
                    aiAutoSchedule
                  });
                  setAiSaving(false);
                  alert("Configurações da IA salvas com sucesso!");
                }}
                className="w-full sm:w-auto px-6 py-2.5 bg-primary text-on-primary rounded-xl font-medium text-sm hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">smart_toy</span>
                {aiSaving ? "Salvando..." : "Salvar Configurações da IA"}
              </button>
            </div>

          </div>
        </div>
      </div>
      )}

      {activeTab === "app" && (
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="font-serif text-2xl md:text-3xl text-primary mb-2">Aplicativo Móvel da Clínica (PWA)</h1>
            <p className="text-base text-on-surface-variant max-w-2xl">
              Instale o sistema diretamente na tela de início do seu celular (iPhone ou Android) para abrir em tela cheia como um aplicativo nativo.
            </p>
          </div>

          {/* App Card Banner */}
          <div className="bg-surface-container-lowest/80 backdrop-blur-sm border border-primary/20 shadow-md rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-6">
            <img
              src="/icons/icon-192x192.png"
              alt="Ícone do App"
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl shadow-xl object-cover border-2 border-white/60"
            />

            <div className="flex-1 text-center sm:text-left space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-tertiary/15 text-tertiary text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse"></span>
                PWA Habilitado &amp; Pronto para Instalação
              </div>
              <h2 className="font-serif text-2xl text-primary font-bold">
                Dra. Jordane (Agenda)
              </h2>
              <p className="text-sm text-on-surface-variant">
                Versão 2.0 • Acesso direto, tela cheia nativa, carregamento instantâneo e atalhos rápidos.
              </p>
            </div>
          </div>

          {/* Push Notifications Card */}
          <div className="bg-surface-container-lowest/80 backdrop-blur-sm border border-primary/25 shadow-md rounded-3xl p-6 sm:p-8 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-outline-variant/20 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-primary/15 text-primary flex items-center justify-center">
                  <span className="material-symbols-outlined text-2xl">notifications_active</span>
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-primary">Notificações na Barra do Celular (Push)</h3>
                  <p className="text-xs text-on-surface-variant">
                    Receba lembretes 2h antes de cada consulta e o resumo da agenda diária às 08h na barra do seu celular.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={pushTesting}
                  onClick={async () => {
                    setPushTesting(true);
                    setPushTestResult(null);
                    try {
                      const res = await fetch('/api/push/subscribe');
                      const data = await res.json();
                      if (data.success) {
                        setPushTestResult(`✅ Notificação disparada com sucesso para ${data.count} dispositivo(s) conectado(s)! Verifique a barra superior do seu celular.`);
                      } else {
                        setPushTestResult(`❌ Erro: ${data.error || 'Nenhum dispositivo cadastrado.'}`);
                      }
                    } catch (e: any) {
                      setPushTestResult(`❌ Erro ao enviar: ${e.message}`);
                    }
                    setPushTesting(false);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-primary text-on-primary font-medium text-xs hover:bg-primary/90 transition-all shadow-sm flex items-center gap-2 disabled:opacity-60"
                >
                  <span className="material-symbols-outlined text-[18px]">{pushTesting ? 'hourglass_empty' : 'send_to_mobile'}</span>
                  {pushTesting ? 'Disparando...' : 'Enviar Alerta de Teste Agora'}
                </button>
              </div>
            </div>

            {pushTestResult && (
              <div className={`p-4 rounded-xl text-xs font-medium border ${
                pushTestResult.startsWith('✅') ? 'bg-primary/10 border-primary/20 text-primary' : 'bg-red-500/10 border-red-500/20 text-red-500'
              }`}>
                {pushTestResult}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-on-surface-variant pt-2">
              <div className="p-3.5 bg-surface-container/30 rounded-xl border border-outline-variant/15">
                <strong className="text-primary block mb-1">📱 No iPhone (iOS):</strong>
                É obrigatório abrir o sistema através do <strong>ícone adicionado à Tela de Início</strong> (modo aplicativo). Se aberto pelo Safari normal, a Apple bloqueia as notificações. Em <em>Ajustes &gt; Notificações &gt; Dra. Jordane</em>, certifique-se de que estão permitidas.
              </div>
              <div className="p-3.5 bg-surface-container/30 rounded-xl border border-outline-variant/15">
                <strong className="text-primary block mb-1">🤖 No Android:</strong>
                As notificações funcionam nativamente. Certifique-se de que as permissões do app não estão silenciadas em <em>Configurações do Celular &gt; Apps &gt; Dra. Jordane (Agenda) &gt; Notificações</em>.
              </div>
            </div>
          </div>

          {/* Guides Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* iOS Guide */}
            <div className="bg-surface-container-lowest/60 backdrop-blur-sm border border-outline-variant/30 shadow-sm rounded-2xl p-6 space-y-4">
              <div className="flex items-center gap-3 border-b border-outline-variant/20 pb-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                  <span className="material-symbols-outlined text-2xl">phone_iphone</span>
                </div>
                <div>
                  <h3 className="font-serif text-lg font-semibold text-primary">Como instalar no iPhone / iPad</h3>
                  <p className="text-xs text-on-surface-variant">Navegador Safari</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-surface-container/40 rounded-xl border border-outline-variant/20">
                  <span className="w-6 h-6 rounded-full bg-primary text-on-primary flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">1</span>
                  <p className="text-xs text-on-surface leading-relaxed">
                    Abra o link <strong className="text-primary font-mono">agenda.drajordanefaria.com</strong> no navegador <strong>Safari</strong> do seu iPhone.
                  </p>
                </div>

                <div className="flex items-start gap-3 p-3 bg-surface-container/40 rounded-xl border border-outline-variant/20">
                  <span className="w-6 h-6 rounded-full bg-primary text-on-primary flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">2</span>
                  <p className="text-xs text-on-surface leading-relaxed">
                    Toque no botão de <strong>Compartilhar</strong> (ícone do quadrado com seta para cima <span className="material-symbols-outlined inline-block align-middle text-[16px] text-primary">ios_share</span>) na barra inferior do Safari.
                  </p>
                </div>

                <div className="flex items-start gap-3 p-3 bg-surface-container/40 rounded-xl border border-outline-variant/20">
                  <span className="w-6 h-6 rounded-full bg-primary text-on-primary flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">3</span>
                  <p className="text-xs text-on-surface leading-relaxed">
                    Role para baixo na lista e toque em <strong className="text-primary">"Adicionar à Tela de Início"</strong> (<span className="material-symbols-outlined inline-block align-middle text-[16px]">add_box</span>), depois confirme em <strong>Adicionar</strong>.
                  </p>
                </div>
              </div>
            </div>

            {/* Android Guide */}
            <div className="bg-surface-container-lowest/60 backdrop-blur-sm border border-outline-variant/30 shadow-sm rounded-2xl p-6 space-y-4">
              <div className="flex items-center gap-3 border-b border-outline-variant/20 pb-4">
                <div className="w-10 h-10 rounded-xl bg-tertiary/10 text-tertiary flex items-center justify-center font-bold">
                  <span className="material-symbols-outlined text-2xl">phone_android</span>
                </div>
                <div>
                  <h3 className="font-serif text-lg font-semibold text-primary">Como instalar no Android</h3>
                  <p className="text-xs text-on-surface-variant">Google Chrome / Samsung Internet</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-surface-container/40 rounded-xl border border-outline-variant/20">
                  <span className="w-6 h-6 rounded-full bg-tertiary text-on-tertiary flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">1</span>
                  <p className="text-xs text-on-surface leading-relaxed">
                    Acesse o sistema no <strong>Google Chrome</strong> do seu smartphone.
                  </p>
                </div>

                <div className="flex items-start gap-3 p-3 bg-surface-container/40 rounded-xl border border-outline-variant/20">
                  <span className="w-6 h-6 rounded-full bg-tertiary text-on-tertiary flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">2</span>
                  <p className="text-xs text-on-surface leading-relaxed">
                    Ao abrir a página, surgirá o banner inferior <strong className="text-primary">"Instalar Aplicativo"</strong>.
                  </p>
                </div>

                <div className="flex items-start gap-3 p-3 bg-surface-container/40 rounded-xl border border-outline-variant/20">
                  <span className="w-6 h-6 rounded-full bg-tertiary text-on-tertiary flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">3</span>
                  <p className="text-xs text-on-surface leading-relaxed">
                    Ou toque no menu de <strong>3 pontinhos (⋮)</strong> no canto superior direito do Chrome e selecione <strong className="text-primary">"Instalar aplicativo"</strong> ou <strong>"Adicionar à tela inicial"</strong>.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Features / Advantages */}
          <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6">
            <h3 className="font-serif text-base sm:text-lg font-semibold text-primary mb-3">
              Vantagens do Aplicativo no Celular:
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-on-surface">
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-primary text-xl">fullscreen</span>
                <span><strong>Tela Cheia:</strong> Sem barras do navegador para máximo aproveitamento visual.</span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-primary text-xl">bolt</span>
                <span><strong>Super Rápido:</strong> Cache inteligente para carregamento instantâneo.</span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-primary text-xl">touch_app</span>
                <span><strong>1 Toque:</strong> Ícone exclusivo na tela inicial do seu celular.</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

