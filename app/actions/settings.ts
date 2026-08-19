"use server";

import { prisma } from '@/lib/prisma';
export interface ClinicSettings {
  nomeFantasia: string;
  razaoSocial: string;
  cnpj: string;
  inscricaoMun: string;
  email: string;
  whatsapp: string;
  cep: string;
  endereco: string;
  bairro: string;
  cidade: string;
  estado: string;
  instagram: string;
  logoUrl: string;
  googleRefreshToken?: string | null;
  wahaUrl?: string | null;
  wahaSessionName?: string | null;
  msgConfirmacaoAtiva: boolean;
  msgConfirmacaoTexto: string;
  msgLembreteAtiva: boolean;
  msgLembreteTexto: string;
  msgHoraLembrete: string;
  msgLembrete2hAtiva: boolean;
  msgLembrete2hTexto: string;
  openAiApiKey?: string | null;
  openAiSystemPrompt?: string | null;
  aiAgentActive?: boolean;
  aiAutoSchedule?: boolean;
  telefonePessoalDoutora?: string | null;
  agendaPessoalAtiva?: boolean;
  agendaPessoalHora?: string;
}

export async function getSettings(): Promise<ClinicSettings> {
  let settings = await prisma.configuracao.findUnique({
    where: { id: "1" }
  });

  if (!settings) {
    settings = await prisma.configuracao.create({
      data: {
        id: "1",
        nomeFantasia: "Clínica da Dra. Jordane Ferreira Faria",
        razaoSocial: "Dra. Jordane Ferreira Faria Estética Avançada",
        wahaUrl: "http://2.25.152.195:3005",
        wahaSessionName: "default",
        telefonePessoalDoutora: "62991346756",
        agendaPessoalAtiva: true,
        agendaPessoalHora: "08:00",
      }
    });
  }

  return {
    nomeFantasia: settings.nomeFantasia,
    razaoSocial: settings.razaoSocial,
    cnpj: settings.cnpj,
    inscricaoMun: settings.inscricaoMun,
    email: settings.email,
    whatsapp: settings.whatsapp,
    cep: settings.cep,
    endereco: settings.endereco,
    bairro: settings.bairro,
    cidade: settings.cidade,
    estado: settings.estado,
    instagram: settings.instagram,
    logoUrl: (!settings.logoUrl || settings.logoUrl.includes('lh3.googleusercontent.com')) ? '/logo.png' : settings.logoUrl,
    googleRefreshToken: settings.googleRefreshToken,
    wahaUrl: settings.wahaUrl,
    wahaSessionName: settings.wahaSessionName,
    msgConfirmacaoAtiva: settings.msgConfirmacaoAtiva,
    msgConfirmacaoTexto: settings.msgConfirmacaoTexto,
    msgLembreteAtiva: settings.msgLembreteAtiva,
    msgLembreteTexto: settings.msgLembreteTexto,
    msgHoraLembrete: settings.msgHoraLembrete,
    msgLembrete2hAtiva: settings.msgLembrete2hAtiva,
    msgLembrete2hTexto: settings.msgLembrete2hTexto,
    openAiApiKey: settings.openAiApiKey,
    openAiSystemPrompt: settings.openAiSystemPrompt,
    aiAgentActive: settings.aiAgentActive,
    aiAutoSchedule: settings.aiAutoSchedule,
    telefonePessoalDoutora: settings.telefonePessoalDoutora ?? "62991346756",
    agendaPessoalAtiva: settings.agendaPessoalAtiva ?? true,
    agendaPessoalHora: settings.agendaPessoalHora ?? "08:00",
  };
}

export async function updateSettingsAction(data: Partial<ClinicSettings>) {
  await prisma.configuracao.upsert({
    where: { id: "1" },
    update: data,
    create: {
      id: "1",
      ...data,
    }
  });
  return { success: true };
}

export async function disconnectGoogleCalendar() {
  await prisma.configuracao.update({
    where: { id: "1" },
    data: {
      googleRefreshToken: null
    }
  });
}

export async function sendWahaTestMessage(phone: string, customText?: string) {
  const { sendWhatsAppMessage } = await import('../../lib/whatsapp');
  const text = customText || "Olá! Esta é uma mensagem de teste do seu Sistema Clínica da Dra. Jordane Ferreira Faria. Sua integração WAHA está funcionando perfeitamente! 🎉";
  return await sendWhatsAppMessage(phone, text);
}
