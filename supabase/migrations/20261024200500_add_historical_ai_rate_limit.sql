create table if not exists public.ai_analysis_rate_limits (
  user_id uuid not null references auth.users (id) on delete cascade,
  bucket_start timestamptz not null,
  request_count smallint not null default 1 check (request_count between 1 and 10),
  primary key (user_id, bucket_start)
);

alter table public.ai_analysis_rate_limits enable row level security;
revoke all on table public.ai_analysis_rate_limits from public, anon, authenticated, service_role;

create or replace function public.consume_ai_analysis_request(p_user_id uuid, p_limit integer default 5)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  allowed boolean;
begin
  if p_limit not between 1 and 10 then
    raise exception 'AI request limit is outside the permitted range';
  end if;

  insert into public.ai_analysis_rate_limits (user_id, bucket_start, request_count)
  values (p_user_id, pg_catalog.date_trunc('minute', pg_catalog.now()), 1)
  on conflict (user_id, bucket_start) do update
    set request_count = public.ai_analysis_rate_limits.request_count + 1
    where public.ai_analysis_rate_limits.request_count < p_limit;

  allowed := found;

  delete from public.ai_analysis_rate_limits
  where user_id = p_user_id
    and bucket_start < pg_catalog.date_trunc('minute', pg_catalog.now() - interval '1 hour');

  return allowed;
end;
$$;

revoke all on function public.consume_ai_analysis_request(uuid, integer) from public, anon, authenticated;
grant execute on function public.consume_ai_analysis_request(uuid, integer) to service_role;
