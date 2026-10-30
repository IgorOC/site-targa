import { randomUUID } from "crypto"
import { NextResponse } from "next/server"
import { readToken } from "@/lib/auth"
import { eventSink } from "@/lib/audiencia/sink"
import { SESSION_COOKIE } from "@/lib/site"
import { classifySource } from "@/lib/traffic"

// Coletor da audiência: recebe os eventos do navegador (lib/track.ts), valida, classifica a origem
// e grava pelo gravador ativo (lib/audiencia/sink.ts: Supabase ou data/db.json).
export const runtime = "nodejs"

const MAX_BODY = 4_000
const RATE_LIMIT = 120 // eventos por minuto por sessão (por instância do servidor)
const hits = new Map<string, { minute: number; count: number }>()

function deviceOf(ua: string): "mobile" | "tablet" | "desktop" {
  if (/ipad|tablet/i.test(ua)) return "tablet"
  if (/mobile|iphone|android/i.test(ua)) return "mobile"
  return "desktop"
}

function limited(sid: string) {
  const minute = Math.floor(Date.now() / 60_000)
  const entry = hits.get(sid)
  if (!entry || entry.minute !== minute) {
    if (hits.size > 5_000) hits.clear()
    hits.set(sid, { minute, count: 1 })
    return false
  }
  entry.count += 1
  return entry.count > RATE_LIMIT
}

// Cidade/UF agregada, quando a CDN informa (Netlify: x-nf-geo; Vercel: x-vercel-ip-*). Nunca o IP.
function regionOf(headers: Headers) {
  const nf = headers.get("x-nf-geo")
  if (nf) {
    try {
      const geo = JSON.parse(Buffer.from(nf, "base64").toString("utf8")) as { city?: string; subdivision?: { code?: string } }
      return [geo.city, geo.subdivision?.code].filter(Boolean).join("/")
    } catch {
      // cabeçalho inválido: segue sem região
    }
  }
  const city = headers.get("x-vercel-ip-city")
  const uf = headers.get("x-vercel-ip-country-region")
  return [city ? decodeURIComponent(city) : "", uf || ""].filter(Boolean).join("/")
}

const text = (value: unknown, max: number) => String(value ?? "").slice(0, max)

export async function POST(request: Request) {
  const raw = await request.text()
  if (raw.length > MAX_BODY) return new NextResponse(null, { status: 413 })
  let body: Record<string, unknown>
  try {
    body = JSON.parse(raw)
  } catch {
    return new NextResponse(null, { status: 400 })
  }
  const type = text(body.type, 40)
  if (!/^[a-z0-9_]+$/.test(type)) return new NextResponse(null, { status: 400 })
  const sid = text(body.sid, 80)
  if (limited(sid || "sem-sessao")) return new NextResponse(null, { status: 429 })

  const ua = request.headers.get("user-agent") || ""
  const token = (request.headers.get("cookie") || "")
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${SESSION_COOKIE}=`))
    ?.slice(SESSION_COOKIE.length + 1)
  const landing = text(body.landing, 300)
  const origin = classifySource(text(body.referrer, 300), landing, new URL(request.url).hostname)
  const campaign = new URLSearchParams(landing.startsWith("?") ? landing.slice(1) : landing).get("utm_campaign") || ""
  const meta: Record<string, string | number> = {}
  if (body.meta && typeof body.meta === "object") {
    for (const [key, value] of Object.entries(body.meta as Record<string, unknown>).slice(0, 12)) {
      if (typeof value === "number" && Number.isFinite(value)) meta[key.slice(0, 40)] = value
      else if (typeof value === "string") meta[key.slice(0, 40)] = value.slice(0, 200)
    }
  }

  const sink = eventSink()
  // Métrica nunca derruba a navegação: se não der para gravar, responde 204 do mesmo jeito
  try {
    await sink.save({
      id: /^[0-9a-f-]{36}$/i.test(text(body.id, 36)) ? text(body.id, 36) : `evt_${randomUUID()}`,
      type,
      ts: new Date().toISOString(),
      path: text(body.path, 200),
      vehicleSlug: text(body.vehicleSlug, 160),
      sid,
      visitorId: text(body.vid, 80),
      referrer: text(body.referrer, 300),
      source: origin.source,
      channel: origin.channel,
      campaign: campaign.slice(0, 120),
      device: deviceOf(ua),
      region: regionOf(request.headers).slice(0, 80),
      bot: /bot|spider|crawler|headless|lighthouse|pagespeed|curl|wget/i.test(ua),
      staff: Boolean(readToken(token ? decodeURIComponent(token) : null)),
      meta,
    })
  } catch (error) {
    if (process.env.NODE_ENV !== "production") console.warn("[audiencia] evento não gravado:", error)
  }
  return new NextResponse(null, { status: 204, headers: { "X-Audiencia-Store": sink.name } })
}
