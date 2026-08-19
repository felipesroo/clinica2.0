'use client';

import { useState, useEffect } from 'react';

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || 'BODbqA3OkpEFpcnM8t35EDjdo2xQHa1fYLEdK_zYOUG0A73AyKCKykAQFHKEC2MICNw8VIU3R8M6y7M7W6lRHN8';

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export default function PushNotificationManager() {
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(false);

  useEffect(() => {
    // Check if dismissed in this session
    if (sessionStorage.getItem('push_banner_dismissed') === 'true') {
      setBannerDismissed(true);
    }

    if ('serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window) {
      setIsSupported(true);
      registerServiceWorker();
    }
  }, []);

  async function registerServiceWorker() {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      const subscription = await registration.pushManager.getSubscription();
      setIsSubscribed(!!subscription);
    } catch (err) {
      console.error('[Push] Service Worker registration failed:', err);
    }
  }

  async function subscribeToPush() {
    setLoading(true);
    try {
      // 1. Request notification permission
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        alert('Permissão de notificação negada no navegador/celular.');
        setLoading(false);
        return;
      }

      // 2. Register service worker and subscribe
      const registration = await navigator.serviceWorker.ready;
      const convertedVapidKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedVapidKey,
      });

      // 3. Save subscription to server database
      const response = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscription,
          userAgent: navigator.userAgent,
        }),
      });

      if (response.ok) {
        setIsSubscribed(true);
        // Trigger immediate welcome test push
        await fetch('/api/push/subscribe');
        alert('✅ Notificações ativadas com sucesso! Você receberá alertas na barra do seu celular.');
      } else {
        alert('Erro ao registrar dispositivo no servidor.');
      }
    } catch (error: any) {
      console.error('[Push] Subscription error:', error);
      alert(`Falha ao ativar notificações: ${error.message || error}`);
    } finally {
      setLoading(false);
    }
  }

  function handleDismiss() {
    setBannerDismissed(true);
    sessionStorage.setItem('push_banner_dismissed', 'true');
  }

  if (!isSupported || isSubscribed || bannerDismissed) {
    return null;
  }

  return (
    <div className="fixed bottom-20 sm:bottom-6 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-40 animate-slide-up">
      <div className="bg-surface-container-lowest/95 backdrop-blur-md border border-primary/20 shadow-xl rounded-2xl p-4 flex items-start gap-3.5">
        <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
          <span className="material-symbols-outlined text-[22px]">notifications_active</span>
        </div>

        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-on-surface">Ativar Alertas no Celular</h4>
          <p className="text-xs text-on-surface-variant mt-0.5 leading-relaxed">
            Receba lembretes 2h antes de cada atendimento e o resumo da agenda diária na barra do celular.
          </p>

          <div className="flex items-center gap-2 mt-3">
            <button
              onClick={subscribeToPush}
              disabled={loading}
              className="px-4 py-1.5 bg-primary text-on-primary rounded-xl text-xs font-medium hover:bg-primary/90 transition-colors shadow-xs flex items-center gap-1.5 disabled:opacity-60"
            >
              <span className="material-symbols-outlined text-[16px]">
                {loading ? 'hourglass_top' : 'notifications'}
              </span>
              {loading ? 'Ativando...' : 'Ativar Alertas'}
            </button>

            <button
              onClick={handleDismiss}
              className="px-3 py-1.5 text-xs text-on-surface-variant hover:text-on-surface transition-colors font-medium"
            >
              Agora não
            </button>
          </div>
        </div>

        <button
          onClick={handleDismiss}
          className="text-on-surface-variant/50 hover:text-on-surface-variant p-1 -mr-1 -mt-1 rounded-lg"
          aria-label="Fechar"
        >
          <span className="material-symbols-outlined text-[18px]">close</span>
        </button>
      </div>
    </div>
  );
}
