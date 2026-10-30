import { supabaseConfig } from "./sink"

// Leitura das visões do Supabase para o painel (supabase/migrations/*_audiencia.sql).
// Enquanto o Supabase não estiver ligado, devolve null e o painel segue com lib/analytics.ts (data/db.json).
export type VehicleStats = {
  vehicle_slug: string
  views: number
  visitors: number
  known_visitors: number
  returning_visitors: number
  active_seconds: number
  avg_active_seconds: number | null
  photo_views: number
  gallery_rate: number | null
  favorites: number
  compares: number
  whatsapp_clicks: number
  whatsapp_sessions: number
  contact_rate: number | null
  phone_clicks: number
  finance_starts: number
}

export type StockIntelligence = {
  vehicle_slug: string
  visitors: number
  whatsapp_sessions: number
  contact_rate: number | null
  avg_active_seconds: number | null
  classification: "Alta procura" | "Alto interesse" | "Interesse sem conversão" | "Baixa procura"
}

export type DailyRow = {
  day: string
  sessions: number
  known_visitors: number
  pageviews: number
  vehicle_views: number
  whatsapp_clicks: number
  phone_clicks: number
  forms_sent: number
}

export type SourceRow = { channel: string; source: string; campaign: string; device: string; sessions: number; whatsapp_sessions: number; contact_rate: number | null }
export type SearchRow = { term: string; searches: number; no_results: number }

type Views = {
  analytics_vehicle_stats: VehicleStats
  analytics_stock_intelligence: StockIntelligence
  analytics_daily: DailyRow
  analytics_sources: SourceRow
  analytics_searches: SearchRow
}

// query no formato do PostgREST, por exemplo "order=views.desc&limit=20" ou "day=gte.2026-10-01"
export async function readView<V extends keyof Views>(view: V, query = ""): Promise<Views[V][] | null> {
  const config = supabaseConfig()
  if (!config) return null
  const response = await fetch(`${config.url}/rest/v1/${view}${query ? `?${query}` : ""}`, {
    headers: { apikey: config.key, Authorization: `Bearer ${config.key}` },
    cache: "no-store",
  })
  if (!response.ok) throw new Error(`Supabase ${response.status}: ${await response.text()}`)
  return (await response.json()) as Views[V][]
}
