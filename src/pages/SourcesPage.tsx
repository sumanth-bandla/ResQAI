import { ArrowUpRight, Database, ExternalLink, KeyRound, MapPinned, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, PageHeader, StatusMessage } from "../components/Ui";
import { PublicFeedNotice } from "../components/PublicFeedStatus";
import { usePublicData } from "../dataContext";

export function SourcesPage() {
  const { records, status, refreshedAt } = usePublicData();

  return (
    <div className="page-stack">
      <PageHeader eyebrow="PUBLIC DATA / PROVENANCE & SETUP" title="Sources and connections" description="How the historical archive is sourced, configured, and kept separate from emergency operations." action={<Link className="button button--secondary" to="/incidents"><Database size={14} /> Browse archive</Link>} />
      <PublicFeedNotice />
      <StatusMessage tone="warning"><strong>Non-operational demonstration.</strong> This application is not an agency system and must not be used to make emergency decisions. It has no 911, CAD, dispatch, responder GPS, or real authentication connection.</StatusMessage>
      <div className="sources-grid">
        <Card title="San Francisco Fire Incidents" subtitle="Official public dataset · historical closed incidents">
          <div className="source-card source-card--large"><Database size={19} /><span><strong>San Francisco Open Data</strong><small>Published by the City and County of San Francisco. This browser reads imported records from the project's read-only Supabase table.</small><a href="https://data.sfgov.org/d/wr8u-xric" target="_blank" rel="noreferrer">Open dataset details <ExternalLink size={12} /></a></span></div>
          <div className="historical-properties source-properties"><div><span>Public source API</span><strong>data.sfgov.org/resource/wr8u-xric.json</strong></div><div><span>Archive window</span><strong>Closed incidents from approximately 30–365 days ago</strong></div><div><span>Import cap</span><strong>Up to 500 source records per sync</strong></div><div><span>Display access</span><strong>Authenticated users · read-only</strong></div></div>
          {status === "ready" && <p className="source-sync-state">{records.length.toLocaleString()} records loaded{refreshedAt ? ` · Read from Supabase at ${new Date(refreshedAt).toLocaleString()}` : ""}.</p>}
        </Card>
        <Card title="OpenStreetMap" subtitle="Community-maintained street map tiles">
          <div className="source-card source-card--large"><MapPinned size={19} /><span><strong>OpenStreetMap contributors</strong><small>Basemap streets and place labels are requested directly from the community tile service. Incident pins use coordinates supplied by the city source.</small><a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">Copyright and attribution <ExternalLink size={12} /></a></span></div>
          <div className="source-caution">The public OSM tile service is best-effort, may be rate-limited, and has no service-level agreement. It is for demonstration and exploration only—not emergency navigation or dispatch.</div>
        </Card>
        <Card title="Supabase setup" subtitle="Configure a verified non-production project before connecting">
          <ol className="source-steps">
            <li><strong>Verify the project environment.</strong><span>Before any setup, confirm in the Supabase dashboard that the selected project is a separate staging/test project, not production.</span></li>
            <li><strong>Set browser-safe values locally.</strong><span>Copy <code>.env.example</code> to <code>.env.local</code>; use the verified project's HTTPS URL and publishable key in <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_PUBLISHABLE_KEY</code>.</span></li>
            <li><strong>Enable Supabase email authentication.</strong><span>Enable email/password in Supabase Auth. Configure the local site URL and allowed redirect URLs for <code>http://localhost:5173/auth/callback</code> and <code>http://localhost:5173/login?recovery=1</code>, plus the matching URLs for your deployment. Public account registration is enabled by this app.</span></li>
            <li><strong>Apply the read-only schema.</strong><span>Only in that confirmed non-production project, run <code>supabase/migrations/20261024111000_create_public_historical_fire_incidents.sql</code>. Review the RLS and grants before execution. Only authenticated users can read; client writes are denied.</span></li>
            <li><strong>Import the public archive.</strong><span>Put <code>SUPABASE_URL</code> and <code>SUPABASE_SERVICE_ROLE_KEY</code> in the ignored local <code>.env.local</code>, then run <code>npm run data:sync:sf</code>. The importer keeps the service-role key server-side and excludes recent closures.</span></li>
            <li><strong>Run the app locally.</strong><span>Run <code>npm run dev</code>. Sign up or sign in before browsing. The interface reports unconfigured, loading, error, empty, or connected states without falling back to sample records.</span></li>
          </ol>
          <div className="source-secret-warning"><KeyRound size={15} /><span><strong>Never expose the service-role key.</strong> Do not put it in a <code>VITE_</code> variable, client code, screenshots, Git, or chat. The browser publishable key is visible in the app and must be constrained by the migration's RLS policy.</span></div>
        </Card>
        <Card title="Access and privacy boundaries" subtitle="Controls in this demonstration">
          <div className="access-boundary-list"><div><ShieldCheck size={16} /><span><strong>Public source only</strong><small>No private agency or caller feed is configured.</small></span></div><div><ShieldCheck size={16} /><span><strong>Delayed, closed records</strong><small>The importer excludes closures from the latest 30 days.</small></span></div><div><ShieldCheck size={16} /><span><strong>Authenticated, read-only archive</strong><small>Signed-in users can select eligible rows; anonymous reads and client writes are denied by grants and RLS.</small></span></div><div><ShieldCheck size={16} /><span><strong>No agency authentication or dispatch</strong><small>Supabase email authentication controls archive access only; there is no CAD integration or responder contact.</small></span></div></div>
        </Card>
      </div>
      <p className="sources-footnote">Data remains owned and governed by its publisher. Confirm source terms, privacy implications, and the Supabase target environment before importing. <Link to="/overview">Return to historical overview <ArrowUpRight size={12} /></Link></p>
    </div>
  );
}
