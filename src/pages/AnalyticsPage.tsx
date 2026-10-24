import { Activity, CalendarDays, Database, Download, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, PageHeader, StatusMessage } from "../components/Ui";
import { PublicDataEmpty, PublicFeedNotice } from "../components/PublicFeedStatus";
import { HistoricalAiAnalysis } from "../components/HistoricalAiAnalysis";
import { usePublicData } from "../dataContext";

export function AnalyticsPage() {
  const { records, status } = usePublicData();
  const canShowData = status === "ready" && records.length > 0;
  const mappedCount = records.filter((record) => record.latitude !== null && record.longitude !== null).length;
  const sourceUpdated = records
    .map((record) => record.source_updated_at)
    .filter((value): value is string => Boolean(value))
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0];

  const monthly = Array.from({ length: 12 }, (_, index) => {
    const date = new Date();
    date.setDate(1);
    date.setMonth(date.getMonth() - (11 - index));
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    return {
      key,
      label: new Intl.DateTimeFormat(undefined, { month: "short" }).format(date),
      count: records.filter((record) => record.incident_date.slice(0, 7) === key).length,
    };
  });
  const maxMonthly = Math.max(...monthly.map((month) => month.count), 1);
  const areas = [...records.reduce((counts, record) => {
    if (record.neighborhood) counts.set(record.neighborhood, (counts.get(record.neighborhood) ?? 0) + 1);
    return counts;
  }, new Map<string, number>()).entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  const maxArea = Math.max(...areas.map(([, count]) => count), 1);

  return (
    <div className="page-stack">
      <PageHeader eyebrow="PUBLIC DATA / DESCRIPTIVE SUMMARY" title="Archive analytics" description="Descriptive counts calculated from the currently loaded public, historical fire records. Not response-performance measurements." action={<><span className="button button--secondary"><CalendarDays size={14} /> Imported archive window</span><button className="button button--secondary" onClick={() => window.print()}><Download size={14} /> Print report</button></>} />
      <PublicFeedNotice />
      {canShowData ? <>
        <div className="analytics-context"><span>HISTORICAL ARCHIVE</span> {records.length.toLocaleString()} most recent records loaded <i /> Published closed incidents only <span className="analytics-context__right">No current operational metrics</span></div>
        <div className="metric-grid">
          <div className="metric-card metric-card--small"><span>Records loaded</span><strong>{records.length.toLocaleString()}</strong><small>Current read-only archive result</small></div>
          <div className="metric-card metric-card--small"><span>Records with coordinates</span><strong>{mappedCount.toLocaleString()}</strong><small>Locations published in source data</small></div>
          <div className="metric-card metric-card--small"><span>Reported neighborhoods</span><strong>{new Set(records.map((record) => record.neighborhood).filter(Boolean)).size}</strong><small>Distinct non-empty source labels</small></div>
          <div className="metric-card metric-card--small"><span>Most recent source update</span><strong>{sourceUpdated ? new Date(sourceUpdated).toLocaleDateString() : "Not reported"}</strong><small>Source values can be delayed</small></div>
        </div>
        <div className="analytics-grid">
          <Card title="Records by incident month" subtitle="Counts from loaded records · zero-filled months are shown as zero">
            <div className="analytics-chart">
              <div className="chart-bars chart-bars--large">{monthly.map((month) => <span key={month.key} title={`${month.label}: ${month.count}`} style={{ height: `${month.count ? Math.max(8, (month.count / maxMonthly) * 100) : 0}%` }} />)}</div>
              <div className="chart-axis">{monthly.filter((_, index) => index % 2 === 0).map((month) => <span key={month.key}>{month.label}</span>)}</div>
              <div className="chart-caption"><span><i className="legend-teal" /> Public records</span><span className="chart-caption__right">Grouped by source incident date</span></div>
            </div>
          </Card>
          <Card title="Most-reported neighborhoods" subtitle="Top source neighborhood labels within this result">
            {areas.length ? <div className="utilization-list">{areas.map(([area, count]) => <div className="archive-area-row" key={area}><span>{area}</span><small>{count.toLocaleString()} records</small><span className="readiness-bar"><i style={{ width: `${(count / maxArea) * 100}%` }} /></span><b>{Math.round((count / records.length) * 100)}%</b></div>)}</div> : <div className="empty-inline">Neighborhood values are not reported in these records.</div>}
          </Card>
          <Card title="Archive coverage" subtitle="What this data can and cannot describe">
            <div className="historical-properties">
              <div><span>Source</span><strong>San Francisco Fire Department open data</strong></div>
              <div><span>Record status</span><strong>Closed historic incidents only</strong></div>
              <div><span>Location source</span><strong>Published coordinates · not GPS tracking</strong></div>
              <div><span>Refresh cadence</span><strong>Manual import · public source may lag</strong></div>
            </div>
            <Link className="subtle-link analytics-source-link" to="/sources">View data provenance <Database size={13} /></Link>
          </Card>
          <Card title="Map coverage" subtitle="Coordinate availability in the loaded archive">
            <div className="archive-coverage"><MapPin size={19} /><strong>{mappedCount.toLocaleString()} / {records.length.toLocaleString()}</strong><span>{records.length ? Math.round((mappedCount / records.length) * 100) : 0}% have valid source coordinates</span><Link className="button button--secondary" to="/map"><Activity size={14} /> Explore historical map</Link></div>
          </Card>
          <HistoricalAiAnalysis mode="trends" />
        </div>
        {sourceUpdated && <div className="overview-footnote">Latest source update value in this result: {new Date(sourceUpdated).toLocaleString()} · Values are descriptive public records, not agency performance indicators.</div>}
      </> : <PublicDataEmpty action={<Link className="button button--secondary" to="/sources">Configure the public archive</Link>} />}
      <StatusMessage tone="warning"><strong>Not an operational performance report.</strong> This page makes no claims about response times, dispatch activity, staffing, service levels, active incidents, or emergency readiness.</StatusMessage>
    </div>
  );
}
