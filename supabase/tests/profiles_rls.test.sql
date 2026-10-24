begin;

select plan(8);

select ok(
  (select relrowsecurity from pg_class where oid = 'public.profiles'::regclass),
  'row level security is enabled for profiles'
);

select is(
  has_table_privilege('anon', 'public.profiles', 'SELECT'),
  false,
  'anonymous clients may not read profiles'
);

select is(
  has_table_privilege('authenticated', 'public.profiles', 'SELECT'),
  true,
  'authenticated clients may select profiles subject to RLS'
);

select is(
  has_column_privilege('authenticated', 'public.profiles', 'full_name', 'UPDATE'),
  true,
  'authenticated clients may update the permitted full name field'
);

select is(
  has_column_privilege('authenticated', 'public.profiles', 'id', 'UPDATE'),
  false,
  'authenticated clients may not change the internal Auth UUID'
);

select is(
  has_column_privilege('authenticated', 'public.profiles', 'public_user_id', 'UPDATE'),
  false,
  'authenticated clients may not change the public user ID'
);

select is(
  has_table_privilege('authenticated', 'public.profiles', 'INSERT'),
  false,
  'authenticated clients may not insert profiles directly'
);

select is(
  has_table_privilege('authenticated', 'public.profiles', 'DELETE'),
  false,
  'authenticated clients may not delete profiles directly'
);

select * from finish();
rollback;
