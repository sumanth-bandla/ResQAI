import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { seedIncidents } from "./data";
import type { Incident } from "./types";

type AppState = {
  incidents: Incident[];
  addIncident: (incident: Incident) => void;
  updateIncident: (id: string, patch: Partial<Incident>) => void;
};

const AppStateContext = createContext<AppState | null>(null);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [incidents, setIncidents] = useState(seedIncidents);
  const value = useMemo<AppState>(() => ({
    incidents,
    addIncident: (incident) => setIncidents((current) => [incident, ...current]),
    updateIncident: (id, patch) => setIncidents((current) => current.map((incident) => incident.id === id ? { ...incident, ...patch } : incident)),
  }), [incidents]);

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState() {
  const value = useContext(AppStateContext);
  if (!value) throw new Error("useAppState must be used within AppStateProvider.");
  return value;
}
