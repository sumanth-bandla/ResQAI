import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { supabase, supabaseConfigured } from "./lib/supabase";

export type PublicFireIncident = {
  id: string;
  incident_number: string;
  exposure_number: string;
  incident_date: string;
  closed_at: string;
  address: string;
  call_number: string | null;
  primary_situation: string | null;
  property_use: string | null;
  action_taken: string | null;
  neighborhood: string | null;
  station_area: string | null;
  battalion: string | null;
  supervisor_district: string | null;
  zipcode: string | null;
  latitude: number | null;
  longitude: number | null;
  source_updated_at: string | null;
  source_url: string;
  imported_at: string;
};

export type PublicDataState = {
  records: PublicFireIncident[];
  status: "loading" | "ready" | "unconfigured" | "error";
  error: string | null;
  configured: boolean;
  refreshedAt: string | null;
  refresh: () => Promise<void>;
};

const PublicDataContext = createContext<PublicDataState | null>(null);

export function PublicDataProvider({ children }: { children: ReactNode }) {
  const [records, setRecords] = useState<PublicFireIncident[]>([]);
  const [status, setStatus] = useState<PublicDataState["status"]>(supabaseConfigured ? "loading" : "unconfigured");
  const [error, setError] = useState<string | null>(null);
  const [refreshedAt, setRefreshedAt] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!supabaseConfigured || !supabase) {
      setRecords([]);
      setError(null);
      setStatus("unconfigured");
      return;
    }

    setStatus((current) => current === "ready" ? "ready" : "loading");
    setError(null);
    const { data, error: queryError } = await supabase
      .from("sf_fire_incidents")
      .select("id,incident_number,exposure_number,incident_date,closed_at,address,call_number,primary_situation,property_use,action_taken,neighborhood,station_area,battalion,supervisor_district,zipcode,latitude,longitude,source_updated_at,source_url,imported_at")
      .order("incident_date", { ascending: false })
      .limit(500);

    if (queryError) {
      setRecords([]);
      setError(queryError.message);
      setStatus("error");
      return;
    }

    const nextRecords = (data ?? []) as PublicFireIncident[];
    setRecords(nextRecords);
    setRefreshedAt(new Date().toISOString());
    setStatus("ready");
  }, []);

  useEffect(() => { void refresh(); }, [refresh]);

  const value = useMemo(() => ({
    records, status, error, configured: supabaseConfigured, refreshedAt, refresh,
  }), [records, status, error, refreshedAt, refresh]);

  return <PublicDataContext.Provider value={value}>{children}</PublicDataContext.Provider>;
}

export function usePublicData(): PublicDataState {
  const value = useContext(PublicDataContext);
  if (!value) throw new Error("usePublicData must be used within PublicDataProvider.");
  return value;
}
