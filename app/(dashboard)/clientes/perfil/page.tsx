'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useClinic } from '../../../contexts/ClinicContext';
import { getClientById, updateClientAction, ClientProfile } from '../../../actions/client';
import { getClientPhotos, addClientPhoto, deleteClientPhoto, getClientRecords, addClientRecord, updateClientRecord, deleteClientRecord } from '../../../actions/clientDetails';
import { getProcedimentos, ProcedimentoData } from '../../../actions/procedures';
import { getEstoque, EstoqueProdutoData, registrarBaixaAgendamento, getMovimentacoesPorAgendamento, sincronizarBaixaAgendamento } from '../../../actions/inventory';

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

export default function PerfilClientePage() {
  const searchParams = useSearchParams();
  const clientId = searchParams.get('id');

  const [activeTab, setActiveTab] = useState<'overview' | 'procedures' | 'gallery' | 'records'>('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const { appointments, addAppointment, updateAppointment, deleteAppointment } = useClinic();
  
  const [procedimentosList, setProcedimentosList] = useState<ProcedimentoData[]>([]);
  const [estoque, setEstoque] = useState<EstoqueProdutoData[]>([]);
  const [produtosUsados, setProdutosUsados] = useState<{produtoId: string, quantidade: number}[]>([]);
  const [sessoesAdicionais, setSessoesAdicionais] = useState<{ date: string; startTime: string; service: string }[]>([]);
  
  const [isAddingProcedure, setIsAddingProcedure] = useState(false);
  const [editingAppointmentId, setEditingAppointmentId] = useState<string | null>(null);
  const [newProcedure, setNewProcedure] = useState({
    service: '',
    valor: '',
    formaPagamento: 'Pix',
    numeroParcelas: 1,
    duration: 60
  });

  const [patientData, setPatientData] = useState<Partial<ClientProfile>>({
    id: '',
    nome: '',
    email: '',
    telefone: '',
    dataNascimento: '',
    tipoPele: '',
    objetivoPrincipal: '',
    alergias: '',
    avatarUrl: ''
  });

  useEffect(() => {
    async function loadClient() {
      if (clientId) {
        const data = await getClientById(clientId);
        if (data) {
          setPatientData(data);
        }
        
        const [photos, recs] = await Promise.all([
          getClientPhotos(clientId),
          getClientRecords(clientId)
        ]);
        setGalleryPhotos(photos);
        setRecords(recs);
      }
      setIsLoading(false);
    }
    loadClient();
    getProcedimentos().then(setProcedimentosList);
    getEstoque().then(data => setEstoque(data.filter(p => p.quantidade > 0)));
  }, [clientId]);

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

  const handleSave = async () => {
    if (!clientId) return;
    try {
      await updateClientAction(clientId, {
        email: patientData.email,
        telefone: patientData.telefone,
        dataNascimento: patientData.dataNascimento,
        tipoPele: patientData.tipoPele,
        objetivoPrincipal: patientData.objetivoPrincipal,
        alergias: patientData.alergias,
        avatarUrl: patientData.avatarUrl
      });
      setIsEditing(false);
    } catch (e) {
      console.error(e);
      alert('Erro ao salvar.');
    }
  };

  const patientAppointments = appointments
    .filter(a => a.clienteId === clientId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
  const lastAppointment = patientAppointments.length > 0 ? patientAppointments[0] : null;

  const [records, setRecords] = useState<any[]>([]);
  const [galleryPhotos, setGalleryPhotos] = useState<any[]>([]);
  const [editingRecordId, setEditingRecordId] = useState<string | null>(null);
  const [editingRecordTitle, setEditingRecordTitle] = useState("");
  const [editingRecordText, setEditingRecordText] = useState("");

  if (isLoading) {
    return <div className="p-8 text-center text-on-surface-variant">Carregando perfil...</div>;
  }

  if (!clientId || !patientData.id) {
    return <div className="p-8 text-center text-on-surface-variant">Paciente não encontrado. Selecione um paciente na lista.</div>;
  }

  return (
    <div className="flex-1 max-w-[1440px] mx-auto w-full">
      {/* Breadcrumbs & Title */}
      <div className="mb-8">
        <nav className="flex items-center gap-2 text-xs text-on-surface-variant mb-4">
          <Link href="/clientes" className="hover:text-primary transition-colors">
            Pacientes
          </Link>
          <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          <span className="text-on-surface font-medium">{patientData.nome}</span>
        </nav>
        <h1 className="font-serif text-2xl md:text-3xl font-semibold text-primary">
          Perfil do Paciente
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Sidebar (Patient Card) */}
        <div className="lg:col-span-4 xl:col-span-3">
          <div className="bg-surface-container-lowest/60 backdrop-blur-sm border border-white/40 shadow-sm rounded-xl p-6 flex flex-col items-center text-center sticky top-24">
            <div className="relative mb-4 group">
              <img
                alt={patientData.nome}
                className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-sm bg-surface-container"
                src={patientData.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(patientData.nome || '')}&background=random`}
              />
              {isEditing && (
                <label className="absolute inset-0 bg-primary/20 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer">
                  <span className="material-symbols-outlined text-white" style={{ fontVariationSettings: "'FILL' 1" }}>upload</span>
                  <input type="file" className="hidden" accept="image/*" onChange={async e => {
                    if (e.target.files && e.target.files[0]) {
                      const base64 = await fileToBase64(e.target.files[0]);
                      setPatientData({ ...patientData, avatarUrl: base64 });
                    }
                  }} />
                </label>
              )}
              <span className="absolute bottom-0 right-2 bg-secondary-container text-on-secondary-container text-[10px] px-2 py-1 rounded-full border border-white font-bold uppercase tracking-wider shadow-sm">
                VIP
              </span>
            </div>
            <h2 className="font-serif text-xl font-semibold text-on-surface mb-1">
              {patientData.nome}
            </h2>
            {isEditing ? (
              <div className="flex flex-col items-center gap-1 mb-6">
                <label className="text-[11px] text-on-surface-variant font-medium">Paciente desde (Data de Cadastro):</label>
                <input 
                  type="date"
                  className="text-xs text-on-surface bg-surface-container/50 border border-outline-variant/30 rounded px-2 py-1 outline-none focus:border-primary"
                  value={patientData.dataCadastro ? new Date(patientData.dataCadastro).toISOString().split('T')[0] : ''}
                  onChange={e => setPatientData({ ...patientData, dataCadastro: e.target.value })}
                />
              </div>
            ) : (
              <p className="text-sm text-on-surface-variant mb-6">
                Paciente desde {patientData.dataCadastro ? new Date(patientData.dataCadastro).toLocaleDateString('pt-BR') : '2024'}
              </p>
            )}

            <div className="w-full flex flex-col gap-3 mb-6 border-t border-outline-variant/30 pt-6">
              <div className="flex items-center gap-3 text-left">
                <span className="material-symbols-outlined text-outline text-[20px]">
                  phone_iphone
                </span>
                {isEditing ? (
                  <input className="text-sm text-on-surface bg-surface-container/50 border border-outline-variant/30 rounded px-2 py-1 w-full" value={patientData.telefone || ''} onChange={e => setPatientData({...patientData, telefone: e.target.value})} placeholder="Telefone" />
                ) : (
                  <span className="text-sm text-on-surface">{patientData.telefone || '-'}</span>
                )}
              </div>
              <div className="flex items-center gap-3 text-left">
                <span className="material-symbols-outlined text-outline text-[20px]">
                  mail
                </span>
                {isEditing ? (
                  <input className="text-sm text-on-surface bg-surface-container/50 border border-outline-variant/30 rounded px-2 py-1 w-full" value={patientData.email || ''} onChange={e => setPatientData({...patientData, email: e.target.value})} placeholder="Email" />
                ) : (
                  <span className="text-sm text-on-surface truncate">{patientData.email || '-'}</span>
                )}
              </div>
              <div className="flex items-center gap-3 text-left">
                <span className="material-symbols-outlined text-outline text-[20px]">
                  cake
                </span>
                {isEditing ? (
                  <input className="text-sm text-on-surface bg-surface-container/50 border border-outline-variant/30 rounded px-2 py-1 w-full" value={patientData.dataNascimento || ''} onChange={e => setPatientData({...patientData, dataNascimento: e.target.value})} placeholder="Data de Nascimento" />
                ) : (
                  <span className="text-sm text-on-surface">{patientData.dataNascimento || '-'}</span>
                )}
              </div>
            </div>

            <div className="w-full flex flex-col gap-3">
              <a
                href={`https://wa.me/${(patientData.telefone || '').replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-primary-container text-on-primary-container hover:bg-primary-container/80 text-sm font-medium py-3 rounded-lg flex items-center justify-center gap-2 transition-colors shadow-sm"
              >
                <span className="material-symbols-outlined text-[20px]">chat</span>
                WhatsApp
              </a>
              <button 
                onClick={isEditing ? handleSave : () => setIsEditing(true)} 
                className={`w-full ${isEditing ? 'bg-primary text-on-primary' : 'bg-surface-container text-on-surface hover:bg-surface-container-high'} text-sm font-medium py-3 rounded-lg flex items-center justify-center gap-2 transition-colors border border-outline-variant/30`}
              >
                <span className="material-symbols-outlined text-[20px]">{isEditing ? 'save' : 'edit'}</span>
                {isEditing ? 'Salvar Alterações' : 'Editar Perfil'}
              </button>
            </div>
          </div>
        </div>

        {/* Main Content Area (Tabs) */}
        <div className="lg:col-span-8 xl:col-span-9">
          {/* Tab Navigation */}
          <div className="border-b border-outline-variant/30 mb-8 overflow-x-auto">
            <nav className="flex gap-8 whitespace-nowrap px-2">
              <button
                onClick={() => setActiveTab('overview')}
                className={`text-sm py-4 transition-colors font-medium cursor-pointer ${
                  activeTab === 'overview'
                    ? 'text-primary border-b-2 border-primary font-semibold'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                Visão Geral
              </button>
              <button
                onClick={() => setActiveTab('procedures')}
                className={`text-sm py-4 transition-colors font-medium cursor-pointer ${
                  activeTab === 'procedures'
                    ? 'text-primary border-b-2 border-primary font-semibold'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                Procedimentos
              </button>
              <button
                onClick={() => setActiveTab('gallery')}
                className={`text-sm py-4 transition-colors font-medium cursor-pointer ${
                  activeTab === 'gallery'
                    ? 'text-primary border-b-2 border-primary font-semibold'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                Galeria
              </button>
              <button
                onClick={() => setActiveTab('records')}
                className={`text-sm py-4 transition-colors font-medium cursor-pointer ${
                  activeTab === 'records'
                    ? 'text-primary border-b-2 border-primary font-semibold'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                Prontuário
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Clinical Summary */}
              <div className="bg-surface-container-lowest/60 backdrop-blur-sm border border-white/40 shadow-sm rounded-xl p-6 md:col-span-2">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-serif text-xl font-semibold text-on-surface">
                    Resumo Clínico
                  </h3>
                  <button onClick={isEditing ? handleSave : () => setIsEditing(true)} className="text-tertiary hover:text-on-tertiary-container transition-colors">
                    <span className="material-symbols-outlined">{isEditing ? 'save' : 'edit_note'}</span>
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div>
                    <p className="text-xs text-outline mb-1 uppercase tracking-wider font-medium">
                      Alergias
                    </p>
                    {isEditing ? (
                      <input className="text-sm text-on-surface bg-surface-container/50 border border-outline-variant/30 rounded px-2 py-1 w-full" value={patientData.alergias || ''} onChange={e => setPatientData({...patientData, alergias: e.target.value})} placeholder="ex: Látex, Nenhuma" />
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {patientData.alergias ? (
                          <span className="bg-error-container text-on-error-container text-[12px] font-medium px-3 py-1 rounded-full">
                            {patientData.alergias}
                          </span>
                        ) : (
                          <span className="bg-surface-container text-on-surface text-[12px] font-medium px-3 py-1 rounded-full">
                            Nenhuma registrada
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-xs text-outline mb-1 uppercase tracking-wider font-medium">
                      Tipo de Pele
                    </p>
                    {isEditing ? (
                      <input className="text-sm text-on-surface bg-surface-container/50 border border-outline-variant/30 rounded px-2 py-1 w-full" value={patientData.tipoPele || ''} onChange={e => setPatientData({...patientData, tipoPele: e.target.value})} placeholder="Mista, Oleosa..." />
                    ) : (
                      <p className="text-sm text-on-surface">{patientData.tipoPele || '-'}</p>
                    )}
                  </div>
                  <div>
                    <p className="text-xs text-outline mb-1 uppercase tracking-wider font-medium">
                      Objetivo Principal
                    </p>
                    {isEditing ? (
                      <input className="text-sm text-on-surface bg-surface-container/50 border border-outline-variant/30 rounded px-2 py-1 w-full" value={patientData.objetivoPrincipal || ''} onChange={e => setPatientData({...patientData, objetivoPrincipal: e.target.value})} placeholder="Ex: Viço e preenchimento" />
                    ) : (
                      <p className="text-sm text-on-surface">{patientData.objetivoPrincipal || '-'}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Recent Treatments Bento */}
              <div className="bg-surface-container-lowest/60 backdrop-blur-sm border border-white/40 shadow-sm rounded-xl p-6">
                <h3 className="font-serif text-lg font-semibold text-on-surface mb-4">
                  Último Procedimento
                </h3>
                {lastAppointment ? (
                  <div className="bg-surface-container-low rounded-lg p-4 border border-outline-variant/20">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="text-sm font-medium text-on-surface">{lastAppointment.service}</h4>
                        <p className="text-xs text-on-surface-variant">Dra. Jordane F Faria</p>
                      </div>
                      <span className="bg-tertiary-container text-on-tertiary-container text-[11px] px-2 py-1 rounded-full font-medium">
                        {new Date(lastAppointment.date + 'T12:00:00').toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                    <p className="text-xs text-on-surface-variant mt-3 border-t border-outline-variant/20 pt-3">
                      Consulta realizada às {lastAppointment.startTime}.
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-on-surface-variant">Nenhum procedimento registrado.</p>
                )}
              </div>
            </div>
          )}

          {activeTab === 'procedures' && (
            <div className="bg-surface-container-lowest/60 backdrop-blur-sm border border-white/40 shadow-sm rounded-xl p-6 space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-serif text-xl font-semibold text-on-surface">
                  Histórico de Procedimentos
                </h3>
                <button 
                  onClick={() => {
                    setEditingAppointmentId(null);
                    setNewProcedure({ service: '', valor: '', formaPagamento: 'Pix', numeroParcelas: 1, duration: 60 });
                    setProdutosUsados([]);
                    setSessoesAdicionais([]);
                    setIsAddingProcedure(true);
                  }} 
                  className="flex items-center gap-2 text-xs font-medium bg-primary text-on-primary px-3 py-1.5 rounded-full hover:bg-primary/90 transition-colors"
                >
                  <span className="material-symbols-outlined text-[16px]">add</span>
                  Registrar Realizado
                </button>
              </div>

              {isAddingProcedure && (
                <div className="bg-surface-container-low rounded-lg p-4 border border-primary/40 mb-4 animate-in fade-in slide-in-from-top-2">
                  <h4 className="text-sm font-semibold text-primary mb-3">
                    {editingAppointmentId ? "Editar Registro de Procedimento" : "Registrar Procedimento na Hora"}
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-on-surface-variant mb-1">Procedimento</label>
                      <select 
                        className="w-full bg-surface-container/50 border border-outline/30 rounded p-2 text-sm text-on-surface outline-none focus:border-primary"
                        value={newProcedure.service}
                        onChange={e => {
                          const proc = procedimentosList.find(p => p.nome === e.target.value);
                          setNewProcedure({ 
                            ...newProcedure, 
                            service: e.target.value, 
                            valor: proc ? proc.preco.toString() : newProcedure.valor,
                            duration: proc ? proc.duracao : 60
                          });
                        }}
                      >
                        <option value="">Selecione...</option>
                        {procedimentosList.map(p => (
                          <option key={p.id} value={p.nome}>{p.nome}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-on-surface-variant mb-1">Valor (R$)</label>
                      <input 
                        type="number"
                        className="w-full bg-surface-container/50 border border-outline/30 rounded p-2 text-sm text-on-surface outline-none focus:border-primary"
                        value={newProcedure.valor}
                        onChange={e => setNewProcedure({ ...newProcedure, valor: e.target.value })}
                        placeholder="Ex: 150.00"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-on-surface-variant mb-1">Forma de Pagamento</label>
                      <select 
                        className="w-full bg-surface-container/50 border border-outline/30 rounded p-2 text-sm text-on-surface outline-none focus:border-primary"
                        value={newProcedure.formaPagamento}
                        onChange={e => setNewProcedure({ ...newProcedure, formaPagamento: e.target.value })}
                      >
                        <option value="Pix">Pix</option>
                        <option value="Cartão de Crédito">Cartão de Crédito</option>
                        <option value="Cartão de Débito">Cartão de Débito</option>
                        <option value="Dinheiro">Dinheiro</option>
                      </select>
                    </div>
                    {newProcedure.formaPagamento === 'Cartão de Crédito' && (
                      <div>
                        <label className="block text-xs text-on-surface-variant mb-1">Parcelas</label>
                        <input 
                          type="number"
                          min="1"
                          className="w-full bg-surface-container/50 border border-outline/30 rounded p-2 text-sm text-on-surface outline-none focus:border-primary"
                          value={newProcedure.numeroParcelas}
                          onChange={e => setNewProcedure({ ...newProcedure, numeroParcelas: Number(e.target.value) })}
                        />
                      </div>
                    )}
                  </div>

                  {/* Produtos Utilizados (Estoque) */}
                  <div className="border-t border-outline/30 pt-3 mt-4">
                    <label className="block text-xs font-semibold text-primary mb-2">
                      Produtos Utilizados (Estoque)
                    </label>
                    
                    {produtosUsados.map((item, index) => {
                      const prodInfo = estoque.find(p => p.id === item.produtoId);
                      return (
                        <div key={index} className="flex items-center gap-2 mb-2">
                          <span className="flex-1 text-xs bg-surface-container/50 px-2 py-1.5 rounded text-on-surface truncate">
                            {prodInfo?.nome}
                          </span>
                          <input 
                            type="number"
                            min="1"
                            value={item.quantidade}
                            onChange={(e) => updateProdutoQuantidade(item.produtoId, Number(e.target.value))}
                            className="w-16 bg-surface-container/50 border border-outline/30 rounded py-1 px-2 text-xs text-center"
                          />
                          <button 
                            type="button"
                            onClick={() => removeProdutoUsado(item.produtoId)}
                            className="p-1 text-error hover:bg-error/10 rounded transition-colors"
                          >
                            <span className="material-symbols-outlined text-[16px]">close</span>
                          </button>
                        </div>
                      );
                    })}
                    
                    <div className="mt-2">
                      <select
                        value=""
                        onChange={(e) => addProdutoUsado(e.target.value)}
                        className="w-full bg-surface-container/30 border border-dashed border-outline/50 focus:border-primary focus:ring-0 focus:outline-none py-1.5 px-2 text-xs text-on-surface-variant rounded"
                      >
                        <option value="" disabled>+ Adicionar produto...</option>
                        {estoque.map(prod => (
                          <option key={prod.id} value={prod.id}>
                            {prod.nome} ({prod.quantidade} disp.)
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Agendar Retornos / Sessões Futuras */}
                  {!editingAppointmentId && (
                    <div className="border-t border-outline/30 pt-3 mt-4">
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-xs font-semibold text-primary">
                          Agendar Retornos / Sessões Futuras
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            const lastDate = sessoesAdicionais.length > 0 
                              ? new Date(sessoesAdicionais[sessoesAdicionais.length - 1].date + 'T12:00:00')
                              : new Date();
                            lastDate.setDate(lastDate.getDate() + 14);
                            const nextDateStr = lastDate.toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' });
                            setSessoesAdicionais([
                              ...sessoesAdicionais,
                              {
                                date: nextDateStr,
                                startTime: "14:00",
                                service: newProcedure.service ? `Retorno - ${newProcedure.service}` : 'Retorno'
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
                        <div key={index} className="bg-surface-container/40 p-2.5 rounded-lg border border-outline-variant/30 mb-2 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-semibold text-primary">Sessão / Retorno #{index + 1}</span>
                            <button
                              type="button"
                              onClick={() => setSessoesAdicionais(sessoesAdicionais.filter((_, i) => i !== index))}
                              className="text-error hover:bg-error/10 p-0.5 rounded"
                            >
                              <span className="material-symbols-outlined text-[14px]">close</span>
                            </button>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                            <div>
                              <input
                                type="text"
                                placeholder="Título / Serviço"
                                value={sessao.service}
                                onChange={(e) => {
                                  const updated = [...sessoesAdicionais];
                                  updated[index].service = e.target.value;
                                  setSessoesAdicionais(updated);
                                }}
                                className="w-full bg-surface-container/60 border border-outline/30 text-xs p-1 rounded text-on-surface"
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
                                className="w-full bg-surface-container/60 border border-outline/30 text-xs p-1 rounded text-on-surface"
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
                                className="w-full bg-surface-container/60 border border-outline/30 text-xs p-1 rounded text-on-surface"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-outline/30">
                    <button 
                      onClick={() => {
                        setIsAddingProcedure(false);
                        setEditingAppointmentId(null);
                      }} 
                      className="text-xs px-3 py-1.5 rounded-md hover:bg-surface-container text-on-surface"
                    >
                      Cancelar
                    </button>
                    <button 
                      disabled={!newProcedure.service}
                      onClick={async () => {
                        if (!patientData.nome) return;
                        
                        if (editingAppointmentId) {
                          const existingAppt = appointments.find(a => a.id === editingAppointmentId);
                          if (existingAppt) {
                            await updateAppointment({
                              ...existingAppt,
                              service: newProcedure.service,
                              valor: newProcedure.valor,
                              formaPagamento: newProcedure.formaPagamento,
                              numeroParcelas: newProcedure.numeroParcelas,
                            });
                            await sincronizarBaixaAgendamento(editingAppointmentId, produtosUsados);
                          }
                        } else {
                          const now = new Date();
                          const dateStr = now.toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' });
                          const timeStr = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo' });
                          
                          const agendamentoId = await addAppointment({
                            id: '', // Will be generated
                            patientName: patientData.nome,
                            patientPhone: patientData.telefone || '',
                            service: newProcedure.service,
                            date: dateStr,
                            startTime: timeStr,
                            duration: newProcedure.duration,
                            valor: newProcedure.valor,
                            formaPagamento: newProcedure.formaPagamento,
                            numeroParcelas: newProcedure.numeroParcelas
                          });

                          if (agendamentoId && produtosUsados.length > 0) {
                            await registrarBaixaAgendamento(agendamentoId, produtosUsados);
                          }
                        }

                        if (!editingAppointmentId && sessoesAdicionais.length > 0) {
                          for (const sessao of sessoesAdicionais) {
                            if (sessao.date && sessao.startTime) {
                              await addAppointment({
                                id: Date.now().toString() + Math.random(),
                                patientName: patientData.nome,
                                patientPhone: patientData.telefone || '',
                                service: sessao.service || `Retorno - ${newProcedure.service}`,
                                date: sessao.date,
                                startTime: sessao.startTime,
                                duration: 60,
                              });
                            }
                          }
                        }

                        getEstoque().then(data => setEstoque(data.filter(p => p.quantidade > 0)));
                        setIsAddingProcedure(false);
                        setEditingAppointmentId(null);
                        setNewProcedure({ service: '', valor: '', formaPagamento: 'Pix', numeroParcelas: 1, duration: 60 });
                        setProdutosUsados([]);
                        setSessoesAdicionais([]);
                      }} 
                      className="bg-primary text-on-primary text-xs px-4 py-1.5 rounded-md disabled:opacity-50"
                    >
                      {editingAppointmentId ? "Salvar Alterações" : "Salvar Registro"}
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                {patientAppointments.length > 0 ? (
                  patientAppointments.map(app => (
                    <div key={app.id} className="bg-surface-container-low rounded-lg p-4 border border-outline-variant/20 flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-on-surface">{app.service}</h4>
                        <p className="text-xs text-on-surface-variant">Dra. Jordane F Faria • {app.startTime}</p>
                        {(app.valor || app.formaPagamento) && (
                          <div className="flex flex-wrap gap-2 mt-1">
                            {app.valor && <span className="text-[11px] bg-primary/10 text-primary px-2 py-0.5 rounded">R$ {app.valor}</span>}
                            {app.formaPagamento && (
                              <span className="text-[11px] bg-surface-container-high text-on-surface-variant px-2 py-0.5 rounded">
                                {app.formaPagamento} {app.formaPagamento === 'Cartão de Crédito' && app.numeroParcelas ? `(${app.numeroParcelas}x)` : ''}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-on-surface-variant font-medium text-right">
                          {new Date(app.date + 'T12:00:00').toLocaleDateString('pt-BR')}
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={async () => {
                              setEditingAppointmentId(app.id);
                              setNewProcedure({
                                service: app.service,
                                valor: app.valor || '',
                                formaPagamento: app.formaPagamento || 'Pix',
                                numeroParcelas: app.numeroParcelas || 1,
                                duration: app.duration || 60
                              });
                              const movs = await getMovimentacoesPorAgendamento(app.id);
                              setProdutosUsados(movs);
                              setSessoesAdicionais([]);
                              setIsAddingProcedure(true);
                            }}
                            className="p-1 text-on-surface-variant hover:text-primary rounded hover:bg-surface-container transition-colors"
                            title="Editar procedimento"
                          >
                            <span className="material-symbols-outlined text-[18px]">edit</span>
                          </button>
                          <button
                            onClick={async () => {
                              if (confirm('Deseja realmente excluir este procedimento do histórico?')) {
                                await deleteAppointment(app.id);
                              }
                            }}
                            className="p-1 text-on-surface-variant hover:text-error rounded hover:bg-error/10 transition-colors"
                            title="Excluir procedimento"
                          >
                            <span className="material-symbols-outlined text-[18px]">delete</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-on-surface-variant">Nenhum procedimento registrado.</p>
                )}
              </div>
            </div>
          )}

          {activeTab === 'gallery' && (
            <div className="bg-surface-container-lowest/60 backdrop-blur-sm border border-white/40 shadow-sm rounded-xl p-6">
              <h3 className="font-serif text-xl font-semibold text-on-surface mb-4">
                Galeria de Evolução
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {galleryPhotos.map((photo) => (
                  <div key={photo.id} className="aspect-square rounded-lg overflow-hidden bg-surface-container border border-outline-variant/20 relative group">
                    <img
                      alt={photo.tipo}
                      className="w-full h-full object-cover"
                      src={photo.url}
                    />
                    <div className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded-md backdrop-blur-sm">
                      {photo.tipo}
                    </div>
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button 
                        onClick={async () => {
                          if (confirm("Excluir esta foto?")) {
                            await deleteClientPhoto(photo.id);
                            const photos = await getClientPhotos(clientId!);
                            setGalleryPhotos(photos);
                          }
                        }}
                        className="bg-error text-white p-2 rounded-full hover:bg-error/80 transition-colors"
                        title="Excluir"
                      >
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    </div>
                  </div>
                ))}
                <label className="aspect-square rounded-lg bg-surface-container/40 border border-dashed border-outline-variant flex flex-col items-center justify-center text-on-surface-variant cursor-pointer hover:bg-surface-container transition-colors">
                  <span className="material-symbols-outlined mb-1 text-primary">add_a_photo</span>
                  <span className="text-[10px] font-medium text-primary">Foto: ANTES</span>
                  <input type="file" className="hidden" accept="image/*" onChange={async e => {
                    if (e.target.files && e.target.files[0] && clientId) {
                      const newUrl = await fileToBase64(e.target.files[0]);
                      await addClientPhoto({ clienteId: clientId, url: newUrl, tipo: "Antes" });
                      const photos = await getClientPhotos(clientId);
                      setGalleryPhotos(photos);
                    }
                  }} />
                </label>
                <label className="aspect-square rounded-lg bg-surface-container/40 border border-dashed border-outline-variant flex flex-col items-center justify-center text-on-surface-variant cursor-pointer hover:bg-surface-container transition-colors">
                  <span className="material-symbols-outlined mb-1 text-tertiary">add_a_photo</span>
                  <span className="text-[10px] font-medium text-tertiary">Foto: DEPOIS</span>
                  <input type="file" className="hidden" accept="image/*" onChange={async e => {
                    if (e.target.files && e.target.files[0] && clientId) {
                      const newUrl = await fileToBase64(e.target.files[0]);
                      await addClientPhoto({ clienteId: clientId, url: newUrl, tipo: "Depois" });
                      const photos = await getClientPhotos(clientId);
                      setGalleryPhotos(photos);
                    }
                  }} />
                </label>
              </div>
            </div>
          )}

          {activeTab === 'records' && (
            <div className="bg-surface-container-lowest/60 backdrop-blur-sm border border-white/40 shadow-sm rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-serif text-xl font-semibold text-on-surface">
                  Prontuário Médico & Observações
                </h3>
                <button onClick={() => {
                  setEditingRecordId("new");
                  setEditingRecordTitle("Nova Observação");
                  setEditingRecordText("");
                }} className="flex items-center gap-2 text-xs font-medium bg-primary text-on-primary px-3 py-1.5 rounded-full hover:bg-primary/90 transition-colors">
                  <span className="material-symbols-outlined text-[16px]">add</span>
                  Novo Registro
                </button>
              </div>
              <div className="space-y-4">
                
                {editingRecordId === "new" && (
                  <div className="bg-surface-container-low p-4 rounded-lg border border-primary/40">
                    <input 
                      type="text"
                      className="w-full bg-transparent border-b border-outline/30 focus:border-primary text-sm font-semibold text-primary mb-3 outline-none"
                      value={editingRecordTitle}
                      onChange={e => setEditingRecordTitle(e.target.value)}
                      placeholder="Título da observação"
                    />
                    <textarea 
                      className="w-full bg-surface-container/50 border border-outline/30 focus:border-primary rounded-md p-2 text-sm text-on-surface outline-none min-h-[100px]"
                      value={editingRecordText}
                      onChange={e => setEditingRecordText(e.target.value)}
                      placeholder="Detalhes do prontuário..."
                    />
                    <div className="flex gap-2 justify-end mt-3">
                      <button onClick={() => setEditingRecordId(null)} className="text-xs px-3 py-1.5 rounded-md hover:bg-surface-container">Cancelar</button>
                      <button onClick={async () => {
                        if (clientId) {
                          await addClientRecord({ clienteId: clientId, titulo: editingRecordTitle, texto: editingRecordText });
                          const recs = await getClientRecords(clientId);
                          setRecords(recs);
                          setEditingRecordId(null);
                        }
                      }} className="bg-primary text-on-primary text-xs px-4 py-1.5 rounded-md">Salvar</button>
                    </div>
                  </div>
                )}

                {records.map((record) => (
                  <div key={record.id} className="bg-surface-container-low p-4 rounded-lg border border-outline-variant/20 group relative">
                    {editingRecordId === record.id ? (
                      <div>
                        <input 
                          type="text"
                          className="w-full bg-transparent border-b border-outline/30 focus:border-primary text-sm font-semibold text-primary mb-3 outline-none"
                          value={editingRecordTitle}
                          onChange={e => setEditingRecordTitle(e.target.value)}
                        />
                        <textarea 
                          className="w-full bg-surface-container/50 border border-outline/30 focus:border-primary rounded-md p-2 text-sm text-on-surface outline-none min-h-[100px]"
                          value={editingRecordText}
                          onChange={e => setEditingRecordText(e.target.value)}
                        />
                        <div className="flex gap-2 justify-end mt-3">
                          <button onClick={() => setEditingRecordId(null)} className="text-xs px-3 py-1.5 rounded-md hover:bg-surface-container">Cancelar</button>
                          <button onClick={async () => {
                            await updateClientRecord(record.id, { titulo: editingRecordTitle, texto: editingRecordText });
                            const recs = await getClientRecords(clientId!);
                            setRecords(recs);
                            setEditingRecordId(null);
                          }} className="bg-primary text-on-primary text-xs px-4 py-1.5 rounded-md">Atualizar</button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs font-semibold text-primary">{record.titulo}</span>
                          <span className="text-xs text-on-surface-variant">{new Date(record.data).toLocaleDateString('pt-BR')}</span>
                        </div>
                        <p className="text-sm text-on-surface whitespace-pre-wrap">{record.texto}</p>
                        
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                          <button onClick={() => {
                            setEditingRecordId(record.id);
                            setEditingRecordTitle(record.titulo);
                            setEditingRecordText(record.texto);
                          }} className="p-1 text-on-surface-variant hover:text-primary bg-surface-container-high rounded shadow-sm">
                            <span className="material-symbols-outlined text-[14px]">edit</span>
                          </button>
                          <button onClick={async () => {
                            if (confirm("Excluir este prontuário?")) {
                              await deleteClientRecord(record.id);
                              const recs = await getClientRecords(clientId!);
                              setRecords(recs);
                            }
                          }} className="p-1 text-on-surface-variant hover:text-error bg-surface-container-high rounded shadow-sm">
                            <span className="material-symbols-outlined text-[14px]">delete</span>
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
