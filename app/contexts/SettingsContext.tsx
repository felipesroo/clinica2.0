"use client";

import React, { createContext, useContext, useState, useEffect, useTransition } from 'react';
import { getSettings, updateSettingsAction, ClinicSettings } from '../actions/settings';

interface SettingsContextType {
  settings: ClinicSettings | null;
  updateSettings: (newSettings: Partial<ClinicSettings>) => Promise<void>;
  isLoading: boolean;
}

const SettingsContext = createContext<SettingsContextType>({
  settings: null,
  updateSettings: async () => {},
  isLoading: true,
});

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<ClinicSettings | null>(null);
  const [isPending, startTransition] = useTransition();

  const fetchSettings = async () => {
    const data = await getSettings();
    setSettings(data);
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const updateSettings = async (newSettings: Partial<ClinicSettings>) => {
    await updateSettingsAction(newSettings);
    await fetchSettings();
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, isLoading: !settings || isPending }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  return useContext(SettingsContext);
}
