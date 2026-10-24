import { useState } from "react";
import { Crosshair, Layers, Minus, Plus } from "lucide-react";

type Marker = { x: number; y: number; id: string; level: "critical" | "high" | "moderate" | "unit" };
const markers: Marker[] = [
  { x: 31, y: 24, id: "49", level: "critical" }, { x: 49, y: 52, id: "48", level: "critical" },
  { x: 64, y: 43, id: "51", level: "high" }, { x: 60, y: 68, id: "50", level: "high" },
  { x: 53, y: 84, id: "52", level: "high" }, { x: 18, y: 18, id: "55", level: "moderate" },
  { x: 21, y: 57, id: "54", level: "moderate" }, { x: 73, y: 19, id: "53", level: "moderate" },
  { x: 36, y: 64, id: "E12", level: "unit" }, { x: 55, y: 49, id: "A04", level: "unit" },
  { x: 39, y: 36, id: "E07", level: "unit" },
];

export function MapIllustration({
  large = false,
  onSelect,
  showIncidents = true,
  showUnits,
  showRoutes = true,
  onToggleUnits,
}: {
  large?: boolean;
  onSelect?: (id: string) => void;
  showIncidents?: boolean;
  showUnits?: boolean;
  showRoutes?: boolean;
  onToggleUnits?: () => void;
}) {
  const [zoom, setZoom] = useState(1);
  const [internalShowUnits, setInternalShowUnits] = useState(true);
  const unitsVisible = showUnits ?? internalShowUnits;

  return (
    <div className={`map-illustration${large ? " map-illustration--large" : ""}`}>
      <svg className="street-map" viewBox="0 0 800 450" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Illustrated San Francisco street map with incidents and response units">
        <rect width="800" height="450" fill="#e7f0ec" />
        <path d="M671 0h129v450H647c19-63-11-99 7-151 20-58-14-94 1-145 12-40-10-88 16-154Z" fill="#c7e0e7" />
        <path d="M682 0c-16 64-20 88 1 135 17 39-13 83-1 125 13 47-13 83-13 121-1 28-7 45-13 69" fill="none" stroke="#a7cdd1" strokeWidth="3" />
        <path d="M-30 82 675 170M-20 236 679 105M-10 368 676 230M5 12 648 319M80-10 710 385M222-15 687 423M380-8 705 287M512-20 644 442M-20 157 674 295M151-14 657 238M306-12 692 356M-10 300 684 64" stroke="#fff" strokeWidth="18" />
        <path d="M-30 82 675 170M-20 236 679 105M-10 368 676 230M5 12 648 319M80-10 710 385M222-15 687 423M380-8 705 287M512-20 644 442M-20 157 674 295M151-14 657 238M306-12 692 356M-10 300 684 64" stroke="#c5d5cf" strokeWidth="1.4" />
        <path d="m42 95 578 75-6 95L52 192Zm129-99 75 7 46 374-75 6Zm208-4 70-4 32 404-68 5Z" fill="#c0dbc5" fillOpacity=".32" />
        <path d="m0 201 674 65m-643-134 644 88M140 20l55 408m172-415 45 425m115-390 8 329" stroke="#d3e1da" strokeWidth="2" strokeDasharray="6 8" />
        {showRoutes && <path d="M392 236c34-40 82-34 118-4 28 24 19 46 71 61" fill="none" stroke="#0b8d86" strokeWidth="3" strokeDasharray="7 7" />}
        <g fill="#788d86" fontFamily="Arial, sans-serif" fontSize="12" letterSpacing="1.4">
          <text x="124" y="90">CIVIC CENTER</text><text x="306" y="148">SOUTH OF MARKET</text>
          <text x="478" y="110">RINCON HILL</text><text x="502" y="250">SOUTH BEACH</text>
          <text x="414" y="348">MISSION BAY</text>
        </g>
        <text x="714" y="285" fill="#72929a" fontFamily="Arial, sans-serif" fontSize="11" letterSpacing="2" transform="rotate(90 714 285)">SAN FRANCISCO BAY</text>
      </svg>
      <div className="map-markers" style={{ transform: `scale(${zoom})` }}>
        {markers.filter((marker) => marker.level === "unit" ? unitsVisible : showIncidents).map((marker) => (
          <button
            key={marker.id}
            type="button"
            className={`map-marker map-marker--${marker.level}${marker.id === "48" ? " map-marker--selected" : ""}`}
            style={{ left: `${marker.x}%`, top: `${marker.y}%` }}
            aria-label={marker.level === "unit" ? `Response unit ${marker.id}` : `Incident ${marker.id}`}
            onClick={() => onSelect?.(marker.id)}
          >
            {marker.level === "unit" ? <span className="unit-car">▰</span> : marker.id}
          </button>
        ))}
      </div>
      <span className="map-label map-label--north">N ↑</span>
      <span className="map-label map-label--scale">━━━━ 250 m</span>
      <div className="map-controls">
        <button type="button" aria-label={unitsVisible ? "Hide unit markers" : "Show unit markers"} onClick={() => onToggleUnits ? onToggleUnits() : setInternalShowUnits((value) => !value)}><Layers size={14} /></button>
        <button type="button" aria-label="Zoom in" onClick={() => setZoom((value) => Math.min(value + 0.1, 1.3))}><Plus size={15} /></button>
        <button type="button" aria-label="Zoom out" onClick={() => setZoom((value) => Math.max(value - 0.1, 0.9))}><Minus size={15} /></button>
        <button type="button" aria-label="Center map" onClick={() => setZoom(1)}><Crosshair size={14} /></button>
      </div>
    </div>
  );
}
