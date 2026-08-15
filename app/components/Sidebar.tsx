"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSettings } from "../contexts/SettingsContext";

const navItems = [
  { href: "/", label: "Dashboard", icon: "dashboard" },
  { href: "/agendamentos", label: "Agendamentos", icon: "calendar_today" },
  { href: "/clientes", label: "Pacientes", icon: "group" },
  { href: "/estoque", label: "Estoque", icon: "inventory_2" },
  { href: "/relatorios", label: "Relatórios", icon: "bar_chart" },
  { href: "/perfil", label: "Perfil da Clínica", icon: "storefront" },
  { href: "/configuracoes", label: "Configurações", icon: "settings" },
];

export default function Sidebar({ isOpen = false, onClose = () => {} }: { isOpen?: boolean, onClose?: () => void }) {
  const pathname = usePathname();
  const { settings } = useSettings();

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
          onClick={onClose}
        />
      )}

      <nav className={`flex flex-col h-full py-8 md:py-12 px-4 w-64 fixed left-0 top-0 bg-surface-container-lowest md:bg-surface-container-low/40 md:backdrop-blur-xl border-r border-outline-variant/30 md:border-white/50 z-50 transition-transform duration-300 ease-in-out ${
        isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      }`}>
      <div className="mb-12 px-4 flex flex-col items-center text-center">
        {settings?.logoUrl && (
          <img
            alt="Clinic Logo"
            className="w-16 h-16 rounded-full mb-4 object-cover border-2 border-white shadow-sm"
            src={settings.logoUrl}
          />
        )}
        <h1 className="font-serif text-xl text-primary mb-1">
          {settings?.nomeFantasia || "Clínica da Dra. Jordane Ferreira Faria"}
        </h1>
        <p className="text-xs text-on-surface-variant uppercase tracking-wider">
          Gestão Clínica
        </p>
      </div>

      <ul className="flex-1 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={onClose}
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all text-sm group ${
                  isActive
                    ? "text-primary font-bold bg-primary-container/50"
                    : "text-on-surface-variant font-medium hover:bg-primary-fixed/20"
                }`}
              >
                <span
                  className="material-symbols-outlined"
                  style={
                    isActive
                      ? { fontVariationSettings: "'FILL' 1" }
                      : undefined
                  }
                >
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>

      <div className="mt-auto pt-8">
        <Link
          href="/agendamentos"
          onClick={onClose}
          className="w-full py-3 px-4 rounded-xl text-xs bg-primary text-on-primary hover:bg-primary/90 transition-colors flex items-center justify-center space-x-2 font-medium uppercase tracking-wider shadow-sm"
        >
          <span className="material-symbols-outlined">add</span>
          <span>Novo Agendamento</span>
        </Link>
      </div>
    </nav>
    </>
  );
}
