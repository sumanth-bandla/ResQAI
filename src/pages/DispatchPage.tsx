import { useMemo, useState } from "react";
import { ArrowRight, Check, ShieldAlert, Truck } from "lucide-react";
import { useAppState } from "../state";
import { seedUnits } from "../data";
import { Button, Card, PageHeader, Pill, StatusMessage } from "../components/Ui";
import type { Unit } from "../types";

export function DispatchPage() {
  const { incidents, updateIncident } = useAppState();
  const [unitStatuses, setUnitStatuses] = useState(seedUnits);
  const [selectedUnit, setSelectedUnit] = useState("");
  const [incidentId, setIncidentId] = useState("1048");
  const [purpose, setPurpose] = useState("Reinforcement · Additional assessment");
  const [ack, setAck] = useState(false);
  const [notice, setNotice] = useState("");
  const incident = incidents.find((item) => item.id === incidentId);
  const selected: Unit | undefined = unitStatuses.find((unit) => unit.id === selectedUnit);
  const available = useMemo(() => unitStatuses.filter((unit) => unit.status === "Available"), [unitStatuses]);

  function stage() {
    if (!incident) return;
    if (!selected) { setNotice("Select an available unit before staging a demo assignment."); return; }
    if (!ack) { setNotice("Confirm that you have reviewed the incident priority, unit capability, and availability."); return; }
    setUnitStatuses((current) => current.map((unit) => unit.id === selected.id ? { ...unit, status: "En route" } : unit));
    updateIncident(incident.id, { units: [...incident.units, selected.id] });
    setNotice(`${selected.id} staged for ${incident.title}. This is a local demo only. No unit has been notified, assigned in CAD, or dispatched.`);
    setSelectedUnit("");
    setAck(false);
  }

  return <div className="page-stack">
    <PageHeader eyebrow="TRAINING SIMULATOR / SAMPLE RESOURCES" title="Dispatch simulator" description="Practice staged assignments using fictional sample units and incidents." />
    <StatusMessage tone="warning"><strong>Training only · No actual dispatch occurs.</strong> All data is illustrative. This page is not connected to an authorized agency service and must not be used for real response decisions.</StatusMessage>
    {notice && <StatusMessage tone={notice.includes("local demo") ? "success" : "warning"}>{notice}</StatusMessage>}
    <div className="metric-grid"><div className="metric-card metric-card--small"><span>Available</span><strong>{available.length}</strong><small>Illustrative sample fleet</small></div><div className="metric-card metric-card--small"><span>En route</span><strong>{unitStatuses.filter((unit) => unit.status === "En route").length + 8}</strong><small>Demo acknowledgments only</small></div><div className="metric-card metric-card--small"><span>On scene</span><strong>10</strong><small>Across 3 incident locations</small></div><div className="metric-card metric-card--small"><span>Total fleet</span><strong>26</strong><small>18 deployed · 69% utilization</small></div></div>
    <div className="dispatch-grid">
      <div className="page-stack">
        <Card title="Unit availability" subtitle={`${available.length} units currently available in the illustrative roster`}><div className="unit-roster">{unitStatuses.map((unit) => <div className="unit-roster__row" key={unit.id}><strong>{unit.id}</strong><span>{unit.service}<small>{unit.base}</small></span><span>{unit.capability}</span><span>{unit.eta}</span><Pill tone={unit.status === "Available" ? "success" : unit.status === "On scene" ? "high" : "neutral"}>{unit.status}</Pill><button className="unit-select-link" onClick={() => { setSelectedUnit(unit.id); setNotice(""); }}>{unit.status === "Available" ? "Select" : "Unavailable"}</button></div>)}</div></Card>
        <Card title="Current deployments" subtitle="Local demo state · no live CAD integration"><div className="deployment-list">{incidents.filter((item) => item.units.length).map((item) => <div key={item.id}><span>#{item.id} · {item.title}</span><span>{item.units.length} units</span><Pill tone={item.priority.startsWith("P1") ? "critical" : "high"}>{item.response}</Pill></div>)}</div></Card>
      </div>
      <aside className="page-stack">
        <Card title="Stage unit assignment" subtitle="Operator-led · Staging only">
          <div className="stage-form">
            <label>Approved incident<select value={incidentId} onChange={(event) => setIncidentId(event.target.value)}>{incidents.map((item) => <option key={item.id} value={item.id}>#{item.id} · {item.title}</option>)}</select></label>
            {incident && <div className="stage-incident-summary"><Pill tone={incident.priority.startsWith("P1") ? "critical" : "high"}>{incident.priority}</Pill><p>{incident.address} · {incident.neighborhood}</p><small>Fictional training data · not an operational record.</small></div>}
            <label>Assignment purpose<select value={purpose} onChange={(event) => setPurpose(event.target.value)}><option>Reinforcement · Additional assessment</option><option>Initial assessment · Staged only</option><option>Medical support · Staged only</option><option>Traffic control · Staged only</option></select></label>
            <label>Available unit<select value={selectedUnit} onChange={(event) => setSelectedUnit(event.target.value)}><option value="">Select an available unit</option>{available.map((unit) => <option key={unit.id} value={unit.id}>{unit.id} · {unit.service} · {unit.capability}</option>)}</select></label>
            {selected && <div className="selected-unit-card"><Truck size={15} /><span><strong>{selected.id} · {selected.service}</strong><small>{selected.capability} · Illustrative ETA {selected.eta}</small></span></div>}
            <label htmlFor="operator-notes">Operator notes *</label><textarea id="operator-notes" rows={4} defaultValue="Demo staging only. Verify incident conditions, agency approval, unit capability and availability before any real operational action." />
            <div className="staging-notice"><ShieldAlert size={15} /><span><strong>Staged only · No dispatch sent</strong><small>Confirming updates a local demo record only; no CAD, radio, phone, or responder is contacted.</small></span></div>
            <label className="review-ack"><input type="checkbox" checked={ack} onChange={(event) => setAck(event.target.checked)} /> I reviewed the incident priority, capability match, and availability.</label>
            <Button className="full-button" onClick={stage} disabled={!selected}><Check size={14} /> Stage demo assignment <ArrowRight size={14} /></Button>
          </div>
        </Card>
      </aside>
    </div>
  </div>;
}
