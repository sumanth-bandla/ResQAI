import { useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, CalendarDays, Database, Filter, Search, ShieldCheck, SlidersHorizontal } from "lucide-react";
import { Link } from "react-router-dom";
import { PageHeader } from "../components/Ui";
import { HistoricalFireTable } from "../components/HistoricalFireTable";
import { PublicDataEmpty, PublicFeedNotice } from "../components/PublicFeedStatus";
import { usePublicData } from "../dataContext";

const PAGE_SIZE = 50;

export function IncidentsPage() {
  const { records, status } = usePublicData();
  const [query, setQuery] = useState("");
  const [neighborhood, setNeighborhood] = useState("All neighborhoods");
  const [recordType, setRecordType] = useState("All record types");
  const [locationFilter, setLocationFilter] = useState("All records");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [page, setPage] = useState(0);

  const neighborhoods = useMemo(() => [...new Set(records.map((record) => record.neighborhood).filter((value): value is string => Boolean(value)))].sort(), [records]);
  const situations = useMemo(() => [...new Set(records.map((record) => record.primary_situation).filter((value): value is string => Boolean(value)))].sort(), [records]);

  const filtered = useMemo(() => records.filter((record) => {
    const searchable = `${record.incident_number} ${record.address} ${record.call_number} ${record.neighborhood} ${record.primary_situation} ${record.station_area}`.toLowerCase();
    const inDateRange = (!startDate || record.incident_date >= startDate) && (!endDate || record.incident_date.slice(0, 10) <= endDate);
    const hasCoordinates = record.latitude !== null && record.longitude !== null;
    return searchable.includes(query.toLowerCase())
      && inDateRange
      && (neighborhood === "All neighborhoods" || record.neighborhood === neighborhood)
      && (recordType === "All record types" || record.primary_situation === recordType)
      && (locationFilter === "All records" || (locationFilter === "Mapped records" ? hasCoordinates : !hasCoordinates));
  }), [records, query, neighborhood, recordType, locationFilter, startDate, endDate]);

  const pageCount = Math.ceil(filtered.length / PAGE_SIZE);
  const currentRecords = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const mappedCount = records.filter((record) => record.latitude !== null && record.longitude !== null).length;
  const allDates = records.map((record) => record.incident_date).sort();

  function resetFilters() {
    setQuery("");
    setNeighborhood("All neighborhoods");
    setRecordType("All record types");
    setLocationFilter("All records");
    setStartDate("");
    setEndDate("");
    setPage(0);
  }

  function changeFilter(change: () => void) {
    change();
    setPage(0);
  }

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="SAN FRANCISCO OPEN DATA · CLOSED HISTORICAL RECORDS"
        title="Fire incident archive"
        description="Search the public record of completed San Francisco Fire Department incidents. No active calls or response status are provided."
        action={<Link className="button button--secondary" to="/sources"><Database size={14} /> Data provenance</Link>}
      />
      <PublicFeedNotice />
      {status !== "ready" || records.length === 0 ? <PublicDataEmpty action={<Link className="button button--secondary" to="/sources">Set up the archive</Link>} /> : <>
        <div className="records-archive-note"><span className="records-archive-note__icon"><ShieldCheck size={15} /></span><span><strong>Verified public archive</strong><small>Closed historical records only · source data may be delayed · no live incident feed</small></span><span className="records-archive-note__badge"><i /> READ ONLY</span></div>
        <div className="metric-grid metric-grid--four">
          <div className="metric-card metric-card--small"><span>Records in this query</span><strong>{records.length.toLocaleString()}</strong><small>Most recent available · max 500</small></div>
          <div className="metric-card metric-card--small"><span>Mapped locations</span><strong>{mappedCount.toLocaleString()}</strong><small>Source coordinates · not live GPS</small></div>
          <div className="metric-card metric-card--small"><span>Neighborhoods represented</span><strong>{neighborhoods.length.toLocaleString()}</strong><small>As provided by the public dataset</small></div>
          <div className="metric-card metric-card--small"><span>Source-record date range</span><strong className="date-range-value">{allDates[0] ? new Date(allDates[0]).toLocaleDateString() : "—"} – {allDates.at(-1) ? new Date(allDates.at(-1)!).toLocaleDateString() : "—"}</strong><small>Archive records only · 30-day delay</small></div>
        </div>
        <section className="card incidents-card">
          <div className="records-card-heading"><div><span>PUBLIC RECORDS</span><strong>{filtered.length.toLocaleString()} <small>matching results</small></strong></div><span className="records-card-heading__range">Up to {records.length.toLocaleString()} records loaded</span></div>
          <div className="tabs-row" role="group" aria-label="Filter records by location availability">
            {["All records", "Mapped records", "Records without map points"].map((name) => <button key={name} aria-pressed={locationFilter === name} onClick={() => changeFilter(() => setLocationFilter(name))} className={`text-tab${locationFilter === name ? " text-tab--active" : ""}`}>{name}<span>{name === "All records" ? records.length : name === "Mapped records" ? mappedCount : records.length - mappedCount}</span></button>)}
            <span className="tabs-spacer" />
            <a className="text-link-quiet" href="https://data.sfgov.org/d/wr8u-xric" target="_blank" rel="noreferrer">Official dataset <ArrowRight size={12} /></a>
          </div>
          <div className="records-filter-heading"><span><SlidersHorizontal size={14} /> Search and refine</span><small>Filters apply to the loaded archive only</small></div>
          <div className="incident-filters">
            <label className="search-control"><Search size={15} /><input aria-label="Search public records" value={query} onChange={(event) => changeFilter(() => setQuery(event.target.value))} placeholder="Search public ID, address or incident description" /></label>
            <select aria-label="Filter by neighborhood" value={neighborhood} onChange={(event) => changeFilter(() => setNeighborhood(event.target.value))}><option>All neighborhoods</option>{neighborhoods.map((name) => <option key={name}>{name}</option>)}</select>
            <select aria-label="Filter by recorded event" value={recordType} onChange={(event) => changeFilter(() => setRecordType(event.target.value))}><option>All record types</option>{situations.map((name) => <option key={name}>{name}</option>)}</select>
            <label className="date-filter"><CalendarDays size={13} /><input aria-label="Incident start date" type="date" value={startDate} onChange={(event) => changeFilter(() => setStartDate(event.target.value))} /></label>
            <label className="date-filter"><span>to</span><input aria-label="Incident end date" type="date" value={endDate} onChange={(event) => changeFilter(() => setEndDate(event.target.value))} /></label>
            <button className="button button--secondary button--small" onClick={resetFilters}><Filter size={13} /> Reset</button>
          </div>
          <HistoricalFireTable records={currentRecords} />
          <div className="historical-pagination"><span>Showing {filtered.length ? page * PAGE_SIZE + 1 : 0}–{Math.min((page + 1) * PAGE_SIZE, filtered.length)} of {filtered.length.toLocaleString()} public records · read only</span><div><button className="button button--secondary button--small" aria-label="Previous page" disabled={page === 0} onClick={() => setPage((value) => Math.max(value - 1, 0))}><ArrowLeft size={13} /></button><span>Page {pageCount === 0 ? 0 : page + 1} of {pageCount}</span><button className="button button--secondary button--small" aria-label="Next page" disabled={page + 1 >= pageCount} onClick={() => setPage((value) => Math.min(value + 1, pageCount - 1))}><ArrowRight size={13} /></button></div></div>
        </section>
      </>}
      <div className="public-data-safety">Every displayed record is from a public archive of already closed historical calls. Record timing reflects the source publication and synchronization schedule; this is not an active incident queue.</div>
    </div>
  );
}
