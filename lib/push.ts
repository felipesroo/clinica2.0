import webpush from 'web-push';
import { prisma } from './prisma';

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || 'BODbqA3OkpEFpcnM8t35EDjdo2xQHa1fYLEdK_zYOUG0A73AyKCKykAQFHKEC2MICNw8VIU3R8M6y7M7W6lRHN8';
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || 'x7Azs-Muk4B3s_1BmCihIo9uLePapPXJQYTCFEOBa80';
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || 'mailto:contato@drajordanefaria.com';

// Configure VAPID details
try {
  webpush.setVapidDetails(
    VAPID_SUBJECT,
    VAPID_PUBLIC_KEY,
    VAPID_PRIVATE_KEY
  );
} catch (err) {
  console.error('Failed to configure web-push VAPID details:', err);
}

export interface PushNotificationPayload {
  title: string;
  body: string;
  url?: string;
  icon?: string;
  badge?: string;
  tag?: string;
}

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

/**
 * Dispatches a push notification to all subscribed mobile devices / browsers.
 * Automatically removes invalid or expired subscriptions.
 */
export async function sendPushNotification(payload: PushNotificationPayload) {
  try {
    await ensurePushTableExists();
    const subscriptions = await prisma.pushSubscription.findMany();
    if (subscriptions.length === 0) {
      console.log('[Push] No active push subscriptions found.');
      return { success: true, count: 0 };
    }

    console.log(`[Push] Sending push notification to ${subscriptions.length} device(s):`, payload.title);

    const stringifiedPayload = JSON.stringify({
      title: payload.title,
      body: payload.body,
      url: payload.url || '/agendamentos',
      icon: payload.icon || '/logo.png',
      badge: payload.badge || '/icons/icon-192x192.png',
      tag: payload.tag || 'clinica-notificacao',
    });

    const expiredIds: string[] = [];
    let sentCount = 0;

    await Promise.all(
      subscriptions.map(async (sub) => {
        try {
          const pushSubscription = {
            endpoint: sub.endpoint,
            keys: {
              p256dh: sub.p256dh,
              auth: sub.auth,
            },
          };

          await webpush.sendNotification(pushSubscription, stringifiedPayload);
          sentCount++;
        } catch (err: any) {
          // 404 or 410 indicates the subscription is expired or cancelled by user
          if (err.statusCode === 404 || err.statusCode === 410) {
            expiredIds.push(sub.id);
          } else {
            console.error(`[Push] Error sending to endpoint ${sub.endpoint.slice(0, 30)}...:`, err.message);
          }
        }
      })
    );

    // Clean up expired subscriptions
    if (expiredIds.length > 0) {
      await prisma.pushSubscription.deleteMany({
        where: { id: { in: expiredIds } },
      });
      console.log(`[Push] Cleaned up ${expiredIds.length} expired push subscription(s).`);
    }

    return { success: true, count: sentCount };
  } catch (error) {
    console.error('[Push] Fatal error sending push notifications:', error);
    return { success: false, error };
  }
}
