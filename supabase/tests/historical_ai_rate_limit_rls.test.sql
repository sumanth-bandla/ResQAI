begin;

select plan(7);

select ok(
  (select relrowsecurity from pg_class where oid = 'public.ai_analysis_rate_limits'::regclass),
  'AI rate-limit data has row level security enabled'
);

select is(
  has_table_privilege('anon', 'public.ai_analysis_rate_limits', 'SELECT'),
  false,
  'anonymous clients cannot read AI rate-limit data'
);

select is(
  has_table_privilege('authenticated', 'public.ai_analysis_rate_limits', 'SELECT'),
  false,
  'authenticated clients cannot read AI rate-limit data'
);

select is(
  has_table_privilege('authenticated', 'public.ai_analysis_rate_limits', 'INSERT'),
  false,
  'authenticated clients cannot manipulate AI rate limits'
);

select is(
  has_function_privilege('anon', 'public.consume_ai_analysis_request(uuid, integer)', 'EXECUTE'),
  false,
  'anonymous clients cannot consume AI request quota'
);

select is(
  has_function_privilege('authenticated', 'public.consume_ai_analysis_request(uuid, integer)', 'EXECUTE'),
  false,
  'authenticated clients cannot consume AI request quota directly'
);

select is(
  has_function_privilege('service_role', 'public.consume_ai_analysis_request(uuid, integer)', 'EXECUTE'),
  true,
  'only the trusted edge-function role can consume AI request quota'
);

select * from finish();
rollback;
