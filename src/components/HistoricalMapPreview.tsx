export function HistoricalMapPreview() {
  return (
    <svg
      className="historical-map-preview"
      viewBox="0 0 720 220"
      preserveAspectRatio="xMidYMid slice"
      role="img"
      aria-labelledby="historical-map-title historical-map-description"
    >
      <title id="historical-map-title">Illustrated San Francisco street map preview</title>
      <desc id="historical-map-description">
        A non-interactive map illustration of downtown San Francisco. Actual historical record locations are shown after sign-in.
      </desc>
      <rect width="720" height="220" fill="#e8efea" />
      <path d="M610-8h125v240H590c18-39-6-66 9-99 14-31-7-54 6-83 9-21-7-37 5-58Z" fill="#c8e1e5" />
      <path d="M618 0c-10 31-12 53-1 75 12 25-8 48 0 75 9 24-6 44-10 68" fill="none" stroke="#a9ccd1" strokeWidth="2" />
      <path d="M35 0 84 220M155-12l39 244M276-12l32 244M397-12l23 244M510-12l14 244M-10 48l632 39M-10 111l626 20M-10 177l610 2" fill="none" stroke="#fff" strokeWidth="12" />
      <path d="M35 0 84 220M155-12l39 244M276-12l32 244M397-12l23 244M510-12l14 244M-10 48l632 39M-10 111l626 20M-10 177l610 2" fill="none" stroke="#c6d4cd" strokeWidth="1" />
      <path d="m84 21 70 5 13 32-69-3Zm204 101 92 3 5 37-90-4Zm-180 42 85 2 9 31-84-1Z" fill="#c5d9c1" />
      <path d="M6 76 618 156M118 0l410 220M347 0l190 220" fill="none" stroke="#d5e0da" strokeWidth="2" strokeDasharray="5 7" />
      <g fill="#667f76" fontFamily="Arial, sans-serif" fontSize="10" fontWeight="600" letterSpacing="1.1">
        <text x="73" y="78">CIVIC CENTER</text>
        <text x="259" y="92">SOUTH OF MARKET</text>
        <text x="414" y="61">RINCON HILL</text>
        <text x="395" y="185">MISSION BAY</text>
      </g>
      <text x="675" y="132" fill="#72929a" fontFamily="Arial, sans-serif" fontSize="9" letterSpacing="1.6" transform="rotate(90 675 132)">SAN FRANCISCO BAY</text>
      <g transform="translate(18 17)">
        <rect width="99" height="21" rx="3" fill="#fff" fillOpacity=".88" />
        <text x="9" y="14" fill="#536b62" fontFamily="Arial, sans-serif" fontSize="8" fontWeight="700" letterSpacing="1">MAP PREVIEW</text>
      </g>
      <g transform="translate(676 20)" fill="none" stroke="#60796e" strokeWidth="1.5">
        <path d="M0 17V1m0 0L-4 7m4-6 4 6" />
      </g>
      <text x="670" y="45" fill="#60796e" fontFamily="Arial, sans-serif" fontSize="7" fontWeight="700">N</text>
    </svg>
  );
}
