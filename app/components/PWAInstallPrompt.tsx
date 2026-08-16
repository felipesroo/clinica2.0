"use client";

import { useState, useEffect } from "react";

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  useEffect(() => {
    // 1. Register Service Worker
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => {
          console.log("[PWA] Service worker registered with scope:", reg.scope);
        })
        .catch((err) => {
          console.error("[PWA] Service worker registration failed:", err);
        });
    }

    // 2. Check if already installed / running in standalone mode
    const isStandaloneMode =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true;
    setIsStandalone(isStandaloneMode);

    if (isStandaloneMode) {
      return; // Already installed as PWA!
    }

    // 3. Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    // Check if dismissed previously within last 7 days
    const dismissedTime = localStorage.getItem("pwa_prompt_dismissed");
    if (dismissedTime && Date.now() - parseInt(dismissedTime, 10) < 7 * 24 * 60 * 60 * 1000) {
      return;
    }

    // 4. Capture beforeinstallprompt event (Android / Chromium)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // If iOS and not standalone, show prompt after a short delay (3 seconds)
    if (isIosDevice) {
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 3000);
      return () => {
        clearTimeout(timer);
        window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      };
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        console.log("[PWA] User accepted install prompt");
      }
      setDeferredPrompt(null);
      setShowPrompt(false);
    } else if (isIOS) {
      setShowIOSGuide(true);
    }
  };

  const handleDismiss = () => {
    localStorage.setItem("pwa_prompt_dismissed", Date.now().toString());
    setShowPrompt(false);
    setShowIOSGuide(false);
  };

  if (isStandalone || !showPrompt) return null;

  return (
    <>
      {/* Floating Bottom Install Banner for Mobile */}
      <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-sm z-50 animate-in slide-in-from-bottom-5 duration-300">
        <div className="bg-surface-container-lowest/95 backdrop-blur-md border border-primary/20 p-4 rounded-2xl shadow-2xl flex items-center gap-3.5">
          <img
            src="/icons/icon-192x192.png"
            alt="Dra. Jordane App"
            className="w-12 h-12 rounded-xl shadow-md object-cover shrink-0 border border-white/40"
          />
          
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold text-on-surface truncate">
              Instalar Aplicativo
            </h4>
            <p className="text-[11px] text-on-surface-variant line-clamp-1">
              Acesso rápido e direto da tela de início do seu celular
            </p>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={handleInstallClick}
              className="px-3 py-1.5 bg-primary text-on-primary text-xs font-semibold rounded-xl shadow-xs hover:bg-primary/90 active:scale-95 transition-all flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[15px]">download</span>
              <span>Instalar</span>
            </button>
            <button
              onClick={handleDismiss}
              className="w-7 h-7 flex items-center justify-center text-on-surface-variant hover:text-on-surface rounded-lg hover:bg-surface-container"
              title="Dispensar"
              aria-label="Dispensar"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>
        </div>
      </div>

      {/* iOS Instructions Modal */}
      {showIOSGuide && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-3xl w-full max-w-sm p-6 shadow-2xl relative border border-white/20 animate-in slide-in-from-bottom-4 duration-200 text-center">
            <button
              onClick={() => setShowIOSGuide(false)}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-surface-container text-on-surface-variant"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>

            <img
              src="/icons/icon-192x192.png"
              alt="Dra. Jordane App"
              className="w-16 h-16 rounded-2xl mx-auto shadow-lg mb-3 object-cover border-2 border-white"
            />

            <h3 className="font-serif text-lg font-bold text-primary mb-1">
              Instalar no iPhone / iPad
            </h3>
            <p className="text-xs text-on-surface-variant mb-5">
              Siga os 2 passos rápidos no Safari para fixar o app na sua tela de início:
            </p>

            <div className="space-y-3 text-left mb-6">
              <div className="flex items-center gap-3 p-3 bg-surface-container/60 rounded-xl border border-outline-variant/20">
                <span className="w-7 h-7 rounded-full bg-primary text-on-primary flex items-center justify-center text-xs font-bold shrink-0">
                  1
                </span>
                <p className="text-xs text-on-surface">
                  Toque no botão <strong className="text-primary">Compartilhar</strong> (ícone do quadrado com a seta para cima <span className="material-symbols-outlined inline-block align-middle text-[16px]">ios_share</span>) na barra inferior do Safari.
                </p>
              </div>

              <div className="flex items-center gap-3 p-3 bg-surface-container/60 rounded-xl border border-outline-variant/20">
                <span className="w-7 h-7 rounded-full bg-primary text-on-primary flex items-center justify-center text-xs font-bold shrink-0">
                  2
                </span>
                <p className="text-xs text-on-surface">
                  Role para baixo e toque em <strong className="text-primary">"Adicionar à Tela de Início"</strong> (<span className="material-symbols-outlined inline-block align-middle text-[16px]">add_box</span>).
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowIOSGuide(false)}
              className="w-full py-2.5 bg-primary text-on-primary text-xs font-semibold rounded-xl hover:bg-primary/90 transition-colors shadow-xs"
            >
              Entendido!
            </button>
          </div>
        </div>
      )}
    </>
  );
}
