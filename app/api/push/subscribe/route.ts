import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendPushNotification } from '@/lib/push';

// Helper to ensure the PushSubscription table exists in PostgreSQL
async function ensurePushTableExists() {
  try {
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "PushSubscription" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "endpoint" TEXT NOT NULL UNIQUE,
        "p256dh" TEXT NOT NULL,
        "auth" TEXT NOT NULL,
        "userAgent" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
  } catch (err) {
    console.error('[Push] ensurePushTableExists error:', err);
  }
}

// POST /api/push/subscribe — Cadastrar dispositivo para receber notificações push
export async function POST(request: Request) {
  try {
    await ensurePushTableExists();

    const body = await request.json();
    const { subscription, userAgent } = body;

    if (!subscription || !subscription.endpoint) {
      return NextResponse.json({ error: 'Dados de inscrição inválidos (endpoint ausente).' }, { status: 400 });
    }

    const endpoint = subscription.endpoint;
    const p256dh = subscription.keys?.p256dh || subscription.p256dh;
    const auth = subscription.keys?.auth || subscription.auth;

    if (!p256dh || !auth) {
      return NextResponse.json({ error: 'Chaves criptográficas (p256dh/auth) ausentes.' }, { status: 400 });
    }

    const saved = await prisma.pushSubscription.upsert({
      where: { endpoint },
      update: {
        p256dh,
        auth,
        userAgent: userAgent || request.headers.get('user-agent') || 'Dispositivo',
        updatedAt: new Date(),
      },
      create: {
        endpoint,
        p256dh,
        auth,
        userAgent: userAgent || request.headers.get('user-agent') || 'Dispositivo',
      },
    });

    console.log('[Push] Subscription registered successfully:', saved.id);

    return NextResponse.json({ success: true, id: saved.id });
  } catch (error: any) {
    console.error('[Push] Error subscribing device:', error);
    return NextResponse.json({ error: error.message || 'Erro ao registrar dispositivo.' }, { status: 500 });
  }
}

// DELETE /api/push/subscribe — Remover inscrição
export async function DELETE(request: Request) {
  try {
    await ensurePushTableExists();
    const body = await request.json();
    const { endpoint } = body;

    if (!endpoint) {
      return NextResponse.json({ error: 'Endpoint ausente.' }, { status: 400 });
    }

    await prisma.pushSubscription.deleteMany({
      where: { endpoint },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[Push] Error unsubscribing device:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// GET /api/push/subscribe — Testar envio de notificação push imediata
export async function GET() {
  try {
    await ensurePushTableExists();
    const result = await sendPushNotification({
      title: '🌸 Notificações Ativadas!',
      body: 'Seu celular está conectado para receber alertas de atendimentos e agenda da Dra. Jordane.',
      url: '/agendamentos',
      tag: 'teste-ativacao',
    });

    return NextResponse.json({ success: true, count: result.count });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
