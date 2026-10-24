export type Priority = "P1 · Critical" | "P2 · High" | "P3 · Moderate";

export type Incident = {
  id: string;
  title: string;
  kind: string;
  address: string;
  neighborhood: string;
  priority: Priority;
  response: "En route" | "On scene" | "Awaiting triage";
  reported: string;
  source: string;
  units: string[];
  description: string;
};

export type Unit = {
  id: string;
  service: "Fire & rescue" | "Emergency medical" | "Law enforcement";
  base: string;
  capability: string;
  status: "Available" | "En route" | "On scene";
  eta: string;
};
