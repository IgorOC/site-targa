"use server"

import { randomUUID } from "crypto"
import { promises as fs } from "fs"
import path from "path"
import { cookies, headers } from "next/headers"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import sharp from "sharp"
import { canDeleteVehicle, canEditContent, canSeeCosts, getSession, roleFromEnv, safeEqual, signSession } from "./auth"
import { slugify } from "./format"
import { SESSION_COOKIE } from "./site"
import { getDb, updateDb } from "./store"
import type { Banner, BodyType, Content, Faq, LeadOrigin, TeamMember, Testimonial, Vehicle, VehicleStatus } from "./types"

const hits = new Map<string, number[]>()

async function clientIp() {
  const h = await headers()
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() || "local"
}

function limited(key: string, limit = 8) {
  const now = Date.now()
  const recent = (hits.get(key) || []).filter((stamp) => now - stamp < 3600000)
  if (recent.length >= limit) return true
  recent.push(now)
  hits.set(key, recent)
  return false
}

function clean(value: FormDataEntryValue | null, max = 4000) {
  return String(value ?? "").replace(/\s+/g, " ").trim().slice(0, max)
}

function lines(value: FormDataEntryValue | null, max = 4000) {
  return String(value ?? "").replace(/\r/g, "").trim().slice(0, max)
}

function tri(value: FormDataEntryValue | null) {
  const raw = String(value ?? "")
  if (raw === "sim") return true
  if (raw === "nao") return false
  return null
}

function refresh() {
  revalidatePath("/", "layout")
}

export async function login(formData: FormData) {
  const email = clean(formData.get("email"), 160).toLowerCase()
  const password = String(formData.get("password") ?? "")
  const expectedEmail = (process.env.ADMIN_EMAIL || "admin@targapremium.com.br").toLowerCase()
  const expectedPassword = process.env.ADMIN_PASSWORD || ""
  if (!expectedPassword || !safeEqual(email, expectedEmail) || !safeEqual(password, expectedPassword)) {
    return { ok: false as const, error: "E-mail ou senha incorretos." }
  }
  const jar = await cookies()
  jar.set(
    SESSION_COOKIE,
    signSession({
      email,
      name: process.env.ADMIN_NAME || "Targa",
      role: roleFromEnv(),
    }),
    {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    },
  )
  redirect("/admin")
}

export async function logout() {
  const jar = await cookies()
  jar.delete(SESSION_COOKIE)
  redirect("/admin/login")
}

export async function uploadVehiclePhoto(formData: FormData) {
  const session = await getSession()
  if (!session) return { ok: false as const, error: "Sessão expirada." }
  const file = formData.get("file")
  if (!(file instanceof File) || file.size === 0) return { ok: false as const, error: "Escolha uma imagem." }
  if (file.size > 12 * 1024 * 1024) return { ok: false as const, error: "A imagem passa de 12 MB." }
  if (!/^image\/(jpeg|png|webp|avif)$/.test(file.type)) {
    return { ok: false as const, error: "Use JPG, PNG ou WebP." }
  }
  const dir = path.join(process.cwd(), "public", "uploads")
  await fs.mkdir(dir, { recursive: true })
  const name = `${randomUUID()}.webp`
  await sharp(Buffer.from(await file.arrayBuffer()))
    .rotate()
    .resize({ width: 2000, withoutEnlargement: true })
    .webp({ quality: 78 })
    .toFile(path.join(dir, name))
  return { ok: true as const, url: `/uploads/${name}` }
}

function readVehicle(formData: FormData, previous: Vehicle | null, keepPrivate: boolean): { vehicle: Vehicle } | { error: string } {
  const brand = clean(formData.get("brand"), 80)
  const model = clean(formData.get("model"), 80)
  const version = clean(formData.get("version"), 180)
  const yearMake = Number(formData.get("yearMake"))
  const yearModel = Number(formData.get("yearModel"))
  const km = Number(formData.get("km"))
  const price = Number(formData.get("price"))
  const promoRaw = clean(formData.get("promoPrice"), 20)
  const promoPrice = promoRaw ? Number(promoRaw) : null
  const bodyType = clean(formData.get("bodyType"), 20) as BodyType
  const status = clean(formData.get("status"), 20) as VehicleStatus
  if (!brand || !model || !version) return { error: "Marca, modelo e versão são obrigatórios." }
  if (!Number.isFinite(yearMake) || yearMake < 1950 || yearMake > 2035) return { error: "Ano de fabricação inválido." }
  if (!Number.isFinite(yearModel) || yearModel < 1950 || yearModel > 2036) return { error: "Ano do modelo inválido." }
  if (!Number.isFinite(km) || km < 0) return { error: "Quilometragem inválida." }
  if (!Number.isFinite(price) || price <= 0) return { error: "Informe o preço." }
  if (!["suv", "picape", "sedan", "esportivo", "hatch"].includes(bodyType)) return { error: "Escolha o tipo." }
  if (!["disponivel", "reservado", "vendido", "oculto"].includes(status)) return { error: "Status inválido." }
  const slugInput = clean(formData.get("slug"), 120)
  const slug = slugify(slugInput || `${brand}-${model}-${yearMake}`)
  if (!slug) return { error: "Endereço da página inválido." }
  let photos: string[] = []
  let spinFrames: string[] = []
  try {
    photos = JSON.parse(clean(formData.get("photos"), 20000) || "[]")
    spinFrames = JSON.parse(clean(formData.get("spinFrames"), 20000) || "[]")
  } catch {
    return { error: "A lista de fotos veio incompleta. Envie de novo." }
  }
  if (!Array.isArray(photos) || !Array.isArray(spinFrames)) return { error: "A lista de fotos veio incompleta." }
  const id = previous?.id || `v_${randomUUID()}`
  const soldViaSite = formData.get("soldViaSite") === "on"
  const costRaw = clean(formData.get("cost"), 20)
  const plateRaw = clean(formData.get("plate"), 12)
  const vehicle: Vehicle = {
    id,
    slug,
    brand,
    model,
    version,
    yearMake,
    yearModel,
    km,
    price,
    promoPrice: promoPrice && promoPrice > 0 ? promoPrice : null,
    color: clean(formData.get("color"), 40),
    fuel: clean(formData.get("fuel"), 40),
    transmission: clean(formData.get("transmission"), 40),
    doors: Number(formData.get("doors")) || 4,
    engine: clean(formData.get("engine"), 40),
    power: clean(formData.get("power"), 40),
    plateEnd: clean(formData.get("plateEnd"), 4),
    singleOwner: tri(formData.get("singleOwner")),
    ipvaPaid: tri(formData.get("ipvaPaid")),
    inspection: tri(formData.get("inspection")),
    acceptsTrade: tri(formData.get("acceptsTrade")),
    options: lines(formData.get("options"), 2000)
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean)
      .slice(0, 40),
    description: lines(formData.get("description"), 5000),
    photos: photos.filter((item) => typeof item === "string").slice(0, 40),
    coverIndex: Math.max(0, Number(formData.get("coverIndex")) || 0),
    videoUrl: clean(formData.get("videoUrl"), 400),
    spinFrames: spinFrames.filter((item) => typeof item === "string").slice(0, 36),
    status,
    featured: formData.get("featured") === "on",
    featuredOrder: Number(formData.get("featuredOrder")) || 0,
    enteredAt: clean(formData.get("enteredAt"), 10) || previous?.enteredAt || new Date().toISOString().slice(0, 10),
    cost: keepPrivate ? previous?.cost ?? null : costRaw ? Number(costRaw) : null,
    plate: keepPrivate ? previous?.plate ?? null : plateRaw || null,
    soldViaSite: status === "vendido" ? soldViaSite : false,
    soldAt: status === "vendido" ? previous?.soldAt || new Date().toISOString() : null,
    seoTitle: clean(formData.get("seoTitle"), 160) || `${brand} ${model} ${yearMake}/${yearModel} seminovo em Uberlândia`,
    seoDescription: clean(formData.get("seoDescription"), 300) || clean(formData.get("description"), 300),
    bodyType,
  }
  if (!vehicle.description) return { error: "Escreva a descrição do anúncio." }
  return { vehicle }
}

export async function saveVehicle(formData: FormData) {
  const session = await getSession()
  if (!session) return { ok: false as const, error: "Sessão expirada." }
  const db = await getDb()
  const existingId = clean(formData.get("id"), 80)
  const previous = db.vehicles.find((vehicle) => vehicle.id === existingId) || null
  const parsed = readVehicle(formData, previous, !canSeeCosts(session.role))
  if ("error" in parsed) return { ok: false as const, error: parsed.error }
  const vehicle = parsed.vehicle
  const clash = db.vehicles.some((item) => item.slug === vehicle.slug && item.id !== vehicle.id)
  if (clash) return { ok: false as const, error: "Já existe um anúncio com esse endereço." }
  await updateDb((draft) => {
    const index = draft.vehicles.findIndex((item) => item.id === vehicle.id)
    if (index >= 0) draft.vehicles[index] = vehicle
    else draft.vehicles.push(vehicle)
    const priceNote =
      previous && previous.price !== vehicle.price
        ? ` Preço de ${previous.price} para ${vehicle.price}.`
        : ""
    draft.audit.push({
      id: `aud_${randomUUID()}`,
      at: new Date().toISOString(),
      user: session.email,
      action: previous ? "editar" : "criar",
      entity: "veiculo",
      entityId: vehicle.id,
      summary: `${vehicle.brand} ${vehicle.model}.${priceNote}`,
    })
  })
  refresh()
  return { ok: true as const, id: vehicle.id }
}

export async function deleteVehicle(id: string, mode: "ocultar" | "excluir") {
  const session = await getSession()
  if (!session) return { ok: false as const, error: "Sessão expirada." }
  if (mode === "excluir" && !canDeleteVehicle(session.role)) {
    return { ok: false as const, error: "Só o dono ou o gerente exclui um anúncio." }
  }
  await updateDb((db) => {
    const vehicle = db.vehicles.find((item) => item.id === id)
    if (!vehicle) return
    if (mode === "ocultar") vehicle.status = "oculto"
    else db.vehicles = db.vehicles.filter((item) => item.id !== id)
    db.audit.push({
      id: `aud_${randomUUID()}`,
      at: new Date().toISOString(),
      user: session.email,
      action: mode,
      entity: "veiculo",
      entityId: id,
      summary: vehicle.brand + " " + vehicle.model,
    })
  })
  refresh()
  return { ok: true as const }
}

export async function duplicateVehicle(id: string) {
  const session = await getSession()
  if (!session) return { ok: false as const, error: "Sessão expirada." }
  let nextId = ""
  await updateDb((db) => {
    const vehicle = db.vehicles.find((item) => item.id === id)
    if (!vehicle) return
    const copy: Vehicle = {
      ...structuredClone(vehicle),
      id: `v_${randomUUID()}`,
      slug: `${vehicle.slug}-copia`,
      status: "oculto",
      featured: false,
      soldAt: null,
      soldViaSite: false,
      enteredAt: new Date().toISOString().slice(0, 10),
    }
    let slug = copy.slug
    let n = 2
    while (db.vehicles.some((item) => item.slug === slug)) {
      slug = `${vehicle.slug}-copia-${n}`
      n += 1
    }
    copy.slug = slug
    db.vehicles.push(copy)
    nextId = copy.id
  })
  refresh()
  if (!nextId) return { ok: false as const, error: "Anúncio não encontrado." }
  return { ok: true as const, id: nextId }
}

export async function saveContent(section: keyof Content, json: string) {
  const session = await getSession()
  if (!session || !canEditContent(session.role)) {
    return { ok: false as const, error: "Sem permissão para editar o conteúdo." }
  }
  let data: unknown
  try {
    data = JSON.parse(json)
  } catch {
    return { ok: false as const, error: "Não foi possível ler o conteúdo." }
  }
  await updateDb((db) => {
    if (section === "hero") db.content.hero = data as Content["hero"]
    else if (section === "about") db.content.about = data as Content["about"]
    else if (section === "contact") db.content.contact = data as Content["contact"]
    else if (section === "privacy") db.content.privacy = data as Content["privacy"]
    else if (section === "ranking") db.content.ranking = data as Content["ranking"]
    else if (section === "faqs") db.content.faqs = data as Faq[]
    else if (section === "testimonials") db.content.testimonials = data as Testimonial[]
    else if (section === "team") db.content.team = data as TeamMember[]
    else if (section === "banners") db.content.banners = data as Banner[]
    db.audit.push({
      id: `aud_${randomUUID()}`,
      at: new Date().toISOString(),
      user: session.email,
      action: "editar",
      entity: "conteudo",
      entityId: section,
      summary: `Seção ${section}`,
    })
  })
  refresh()
  return { ok: true as const }
}

export async function updateLead(id: string, status: string) {
  const session = await getSession()
  if (!session) return { ok: false as const, error: "Sessão expirada." }
  await updateDb((db) => {
    const lead = db.leads.find((item) => item.id === id)
    if (!lead) return
    lead.status = status
    lead.updatedAt = new Date().toISOString()
  })
  refresh()
  return { ok: true as const }
}

async function addLead(input: {
  origin: LeadOrigin
  name: string
  phone: string
  email: string
  message: string
  vehicleSlug?: string
  vehicleLabel?: string
  refCode?: string
  payload?: Record<string, string>
  photos?: string[]
  sid?: string
}) {
  const now = new Date().toISOString()
  await updateDb((db) => {
    db.leads.unshift({
      id: `lead_${randomUUID()}`,
      origin: input.origin,
      status: "Novo",
      createdAt: now,
      updatedAt: now,
      name: input.name,
      phone: input.phone,
      email: input.email,
      message: input.message,
      vehicleSlug: input.vehicleSlug || "",
      vehicleLabel: input.vehicleLabel || "",
      refCode: input.refCode || "",
      payload: input.payload || {},
      photos: input.photos || [],
      sid: input.sid || "",
    })
    db.events.push({
      id: `evt_${randomUUID()}`,
      type: input.origin === "financiamento" ? "finance_submit" : input.origin === "venda" ? "sell_submit" : "lead",
      ts: now,
      path: "",
      vehicleSlug: input.vehicleSlug || "",
      sid: input.sid || "",
      referrer: "",
      source: "formulario",
      device: "desktop",
      bot: false,
      staff: false,
      meta: {},
    })
  })
  refresh()
}

export async function submitContact(formData: FormData) {
  if (clean(formData.get("company"), 80)) return { ok: true as const }
  if (await limited(`contato:${await clientIp()}`)) return { ok: false as const, error: "Muitas mensagens agora. Tente mais tarde." }
  const name = clean(formData.get("name"), 120)
  const phone = clean(formData.get("phone"), 40)
  const message = lines(formData.get("message"), 2000)
  if (name.length < 2 || phone.length < 8 || message.length < 3) {
    return { ok: false as const, error: "Preencha nome, telefone e mensagem." }
  }
  if (formData.get("consent") !== "on") return { ok: false as const, error: "É preciso aceitar o uso dos dados para responder." }
  await addLead({ origin: "contato", name, phone, email: clean(formData.get("email"), 160), message, sid: clean(formData.get("sid"), 80) })
  return { ok: true as const }
}

export async function submitVisit(formData: FormData) {
  if (clean(formData.get("company"), 80)) return { ok: true as const }
  if (await limited(`visita:${await clientIp()}`)) return { ok: false as const, error: "Muitos pedidos agora. Tente mais tarde." }
  const name = clean(formData.get("name"), 120)
  const phone = clean(formData.get("phone"), 40)
  if (name.length < 2 || phone.length < 8) return { ok: false as const, error: "Preencha nome e telefone." }
  if (formData.get("consent") !== "on") return { ok: false as const, error: "É preciso aceitar o uso dos dados para responder." }
  await addLead({
    origin: "visita",
    name,
    phone,
    email: "",
    message: clean(formData.get("when"), 160),
    vehicleSlug: clean(formData.get("vehicleSlug"), 160),
    vehicleLabel: clean(formData.get("vehicleLabel"), 180),
    refCode: clean(formData.get("refCode"), 20),
    sid: clean(formData.get("sid"), 80),
  })
  return { ok: true as const }
}

export async function submitFinance(formData: FormData) {
  if (clean(formData.get("company"), 80)) return { ok: true as const }
  if (await limited(`fin:${await clientIp()}`, 6)) return { ok: false as const, error: "Muitas fichas agora. Tente mais tarde." }
  const name = clean(formData.get("name"), 120)
  const phone = clean(formData.get("phone"), 40)
  const email = clean(formData.get("email"), 160)
  const cpf = clean(formData.get("cpf"), 20).replace(/\D/g, "")
  if (name.length < 2 || phone.length < 8) return { ok: false as const, error: "Preencha nome e telefone." }
  if (cpf && cpf.length !== 11) return { ok: false as const, error: "CPF precisa ter 11 números." }
  if (formData.get("consent") !== "on") return { ok: false as const, error: "É preciso aceitar o uso dos dados para a análise." }
  await addLead({
    origin: "financiamento",
    name,
    phone,
    email,
    message: lines(formData.get("notes"), 1000),
    vehicleSlug: clean(formData.get("vehicleSlug"), 160),
    vehicleLabel: clean(formData.get("vehicleLabel"), 180),
    refCode: clean(formData.get("refCode"), 20),
    sid: clean(formData.get("sid"), 80),
    payload: {
      cpf,
      renda: clean(formData.get("income"), 40),
      profissao: clean(formData.get("job"), 80),
      entrada: clean(formData.get("down"), 40),
    },
  })
  return { ok: true as const }
}

export async function submitSell(formData: FormData) {
  if (clean(formData.get("company"), 80)) return { ok: true as const }
  if (await limited(`venda:${await clientIp()}`, 6)) return { ok: false as const, error: "Muitos envios agora. Tente mais tarde." }
  const name = clean(formData.get("name"), 120)
  const phone = clean(formData.get("phone"), 40)
  const brand = clean(formData.get("brand"), 80)
  const model = clean(formData.get("model"), 80)
  if (name.length < 2 || phone.length < 8 || !brand || !model) {
    return { ok: false as const, error: "Preencha contato, marca e modelo." }
  }
  if (formData.get("consent") !== "on") return { ok: false as const, error: "É preciso aceitar o uso dos dados e das fotos." }
  const photos: string[] = []
  const files = formData.getAll("photos").filter((item): item is File => item instanceof File && item.size > 0).slice(0, 8)
  const dir = path.join(process.cwd(), "data", "private")
  await fs.mkdir(dir, { recursive: true })
  for (const file of files) {
    if (file.size > 8 * 1024 * 1024) continue
    if (!/^image\/(jpeg|png|webp|avif)$/.test(file.type)) continue
    const name = `${randomUUID()}.webp`
    await sharp(Buffer.from(await file.arrayBuffer()))
      .rotate()
      .resize({ width: 1600, withoutEnlargement: true })
      .webp({ quality: 72 })
      .toFile(path.join(dir, name))
    photos.push(name)
  }
  await addLead({
    origin: "venda",
    name,
    phone,
    email: clean(formData.get("email"), 160),
    message: lines(formData.get("notes"), 2000),
    photos,
    sid: clean(formData.get("sid"), 80),
    payload: {
      cidade: clean(formData.get("city"), 80),
      marca: brand,
      modelo: model,
      ano: clean(formData.get("year"), 10),
      km: clean(formData.get("km"), 20),
      pedido: clean(formData.get("ask"), 40),
    },
  })
  return { ok: true as const }
}

export async function recordWhatsappLead(input: { slug: string; label: string; ref: string; sid: string }) {
  const db = await getDb()
  const since = Date.now() - 86400000
  const exists = db.leads.some(
    (lead) =>
      lead.origin === "whatsapp" &&
      lead.vehicleSlug === input.slug &&
      lead.sid === input.sid &&
      Date.parse(lead.createdAt) > since,
  )
  if (exists) return { ok: true as const }
  await addLead({
    origin: "whatsapp",
    name: "",
    phone: "",
    email: "",
    message: "Clique no WhatsApp do anúncio",
    vehicleSlug: input.slug,
    vehicleLabel: input.label,
    refCode: input.ref,
    sid: input.sid,
  })
  return { ok: true as const }
}
