import type { Incident, Unit } from "./types";

export const seedIncidents: Incident[] = [
  { id: "1048", title: "Commercial building fire", kind: "Fire & rescue", address: "640 Brannan St", neighborhood: "SoMa", priority: "P1 · Critical", response: "En route", reported: "8m ago", source: "911 call", units: ["E12", "E07", "A04"], description: "Smoke and flames from a third-floor window. Staff are leaving through the main entrance." },
  { id: "1049", title: "Multi-vehicle collision", kind: "Traffic · multi-agency", address: "8th & Market St", neighborhood: "Civic Center", priority: "P1 · Critical", response: "On scene", reported: "6m ago", source: "911 call", units: ["R01", "A02", "P09", "P14"], description: "Multiple vehicles involved. One lane blocked; EMS assessment in progress." },
  { id: "1050", title: "Medical emergency", kind: "Emergency medical", address: "201 Berry St", neighborhood: "Mission Bay", priority: "P2 · High", response: "En route", reported: "4m ago", source: "911 call", units: ["A11"], description: "Caller reports a person in need of immediate medical assistance." },
  { id: "1051", title: "Smoke report", kind: "Fire · reported / unverified", address: "180 Townsend St", neighborhood: "South Beach", priority: "P2 · High", response: "Awaiting triage", reported: "2m ago", source: "3 calls", units: [], description: "Three callers report smoke near a third-floor window; building occupancy is not confirmed." },
  { id: "1052", title: "Water rescue", kind: "Rescue · medical", address: "Mission Creek / 4th St", neighborhood: "Mission Bay", priority: "P2 · High", response: "On scene", reported: "22m ago", source: "911 call", units: ["R01", "A02", "P09"], description: "Water rescue response in progress near the channel." },
  { id: "1053", title: "Suspicious package", kind: "Police · reported / unverified", address: "425 Main St", neighborhood: "Financial District", priority: "P3 · Moderate", response: "Awaiting triage", reported: "3m ago", source: "311 transfer", units: [], description: "Unattended package reported in a public lobby. Details awaiting confirmation." },
  { id: "1054", title: "Gas odor investigation", kind: "Fire & rescue · police", address: "950 Folsom St", neighborhood: "SoMa", priority: "P3 · Moderate", response: "En route", reported: "16m ago", source: "911 call", units: ["E03", "P14"], description: "Reported gas odor; crews are investigating and checking adjacent buildings." },
  { id: "1055", title: "Welfare check", kind: "Multi-agency assist", address: "101 Grove St", neighborhood: "Civic Center", priority: "P3 · Moderate", response: "On scene", reported: "27m ago", source: "Agency radio", units: ["P09"], description: "Agency-requested welfare check. Responders are on scene." },
];

export const seedUnits: Unit[] = [
  { id: "E03", service: "Fire & rescue", base: "Station 3 · Available", capability: "Suppression · 4 crew", status: "Available", eta: "2m 40s" },
  { id: "E08", service: "Fire & rescue", base: "Station 8 · Available", capability: "Suppression · 4 crew", status: "Available", eta: "3m 15s" },
  { id: "T02", service: "Fire & rescue", base: "Station 2 · Available", capability: "Aerial access · 5 crew", status: "Available", eta: "4m 10s" },
  { id: "R01", service: "Emergency medical", base: "Station 1 · Available", capability: "Technical rescue · 4 crew", status: "On scene", eta: "3m 50s" },
  { id: "A02", service: "Emergency medical", base: "Medic post 2 · Available", capability: "Advanced life support", status: "On scene", eta: "2m 55s" },
  { id: "A11", service: "Emergency medical", base: "Medic post 11 · Available", capability: "Patient transport", status: "En route", eta: "4m 20s" },
  { id: "P09", service: "Law enforcement", base: "Central district · Available", capability: "Traffic · 2 officers", status: "On scene", eta: "1m 50s" },
  { id: "P14", service: "Law enforcement", base: "Southern district · Available", capability: "Perimeter · 2 officers", status: "Available", eta: "2m 30s" },
];
