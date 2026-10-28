import { priceOf } from "./catalog"
import { daysInStock } from "./format"
import type { AnalyticsEvent, Db, Vehicle } from "./types"

export type Totals = {
  sessions: number
  pageviews: number
  vehicleViews: number
  cardClicks: number
  whatsapp: number
  phone: number
  leads: number
  sales: number
  favorites: number
  compares: number
}

export type VehicleStat = {
  slug: string
  name: string
  views: number
  whatsapp: number
  favorites: number
  daysInStock: number
  price: number
  status: Vehicle["status"]
  klass: "quente" | "morno" | "frio"
  flags: string[]
}

export type Report = {
  days: number
  totals: Totals
  previous: Totals
  deltas: Record<keyof Totals, number>
  visitsByDay: { date: string; count: number }[]
  vehicles: VehicleStat[]
  funnel: { name: string; value: number }[]
  sources: { name: string; value: number }[]
  channels: { name: string; value: number }[]
  landings: { name: string; value: number }[]
  devices: { name: string; value: number }[]
  heatmap: number[][]
  searches: { term: string; count: number; empty: number }[]
}

function dayKey(ts: string) {
  const d = new Date(ts)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${day}`
}

function inRange(ts: string, from: number, to: number) {
  const t = Date.parse(ts)
  return t >= from && t < to
}

function eligible(event: AnalyticsEvent) {
  return !event.bot && !event.staff
}

function totalsOf(events: AnalyticsEvent[], leads: Db["leads"], vehicles: Vehicle[], from: number, to: number): Totals {
  const slice = events.filter((event) => eligible(event) && inRange(event.ts, from, to))
  const sessions = new Set(slice.filter((event) => event.type === "pageview" && event.sid).map((event) => event.sid))
  const count = (type: string) => slice.filter((event) => event.type === type).length
  const leadsIn = leads.filter((lead) => inRange(lead.createdAt, from, to) && lead.origin !== "whatsapp")
  const sales = vehicles.filter((vehicle) => vehicle.soldViaSite && vehicle.soldAt && inRange(vehicle.soldAt, from, to))
  return {
    sessions: sessions.size,
    pageviews: count("pageview"),
    vehicleViews: count("vehicle_view"),
    cardClicks: count("card_click"),
    whatsapp: count("whatsapp"),
    phone: count("phone"),
    leads: leadsIn.length,
    sales: sales.length,
    favorites: count("favorite"),
    compares: count("compare"),
  }
}

function delta(current: number, previous: number) {
  if (previous === 0) return current === 0 ? 0 : 100
  return Math.round(((current - previous) / previous) * 100)
}

export function buildReport(db: Db, days: number, now = new Date()): Report {
  const to = now.getTime()
  const from = to - days * 86400000
  const prevFrom = from - days * 86400000
  const totals = totalsOf(db.events, db.leads, db.vehicles, from, to)
  const previous = totalsOf(db.events, db.leads, db.vehicles, prevFrom, from)
  const deltas = Object.fromEntries(
    (Object.keys(totals) as (keyof Totals)[]).map((key) => [key, delta(totals[key], previous[key])]),
  ) as Record<keyof Totals, number>

  const visitsByDay: { date: string; count: number }[] = []
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now)
    date.setHours(0, 0, 0, 0)
    date.setDate(date.getDate() - i)
    const key = dayKey(date.toISOString())
    const count = db.events.filter(
      (event) => eligible(event) && event.type === "pageview" && dayKey(event.ts) === key,
    ).length
    visitsByDay.push({ date: key.slice(5), count })
  }

  const currentEvents = db.events.filter((event) => eligible(event) && inRange(event.ts, from, to))
  const bySlug = new Map<string, { views: number; whatsapp: number; favorites: number }>()
  for (const event of currentEvents) {
    if (!event.vehicleSlug) continue
    const row = bySlug.get(event.vehicleSlug) || { views: 0, whatsapp: 0, favorites: 0 }
    if (event.type === "vehicle_view") row.views += 1
    if (event.type === "whatsapp") row.whatsapp += 1
    if (event.type === "favorite") row.favorites += 1
    bySlug.set(event.vehicleSlug, row)
  }

  const visible = db.vehicles.filter((vehicle) => vehicle.status === "disponivel" || vehicle.status === "reservado")
  const draft: VehicleStat[] = visible.map((vehicle) => {
    const row = bySlug.get(vehicle.slug) || { views: 0, whatsapp: 0, favorites: 0 }
    return {
      slug: vehicle.slug,
      name: `${vehicle.brand} ${vehicle.model}`,
      views: row.views,
      whatsapp: row.whatsapp,
      favorites: row.favorites,
      daysInStock: daysInStock(vehicle.enteredAt, to),
      price: priceOf(vehicle),
      status: vehicle.status,
      klass: "morno",
      flags: [],
    }
  })

  const maxViews = Math.max(0, ...draft.map((row) => row.views))
  const { coldDays, hotShare, coldShare } = db.content.ranking
  if (draft.length && maxViews > 0) {
    const sorted = [...draft].sort((a, b) => a.views - b.views)
    const coldCut = sorted[Math.max(0, Math.floor(sorted.length * coldShare) - 1)].views
    const hotCut = sorted[Math.min(sorted.length - 1, Math.ceil(sorted.length * (1 - hotShare)))].views
    for (const row of draft) {
      if (row.views >= hotCut && row.views > 0) row.klass = "quente"
      else if (row.views <= coldCut && row.views < hotCut) row.klass = "frio"
      if (row.klass === "frio" && row.daysInStock > coldDays) row.flags.push("alerta")
      if (row.views >= 5 && row.klass === "quente" && row.whatsapp / row.views >= 0.12) row.flags.push("conversao-alta")
      if (row.views >= 5 && row.klass === "quente" && row.whatsapp / row.views < 0.05) row.flags.push("conversao-baixa")
    }
  }

  draft.sort((a, b) => b.views - a.views || a.name.localeCompare(b.name, "pt-BR"))

  const sources = new Map<string, number>()
  const channels = new Map<string, number>()
  const landings = new Map<string, number>()
  const devices = new Map<string, number>()
  const searches = new Map<string, { count: number; empty: number }>()
  const heatmap = Array.from({ length: 7 }, () => Array.from({ length: 24 }, () => 0))
  const seenSession = new Set<string>()

  for (const event of currentEvents) {
    if (event.type === "pageview") {
      const when = new Date(event.ts)
      const weekday = (when.getDay() + 6) % 7
      heatmap[weekday][when.getHours()] += 1
      const device = event.device === "mobile" ? "Celular" : event.device === "tablet" ? "Tablet" : "Computador"
      devices.set(device, (devices.get(device) || 0) + 1)
      if (event.sid && !seenSession.has(event.sid)) {
        seenSession.add(event.sid)
        const source = event.source || "Direto"
        sources.set(source, (sources.get(source) || 0) + 1)
        const channel = String(event.meta.channel || (source === "Direto" ? "Direto" : "Referência"))
        channels.set(channel, (channels.get(channel) || 0) + 1)
        // Páginas de entrada do tráfego orgânico e de IA: mostram o que o Google e as IAs indexam
        if (channel === "Orgânico" || channel === "IA") landings.set(event.path || "/", (landings.get(event.path || "/") || 0) + 1)
      }
    }
    if (event.type === "search") {
      const term = String(event.meta.q || "").trim().toLowerCase()
      if (!term) continue
      const row = searches.get(term) || { count: 0, empty: 0 }
      row.count += 1
      if (Number(event.meta.results) === 0) row.empty += 1
      searches.set(term, row)
    }
  }

  return {
    days,
    totals,
    previous,
    deltas,
    visitsByDay,
    vehicles: draft,
    funnel: [
      { name: "Visitas", value: totals.pageviews },
      { name: "Ver carro", value: totals.vehicleViews },
      { name: "WhatsApp", value: totals.whatsapp },
      { name: "Formulários", value: totals.leads },
      { name: "Vendas via site", value: totals.sales },
    ],
    sources: [...sources.entries()].map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value),
    channels: [...channels.entries()].map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value),
    landings: [...landings.entries()].map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 12),
    devices: [...devices.entries()].map(([name, value]) => ({ name, value })),
    heatmap,
    searches: [...searches.entries()]
      .map(([term, row]) => ({ term, count: row.count, empty: row.empty }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 12),
  }
}
