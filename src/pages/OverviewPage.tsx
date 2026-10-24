import { Activity, ArrowUpRight, Database, MapPin, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, PageHeader, StatusMessage } from "../components/Ui";
import { HistoricalFireTable } from "../components/HistoricalFireTable";
import { HistoryMap } from "../components/HistoryMap";
import { PublicDataEmpty, PublicFeedNotice } from "../components/PublicFeedStatus";
import { usePublicData } from "../dataContext";
import type { PublicFireIncident } from "../dataContext";

function getTopLabel(records: PublicFireIncident[], key: "neighborhood" | "primary_situation") {
  const counts = new Map<string, number>();
  for (const record of records) {
    const label = record[key]?.trim();
    if (label) counts.set(label, (counts.get(label) ?? 0) + 1);
  }
  return [...counts.entries()].sort((left, right) => right[1] - left[1])[0] ?? ["Not reported", 0];
}

function getMonthlyRecords(records: PublicFireIncident[]) {
  const today = new Date();
  const months = Array.from({ length: 12 }, (_, index) => {
    const date = new Date(today.getFullYear(), today.getMonth() - (11 - index), 1);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    return {
      key,
      label: new Intl.DateTimeFormat(undefined, { month: "short" }).format(date),
      count: records.filter((record) => record.incident_date.slice(0, 7) === key).length,
    };
  });
  const max = Math.max(...months.map((month) => month.count), 1);
  return months.map((month) => ({ ...month, height: Math.max(month.count ? 8 : 0, (month.count / max) * 100) }));
}

function Metric({ label, value, note, icon, tone }: { label: string; value: string; note: string; icon: React.ReactNode; tone: string }) {
  return <div className="metric-card"><div className={`metric-icon metric-icon--${tone}`}>{icon}</div><div className="metric-card__label">{label}</div><div className="metric-card__value">{value}</div><div className="metric-card__note">{note}</div></div>;
}

export function OverviewPage() {
  const { records, status } = usePublicData();
  const mapped = records.filter((record) => record.latitude !== null && record.longitude !== null);
  const [topNeighborhood, neighborhoodCount] = getTopLabel(records, "neighborhood");
  const [topSituation, situationCount] = getTopLabel(records, "primary_situation");
  const monthly = getMonthlyRecords(records);
  const sourceUpdatedAt = records.map((record) => record.source_updated_at).filter((value): value is string => Boolean(value)).sort().at(-1);
  const canShowData = status === "ready" && records.length > 0;

  return (
    <div className="page-stack">
      <PageHeader eyebrow="PUBLIC RECORDS EXPLORER · HISTORICAL DATA ONLY" title="Historical overview" description="Explore published, closed San Francisco fire department records. This is not a live emergency service." action={<Link className="button button--secondary" to="/incidents"><Search size={14} /> Search archive</Link>} />
      <PublicFeedNotice />
      {canShowData ? <>
        <div className="metric-grid">
          <Metric label="Archived records loaded" value={records.length.toLocaleString()} note="Most recent available · 500-row display limit" icon={<Database size={16} />} tone="teal" />
          <Metric label="Records with map coordinates" value={mapped.length.toLocaleString()} note="Coordinates supplied by the public source" icon={<MapPin size={16} />} tone="blue" />
          <Metric label="Most common reported area" value={topNeighborhood[0]} note={`${topNeighborhood[1]} in this archive result`} icon={<Activity size={16} />} tone="amber" />
          <Metric label="Latest source update" value={sourceUpdatedAt ? new Date(sourceUpdatedAt).toLocaleDateString() : "Not reported"} note="Historical feed · minimum 30-day delay" icon={<ArrowUpRight size={16} />} tone="red" />
        </div>
        <div className="public-data-safety"><strong>Archive, not active incidents.</strong> These public records are closed, at least 30 days old, and do not include live calls, current response status, or available units. They must not be used for emergency decisions.</div>
        <div className="overview-grid">
          <Card title="San Francisco · historical locations" subtitle={`Real basemap · ${Math.min(mapped.length, 100)} most recent geocoded records shown`} action={<Link to="/map" className="subtle-link">Explore map <ArrowUpRight size={13} /></Link>}>
            {mapped.length ? <HistoryMap records={mapped.slice(0, 100)} height="270px" /> : <PublicDataEmpty />}
            <div className="public-map-caption">Historical point locations from the city dataset · Map tiles © OpenStreetMap contributors · Not for navigation.</div>
          </Card>
          <Card title="Top reported fire situations" subtitle={`Public descriptions · ${records.length.toLocaleString()} records loaded`}>
            <div className="archive-stat"><span>Most common reported situation</span><strong>{topSituation[0]}</strong><small>{situationCount} records in this result</small></div>
            <div className="archive-stat archive-stat--second"><span>Most common neighborhood</span><strong>{topNeighborhood[0]}</strong><small>{neighborhoodCount} records in this result</small></div>
            <div className="chart-card">
              <div className="historical-chart-heading">Reported incidents by month · archived sample</div>
              <div className="chart-bars chart-bars--large">{monthly.map((month) => <span key={month.key} title={`${month.label}: ${month.count}`} style={{ height: `${month.height}%` }} />)}</div>
              <div className="chart-axis">{monthly.filter((_, index) => index % 2 === 0).map((month) => <span key={month.key}>{month.label}</span>)}</div>
            </div>
          </Card>
        </div>
        <Card title="Recently closed records" subtitle="Most recent records available from the public historic archive" action={<Link to="/incidents" className="subtle-link">Browse all results <ArrowUpRight size={13} /></Link>}>
          <HistoricalFireTable records={records.slice(0, 7)} />
        </Card>
        {sourceUpdatedAt && <div className="overview-footnote">Official source last updated {new Date(sourceUpdatedAt).toLocaleString()} · Dataset age and publication schedule vary · Source: San Francisco Fire Department open data.</div>}
      </> : <PublicDataEmpty action={<Link className="button button--secondary" to="/sources">Configure Supabase data source</Link>} />}
      <StatusMessage tone="warning"><strong>Read-only public archive.</strong> Public data may be incomplete or delayed. ResQAI is not connected to 911, CAD, dispatch, live responder locations, or any emergency response agency.</StatusMessage>
    </div>
  );
}
