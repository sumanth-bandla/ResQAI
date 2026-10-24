import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import type { PublicFireIncident } from "../dataContext";

export function HistoricalFireTable({ records }: { records: PublicFireIncident[] }) {
  return (
    <div className="table-scroll">
      <table className="data-table historical-fire-table">
        <thead>
          <tr>
            <th>Incident date</th>
            <th>Public report</th>
            <th>Location</th>
            <th>Neighborhood</th>
            <th>Station</th>
            <th>Closed at</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {records.map((record) => (
            <tr key={record.id}>
              <td>{formatHistoricalDate(record.incident_date)}</td>
              <td>
                <Link className="table-link" to={`/incidents/${encodeURIComponent(record.id)}`}>
                  {record.primary_situation || "Fire department incident"}
                  <small>Call #{record.call_number || record.incident_number} · Official historical record</small>
                </Link>
              </td>
              <td>{record.address}<small>{record.zipcode || "San Francisco"}</small></td>
              <td>{record.neighborhood || "Not reported"}</td>
              <td>{record.station_area || "Not reported"}</td>
              <td>{formatHistoricalDate(record.closed_at)}</td>
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
