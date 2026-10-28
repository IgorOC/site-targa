import type { BodyType, LeadOrigin, VehicleStatus } from "./types"

export function brl(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value)
}

export function kmLabel(value: number) {
  return `${new Intl.NumberFormat("pt-BR").format(value)} km`
}

export function refCode(slug: string) {
  let n = 0
  for (let i = 0; i < slug.length; i++) n = (n * 33 + slug.charCodeAt(i)) >>> 0
  return `TM-${String(n % 10000).padStart(4, "0")}`
}

export function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}

export function waLink(phone: string, message: string) {
  const digits = phone.replace(/\D/g, "")
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`
}

export function vehicleInterestMessage(v: { brand: string; model: string; slug: string }) {
  return `Olá! Vi o ${v.brand} ${v.model} no site da Targa Motors. Ref ${refCode(v.slug)} | ${v.brand} ${v.model}.`
}

export function daysInStock(enteredAt: string, now = Date.now()) {
  const t = Date.parse(enteredAt)
  if (Number.isNaN(t)) return 0
  return Math.max(0, Math.floor((now - t) / 86400000))
}

export function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ")
}

export const BODY_LABEL: Record<BodyType, string> = {
  suv: "SUV",
  picape: "Picape",
  sedan: "Sedã",
  esportivo: "Esportivo",
  hatch: "Hatch",
}

export const STATUS_LABEL: Record<VehicleStatus, string> = {
  disponivel: "Disponível",
  reservado: "Reservado",
  vendido: "Vendido",
  oculto: "Oculto",
}

export const ORIGIN_LABEL: Record<LeadOrigin, string> = {
  whatsapp: "WhatsApp",
  financiamento: "Financiamento",
  venda: "Venda seu veículo",
  contato: "Contato",
  visita: "Visita",
}

export const LEAD_STATUSES: Record<LeadOrigin, string[]> = {
  whatsapp: ["Novo", "Em conversa", "Visita marcada", "Vendido", "Perdido"],
  financiamento: ["Novo", "Em análise", "Aprovado", "Recusado"],
  venda: ["Novo", "Avaliado", "Proposta enviada", "Comprado", "Descartado"],
  contato: ["Novo", "Respondido"],
  visita: ["Novo", "Visita marcada", "Respondido", "Perdido"],
}

export function todayKey(date = new Date()) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}
