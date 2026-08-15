"use client";

import { createContext, useContext, useState, useEffect, useTransition } from "react";
import { getAppointments, createAppointment, updateAppointment as updateApptAction, deleteAppointment as deleteApptAction } from "../actions/clinic";

export interface Appointment {
  id: string;
  patientName: string;
  patientPhone?: string;
  service: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  duration: number; // minutes
  googleEventId?: string;
  isExternal?: boolean;
  clienteId?: string;
  valor?: string;
  formaPagamento?: string;
  numeroParcelas?: number;
}

interface ClinicContextType {
  appointments: Appointment[];
  addAppointment: (app: Appointment) => Promise<string>;
  updateAppointment: (app: Appointment) => Promise<string>;
  deleteAppointment: (id: string) => Promise<void>;
  isLoading: boolean;
}

const ClinicContext = createContext<ClinicContextType | undefined>(undefined);

export function ClinicProvider({ children }: { children: React.ReactNode }) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isPending, startTransition] = useTransition();

  const fetchAppointments = async () => {
    const data = await getAppointments();
    setAppointments(data);
    setIsLoaded(true);
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const addAppointment = async (app: Appointment) => {
    const res = await createAppointment(app);
    await fetchAppointments();
    return res.id;
  };

  const updateAppointment = async (app: Appointment) => {
    await updateApptAction(app);
    await fetchAppointments();
    return app.id;
  };

  const deleteAppointment = async (id: string) => {
    await deleteApptAction(id);
    await fetchAppointments();
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <ClinicContext.Provider value={{ appointments, addAppointment, updateAppointment, deleteAppointment, isLoading: isPending }}>
      {children}
    </ClinicContext.Provider>
  );
}

export function useClinic() {
  const ctx = useContext(ClinicContext);
  if (!ctx) throw new Error("useClinic must be used within ClinicProvider");
  return ctx;
}
