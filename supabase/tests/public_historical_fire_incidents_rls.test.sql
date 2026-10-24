begin;

select plan(9);

select ok(
  (select relrowsecurity from pg_class where oid = 'public.sf_fire_incidents'::regclass),
  'row level security is enabled'
);

select is(
  has_table_privilege('anon', 'public.sf_fire_incidents', 'SELECT'),
  false,
  'anonymous clients may not read the archive'
);

select is(
  has_table_privilege('authenticated', 'public.sf_fire_incidents', 'SELECT'),
  true,
  'authenticated accounts may read the delayed historical archive'
);

select is(
  has_table_privilege('anon', 'public.sf_fire_incidents', 'INSERT'),
  false,
  'anonymous clients may not insert incident records'
);

select is(
  has_table_privilege('anon', 'public.sf_fire_incidents', 'UPDATE'),
  false,
  'anonymous clients may not update incident records'
);

select is(
  has_table_privilege('anon', 'public.sf_fire_incidents', 'DELETE'),
  false,
  'anonymous clients may not delete incident records'
);

select is(
  has_table_privilege('authenticated', 'public.sf_fire_incidents', 'INSERT'),
  false,
  'authenticated clients may not insert incident records'
);

select is(
  has_table_privilege('authenticated', 'public.sf_fire_incidents', 'UPDATE'),
  false,
  'authenticated clients may not update incident records'
);

select is(
  has_table_privilege('authenticated', 'public.sf_fire_incidents', 'DELETE'),
  false,
  'authenticated clients may not delete incident records'
);

select * from finish();
rollback;
