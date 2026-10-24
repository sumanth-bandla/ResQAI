create table if not exists public.sf_fire_incidents (
  id text primary key,
  incident_number text not null,
  exposure_number text not null default '0',
  incident_date timestamptz not null,
  closed_at timestamptz not null,
  address text not null,
  call_number text,
  primary_situation text,
  property_use text,
  action_taken text,
  neighborhood text,
  station_area text,
  battalion text,
  supervisor_district text,
  zipcode text,
  latitude double precision,
  longitude double precision,
  source_updated_at timestamptz,
  source_url text not null default 'https://data.sfgov.org/d/wr8u-xric',
  imported_at timestamptz not null default now(),
  constraint sf_fire_incidents_valid_id check (length(id) between 1 and 32),
  constraint sf_fire_incidents_san_francisco_location check (
    (latitude is null and longitude is null)
    or (
      latitude between 37.0 and 38.0
      and longitude between -123.0 and -122.0
    )
  ),
  constraint sf_fire_incidents_valid_coordinates check (
    (latitude is null and longitude is null)
    or (latitude is not null and longitude is not null)
  )
);

create index if not exists sf_fire_incidents_incident_date_idx
  on public.sf_fire_incidents (incident_date desc);
create index if not exists sf_fire_incidents_neighborhood_idx
  on public.sf_fire_incidents (neighborhood);

alter table public.sf_fire_incidents enable row level security;

revoke all on table public.sf_fire_incidents from anon, authenticated;
grant select on table public.sf_fire_incidents to authenticated;
grant all on table public.sf_fire_incidents to service_role;

drop policy if exists "Public can read delayed closed public fire records"
  on public.sf_fire_incidents;
drop policy if exists "Authenticated users can read delayed closed public fire records"
  on public.sf_fire_incidents;
create policy "Authenticated users can read delayed closed public fire records"
  on public.sf_fire_incidents
  for select
  to authenticated
  using (closed_at < now() - interval '30 days');

drop policy if exists "No client inserts to public fire records"
  on public.sf_fire_incidents;
drop policy if exists "No client updates to public fire records"
  on public.sf_fire_incidents;
drop policy if exists "No client deletes from public fire records"
  on public.sf_fire_incidents;

comment on table public.sf_fire_incidents is
  'Read-only, authenticated-user access to historical San Francisco Fire Department open-data records. Closed at least 30 days before exposure. Never operational dispatch data.';
comment on column public.sf_fire_incidents.source_url is
  'Original public San Francisco open-data dataset. Data belongs to its publisher.';
