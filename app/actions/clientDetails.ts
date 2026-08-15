"use server";

import { prisma } from '@/lib/prisma';
// -- FOTOS DA GALERIA --

export async function getClientPhotos(clienteId: string) {
  return await prisma.clienteFoto.findMany({
    where: { clienteId },
    orderBy: { data: 'desc' }
  });
}

export async function addClientPhoto(data: {
  clienteId: string;
  url: string;
  tipo: string;
}) {
  return await prisma.clienteFoto.create({
    data
  });
}

export async function deleteClientPhoto(id: string) {
  return await prisma.clienteFoto.delete({
    where: { id }
  });
}

// -- PRONTUÁRIOS --

export async function getClientRecords(clienteId: string) {
  return await prisma.clienteProntuario.findMany({
    where: { clienteId },
    orderBy: { data: 'desc' }
  });
}

export async function addClientRecord(data: {
  clienteId: string;
  titulo: string;
  texto: string;
}) {
  return await prisma.clienteProntuario.create({
    data
  });
}

export async function updateClientRecord(id: string, data: {
  titulo: string;
  texto: string;
}) {
  return await prisma.clienteProntuario.update({
    where: { id },
    data
  });
}

export async function deleteClientRecord(id: string) {
  return await prisma.clienteProntuario.delete({
    where: { id }
  });
}
