import { useState } from "react";
import { ArrowRight, Check, CheckCircle2, FileText, ShieldAlert } from "lucide-react";
import { Link } from "react-router-dom";
import { useAppState } from "../state";
import { Button, Card, PageHeader, Pill, StatusMessage } from "../components/Ui";
import type { Priority } from "../types";

export function ReviewPage() {
  const { incidents, updateIncident } = useAppState();
  const [notice, setNotice] = useState("");
  const [acknowledged, setAcknowledged] = useState(false);
  const pending = incidents.filter((incident) => incident.response === "Awaiting triage");
  const [selected, setSelected] = useState<string | null>(null);
  const incident = pending.find((item) => item.id === selected) ?? pending[0];
  const [priority, setPriority] = useState<Priority>("P2 · High");

  function recordTrainingDecision() {
    if (!incident) return;
    if (!acknowledged) {
      setNotice("Confirm that you understand this is a fictional training exercise before recording a sample decision.");
      return;
    }
    updateIncident(incident.id, { priority });
    setNotice(`Sample manual classification saved for training record #${incident.id}. No agency record was changed.`);
    setAcknowledged(false);
  }

  return (
    <div className="page-stack">
      <PageHeader eyebrow="TRAINING SIMULATOR / MANUAL EXERCISE" title="Manual review exercise" description="Practice reviewing fictional sample reports and recording a manual classification. No AI/model generates recommendations." />
      <div className="status-message status-message--warning"><ShieldAlert size={16} /><span><strong>Fictional training only.</strong><small>This is not connected to an agency, live report, field verification, or operational decision workflow.</small></span></div>
      {notice && <StatusMessage tone={notice.startsWith("Confirm") ? "warning" : "success"}>{notice}</StatusMessage>}
      {incident ? <div className="review-grid">
        <div className="page-stack">
          <Card title="Sample report" subtitle={`TRAINING DATA · #${incident.id}`}>
            <div className="training-report-summary"><Pill>{incident.priority}</Pill><h3>{incident.title}</h3><p>{incident.description}</p><div><span>Fictional location</span><strong>{incident.address} · {incident.neighborhood}</strong></div><div><span>Sample source</span><strong>{incident.source} · not verified</strong></div></div>
          </Card>
          <Card title="Review considerations" subtitle="Example prompts only">
            <div className="training-review-prompts"><p>• Separate reported observations from verified information.</p><p>• Identify details that remain unknown in this sample.</p><p>• In a real setting, follow approved organizational policy and authorized procedures.</p></div>
          </Card>
        </div>
        <aside className="page-stack">
          <Card title="Manual classification exercise" subtitle="Local training state only">
            <div className="decision-form">
              <span className="review-status">SAMPLE EXERCISE</span>
              <label>Choose a sample classification</label>
              <div className="priority-options">
                {(["P1 · Critical", "P2 · High", "P3 · Moderate"] as const).map((option) => <button key={option} className={`priority-option${priority === option ? " priority-option--selected" : ""}`} onClick={() => setPriority(option)}>{option}</button>)}
              </div>
              <label htmlFor="manual-review-notes">Training notes</label>
              <textarea id="manual-review-notes" rows={4} defaultValue="Example only. In real workflows, use authorized policies and verified information." />
              <div className="staging-notice"><ShieldAlert size={15} /><span><strong>No external action</strong><small>This changes only fictional in-memory training data.</small></span></div>
              <label className="review-ack"><input type="checkbox" checked={acknowledged} onChange={(event) => setAcknowledged(event.target.checked)} /> I understand this sample is fictional and non-operational.</label>
              <Button className="full-button" onClick={recordTrainingDecision}><Check size={14} /> Save sample decision</Button>
              <small className="audit-note">No AI model, agency log, dispatch, or external service is involved.</small>
            </div>
          </Card>
          <Card title="Other sample reports"><div className="queue-list">{pending.filter((item) => item.id !== incident.id).map((item) => <button className="queue-item" key={item.id} onClick={() => { setSelected(item.id); setPriority(item.priority); setNotice(""); setAcknowledged(false); }}><Pill>{item.priority}</Pill><span><strong>#{item.id} · {item.title}</strong><small>Fictional training record</small></span><ArrowRight size={14} /></button>)}</div>{pending.length === 1 && <div className="empty-inline"><CheckCircle2 size={15} />No other sample reports in this exercise.</div>}</Card>
        </aside>
      </div> : <Card title="Training queue empty"><div className="empty-inline"><CheckCircle2 size={17} />There are no fictional training reports to review. <Link to="/training/report">Open sample intake <ArrowRight size={13} /></Link></div></Card>}
      <Link className="subtle-link review-back" to="/training/report"><FileText size={14} /> Open training intake</Link>
    </div>
  );
}
