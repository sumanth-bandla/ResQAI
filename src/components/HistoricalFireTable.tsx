import { ArrowUpRight, MapPin, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import type { PublicFireIncident } from "../dataContext";

export function HistoricalFireTable({ records }: { records: PublicFireIncident[] }) {
  return (
    <div className="table-scroll">
      <table className="data-table historical-fire-table">
        <caption className="visually-hidden">Closed historical San Francisco fire department records matching the current filters.</caption>
        <thead>
          <tr>
            <th scope="col">Incident date</th>
            <th scope="col">Public report</th>
            <th scope="col">Published location</th>
            <th scope="col">Neighborhood</th>
            <th scope="col">Station area</th>
            <th scope="col">Reported closed</th>
            <th scope="col"><span className="visually-hidden">Open record</span></th>
          </tr>
        </thead>
        <tbody>
          {records.map((record) => (
            <tr key={record.id}>
              <td><span className="historical-date-cell"><strong>{formatHistoricalDate(record.incident_date)}</strong><small>Incident date</small></span></td>
              <td>
                <Link className="historical-report-link" to={`/incidents/${encodeURIComponent(record.id)}`}>
                  <span className="historical-report-icon"><ShieldCheck size={14} /></span>
                  <span className="historical-report-copy"><strong>{record.primary_situation || "Fire department incident"}</strong><small>Public record #{record.call_number || record.incident_number}</small></span>
                </Link>
              </td>
              <td><span className="historical-location-cell"><MapPin size={13} /><span><strong>{record.address}</strong><small>{record.zipcode || "San Francisco"}</small></span></span></td>
              <td>{record.neighborhood || "Not reported"}</td>
              <td>{record.station_area || "Not reported"}</td>
              <td><span className="historical-date-cell"><strong>{formatHistoricalDate(record.closed_at)}</strong><small>Closed in source</small></span></td>
              <td><Link className="row-open" to={`/incidents/${encodeURIComponent(record.id)}`} aria-label={`View public fire record ${record.incident_number}`}><ArrowUpRight size={15} /></Link></td>
            </tr>
          ))}
          {records.length === 0 && <tr><td colSpan={7} className="empty-row">No public historical records match these filters.</td></tr>}
        </tbody>
      </table>
    </div>
  );
}

export function formatHistoricalDate(value: string): string {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: value.includes("T") ? "short" : undefined,
  }).format(new Date(value));
}
