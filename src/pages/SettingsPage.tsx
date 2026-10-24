import { useState, type FormEvent } from "react";
import { Check, ChevronDown, LockKeyhole, Save, Shield, ShieldCheck } from "lucide-react";
import { Card, PageHeader, StatusMessage } from "../components/Ui";

export function SettingsPage() {
  const [notice, setNotice] = useState("");
  const [toggles, setToggles] = useState({ critical: true, review: true, unit: true, email: false });
  function toggle(key: keyof typeof toggles) { setToggles((current) => ({ ...current, [key]: !current[key] })); }
  function save(event: FormEvent<HTMLFormElement>) { event.preventDefault(); setNotice("Settings saved in this browser session only. No agency directory, account, or external integration was changed."); }
  return <div className="page-stack">
    <PageHeader eyebrow="TRAINING SIMULATOR / SAMPLE CONTROLS" title="Settings simulator" description="Explore illustrative profile and governance controls. Changes remain in the browser session and do not configure an agency." action={<><button className="button button--secondary" onClick={() => setNotice("Unsaved values have not been persisted.")}>Discard changes</button><button className="button button--primary" form="settings-form"><Save size={14} /> Save changes</button></>} />
    <div className="settings-banner"><ShieldCheck size={15} /> Fictional sample profile <span>No agency account, authentication, permissions, or policies are connected</span></div>
    {notice && <StatusMessage tone="success"><Check size={14} />{notice}</StatusMessage>}
    <form id="settings-form" onSubmit={save} className="settings-grid">
      <div className="page-stack">
        <Card title="Agency & profile" subtitle="Illustrative profile information"><div className="settings-form-grid"><label>Agency name<input defaultValue="San Francisco Emergency Operations" /></label><label>Time zone<span className="input-select">America/Los_Angeles · PDT <ChevronDown size={14} /></span></label><label>Full name<input defaultValue="Jordan Miller" /></label><label>Work email<input defaultValue="jordan.miller@sfgov.example" type="email" /></label><div><span>Role</span><strong>Dispatch supervisor</strong></div><div><span>Shift</span><strong>Day · 07:00–19:00</strong></div><div><span>Authentication</span><strong>Demo access · No SSO</strong></div></div></Card>
        <Card title="Role permissions" subtitle="Sample roles · No permission system connected"><div className="permissions-table"><div><span>ROLE</span><span>TRIAGE</span><span>DISPATCH</span><span>POLICIES</span></div><div><strong>Agency administrator</strong><span>✓</span><span>✓</span><span>✓</span></div><div className="permissions-highlight"><strong>Dispatch supervisor</strong><span>✓</span><span>✓</span><span>View</span></div><div><strong>Dispatcher</strong><span>✓</span><span>✓</span><span>—</span></div><div><strong>Field responder</strong><span>View</span><span>—</span><span>—</span></div></div><small className="permission-note"><LockKeyhole size={12} />Example permissions only · No roles or access rules are enforced in this demo.</small></Card>
      </div>
      <div className="page-stack">
        <Card title="Integrations" subtitle="Connections are visual examples only"><div className="integration-list">{[["Computer-aided dispatch", "CAD · No live feed"], ["911 intake", "Calls and transcripts · Not connected"], ["Unit GPS", "Positions · Illustrative data"], ["Agency SSO", "SAML · No identity provider"]].map(([name, detail]) => <div key={name}><span className="integration-icon"><Shield size={14} /></span><span><strong>{name}</strong><small>{detail}</small></span><span className="integration-status">Demo</span></div>)}</div></Card>
        <Card title="Notifications" subtitle="Local illustrative preferences"><div className="settings-toggles"><Toggle label="Sample priority reminders" hint="Training examples only · no model connected" value={toggles.critical} onClick={() => toggle("critical")} locked /><Toggle label="Manual review reminders" hint="Fictional training records only" value={toggles.review} onClick={() => toggle("review")} /><Toggle label="Sample roster changes" hint="Illustrative roster updates" value={toggles.unit} onClick={() => toggle("unit")} /><Toggle label="Email shift summary" hint="Email notifications are not connected" value={toggles.email} onClick={() => toggle("email")} /></div></Card>
      </div>
      <Card title="System boundaries" subtitle="Current demonstration configuration" className="settings-governance"><div className="access-boundary-list"><div><ShieldCheck size={16} /><span><strong>No AI or machine-learning model configured</strong><small>Priorities in simulator records are fictional user-selected training values.</small></span></div><div><ShieldCheck size={16} /><span><strong>No agency authorization</strong><small>Example roles and permissions are visual samples only and are not enforced.</small></span></div><div><ShieldCheck size={16} /><span><strong>Archive account is not an agency account</strong><small>Supabase authentication controls web access only; it grants no emergency-response authority.</small></span></div></div></Card>
    </form>
  </div>;
}

function Toggle({ label, hint, value, onClick, locked = false }: { label: string; hint: string; value: boolean; onClick: () => void; locked?: boolean }) {
  return <div className="toggle-row"><span><strong>{label}</strong><small>{hint}</small></span><button type="button" className={`toggle-switch${value ? " is-on" : ""}`} onClick={onClick} aria-label={`${label}: ${value ? "on" : "off"}`} disabled={locked}><i /></button></div>;
}
