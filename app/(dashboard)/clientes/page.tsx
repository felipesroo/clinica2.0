'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { getAllClientsList, createClientAction, deleteClientAction } from "../../actions/client";

interface Treatment {
  name: string;
  date: string;
  colorClass: string;
}

interface Client {
  id: string;
  name: string;
  phone: string;
  avatar?: string;
  initials?: string;
  lastVisit: string;
  nextAppointment?: string;
  isVip?: boolean;
  memberSince: string;
  totalVisits: number;
  lifetimeValue: string;
  recentTreatments: Treatment[];
  progressPhotos: string[];
}

export default function ClientesPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filterVip, setFilterVip] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newClientNome, setNewClientNome] = useState("");
  const [newClientTelefone, setNewClientTelefone] = useState("");
  const [newClientEmail, setNewClientEmail] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  async function load() {
    setIsLoading(true);
    const data = await getAllClientsList();
    setClients(data);
    if (data.length > 0 && !selectedClientId) {
      setSelectedClientId(data[0].id);
    }
    setIsLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  const handleCreateClient = async () => {
    if (!newClientNome.trim()) return alert("Nome é obrigatório");
    setIsCreating(true);
    try {
      const res = await createClientAction({
        nome: newClientNome,
        telefone: newClientTelefone,
        email: newClientEmail
      });
      if (res.success) {
        setIsModalOpen(false);
        setNewClientNome("");
        setNewClientTelefone("");
        setNewClientEmail("");
        setSelectedClientId(res.id);
        await load();
      }
    } catch (e) {
      console.error(e);
      alert("Erro ao criar cliente");
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteClient = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); // prevent selecting the client
    if (confirm("Tem certeza que deseja excluir este paciente? Todos os seus agendamentos também serão apagados.")) {
      try {
        await deleteClientAction(id);
        if (selectedClientId === id) setSelectedClientId("");
        await load();
      } catch (err) {
        alert("Erro ao excluir paciente");
      }
    }
  };

  const selectedClient = clients.find((c) => c.id === selectedClientId) || clients[0];

  const filteredClients = clients.filter((client) => {
    const matchesSearch =
      client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesVip = filterVip ? client.isVip : true;
    return matchesSearch && matchesVip;
  });

  if (isLoading && clients.length === 0) {
    return <div className="p-8 text-center text-on-surface-variant">Carregando lista de pacientes...</div>;
  }

  return (
    <>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-8">
        <div>
          <h1 className="font-serif text-2xl md:text-3xl text-primary mb-2">
            Diretório de Pacientes
          </h1>
          <p className="text-base text-on-surface-variant">
            Gerencie e revise perfis de pacientes.
          </p>
        </div>
        <div className="flex gap-4">
          <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-primary text-on-primary shadow-sm rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors">
            <span className="material-symbols-outlined text-[20px]">add</span>
            Novo Paciente
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-surface-container-lowest/60 backdrop-blur-sm border border-white/40 shadow-sm rounded-xl text-primary text-sm font-medium hover:bg-surface-container/60 transition-colors">
            <span className="material-symbols-outlined text-[20px]">filter_list</span>
            Filtrar
          </button>
        </div>
      </div>

      {/* Bento Grid Layout for Client Management */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Client List (Left/Main Span) */}
        <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-4">
          {/* Search & Tag Bar */}
          <div className="bg-surface-container-lowest/60 backdrop-blur-sm border border-white/40 shadow-sm rounded-2xl p-4 flex flex-col sm:flex-row gap-4 items-center justify-between mb-2">
            <div className="relative w-full sm:w-64">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/50">
                search
              </span>
              <input
                className="w-full bg-surface-container/40 border-0 border-b border-outline-variant/30 focus:border-tertiary focus:ring-0 pl-10 pr-4 py-2 text-sm rounded-lg placeholder:text-on-surface-variant/50 text-on-surface"
                placeholder="Buscar nome ou ID..."
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setFilterVip(true)}
                className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                  filterVip
                    ? "bg-primary-container text-on-primary-container"
                    : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
                }`}
              >
                Pacientes VIP
              </button>
              <button
                onClick={() => {
                  setFilterVip(false);
                  setSearchQuery("");
                }}
                className="px-3 py-1 bg-surface-container text-on-surface-variant hover:bg-surface-container-high rounded-full text-xs font-medium whitespace-nowrap transition-colors"
              >
                Todos
              </button>
            </div>
          </div>

          {/* Client List Items */}
          <div className="flex flex-col gap-3">
            {filteredClients.length === 0 && (
               <div className="p-8 text-center text-on-surface-variant bg-surface-container-lowest rounded-2xl">
                 Nenhum paciente encontrado. Crie um novo paciente usando o botão "Novo Paciente".
               </div>
            )}
            {filteredClients.map((client) => {
              const isSelected = client.id === selectedClientId;
              return (
                <div
                  key={client.id}
                  onClick={() => setSelectedClientId(client.id)}
                  className={`bg-surface-container-lowest/60 backdrop-blur-sm border border-white/40 shadow-sm rounded-2xl p-4 flex items-center justify-between cursor-pointer transition-all border-l-4 ${
                    isSelected
                      ? "border-l-primary bg-surface-container-lowest/90 shadow-md"
                      : "border-l-transparent hover:bg-surface-container/60"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    {client.avatar ? (
                      <div className="w-12 h-12 rounded-full overflow-hidden bg-surface-container border border-outline-variant/20 shrink-0">
                        <img
                          alt={client.name}
                          className="w-full h-full object-cover"
                          src={client.avatar}
                        />
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-full overflow-hidden bg-primary-container border border-outline-variant/20 shrink-0 flex items-center justify-center text-primary font-serif text-lg font-semibold">
                        {client.initials}
                      </div>
                    )}
                    <div>
                      <Link 
                        href={`/clientes/perfil?id=${client.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="font-serif text-lg font-semibold text-primary hover:underline block"
                      >
                        {client.name}
                      </Link>
                      <p className="text-xs text-on-surface-variant">
                        ID: {client.id.substring(0,8)}... • {client.phone}
                      </p>
                    </div>
                  </div>
                  <div className="hidden sm:block text-right">
                    <p className="text-xs text-on-surface-variant">
                      Último: {client.lastVisit}
                    </p>
                    <p
                      className={`text-xs font-medium ${
                        client.nextAppointment && client.nextAppointment !== "Sem agendamentos"
                          ? "text-tertiary"
                          : "text-on-surface-variant/70"
                      }`}
                    >
                      {client.nextAppointment
                        ? `Próximo: ${client.nextAppointment}`
                        : "Sem agendamentos"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/clientes/perfil?id=${client.id}`}
                      onClick={(e) => e.stopPropagation()}
                      className="p-1.5 hover:bg-primary/10 rounded-full transition-colors flex items-center justify-center text-primary"
                      title="Ver perfil do paciente"
                    >
                      <span className="material-symbols-outlined text-2xl">
                        chevron_right
                      </span>
                    </Link>
                    <button
                      onClick={(e) => handleDeleteClient(e, client.id)}
                      className="p-1.5 text-on-surface-variant/50 hover:text-error hover:bg-error/10 rounded-full transition-colors flex items-center justify-center"
                      title="Excluir paciente"
                    >
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Client Detail Preview (Right Sidebar Span) */}
        {selectedClient && (
          <div className="lg:col-span-5 xl:col-span-4 hidden lg:block">
            <div className="bg-surface-container-lowest/60 backdrop-blur-sm border border-white/40 shadow-sm rounded-2xl p-6 sticky top-28">
              {/* Detail Header */}
              <div className="flex flex-col items-center text-center mb-6">
                <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-primary mb-4 relative shadow-sm">
                  {selectedClient.avatar ? (
                    <img
                      alt={selectedClient.name}
                      className="w-full h-full object-cover"
                      src={selectedClient.avatar}
                    />
                  ) : (
                    <div className="w-full h-full bg-primary-container flex items-center justify-center text-primary font-serif text-3xl font-bold">
                      {selectedClient.initials}
                    </div>
                  )}
                  {selectedClient.isVip && (
                    <div className="absolute bottom-0 right-0 w-6 h-6 bg-tertiary-container rounded-full border-2 border-white flex items-center justify-center shadow-xs">
                      <span
                        className="material-symbols-outlined text-on-tertiary-container text-[14px]"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        star
                      </span>
                    </div>
                  )}
                </div>
                <h2 className="font-serif text-2xl font-semibold text-primary">
                  {selectedClient.name}
                </h2>
                <p className="text-sm text-on-surface-variant">
                  {selectedClient.memberSince}
                </p>
                <div className="flex gap-3 mt-4">
                  <button className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-primary hover:bg-primary-container transition-colors">
                    <span className="material-symbols-outlined">mail</span>
                  </button>
                  <button className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-primary hover:bg-primary-container transition-colors">
                    <span className="material-symbols-outlined">call</span>
                  </button>
                  <Link href={`/clientes/perfil?id=${selectedClient.id}`} className="px-4 py-2 bg-primary text-on-primary rounded-full text-xs font-medium hover:bg-primary/90 transition-colors">
                    Ver Perfil Completo
                  </Link>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-surface-container-lowest/80 rounded-xl p-3 text-center border border-outline-variant/20">
                  <p className="text-xs text-on-surface-variant mb-1">
                    Total de Visitas
                  </p>
                  <p className="font-serif text-2xl font-bold text-primary">
                    {selectedClient.totalVisits}
                  </p>
                </div>
                <div className="bg-surface-container-lowest/80 rounded-xl p-3 text-center border border-outline-variant/20">
                  <p className="text-xs text-on-surface-variant mb-1">
                    Valor em Vida
                  </p>
                  <p className="font-serif text-2xl font-bold text-primary">
                    {selectedClient.lifetimeValue}
                  </p>
                </div>
              </div>

              {/* Treatment History Snippet */}
              <div className="mb-6">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-primary mb-3 border-b border-outline-variant/30 pb-1">
                  Tratamentos Recentes
                </h4>
                <div className="flex flex-col gap-3">
                  {selectedClient.recentTreatments.length === 0 && (
                    <p className="text-xs text-on-surface-variant text-center">Nenhum tratamento registrado.</p>
                  )}
                  {selectedClient.recentTreatments.map((treatment, idx) => (
                    <div key={idx} className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-2 h-2 rounded-full ${treatment.colorClass}`}
                        ></div>
                        <p className="text-sm font-medium text-on-surface">
                          {treatment.name}
                        </p>
                      </div>
                      <p className="text-xs text-on-surface-variant">
                        {treatment.date}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-2xl w-full max-w-md p-6 shadow-xl relative border border-white/20">
            <h2 className="font-serif text-2xl font-semibold text-primary mb-6">
              Novo Paciente
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-on-surface-variant uppercase tracking-wider mb-1">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  value={newClientNome}
                  onChange={(e) => setNewClientNome(e.target.value)}
                  className="w-full bg-surface-container/50 border border-outline-variant/40 rounded-lg px-3 py-2 text-sm text-on-surface focus:outline-none focus:border-primary"
                  placeholder="Nome do paciente"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-on-surface-variant uppercase tracking-wider mb-1">
                  Telefone
                </label>
                <input
                  type="text"
                  value={newClientTelefone}
                  onChange={(e) => setNewClientTelefone(e.target.value)}
                  className="w-full bg-surface-container/50 border border-outline-variant/40 rounded-lg px-3 py-2 text-sm text-on-surface focus:outline-none focus:border-primary"
                  placeholder="(11) 99999-9999"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-on-surface-variant uppercase tracking-wider mb-1">
                  E-mail
                </label>
                <input
                  type="email"
                  value={newClientEmail}
                  onChange={(e) => setNewClientEmail(e.target.value)}
                  className="w-full bg-surface-container/50 border border-outline-variant/40 rounded-lg px-3 py-2 text-sm text-on-surface focus:outline-none focus:border-primary"
                  placeholder="paciente@email.com"
                />
              </div>
            </div>
            <div className="mt-8 flex gap-3 justify-end">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-on-surface hover:bg-surface-container transition-colors rounded-lg"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateClient}
                disabled={isCreating}
                className="px-4 py-2 bg-primary text-on-primary text-sm font-medium hover:bg-primary/90 transition-colors rounded-lg disabled:opacity-50"
              >
                {isCreating ? 'Salvando...' : 'Criar Paciente'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
