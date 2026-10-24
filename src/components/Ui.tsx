import type { ReactNode } from "react";
import { ArrowUpRight, Database } from "lucide-react";
import { Link } from "react-router-dom";
import type { Incident, Priority } from "../types";

export function PageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="page-heading">
      <div>
        {eyebrow && <div className="page-eyebrow">{eyebrow}</div>}
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      {action && <div className="page-heading__action">{action}</div>}
    </div>
  );
}

export function Button({
  children,
  variant = "primary",
  onClick,
  type = "button",
  disabled = false,
  className = "",
}: {
  children: ReactNode;
  variant?: "primary" | "secondary" | "quiet" | "danger";
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
  className?: string;
}) {
  return <button className={`button button--${variant} ${className}`} type={type} onClick={onClick} disabled={disabled}>{children}</button>;
}

export function Pill({ children, tone = "neutral" }: { children: ReactNode; tone?: "critical" | "high" | "moderate" | "proposed" | "success" | "neutral" }) {
  return <span className={`pill pill--${tone}`}>{children}</span>;
}

export function priorityTone(priority: Priority): "critical" | "high" | "moderate" | "proposed" {
  if (priority.startsWith("P1")) return "critical";
  if (priority.startsWith("P2")) return "high";
  if (priority.startsWith("P3")) return "moderate";
  return "proposed";
}

export function IncidentTable({ incidents, compact = false }: { incidents: Incident[]; compact?: boolean }) {
  return (
    <div className="table-scroll">
      <table className={`data-table${compact ? " data-table--compact" : ""}`}>
        <thead>
          <tr><th>Priority</th><th>Incident</th><th>Location</th><th>Response status</th><th>Reported</th><th>Source</th><th aria-label="Open" /></tr>
        </thead>
        <tbody>
          {incidents.map((incident) => (
            <tr key={incident.id} className={incident.id === "1048" ? "row-highlight" : ""}>
              <td><Pill tone={priorityTone(incident.priority)}>{incident.priority}</Pill></td>
              <td><Link to={`/incidents/${incident.id}`} className="table-link">{incident.title} <span>#{incident.id}</span><small>{incident.kind}</small></Link></td>
              <td>{incident.address}<small>{incident.neighborhood}</small></td>
              <td><span className={`response-state response-state--${incident.response.toLowerCase().replaceAll(" ", "-")}`}>{incident.response}</span><small>{incident.units.length ? `${incident.units.length} unit${incident.units.length === 1 ? "" : "s"} responding` : "Not dispatched"}</small></td>
              <td>{incident.reported}</td><td>{incident.source}</td>
              <td><Link className="row-open" to={`/incidents/${incident.id}`} aria-label={`Open incident ${incident.id}`}><ArrowUpRight size={15} /></Link></td>
            </tr>
          ))}
          {incidents.length === 0 && <tr><td colSpan={7} className="empty-row">No incidents match this view.</td></tr>}
        </tbody>
      </table>
    </div>
  );
}

export function Card({ children, title, subtitle, action, className = "" }: { children: ReactNode; title?: string; subtitle?: string; action?: ReactNode; className?: string }) {
  return (
    <section className={`card ${className}`}>
      {(title || subtitle || action) && <header className="card__header"><div>{title && <h2>{title}</h2>}{subtitle && <p>{subtitle}</p>}</div>{action}</header>}
      {children}
    </section>
  );
}

export function DemoFooter() {
  return <div className="demo-footer"><Database size={12} /> Public historical archive · CAD, 911, and responder GPS are not connected</div>;
}

export function StatusMessage({ children, tone = "info" }: { children: ReactNode; tone?: "info" | "warning" | "success" }) {
  return <div className={`status-message status-message--${tone}`}>{children}</div>;
}
