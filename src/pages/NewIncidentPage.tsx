import { useState, type FormEvent } from "react";
import { ArrowLeft, ArrowRight, Check, MapPin, ShieldAlert, Upload } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAppState } from "../state";
import { Button, Card, PageHeader, StatusMessage } from "../components/Ui";

export function NewIncidentPage() {
  const { addIncident, incidents } = useAppState();
  const navigate = useNavigate();
  const [notice, setNotice] = useState("");
  const [address, setAddress] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [caller, setCaller] = useState("");
  const [error, setError] = useState("");

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!address.trim() || !title.trim() || !description.trim()) { setError("Complete the incident type, address, and description before saving."); return; }
    const id = String(Math.max(1055, ...incidents.map((incident) => Number(incident.id))) + 1);
    addIncident({ id, title: title.trim(), kind: "Reported · Awaiting verification", address: address.trim(), neighborhood: "San Francisco", priority: "P3 · Moderate", response: "Awaiting triage", reported: "Just now", source: "Demo report", units: [], description: description.trim() });
    setNotice(`Demo incident #${id} saved to this page session. No emergency service was contacted or dispatched.`);
    window.setTimeout(() => navigate(`/training/incidents/${id}`), 900);
  }

  return <div className="page-stack">
    <Link className="back-link" to="/incidents"><ArrowLeft size={14} /> Incidents</Link>
    <PageHeader eyebrow="TRAINING SIMULATOR · LOCAL SAMPLE ONLY" title="Sample incident intake" description="Practice a report workflow with fictional, browser-session data. This does not create a public record or contact an agency." />
    <StatusMessage tone="warning"><strong>Training only.</strong> Do not enter real caller information or actual emergencies. Submissions stay in this local demo and do not reach 911, CAD, dispatch, or responders.</StatusMessage>
    <div className="form-steps"><span className="is-current"><i>1</i> Report & evidence</span><span><i>2</i> Human triage</span><span><i>3</i> Confirm dispatch</span><span className="draft-label">DRAFT ONLY · NOT IN INCIDENT COUNT</span></div>
    {error && <StatusMessage tone="warning">{error}</StatusMessage>}
    {notice && <StatusMessage tone="success"><Check size={15} />{notice}</StatusMessage>}
    <form onSubmit={submit} className="new-incident-grid">
      <div className="page-stack">
        <Card title="Report information" subtitle="Record the source and event as reported"><div className="form-grid form-grid--three"><Field label="Report source" required><select><option>911 call</option><option>Agency radio</option><option>311 transfer</option><option>Field responder</option></select></Field><Field label="Incident type" required><select value={title} onChange={(event) => setTitle(event.target.value)}><option value="">Select an incident type</option><option>Structure fire</option><option>Medical emergency</option><option>Multi-vehicle collision</option><option>Water rescue</option><option>Smoke report</option><option>Other reported incident</option></select></Field><Field label="Received at"><input value="Oct 24, 2026 · 14:32 PDT" readOnly /></Field><Field label="Caller name"><input placeholder="Name, if provided" value={caller} onChange={(event) => setCaller(event.target.value)} /></Field><Field label="Callback number"><input type="tel" placeholder="(415) 555-0100" /></Field></div></Card>
        <Card title="Location & reported conditions" subtitle="Reported information is not equivalent to verified field conditions"><div className="form-grid"><Field label="Street address" required><input placeholder="Street address, San Francisco" value={address} onChange={(event) => setAddress(event.target.value)} /><small className="field-hint"><MapPin size={12} /> Demo geography · Location is not verified</small></Field><Field label="Floor / access details"><input placeholder="Floor, entrance or access details" /></Field><Field className="field-full" label="Incident description" required><textarea placeholder="Describe what the caller reported. Separate observations from verified facts." value={description} onChange={(event) => setDescription(event.target.value)} rows={4} /></Field><Field label="People potentially at risk"><input placeholder="Caller estimate or unknown" /></Field><Field label="Injuries or immediate hazards"><input placeholder="Reported conditions or unknown" /></Field></div></Card>
        <Card title="Verification & attachments" subtitle="Evidence is unverified until reviewed by an authorized operator"><div className="check-row"><label><input type="checkbox" /> Address matched to agency map</label><label><input type="checkbox" /> Caller callback completed</label></div><label className="upload-area"><Upload size={16} /><span>Attach a photo, document or audio</span><small>File selection is not connected in this demo</small><input type="file" disabled aria-label="Attachments unavailable in demo" /></label></Card>
        <div className="form-submit-row"><span><ShieldAlert size={14} />Saving creates a demo record. It does not dispatch a unit.</span><Button variant="secondary" onClick={() => navigate("/incidents")}>Cancel</Button><Button type="submit"><ArrowRight size={14} />Submit for review</Button></div>
      </div>
      <aside className="page-stack"><Card title="Training report summary"><div className="summary-list"><div><span>Environment</span><strong>Local training simulator</strong></div><div><span>Report status</span><strong>Fictional · not verified</strong></div><div><span>External services</span><strong>None connected</strong></div><div><span>Storage</span><strong>Current browser session only</strong></div></div><p className="summary-legal">This fictional exercise is not an agency report. No model evaluates the submission, and no person or unit is contacted.</p></Card></aside>
    </form>
  </div>;
}

function Field({ label, required = false, children, className = "" }: { label: string; required?: boolean; children: React.ReactNode; className?: string }) {
  return <label className={`form-field ${className}`}><span>{label}{required && <i> *</i>}</span>{children}</label>;
}
