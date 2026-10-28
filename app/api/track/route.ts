import { randomUUID } from "crypto"
import { NextResponse } from "next/server"
import { readToken } from "@/lib/auth"
import { SESSION_COOKIE } from "@/lib/site"
import { classifySource } from "@/lib/traffic"
import { updateDb } from "@/lib/store"

export const runtime = "nodejs"

function deviceOf(ua: string): "mobile" | "tablet" | "desktop" {
  if (/ipad|tablet/i.test(ua)) return "tablet"
  if (/mobile|iphone|android/i.test(ua)) return "mobile"
  return "desktop"
}


export async function POST(request: Request) {
  let body: {
    type?: string
    path?: string
    vehicleSlug?: string
    meta?: Record<string, string | number>
    sid?: string
    referrer?: string
    landing?: string
  }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 })
  }
  const type = String(body.type || "").slice(0, 40)
  if (!/^[a-z0-9_]+$/.test(type)) return NextResponse.json({ ok: false }, { status: 400 })
  const ua = request.headers.get("user-agent") || ""
  const bot = /bot|spider|crawler|headless|lighthouse|pagespeed|curl|wget/i.test(ua)
  const cookie = request.headers.get("cookie") || ""
  const token = cookie
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${SESSION_COOKIE}=`))
    ?.slice(SESSION_COOKIE.length + 1)
  const staff = Boolean(readToken(token ? decodeURIComponent(token) : null))
  const origin = classifySource(String(body.referrer || ""), String(body.landing || ""), new URL(request.url).hostname)
  const meta = body.meta && typeof body.meta === "object" ? { ...body.meta } : {}
  meta.channel = origin.channel
  await updateDb((db) => {
    db.events.push({
      id: `evt_${randomUUID()}`,
      type,
      ts: new Date().toISOString(),
      path: String(body.path || "").slice(0, 200),
      vehicleSlug: String(body.vehicleSlug || "").slice(0, 160),
      sid: String(body.sid || "").slice(0, 80),
      referrer: String(body.referrer || "").slice(0, 300),
      source: origin.source,
      device: deviceOf(ua),
      bot,
      staff,
      meta,
    })
  })
  return NextResponse.json({ ok: true })
}
