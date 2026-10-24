import { useState } from "react";
import { Activity, UserRound } from "lucide-react";
import { useAppState } from "../state";
import { Card, PageHeader, Pill, StatusMessage } from "../components/Ui";

const entries = [
  ["14:32:08", "Jordan Miller", "Opened operations overview", "System"],
  ["14:31:42", "Training exercise", "Opened sample report #1051 for manual review", "Training · local only"],
  ["14:29:12", "Jordan Miller", "Viewed caller report for incident #1048", "Incident"],
  ["14:26:28", "Jordan Miller", "Confirmed sample response status for #1048", "Operator action · demo"],
  ["14:24:08", "911 intake", "Sample fire report created · #1048", "Demo data"],
];

export function GenericPage({ section }: { section: "activity" | "team" }) {
  const { incidents } = useAppState();
  const [notice, setNotice] = useState("");
  const isActivity = section === "activity";
  return <div className="page-stack">
    <PageHeader eyebrow={`TRAINING SIMULATOR / ${isActivity ? "SAMPLE ACTIVITY" : "SAMPLE PERSONNEL"}`} title={isActivity ? "Sample activity" : "Sample team"} description={isActivity ? "Review fictional entries for the training simulator. This is not an agency audit log." : "Browse fictional sample profiles. No actual accounts, invitations, or personnel records are connected."} />
    <StatusMessage tone="warning">Training-only examples · No real agency activity, personnel, or legally compliant audit record is represented here.</StatusMessage>
    {isActivity ? <Card title="Sample activity" subtitle="Fictional local events"><div className="activity-list">{entries.map(([time, actor, action, tag]) => <div className="activity-list__row" key={`${time}-${actor}`}><span className="activity-icon"><Activity size={15} /></span><span className="activity-time">{time}</span><span className="activity-copy"><strong>{action}</strong><small>{actor}</small></span><Pill>{tag}</Pill></div>)}</div></Card> : <><div className="metric-grid metric-grid--four"><div className="metric-card metric-card--small"><span>Sample profiles</span><strong>4</strong><small>Fictional training roster</small></div><div className="metric-card metric-card--small"><span>Sample shifts</span><strong>2</strong><small>Not current staffing</small></div><div className="metric-card metric-card--small"><span>Training reports</span><strong>{incidents.filter((item) => item.response === "Awaiting triage").length}</strong><small>Local sample data</small></div><div className="metric-card metric-card--small"><span>Agency roles</span><strong>0</strong><small>No agency permissions connected</small></div></div><Card title="Fictional sample profiles" subtitle="No actual accounts or invitations"><div className="table-scroll"><table className="data-table"><thead><tr><th>Sample profile</th><th>Illustrative role</th><th>Sample shift</th><th>Status</th><th /></tr></thead><tbody><tr><td><span className="team-person"><span className="avatar">JM</span><span><strong>Jordan Miller · Fictional</strong><small>example.user1@example.invalid</small></span></span></td><td>Training supervisor</td><td>Sample day shift</td><td><Pill>Example only</Pill></td><td><button className="row-open" onClick={() => setNotice("This sample profile is not backed by an account service.")}><UserRound size={14} /></button></td></tr><tr><td><span className="team-person"><span className="avatar avatar--blue">AR</span><span><strong>Amelia Rivera · Fictional</strong><small>example.user2@example.invalid</small></span></span></td><td>Training administrator</td><td>Sample day shift</td><td><Pill>Example only</Pill></td><td><button className="row-open" onClick={() => setNotice("This sample profile is not backed by an account service.")}><UserRound size={14} /></button></td></tr><tr><td><span className="team-person"><span className="avatar avatar--amber">DC</span><span><strong>Devon Chen · Fictional</strong><small>example.user3@example.invalid</small></span></span></td><td>Training user</td><td>Sample evening shift</td><td><Pill>Example only</Pill></td><td><button className="row-open" onClick={() => setNotice("This sample profile is not backed by an account service.")}><UserRound size={14} /></button></td></tr></tbody></table></div></Card></>}
    {notice && <StatusMessage>{notice}</StatusMessage>}
  </div>;
}
