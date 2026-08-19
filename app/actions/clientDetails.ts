"use server";

import { prisma } from '@/lib/prisma';
// -- FOTOS DA GALERIA --

export async function getClientPhotos(clienteId: string) {
  const fotos = await prisma.clienteFoto.findMany({
    where: { clienteId },
    orderBy: { data: 'desc' }
  });
  return fotos.map((f: any) => ({
    id: f.id,
    clienteId: f.clienteId,
    url: f.url,
    tipo: f.tipo,
    data: f.data?.toISOString() ?? null,
  }));
}

export async function addClientPhoto(data: {
  clienteId: string;
  url: string;
  tipo: string;
}) {
  const foto = await prisma.clienteFoto.create({ data });
  return {
    id: foto.id,
    clienteId: foto.clienteId,
    url: foto.url,
    tipo: foto.tipo,
    data: foto.data?.toISOString() ?? null,
  };
}

export async function deleteClientPhoto(id: string) {
  await prisma.clienteFoto.delete({ where: { id } });
  return { success: true };
}

// -- PRONTUÁRIOS --

export async function getClientRecords(clienteId: string) {
  const prontuarios = await prisma.clienteProntuario.findMany({
    where: { clienteId },
    orderBy: { data: 'desc' }
  });
  return prontuarios.map((p: any) => ({
    id: p.id,
    clienteId: p.clienteId,
    titulo: p.titulo,
    texto: p.texto,
    data: p.data?.toISOString() ?? null,
  }));
}

export async function addClientRecord(data: {
  clienteId: string;
  titulo: string;
  texto: string;
}) {
  const record = await prisma.clienteProntuario.create({ data });
  return {
    id: record.id,
    clienteId: record.clienteId,
    titulo: record.titulo,
    texto: record.texto,
    data: record.data?.toISOString() ?? null,
  };
}

export async function updateClientRecord(id: string, data: {
  titulo: string;
  texto: string;
}) {
  const record = await prisma.clienteProntuario.update({
    where: { id },
    data
  });
  return {
    id: record.id,
    clienteId: record.clienteId,
    titulo: record.titulo,
    texto: record.texto,
    data: record.data?.toISOString() ?? null,
  };
}

export async function deleteClientRecord(id: string) {
  await prisma.clienteProntuario.delete({ where: { id } });
  return { success: true };
}
