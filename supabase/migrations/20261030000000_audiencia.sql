-- Audiência do site (Targa Motors): eventos brutos + visões com as métricas do painel.
-- Rodar uma vez no Supabase (SQL Editor ou `supabase db push`). Grava só pelo servidor do site
-- (chave service_role, que ignora o RLS); o navegador nunca fala direto com o banco.
-- LGPD: sem IP, sem nome, sem e-mail. Sessão e visitante são identificadores anônimos aleatórios.

create table if not exists public.analytics_events (
  id            text primary key,                    -- gerado no navegador: reenvio do mesmo evento não duplica
  type          text not null,                       -- ver lib/audiencia/events.ts
  ts            timestamptz not null default now(),
  path          text not null default '',
  vehicle_slug  text not null default '',
  session_id    text not null default '',            -- por aba (sessionStorage)
  visitor_id    text not null default '',            -- por aparelho (localStorage), só com consentimento "todos"
  referrer      text not null default '',
  source        text not null default '',            -- Google, Instagram, Direto...
  channel       text not null default '',            -- Orgânico, Pago, Social, IA, Referência, Direto, Campanha
  campaign      text not null default '',            -- utm_campaign
  device        text not null default 'desktop',     -- mobile | tablet | desktop
  region        text not null default '',            -- cidade/UF agregada vinda da CDN, quando houver
  bot           boolean not null default false,
  staff         boolean not null default false,      -- acesso com sessão do painel
  meta          jsonb not null default '{}'::jsonb,
  created_at    timestamptz not null default now()
);

create index if not exists analytics_events_ts_idx       on public.analytics_events (ts desc);
create index if not exists analytics_events_type_ts_idx  on public.analytics_events (type, ts desc);
create index if not exists analytics_events_vehicle_idx  on public.analytics_events (vehicle_slug, ts desc) where vehicle_slug <> '';
create index if not exists analytics_events_session_idx  on public.analytics_events (session_id);

alter table public.analytics_events enable row level security;
-- Sem políticas de propósito: anon/authenticated não leem nem gravam. O site usa a service_role no servidor.

-- Eventos que contam (sem robôs e sem a equipe)
create or replace view public.analytics_events_valid with (security_invoker = true) as
select * from public.analytics_events where not bot and not staff;

-- 1 e 2. Comportamento e conversão por veículo (últimos 30 dias)
create or replace view public.analytics_vehicle_stats with (security_invoker = true) as
with e as (
  select * from public.analytics_events_valid where vehicle_slug <> '' and ts >= now() - interval '30 days'
), per_vehicle as (
  select
    vehicle_slug,
    count(*) filter (where type = 'vehicle_view')                                        as views,
    count(distinct session_id) filter (where type = 'vehicle_view')                      as visitors,
    count(distinct visitor_id) filter (where type = 'vehicle_view' and visitor_id <> '') as known_visitors,
    coalesce(sum((meta->>'ms')::numeric) filter (where type = 'vehicle_active_time'), 0) / 1000.0 as active_seconds,
    count(*) filter (where type = 'photo_view')                                          as photo_views,
    count(distinct session_id) filter (where type in ('photo_view', 'gallery'))          as gallery_sessions,
    count(*) filter (where type = 'favorite')                                            as favorites,
    count(*) filter (where type = 'compare')                                             as compares,
    count(*) filter (where type = 'whatsapp')                                            as whatsapp_clicks,
    count(distinct session_id) filter (where type = 'whatsapp')                          as whatsapp_sessions,
    count(*) filter (where type = 'phone')                                               as phone_clicks,
    count(*) filter (where type = 'finance_start')                                       as finance_starts
  from e group by vehicle_slug
), returning_visitors as (
  -- mesmo aparelho voltando ao mesmo carro em outra sessão
  select vehicle_slug, count(*) as returning_visitors from (
    select vehicle_slug, visitor_id from e
    where type = 'vehicle_view' and visitor_id <> ''
    group by vehicle_slug, visitor_id having count(distinct session_id) > 1
  ) r group by vehicle_slug
)
select
  p.*,
  coalesce(r.returning_visitors, 0)                             as returning_visitors,
  round(p.active_seconds / nullif(p.visitors, 0), 1)             as avg_active_seconds,
  round(100.0 * p.gallery_sessions / nullif(p.visitors, 0), 1)   as gallery_rate,
  round(100.0 * p.whatsapp_sessions / nullif(p.visitors, 0), 1)  as contact_rate   -- taxa de interesse comercial
from per_vehicle p left join returning_visitors r using (vehicle_slug);

-- 3. Inteligência do estoque: compara cada carro com a mediana do estoque
create or replace view public.analytics_stock_intelligence with (security_invoker = true) as
with s as (select * from public.analytics_vehicle_stats),
m as (
  select
    percentile_cont(0.5) within group (order by visitors)                   as med_visitors,
    percentile_cont(0.5) within group (order by coalesce(contact_rate, 0))  as med_rate
  from s
)
select
  s.vehicle_slug, s.visitors, s.whatsapp_sessions, s.contact_rate, s.avg_active_seconds,
  case
    when s.visitors >= m.med_visitors and coalesce(s.contact_rate, 0) >= m.med_rate then 'Alta procura'
    when s.visitors <  m.med_visitors and coalesce(s.contact_rate, 0) >= m.med_rate then 'Alto interesse'
    when s.visitors >= m.med_visitors and coalesce(s.contact_rate, 0) <  m.med_rate then 'Interesse sem conversão'
    else 'Baixa procura'
  end as classification
from s cross join m;

-- 5. Visão diária do site
create or replace view public.analytics_daily with (security_invoker = true) as
select
  (ts at time zone 'America/Sao_Paulo')::date                                       as day,
  count(distinct session_id)                                                        as sessions,
  count(distinct visitor_id) filter (where visitor_id <> '')                        as known_visitors,
  count(*) filter (where type = 'pageview')                                         as pageviews,
  count(*) filter (where type = 'vehicle_view')                                     as vehicle_views,
  count(*) filter (where type = 'whatsapp')                                         as whatsapp_clicks,
  count(*) filter (where type = 'phone')                                            as phone_clicks,
  count(*) filter (where type in ('finance_submit', 'sell_submit', 'visit_submit', 'contact_submit')) as forms_sent
from public.analytics_events_valid
group by 1;

-- 2 e 5. Origem: sessões e contatos por canal, origem, campanha e aparelho
create or replace view public.analytics_sources with (security_invoker = true) as
select
  channel, source, campaign, device,
  count(distinct session_id)                                    as sessions,
  count(distinct session_id) filter (where type = 'whatsapp')   as whatsapp_sessions,
  round(100.0 * count(distinct session_id) filter (where type = 'whatsapp') / nullif(count(distinct session_id), 0), 1) as contact_rate
from public.analytics_events_valid
where ts >= now() - interval '30 days'
group by channel, source, campaign, device;

-- 4. Buscas (o que procuram e o que não encontram)
create or replace view public.analytics_searches with (security_invoker = true) as
select
  lower(trim(meta->>'q'))                             as term,
  count(*)                                                         as searches,
  count(*) filter (where coalesce((meta->>'results')::int, 1) = 0) as no_results
from public.analytics_events_valid
where type = 'search' and coalesce(meta->>'q', '') <> '' and ts >= now() - interval '30 days'
group by 1;

-- Retenção (LGPD): apaga eventos brutos antigos. Para agendar com pg_cron:
--   select cron.schedule('audiencia-retencao', '0 4 * * *', 'select public.analytics_purge()');
create or replace function public.analytics_purge(older_than interval default interval '13 months')
returns integer language sql security definer set search_path = public as $fn$
  with d as (delete from public.analytics_events where ts < now() - older_than returning 1)
  select count(*)::integer from d;
$fn$;
revoke all on function public.analytics_purge(interval) from public, anon, authenticated;
