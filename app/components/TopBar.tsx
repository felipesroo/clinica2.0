'use client';

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { useTheme } from "../contexts/ThemeContext";
import { useSettings } from "../contexts/SettingsContext";
import { globalSearch } from "../actions/search";

export default function TopBar({ onMenuClick = () => {} }: { onMenuClick?: () => void }) {
  const { theme, toggleTheme } = useTheme();
  const { settings } = useSettings();
  const router = useRouter();

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<{ pacientes: any[], agendamentos: any[] }>({ pacientes: [], agendamentos: [] });
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (query.trim().length >= 2) {
        setIsSearching(true);
        const data = await globalSearch(query);
        setResults(data);
        setIsSearching(false);
        setShowDropdown(true);
      } else {
        setResults({ pacientes: [], agendamentos: [] });
        setShowDropdown(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const handlePatientClick = (id: string) => {
    setShowDropdown(false);
    setQuery("");
    router.push(`/clientes/perfil?id=${id}`);
  };

  const handleAppointmentClick = (id: string) => {
    setShowDropdown(false);
    setQuery("");
    // Right now, clicking an appointment in search goes to dashboard to see the agenda
    router.push(`/?date=${new Date().toISOString().split('T')[0]}`); // Just go to dashboard for now
  };

  return (
    <header className="flex justify-between items-center h-16 md:h-20 px-4 md:px-12 w-full bg-surface/40 backdrop-blur-md z-30 sticky top-0 border-b border-outline-variant/20 md:border-none shadow-sm shadow-primary/10">
      
      {/* Mobile Menu Button & Search */}
      <div className="flex-1 flex items-center gap-4">
        <button 
          onClick={onMenuClick}
          className="md:hidden p-2 -ml-2 text-on-surface hover:text-primary transition-colors"
        >
          <span className="material-symbols-outlined text-2xl">menu</span>
        </button>

        <button 
          onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
          className="md:hidden p-2 text-on-surface hover:text-primary transition-colors"
        >
          <span className="material-symbols-outlined text-xl">search</span>
        </button>
        
        <div className={`relative w-full max-w-sm ${isMobileSearchOpen ? 'block' : 'hidden md:block'}`} ref={searchRef}>
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">
            search
          </span>
          <input
            className="w-full bg-surface-container-lowest/60 border border-outline-variant/30 text-on-surface placeholder:text-on-surface-variant text-sm py-2 pl-12 pr-4 rounded-full focus:outline-none focus:ring-1 focus:ring-tertiary-fixed-dim focus:border-tertiary-fixed-dim transition-all"
            placeholder="Buscar pacientes, tratamentos ou datas..."
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => { if(query.trim().length >= 2) setShowDropdown(true); }}
          />

          {/* Search Dropdown */}
          {showDropdown && (
            <div className="absolute top-full mt-2 w-full max-w-md bg-surface-container-lowest border border-outline-variant/30 rounded-2xl shadow-xl shadow-shadow/5 overflow-hidden z-50">
              {isSearching ? (
                <div className="p-4 text-center text-sm text-on-surface-variant">Buscando...</div>
              ) : results.pacientes.length === 0 && results.agendamentos.length === 0 ? (
                <div className="p-4 text-center text-sm text-on-surface-variant">Nenhum resultado encontrado.</div>
              ) : (
                <div className="max-h-96 overflow-y-auto">
                  
                  {results.pacientes.length > 0 && (
                    <div className="p-2 border-b border-outline-variant/20">
                      <h4 className="px-3 py-2 text-xs font-bold text-primary uppercase tracking-wider">Pacientes</h4>
                      {results.pacientes.map((p) => (
                        <button
                          key={p.id}
                          onClick={() => handlePatientClick(p.id)}
                          className="w-full text-left px-3 py-2 hover:bg-surface-variant/40 rounded-xl transition-colors flex flex-col"
                        >
                          <span className="text-sm font-medium text-on-surface">{p.nome}</span>
                          {p.telefone && <span className="text-xs text-on-surface-variant">{p.telefone}</span>}
                        </button>
                      ))}
                    </div>
                  )}

                  {results.agendamentos.length > 0 && (
                    <div className="p-2">
                      <h4 className="px-3 py-2 text-xs font-bold text-tertiary uppercase tracking-wider">Agendamentos</h4>
                      {results.agendamentos.map((a) => (
                        <button
                          key={a.id}
                          onClick={() => handleAppointmentClick(a.id)}
                          className="w-full text-left px-3 py-2 hover:bg-surface-variant/40 rounded-xl transition-colors flex flex-col"
                        >
                          <span className="text-sm font-medium text-on-surface">{a.service} - {a.cliente?.nome}</span>
                          <span className="text-xs text-on-surface-variant">
                            {new Date(a.date).toLocaleDateString('pt-BR')} às {a.startTime}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}

                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Action Buttons */}
      <div className="flex items-center space-x-1.5 sm:space-x-2 md:space-x-4">
        <Link
          href="/configuracoes?tab=app"
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 hover:bg-primary/20 active:scale-95 text-primary rounded-xl text-xs font-semibold transition-all border border-primary/20 shadow-2xs"
          title="Instalar App no Celular"
        >
          <span className="material-symbols-outlined text-[16px]">install_mobile</span>
          <span>App</span>
        </Link>
        <button onClick={toggleTheme} className="relative p-2 text-on-surface-variant hover:text-primary transition-all rounded-full hover:bg-surface-container">
          <span className="material-symbols-outlined">{theme === 'dark' ? 'light_mode' : 'dark_mode'}</span>
        </button>
        <button className="relative p-2 text-on-surface-variant hover:text-primary transition-all rounded-full hover:bg-surface-container">
          <span className="material-symbols-outlined">notifications</span>
          <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-error rounded-full border-2 border-surface"></span>
        </button>
        <button className="hidden md:block relative p-2 text-on-surface-variant hover:text-primary transition-all rounded-full hover:bg-surface-container">
          <span className="material-symbols-outlined">chat_bubble</span>
        </button>
        <div className="hidden md:block w-px h-8 bg-outline-variant/30"></div>
        <Link href="/configuracoes">
          {settings?.logoUrl && (
            <img
              alt="Practitioner Profile"
              className="w-10 h-10 rounded-full object-cover cursor-pointer border-2 border-white shadow-sm"
              src={settings.logoUrl}
            />
          )}
        </Link>
      </div>
    </header>
  );
}
