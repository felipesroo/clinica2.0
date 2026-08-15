"use client";

import { useState, useEffect } from "react";
import { useSettings } from "../../contexts/SettingsContext";

export default function PerfilPage() {
  const { settings, updateSettings, isLoading } = useSettings();
  
  const [formData, setFormData] = useState({
    email: "",
    whatsapp: "",
    instagram: "",
    nomeFantasia: "",
    razaoSocial: "",
    cnpj: "",
    inscricaoMunicipal: "",
    cep: "",
    endereco: "",
    bairro: "",
    cidade: "",
    estado: "",
  });
  
  const [logoUrl, setLocalLogoUrl] = useState("");
  const [savedMessage, setSavedMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (settings) {
      setFormData({
        email: settings.email || "",
        whatsapp: settings.whatsapp || "",
        instagram: settings.instagram || "",
        nomeFantasia: settings.nomeFantasia || "",
        razaoSocial: settings.razaoSocial || "",
        cnpj: settings.cnpj || "",
        inscricaoMunicipal: settings.inscricaoMun || "",
        cep: settings.cep || "",
        endereco: settings.endereco || "",
        bairro: settings.bairro || "",
        cidade: settings.cidade || "",
        estado: settings.estado || "SP",
      });
      setLocalLogoUrl(settings.logoUrl || "");
    }
  }, [settings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    await updateSettings({
      email: formData.email,
      whatsapp: formData.whatsapp,
      instagram: formData.instagram,
      nomeFantasia: formData.nomeFantasia,
      razaoSocial: formData.razaoSocial,
      cnpj: formData.cnpj,
      inscricaoMun: formData.inscricaoMunicipal,
      cep: formData.cep,
      endereco: formData.endereco,
      bairro: formData.bairro,
      cidade: formData.cidade,
      estado: formData.estado,
      logoUrl: logoUrl,
    });
    setIsSaving(false);
    setSavedMessage("Alterações salvas com sucesso!");
    setTimeout(() => {
      setSavedMessage("");
    }, 3000);
  };

  const handleCancel = () => {
    if (settings) {
      setFormData({
        email: settings.email || "",
        whatsapp: settings.whatsapp || "",
        instagram: settings.instagram || "",
        nomeFantasia: settings.nomeFantasia || "",
        razaoSocial: settings.razaoSocial || "",
        cnpj: settings.cnpj || "",
        inscricaoMunicipal: settings.inscricaoMun || "",
        cep: settings.cep || "",
        endereco: settings.endereco || "",
        bairro: settings.bairro || "",
        cidade: settings.cidade || "",
        estado: settings.estado || "SP",
      });
      setLocalLogoUrl(settings.logoUrl || "");
    }
    setSavedMessage("");
  };

  if (isLoading) {
    return <div className="p-8 text-on-surface-variant text-center font-medium">Carregando configurações...</div>;
  }

  return (
    <div className="space-y-8 max-w-[1440px] mx-auto pb-16">
      {/* Header */}
      <div>
        <h1 className="font-serif text-2xl md:text-3xl text-primary mb-2">
          Perfil da Clínica
        </h1>
        <p className="text-base text-on-surface-variant max-w-2xl">
          Gerencie as informações públicas e dados de contato da sua unidade {formData.nomeFantasia || "Clínica da Dra. Jordane Ferreira Faria"}.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left Column: Identity & Contact */}
        <div className="col-span-1 md:col-span-4 flex flex-col gap-6">
          {/* Visual Identity Card */}
          <section className="bg-surface-container-lowest/60 backdrop-blur-sm border border-white/40 shadow-sm rounded-2xl p-6">
            <h2 className="font-serif text-xl text-primary mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">image</span>
              Identidade Visual
            </h2>
            <div className="flex flex-col items-center justify-center gap-4">
              <label className="relative group cursor-pointer">
                <div className="w-32 h-32 rounded-full border-2 border-primary-container overflow-hidden bg-surface-container flex items-center justify-center shadow-sm">
                  {logoUrl ? (
                    <img
                      alt="Logotipo da Clínica"
                      className="w-full h-full object-cover"
                      src={logoUrl}
                    />
                  ) : (
                    <span className="material-symbols-outlined text-4xl text-on-surface-variant">broken_image</span>
                  )}
                </div>
                <div className="absolute inset-0 bg-primary/20 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span
                    className="material-symbols-outlined text-white"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    upload
                  </span>
                </div>
                <input 
                  type="file" 
                  className="hidden" 
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      const file = e.target.files[0];
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setLocalLogoUrl(reader.result as string);
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
              </label>
              <div className="text-center">
                <p className="text-sm font-medium text-on-surface mb-1">Logotipo Principal</p>
                <p className="text-xs text-on-surface-variant">Recomendado: PNG 500x500px</p>
              </div>
            </div>
          </section>

          {/* Contact Channels Card */}
          <section className="bg-surface-container-lowest/60 backdrop-blur-sm border border-white/40 shadow-sm rounded-2xl p-6">
            <h2 className="font-serif text-xl text-primary mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">connect_without_contact</span>
              Canais de Contato
            </h2>
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-medium text-on-surface-variant mb-1">
                  E-mail Profissional
                </label>
                <input
                  className="w-full bg-surface-container/40 border border-outline-variant/30 focus:border-primary focus:ring-0 rounded-xl px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-variant/50 outline-none transition-all"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-on-surface-variant mb-1">
                  WhatsApp (Agendamentos)
                </label>
                <input
                  className="w-full bg-surface-container/40 border border-outline-variant/30 focus:border-primary focus:ring-0 rounded-xl px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-variant/50 outline-none transition-all"
                  type="tel"
                  value={formData.whatsapp}
                  onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-on-surface-variant mb-1">
                  Instagram (URL)
                </label>
                <input
                  className="w-full bg-surface-container/40 border border-outline-variant/30 focus:border-primary focus:ring-0 rounded-xl px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-variant/50 outline-none transition-all"
                  type="url"
                  value={formData.instagram}
                  onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                />
              </div>
            </div>
          </section>
        </div>

        {/* Right Column: General Info & Location */}
        <div className="col-span-1 md:col-span-8 flex flex-col gap-6">
          {/* General Info Card */}
          <section className="bg-surface-container-lowest/60 backdrop-blur-sm border border-white/40 shadow-sm rounded-2xl p-6 md:p-8">
            <h2 className="font-serif text-xl text-primary mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">storefront</span>
              Informações Gerais
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="col-span-1 md:col-span-2">
                <label className="block text-xs font-medium text-on-surface-variant mb-1">
                  Nome Fantasia
                </label>
                <input
                  className="w-full bg-surface-container/40 border border-outline-variant/30 focus:border-primary focus:ring-0 rounded-xl px-4 py-3 text-sm text-on-surface outline-none transition-all"
                  type="text"
                  value={formData.nomeFantasia}
                  onChange={(e) => setFormData({ ...formData, nomeFantasia: e.target.value })}
                />
              </div>
              <div className="col-span-1 md:col-span-2">
                <label className="block text-xs font-medium text-on-surface-variant mb-1">
                  Razão Social
                </label>
                <input
                  className="w-full bg-surface-container/40 border border-outline-variant/30 focus:border-primary focus:ring-0 rounded-xl px-4 py-3 text-sm text-on-surface outline-none transition-all"
                  type="text"
                  value={formData.razaoSocial}
                  onChange={(e) => setFormData({ ...formData, razaoSocial: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-on-surface-variant mb-1">
                  CNPJ
                </label>
                <input
                  className="w-full bg-surface-container/40 border border-outline-variant/30 focus:border-primary focus:ring-0 rounded-xl px-4 py-3 text-sm text-on-surface outline-none transition-all"
                  type="text"
                  value={formData.cnpj}
                  onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-on-surface-variant mb-1">
                  Inscrição Municipal
                </label>
                <input
                  className="w-full bg-surface-container/40 border border-outline-variant/30 focus:border-primary focus:ring-0 rounded-xl px-4 py-3 text-sm text-on-surface outline-none transition-all"
                  type="text"
                  value={formData.inscricaoMunicipal}
                  onChange={(e) =>
                    setFormData({ ...formData, inscricaoMunicipal: e.target.value })
                  }
                />
              </div>
            </div>
          </section>

          {/* Location Card */}
          <section className="bg-surface-container-lowest/60 backdrop-blur-sm border border-white/40 shadow-sm rounded-2xl p-6 md:p-8">
            <div className="flex justify-between items-start mb-6">
              <h2 className="font-serif text-xl text-primary flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">location_on</span>
                Localização
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              <div className="col-span-1 md:col-span-4">
                <label className="block text-xs font-medium text-on-surface-variant mb-1">
                  CEP
                </label>
                <input
                  className="w-full bg-surface-container/40 border border-outline-variant/30 focus:border-primary focus:ring-0 rounded-xl px-4 py-3 text-sm text-on-surface outline-none transition-all"
                  type="text"
                  value={formData.cep}
                  onChange={(e) => setFormData({ ...formData, cep: e.target.value })}
                />
              </div>
              <div className="col-span-1 md:col-span-8">
                <label className="block text-xs font-medium text-on-surface-variant mb-1">
                  Endereço Completo
                </label>
                <input
                  className="w-full bg-surface-container/40 border border-outline-variant/30 focus:border-primary focus:ring-0 rounded-xl px-4 py-3 text-sm text-on-surface outline-none transition-all"
                  type="text"
                  value={formData.endereco}
                  onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
                />
              </div>
              <div className="col-span-1 md:col-span-5">
                <label className="block text-xs font-medium text-on-surface-variant mb-1">
                  Bairro
                </label>
                <input
                  className="w-full bg-surface-container/40 border border-outline-variant/30 focus:border-primary focus:ring-0 rounded-xl px-4 py-3 text-sm text-on-surface outline-none transition-all"
                  type="text"
                  value={formData.bairro}
                  onChange={(e) => setFormData({ ...formData, bairro: e.target.value })}
                />
              </div>
              <div className="col-span-1 md:col-span-5">
                <label className="block text-xs font-medium text-on-surface-variant mb-1">
                  Cidade
                </label>
                <input
                  className="w-full bg-surface-container/40 border border-outline-variant/30 focus:border-primary focus:ring-0 rounded-xl px-4 py-3 text-sm text-on-surface outline-none transition-all"
                  type="text"
                  value={formData.cidade}
                  onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
                />
              </div>
              <div className="col-span-1 md:col-span-2">
                <label className="block text-xs font-medium text-on-surface-variant mb-1">
                  Estado
                </label>
                <select
                  className="w-full bg-surface-container/40 border border-outline-variant/30 focus:border-primary focus:ring-0 rounded-xl px-4 py-3 text-sm text-on-surface outline-none transition-all cursor-pointer"
                  value={formData.estado}
                  onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                >
                  <option value="SP">SP</option>
                  <option value="RJ">RJ</option>
                  <option value="MG">MG</option>
                  <option value="PR">PR</option>
                  <option value="RS">RS</option>
                  <option value="SC">SC</option>
                  <option value="ES">ES</option>
                  <option value="BA">BA</option>
                  <option value="DF">DF</option>
                  <option value="GO">GO</option>
                </select>
              </div>
            </div>
          </section>

          {/* Action Bar */}
          <div className="flex items-center justify-end gap-4 mt-4">
            {savedMessage && (
              <span className="text-sm font-medium text-tertiary transition-all">
                {savedMessage}
              </span>
            )}
            <button
              className="px-6 py-3 rounded-xl text-sm font-medium text-on-surface-variant hover:bg-surface-container-high transition-colors"
              type="button"
              onClick={handleCancel}
              disabled={isSaving}
            >
              Cancelar
            </button>
            <button
              className="bg-primary text-on-primary hover:bg-primary/90 transition-all shadow-sm rounded-xl px-8 py-3 text-sm font-medium flex items-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
              type="submit"
              disabled={isSaving}
            >
              <span className="material-symbols-outlined text-[18px]">
                {isSaving ? "hourglass_empty" : "save"}
              </span>
              {isSaving ? "Salvando..." : "Salvar Alterações"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
