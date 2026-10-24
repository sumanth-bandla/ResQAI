import { useMemo, useState } from "react";
import { Database, MapPin, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, PageHeader, StatusMessage } from "../components/Ui";
import { HistoryMap } from "../components/HistoryMap";
import { PublicDataEmpty, PublicFeedNotice } from "../components/PublicFeedStatus";
import { usePublicData } from "../dataContext";

export function MapPage() {
  const { records, status } = usePublicData();
  const [query, setQuery] = useState("");
  const [neighborhood, setNeighborhood] = useState("All neighborhoods");
  const [showMarkers, setShowMarkers] = useState(true);
  const [selectedId, setSelectedId] = useState<string>();

  const neighborhoods = useMemo(
    () => [...new Set(records.map((record) => record.neighborhood).filter((value): value is string => Boolean(value)))].sort(),
    [records],
  );

  const filtered = useMemo(() => records.filter((record) => {
    const search = `${record.incident_number} ${record.call_number} ${record.address} ${record.neighborhood} ${record.primary_situation}`.toLowerCase();
    return search.includes(query.toLowerCase()) && (neighborhood === "All neighborhoods" || record.neighborhood === neighborhood);
  }), [records, query, neighborhood]);

  const located = filtered.filter((record) => record.latitude !== null && record.longitude !== null);
  const selected = records.find((record) => record.id === selectedId);

  return (
    <div className="page-stack">
      <PageHeader eyebrow="PUBLIC DATA / HISTORICAL GEOGRAPHY" title="San Francisco record map" description="Real OpenStreetMap streets · published historical SFFD incident coordinates." action={<span className="source-readonly-badge"><Database size={13} /> HISTORICAL · READ ONLY</span>} />
      <PublicFeedNotice />
      <StatusMessage tone="warning">These are reported historical locations from closed incidents—not active emergencies, live tracking, navigation directions, or a CAD/GPS feed. OpenStreetMap tiles are community-operated with no availability SLA.</StatusMessage>
      {status !== "ready" || records.length === 0 ? <PublicDataEmpty action={<Link className="button button--secondary" to="/sources">Set up the read-only archive</Link>} /> : <>
        <div className="map-workspace-grid">
          <div className="map-workspace-main">
            <div className="map-toolbar">
              <label><Search size={15} /><input aria-label="Search public records on the map" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search public incident ID, address or description" /></label>
              <select aria-label="Filter by neighborhood" value={neighborhood} onChange={(event) => setNeighborhood(event.target.value)}><option>All neighborhoods</option>{neighborhoods.map((name) => <option key={name}>{name}</option>)}</select>
              <button className="button button--secondary button--small" onClick={() => setShowMarkers((value) => !value)}>{showMarkers ? "Hide records" : "Show records"}</button>
              <span className="map-toolbar-live"><i /> CLOSED EVENTS · NOT LIVE</span>
            </div>
            <HistoryMap
              records={showMarkers ? located.slice(0, 500) : []}
              height="min(58vh, 580px)"
              selectedId={selectedId}
              onSelect={(record) => setSelectedId(record.id)}
            />
            <div className="map-geography"><span>{located.length.toLocaleString()} matched historical locations · showing at most 500</span><span>Map tiles © OpenStreetMap contributors</span></div>
          </div>
          <aside className="page-stack">
            <Card title="Selected historical record" subtitle={selected ? `PUBLIC FIRE RECORD #${selected.incident_number}` : "Select a mapped historical point"}>
              {selected
                ? <>
                  <h3 className="selected-incident-title">{selected.primary_situation || "Fire department incident"}</h3>
                  <p className="selected-incident-address">{selected.address}, {selected.neighborhood || "San Francisco"}</p>
                  <span className="address-verified"><MapPin size={12} /> Historical source location · not live navigation</span>
                  <div className="selected-response"><div><span>Reported incident date</span><strong>{new Date(selected.incident_date).toLocaleDateString()}</strong></div><div><span>Source close time</span><strong>{new Date(selected.closed_at).toLocaleString()}</strong></div></div>
                  <Link className="button button--primary full-button" to={`/incidents/${encodeURIComponent(selected.id)}`}>View public record</Link>
                </>
                : <div className="empty-inline">Map points are sourced from historical records. Select a point to inspect its public record.</div>}
            </Card>
            <Card title="Map details" subtitle="Locations published in the city open-data source">
              <div className="historical-properties"><div><span>Records matching filters</span><strong>{filtered.length.toLocaleString()}</strong></div><div><span>Records with valid coordinates</span><strong>{located.length.toLocaleString()}</strong></div><div><span>Map data</span><strong>OpenStreetMap · © contributors</strong></div><div><span>Incident data</span><strong>Public records · closed ≥30 days ago</strong></div></div>
            </Card>
            <a className="subtle-link source-map-link" href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap licence and attribution <MapPin size={12} /></a>
          </aside>
        </div>
      </>}
    </div>
  );
}
