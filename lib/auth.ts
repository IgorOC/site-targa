import { createHash, createHmac, timingSafeEqual } from "crypto"
import { cookies } from "next/headers"
import { SESSION_COOKIE } from "./site"
import type { Role, Session } from "./types"

function secret() {
  return process.env.ADMIN_SECRET || "dev-only-targa-secret"
}

export function safeEqual(a: string, b: string) {
  const left = createHash("sha256").update(a).digest()
  const right = createHash("sha256").update(b).digest()
  return timingSafeEqual(left, right)
}

export function signSession(session: Omit<Session, "exp">) {
  const payload: Session = { ...session, exp: Date.now() + 7 * 86400000 }
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url")
  const sig = createHmac("sha256", secret()).update(body).digest("base64url")
  return `${body}.${sig}`
}

export function readToken(raw: string | undefined | null): Session | null {
  if (!raw) return null
  const [body, sig] = raw.split(".")
  if (!body || !sig) return null
  const expected = createHmac("sha256", secret()).update(body).digest("base64url")
  const a = Buffer.from(sig)
  const b = Buffer.from(expected)
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null
  try {
    const data = JSON.parse(Buffer.from(body, "base64url").toString()) as Session
    if (!data.exp || data.exp < Date.now()) return null
    if (data.role !== "dono" && data.role !== "gerente" && data.role !== "vendedor") return null
    return data
  } catch {
    return null
  }
}

export async function getSession() {
  const jar = await cookies()
  return readToken(jar.get(SESSION_COOKIE)?.value)
}

export function roleFromEnv(): Role {
  const role = process.env.ADMIN_ROLE
  if (role === "gerente" || role === "vendedor" || role === "dono") return role
  return "dono"
}

export function canSeeCosts(role: Role) {
  return role === "dono"
}

export function canEditContent(role: Role) {
  return role === "dono" || role === "gerente"
}

export function canDeleteVehicle(role: Role) {
  return role === "dono" || role === "gerente"
}

export function canSeeSensitiveLead(role: Role) {
  return role === "dono" || role === "gerente"
}
