import "leaflet/dist/leaflet.css";
import { useEffect, useMemo } from "react";
import { CircleMarker, MapContainer, Popup, TileLayer, useMap } from "react-leaflet";
import { Link } from "react-router-dom";
import type { LatLngBoundsExpression } from "leaflet";
import type { PublicFireIncident } from "../dataContext";

const SAN_FRANCISCO_CENTER: [number, number] = [37.7749, -122.4194];
const TILE_URL = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
const ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>';

function FitRecords({ records }: { records: PublicFireIncident[] }) {
  const map = useMap();
  const bounds = useMemo<LatLngBoundsExpression | null>(() => {
    const located = records.flatMap((record) => record.latitude !== null && record.longitude !== null
      ? [[record.latitude, record.longitude] as [number, number]]
      : []);
    return located.length > 1 ? located : null;
  }, [records]);

  useEffect(() => {
    if (bounds) map.fitBounds(bounds, { padding: [30, 30], maxZoom: 13 });
  }, [bounds, map]);
  return null;
}

function FocusLocation({ location }: { location: [number, number] | null }) {
  const map = useMap();
  useEffect(() => {
    if (location) map.flyTo(location, 14, { duration: 0.8 });
  }, [location, map]);
  return null;
}

export function HistoryMap({
  records,
  height = "300px",
  selectedId,
  onSelect,
  userLocation = null,
  center = SAN_FRANCISCO_CENTER,
  zoom = 12,
}: {
  records: PublicFireIncident[];
  height?: string;
  selectedId?: string;
  onSelect?: (record: PublicFireIncident) => void;
  userLocation?: [number, number] | null;
  center?: [number, number];
  zoom?: number;
}) {
  const locatedRecords = records.filter((record) => record.latitude !== null && record.longitude !== null);
  return (
    <div className="history-map" style={{ height }}>
      <MapContainer
        center={center}
        zoom={zoom}
        minZoom={10}
        maxZoom={18}
        scrollWheelZoom
        preferCanvas
        attributionControl
        className="history-map__leaflet"
      >
        <TileLayer url={TILE_URL} attribution={ATTRIBUTION} maxZoom={19} />
        <FitRecords records={locatedRecords} />
        <FocusLocation location={userLocation} />
        {locatedRecords.map((record) => (
          <CircleMarker
            key={record.id}
            center={[record.latitude!, record.longitude!]}
            radius={record.id === selectedId ? 8 : 5}
            pathOptions={{
              color: record.id === selectedId ? "#0c6863" : "#ffffff",
              weight: record.id === selectedId ? 3 : 1.5,
              fillColor: "#c55a50",
              fillOpacity: 0.8,
            }}
            eventHandlers={{ click: () => onSelect?.(record) }}
          >
            <Popup>
              <div className="historical-popup">
                <strong>{record.primary_situation || "Reported fire department incident"}</strong>
                <span>{record.address} · {record.neighborhood || "San Francisco"}</span>
                <small>Closed {new Date(record.closed_at).toLocaleDateString()} · Historical public record</small>
                <Link to={`/incidents/${encodeURIComponent(record.id)}`}>View public record</Link>
              </div>
            </Popup>
          </CircleMarker>
        ))}
        {userLocation && (
          <CircleMarker
            center={userLocation}
            radius={8}
            pathOptions={{ color: "#ffffff", weight: 3, fillColor: "#16837c", fillOpacity: 1 }}
          >
            <Popup>
              <div className="historical-popup">
                <strong>Your browser-reported location</strong>
                <span>Shown only in this browser session. This is not responder tracking or emergency navigation.</span>
              </div>
            </Popup>
          </CircleMarker>
        )}
      </MapContainer>
      <span className="history-map__count">{locatedRecords.length.toLocaleString()} archived locations{userLocation ? " · your location is shown" : ""}</span>
    </div>
  );
}
