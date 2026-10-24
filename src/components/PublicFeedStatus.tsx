import { AlertCircle, CheckCircle2, Database, LoaderCircle, RefreshCw } from "lucide-react";
import { Card, StatusMessage } from "./Ui";
import { usePublicData } from "../dataContext";

export function PublicFeedNotice() {
  const { status, error, configured, records, refreshedAt } = usePublicData();

  if (status === "loading") {
    return <div className="public-feed-notice public-feed-notice--loading" role="status"><LoaderCircle size={15} className="spin" /> Loading your authenticated read-only historical archive…</div>;
  }

  if (!configured || status === "unconfigured") {
    return <StatusMessage tone="warning"><Database size={15} /><span><strong>Supabase is not configured.</strong> No incident dataset is shown. Add the browser-safe project URL and publishable key to local .env.local, then import the approved archive from a verified staging project.</span></StatusMessage>;
  }

  if (status === "error") {
    return <StatusMessage tone="warning"><AlertCircle size={15} /><span><strong>The Supabase data source could not be loaded.</strong> {error} No simulated incident data is substituted.</span></StatusMessage>;
  }

  return (
    <div className="public-feed-notice" role="status">
      <CheckCircle2 size={15} />
      <span><strong>Supabase · {records.length.toLocaleString()} archived records</strong> · Signed-in read-only access · closed ≥30 days ago</span>
      <small>{refreshedAt ? `Last read ${new Date(refreshedAt).toLocaleTimeString()}` : "Connected"}</small>
    </div>
  );
}

export function PublicDataEmpty({ action }: { action?: React.ReactNode }) {
  const { status, error, configured, refresh } = usePublicData();

  return (
    <div className="public-data-empty">
      <Card>
        <div className="public-data-empty__content">
          {status === "loading" ? <LoaderCircle size={20} className="spin" /> : status === "error" ? <AlertCircle size={20} /> : <Database size={20} />}
          <strong>{status === "loading" ? "Loading public fire records" : status === "error" ? "Could not load public fire records" : configured ? "No public records in the selected date window" : "Connect the read-only public archive"}</strong>
          <span>{status === "error" ? error : "This page never substitutes sample incidents for missing or unavailable real data."}</span>
          {status === "error" && <button className="button button--secondary" onClick={() => void refresh()}><RefreshCw size={14} /> Retry</button>}
          {action}
        </div>
      </Card>
    </div>
  );
}
