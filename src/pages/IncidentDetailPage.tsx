import { ArrowLeft, ArrowUpRight, Database, MapPin, ShieldAlert } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { Card, PageHeader, StatusMessage } from "../components/Ui";
import { HistoryMap } from "../components/HistoryMap";
import { PublicDataEmpty, PublicFeedNotice } from "../components/PublicFeedStatus";
import { HistoricalAiAnalysis } from "../components/HistoricalAiAnalysis";
import { formatHistoricalDate } from "../components/HistoricalFireTable";
import { usePublicData } from "../dataContext";

export function IncidentDetailPage() {
  const { id } = useParams();
  const { records, status } = usePublicData();
  const incident = records.find((record) => record.id === id);

  if (status !== "ready") {
    return <div className="page-stack"><PageHeader title="Public record" description="Loading a closed historic record from the San Francisco public dataset." /><PublicFeedNotice /><PublicDataEmpty /></div>;
  }

  if (!incident) {
    return (
      <div className="page-stack">
        <Link className="back-link" to="/incidents"><ArrowLeft size={14} /> Historical records</Link>
        <PageHeader title="Record not in the current archive" description="It may be outside the selected import window or among records not included in the latest 500-row archive." />
        <PublicDataEmpty action={<Link className="button button--secondary" to="/incidents">Return to public records</Link>} />
      </div>
    );
  }

  const coordinates: [number, number] | null = incident.latitude !== null && incident.longitude !== null
    ? [incident.latitude, incident.longitude]
    : null;

  return (
    <div className="page-stack">
      <Link className="back-link" to="/incidents"><ArrowLeft size={14} /> Historical records <span>/</span> Public record #{incident.incident_number}</Link>
      <PageHeader eyebrow="OFFICIAL PUBLIC ARCHIVE · CLOSED EVENT" title={`Fire incident #${incident.incident_number}`} description={incident.primary_situation || "Fire department incident · original public source classification not reported"} action={<a className="button button--secondary" href={incident.source_url} target="_blank" rel="noreferrer">View source record <ArrowUpRight size={14} /></a>} />
      <PublicFeedNotice />
      <StatusMessage tone="warning"><ShieldAlert size={15} /><span><strong>Historical data only.</strong> This event was reported closed in the source and is at least 30 days old. This record does not show current emergency conditions, response status, available units, or verified navigation.</span></StatusMessage>
      <div className="historical-detail-grid">
        <div className="page-stack">
          {coordinates
            ? <Card title="Reported historical location" subtitle="Coordinates published with this closed city record"><HistoryMap records={[incident]} center={coordinates} zoom={15} height="310px" /><div className="public-map-caption"><MapPin size={13} /> {incident.address}, San Francisco · Published source coordinates · Map tiles © OpenStreetMap contributors</div></Card>
            : <Card title="Location not mapped" subtitle="This source record does not contain a valid San Francisco map point"><div className="empty-inline"><MapPin size={16} />{incident.address}, San Francisco</div></Card>}
          <Card title="Source classification" subtitle="Original values from the historical open-data record"><div className="historical-properties"><div><span>Primary situation</span><strong>{incident.primary_situation || "Not reported"}</strong></div><div><span>Property use</span><strong>{incident.property_use || "Not reported"}</strong></div><div><span>Action taken</span><strong>{incident.action_taken || "Not reported"}</strong></div><div><span>Call number</span><strong>{incident.call_number || "Not reported"}</strong></div></div></Card>
        </div>
        <aside className="page-stack">
          <Card title="Record dates" subtitle="Source incident and closure timestamps"><div className="historical-properties"><div><span>Incident date</span><strong>{formatHistoricalDate(incident.incident_date)}</strong></div><div><span>Reported closed</span><strong>{formatHistoricalDate(incident.closed_at)}</strong></div><div><span>Source record updated</span><strong>{incident.source_updated_at ? formatHistoricalDate(incident.source_updated_at) : "Not reported"}</strong></div><div><span>Imported into Supabase</span><strong>{formatHistoricalDate(incident.imported_at)}</strong></div></div></Card>
          <Card title="Published location details"><div className="historical-properties"><div><span>Address as published</span><strong>{incident.address}</strong></div><div><span>Neighborhood</span><strong>{incident.neighborhood || "Not reported"}</strong></div><div><span>ZIP code</span><strong>{incident.zipcode || "Not reported"}</strong></div><div><span>Station area</span><strong>{incident.station_area || "Not reported"}</strong></div><div><span>Battalion</span><strong>{incident.battalion || "Not reported"}</strong></div><div><span>Supervisor district</span><strong>{incident.supervisor_district || "Not reported"}</strong></div></div></Card>
          <Card title="Source and data access"><div className="source-card"><Database size={16} /><span><strong>San Francisco Fire Incidents</strong><small>City-published historic records · Supabase public table · read-only browser access</small><a href={incident.source_url} target="_blank" rel="noreferrer">Open original source <ArrowUpRight size={12} /></a></span></div></Card>
          <HistoricalAiAnalysis mode="summary" recordId={incident.id} />
        </aside>
      </div>
    </div>
  );
}
