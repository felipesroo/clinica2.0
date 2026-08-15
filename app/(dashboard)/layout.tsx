"use client";

import { useState } from "react";
import Sidebar from "../components/Sidebar";
import TopBar from "../components/TopBar";
import { SettingsProvider } from "../contexts/SettingsContext";
import { ClinicProvider } from "../contexts/ClinicContext";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  return (
    <SettingsProvider>
      <ClinicProvider>
        <div className="flex min-h-screen bg-background">
          <Sidebar isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
          <div className="flex-1 md:ml-64 flex flex-col min-h-screen min-w-0 max-w-full overflow-x-hidden">
            <TopBar onMenuClick={() => setIsMobileMenuOpen(true)} />
            <main className="flex-1 p-3 sm:p-4 md:p-8 lg:p-12 overflow-y-auto min-w-0 max-w-full">
              {children}
            </main>
          </div>
        </div>
      </ClinicProvider>
    </SettingsProvider>
  );
}
