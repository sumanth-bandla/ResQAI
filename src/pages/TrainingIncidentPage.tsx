import { ArrowLeft, ShieldAlert } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { Card, PageHeader, StatusMessage } from "../components/Ui";
import { useAppState } from "../state";

export function TrainingIncidentPage() {
  const { id } = useParams();
  const { incidents } = useAppState();
  const incident = incidents.find((item) => item.id === id);

  return (
    <div className="page-stack">
      <Link className="back-link" to="/training/report"><ArrowLeft size={14} /> Training report simulator</Link>
      <PageHeader eyebrow="TRAINING SIMULATOR · LOCAL SAMPLE DATA" title={incident ? `Sample incident #${incident.id}` : "Training record not found"} description="This separate training record is stored only in the current browser session and is not part of the public archive." />
      <StatusMessage tone="warning"><ShieldAlert size={15} /><span><strong>Training-only sample.</strong> This is not a real incident, verified emergency, dispatch record, or report to an agency. No external service was contacted.</span></StatusMessage>
      {incident ? <Card title={incident.title} subtitle="Illustrative data entered into the training simulator">
        <div className="historical-properties">
          <div><span>Sample identifier</span><strong>{incident.id}</strong></div>
          <div><span>Sample location</span><strong>{incident.address} · {incident.neighborhood}</strong></div>
          <div><span>Sample priority</span><strong>{incident.priority}</strong></div>
          <div><span>Simulator state</span><strong>{incident.response} · Local only</strong></div>
          <div><span>Reported description</span><strong>{incident.description}</strong></div>
        </div>
        <div className="training-record-note">No call was placed, no emergency was recorded by an agency, and no responder was assigned or notified.</div>
      </Card> : <Card title="Sample data unavailable"><div className="empty-inline">This training record may have been cleared when the browser session ended.</div></Card>}
    </div>
  );
}
