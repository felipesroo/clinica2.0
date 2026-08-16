"use client";

import { useActionState, useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { loginUser } from '../actions/authActions';
import { getSettings } from '../actions/settings';

const DEFAULT_LOGO = "https://lh3.googleusercontent.com/aida-public/AB6AXuBJgqUJmq2CmUG03OfG0psHxEYIuhitDO52_gUwk8F8RZg2NQnbEhYfRLGQ5TidI1PQdXk00Xw7I42dbGfhFFQEO4Lu_WoZOLrCp7W_EXOKVCGjHQURkXvvR3DBTBDmMNMWA8d6IrcaGNCrutj-Skz2IYO8lG4mHVB7QbJOSq9toEYP-ZoPJQP2SX4QDMGSF_Yjnau6N9tAR7Ri2JHMYyGKVZnxkW7YzHBC8m-zSDH28mVq8AKWTzzqFA";

function LoginContent() {
  const [state, formAction, isPending] = useActionState(loginUser, null);
  const searchParams = useSearchParams();
  const urlError = searchParams.get('error');
  const [showPassword, setShowPassword] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [nomeFantasia, setNomeFantasia] = useState<string>("Estética Avançada");
  const [isLogoLoaded, setIsLogoLoaded] = useState(false);

  useEffect(() => {
    getSettings().then(settings => {
      setLogoUrl(settings.logoUrl || DEFAULT_LOGO);
      if (settings.nomeFantasia) setNomeFantasia(settings.nomeFantasia);
    }).catch(() => {
      setLogoUrl(DEFAULT_LOGO);
    }).finally(() => {
      setIsLogoLoaded(true);
    });
  }, []);

  const displayError = state?.error || (urlError ? decodeURIComponent(urlError) : null);

  return (
    <div className="min-h-screen w-full bg-[#121014] text-[#E8E0E5] flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Dynamic Background Gradients */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-tertiary/15 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md bg-surface-container-lowest/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl z-10">
        {/* Header Logo & Title */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-primary/40 shadow-lg mb-4 bg-black/40 flex items-center justify-center relative">
            {!isLogoLoaded ? (
              <div className="w-full h-full bg-white/5 animate-pulse flex items-center justify-center">
                <span className="material-symbols-outlined text-[#A08C98] animate-spin text-xl">progress_activity</span>
              </div>
            ) : (
              <img
                src={logoUrl || DEFAULT_LOGO}
                alt={nomeFantasia}
                className="w-full h-full object-cover animate-in fade-in duration-300"
              />
            )}
          </div>
          <h1 className="font-serif text-2xl md:text-3xl font-semibold text-[#F5E6EC] tracking-wide">
            {nomeFantasia}
          </h1>
          <p className="text-xs uppercase tracking-widest text-[#C8B2BC] mt-1 font-medium">
            Gestão Clínica & Estética Avançada
          </p>
        </div>

        {/* Error Notification */}
        {displayError && (
          <div className="mb-6 p-3 rounded-xl bg-error/20 border border-error/40 text-error text-xs font-medium text-center backdrop-blur-sm animate-in fade-in duration-150">
            {displayError}
          </div>
        )}

        {/* Login Form */}
        <form action={formAction} className="space-y-5">
          <div>
            <label className="block text-xs font-medium text-[#D0C0C8] mb-1.5 ml-1">
              E-mail de Acesso
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[18px] text-[#A08C98]">
                mail
              </span>
              <input
                type="email"
                name="email"
                required
                placeholder="seu.email@exemplo.com"
                className="w-full bg-[#1C1820]/90 border border-white/10 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl py-3 pl-11 pr-4 text-sm text-[#F5E6EC] placeholder-[#786672] outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#D0C0C8] mb-1.5 ml-1">
              Senha
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[18px] text-[#A08C98]">
                lock
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                required
                placeholder="••••••••"
                className="w-full bg-[#1C1820]/90 border border-white/10 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl py-3 pl-11 pr-11 text-sm text-[#F5E6EC] placeholder-[#786672] outline-none transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#A08C98] hover:text-[#E8E0E5] transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">
                  {showPassword ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-gradient-to-r from-primary via-primary/90 to-tertiary text-white font-medium py-3 rounded-xl hover:opacity-95 active:scale-[0.99] transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isPending ? (
              <span className="text-sm">Entrando...</span>
            ) : (
              <>
                <span className="text-sm font-semibold">Entrar no Sistema</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="my-6 flex items-center gap-3">
          <div className="flex-1 h-px bg-white/10" />
          <span className="text-[11px] text-[#907C88] uppercase tracking-wider font-medium">ou</span>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        {/* Google OAuth Button */}
        <a
          href="/api/auth/google/login"
          className="w-full bg-[#1C1820] hover:bg-[#25202B] border border-white/15 text-[#E8E0E5] font-medium py-3 rounded-xl transition-colors flex items-center justify-center gap-3 cursor-pointer shadow-sm text-sm"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#EA4335"
              d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.1 9 5 12 5z"
            />
            <path
              fill="#4285F4"
              d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
            />
            <path
              fill="#FBBC05"
              d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12 0 14.5s.7 4.8 1.9 7.2l3.7-2.9z"
            />
            <path
              fill="#34A853"
              d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.1-6.4-5.2L1.9 16C3.7 19.7 7.5 23 12 23z"
            />
          </svg>
          Entrar com o Google
        </a>

        {/* System Info Footer */}
        <div className="mt-8 pt-4 border-t border-white/5 text-center">
          <p className="text-[11px] text-[#806E7A]">
            Estética Avançada v2.0 • Sistema Restrito & Seguro
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen w-full bg-[#121014] text-[#E8E0E5] flex items-center justify-center p-4">
        <div className="text-sm font-medium text-[#C8B2BC]">Carregando...</div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
