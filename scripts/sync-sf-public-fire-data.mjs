const sourceUrl = "https://data.sfgov.org/resource/wr8u-xric.json";
const sourcePage = "https://data.sfgov.org/d/wr8u-xric";
const maxRecords = 500;
const intervalDays = 365;
const privacyDelayDays = 30;
const chunkSize = 100;
const supabaseUrl = process.env.SUPABASE_URL?.replace(/\/+$/, "");
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error(
    "Configure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local before importing. Never use the service-role key in a VITE_ variable.",
  );
  process.exit(1);
}

if (!/^https:\/\/[a-z0-9.-]+\.supabase\.co$/i.test(supabaseUrl)) {
  console.error("SUPABASE_URL must be an HTTPS Supabase project URL.");
  process.exit(1);
}

if (/^(sb_secret_|sb_publishable_)/i.test(serviceRoleKey)) {
  console.error("SUPABASE_SERVICE_ROLE_KEY must be the project server-side service-role key.");
  process.exit(1);
}

const now = Date.now();
const closedBefore = new Date(now - privacyDelayDays * 86_400_000).toISOString();
const closedAfter = new Date(now - intervalDays * 86_400_000).toISOString();
const query = new URLSearchParams({
  $select: [
    "id",
    "incident_number",
    "exposure_number",
    "incident_date",
    "close_dttm",
    "address",
    "call_number",
    "primary_situation",
    "property_use",
    "action_taken_primary",
    "neighborhood_district",
    "station_area",
    "battalion",
    "supervisor_district",
    "zipcode",
    "point",
    "data_as_of",
  ].join(","),
  $where: `close_dttm IS NOT NULL AND close_dttm >= '${closedAfter}' AND close_dttm < '${closedBefore}' AND city in ('SF', 'San Francisco')`,
  $order: "incident_date DESC",
  $limit: String(maxRecords),
});

const sourceHeaders = { Accept: "application/json" };
if (process.env.SF_OPEN_DATA_APP_TOKEN) {
  sourceHeaders["X-App-Token"] = process.env.SF_OPEN_DATA_APP_TOKEN;
}

const sourceResponse = await fetch(`${sourceUrl}?${query}`, {
  headers: sourceHeaders,
  signal: AbortSignal.timeout(30_000),
});

if (!sourceResponse.ok) {
  console.error(`San Francisco Open Data returned HTTP ${sourceResponse.status}. No Supabase data was changed.`);
  process.exit(1);
}

const sourceRecords = await sourceResponse.json();
if (!Array.isArray(sourceRecords)) {
  console.error("The public dataset returned an unexpected response. No Supabase data was changed.");
  process.exit(1);
}

const records = sourceRecords.flatMap((record) => {
  const closedAt = new Date(record.close_dttm);
  const incidentDate = new Date(record.incident_date);
  const coordinates = record.point?.coordinates;
  const longitude = Array.isArray(coordinates) ? Number(coordinates[0]) : null;
  const latitude = Array.isArray(coordinates) ? Number(coordinates[1]) : null;

  if (
    !record.id
    || !record.incident_number
    || !record.address
    || Number.isNaN(closedAt.getTime())
    || Number.isNaN(incidentDate.getTime())
    || closedAt.getTime() >= now - privacyDelayDays * 86_400_000
    || closedAt.getTime() < now - intervalDays * 86_400_000
  ) {
    return [];
  }

  const hasValidLocation = Number.isFinite(latitude)
    && Number.isFinite(longitude)
    && latitude >= 37
    && latitude <= 38
    && longitude >= -123
    && longitude <= -122;

  return [{
    id: String(record.id),
    incident_number: String(record.incident_number),
    exposure_number: String(record.exposure_number || "0"),
    incident_date: incidentDate.toISOString(),
    closed_at: closedAt.toISOString(),
    address: String(record.address).slice(0, 200),
    call_number: record.call_number ? String(record.call_number).slice(0, 32) : null,
    primary_situation: record.primary_situation ? String(record.primary_situation).slice(0, 200) : null,
    property_use: record.property_use ? String(record.property_use).slice(0, 200) : null,
    action_taken: record.action_taken_primary ? String(record.action_taken_primary).slice(0, 200) : null,
    neighborhood: record.neighborhood_district ? String(record.neighborhood_district).slice(0, 100) : null,
    station_area: record.station_area ? String(record.station_area).slice(0, 16) : null,
    battalion: record.battalion ? String(record.battalion).slice(0, 16) : null,
    supervisor_district: record.supervisor_district ? String(record.supervisor_district).slice(0, 16) : null,
    zipcode: record.zipcode ? String(record.zipcode).slice(0, 16) : null,
    latitude: hasValidLocation ? latitude : null,
    longitude: hasValidLocation ? longitude : null,
    source_updated_at: record.data_as_of ? new Date(record.data_as_of).toISOString() : null,
    source_url: sourcePage,
    imported_at: new Date().toISOString(),
  }];
});

if (records.length === 0) {
  console.error("No closed records passed the source, date, and location checks. No Supabase data was changed.");
  process.exit(1);
}

for (let index = 0; index < records.length; index += chunkSize) {
  const batch = records.slice(index, index + chunkSize);
  const target = new URL(`${supabaseUrl}/rest/v1/sf_fire_incidents`);
  target.searchParams.set("on_conflict", "id");
  const response = await fetch(target, {
    method: "POST",
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      "Content-Type": "application/json",
      Prefer: "resolution=merge-duplicates,return=minimal",
    },
    body: JSON.stringify(batch),
    signal: AbortSignal.timeout(30_000),
  });

  if (!response.ok) {
    const details = (await response.text()).slice(0, 700);
    console.error(`Supabase import failed with HTTP ${response.status}: ${details}`);
    process.exit(1);
  }
}

const locatedRecords = records.filter((record) => record.latitude !== null).length;
console.log(
  `Imported ${records.length} public, closed records; ${locatedRecords} have valid San Francisco coordinates. The source window excludes the latest ${privacyDelayDays} days and records older than ${intervalDays} days.`,
);
