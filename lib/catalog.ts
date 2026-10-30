import type { BodyType, PublicVehicle, Vehicle } from "./types"

export type BandId = "100" | "200" | "400" | "top"

export const BANDS: { id: BandId; label: string; hint: string; min: number; max: number | null }[] = [
  { id: "100", label: "Até R$ 100 mil", hint: "Entrada da vitrine", min: 0, max: 100000 },
  { id: "200", label: "R$ 100 a 200 mil", hint: "O meio do estoque", min: 100001, max: 200000 },
  { id: "400", label: "R$ 200 a 400 mil", hint: "Premium de uso", min: 200001, max: 400000 },
  { id: "top", label: "Acima de R$ 400 mil", hint: "O topo da loja", min: 400001, max: null },
]

export function priceOf(v: { price: number; promoPrice: number | null }) {
  if (v.promoPrice && v.promoPrice > 0 && v.promoPrice < v.price) return v.promoPrice
  return v.price
}

export function inBand(price: number, id: BandId) {
  if (id === "100") return price <= 100000
  if (id === "200") return price > 100000 && price <= 200000
  if (id === "400") return price > 200000 && price <= 400000
  return price > 400000
}

export function toPublic(v: Vehicle): PublicVehicle {
  const { cost, plate, ...rest } = v
  void cost
  void plate
  return rest
}

export function isPublic(v: { status: Vehicle["status"] }) {
  return v.status === "disponivel" || v.status === "reservado"
}

export type Badge = { id: string; label: string; tone: "gold" | "porcelain" | "signal" }

export function badges(v: PublicVehicle, now = Date.now()): Badge[] {
  const list: Badge[] = []
  if (v.status === "reservado") list.push({ id: "reservado", label: "Reservado", tone: "signal" })
  if (v.status === "vendido") list.push({ id: "vendido", label: "Vendido", tone: "signal" })
  if (v.km < 30000) list.push({ id: "km", label: "Baixa km", tone: "gold" })
  const entered = Date.parse(v.enteredAt)
  if (!Number.isNaN(entered) && now - entered <= 7 * 86400000) {
    list.push({ id: "novo", label: "Novo no estoque", tone: "porcelain" })
  }
  if (priceOf(v) > 250000) list.push({ id: "premium", label: "Premium", tone: "gold" })
  if (v.singleOwner) list.push({ id: "dono", label: "Único dono", tone: "porcelain" })
  if (v.ipvaPaid) list.push({ id: "ipva", label: "IPVA pago", tone: "porcelain" })
  if (v.inspection) list.push({ id: "laudo", label: "Laudo cautelar", tone: "porcelain" })
  if (v.acceptsTrade) list.push({ id: "troca", label: "Aceita troca", tone: "porcelain" })
  return list
}

export type FilterState = {
  q: string
  marca: string
  modelo: string
  tipo: "" | BodyType
  ano: string
  precoMin: string
  precoMax: string
  kmMax: string
  ordem: string
}

export const EMPTY_FILTERS: FilterState = {
  q: "",
  marca: "",
  modelo: "",
  tipo: "",
  ano: "",
  precoMin: "",
  precoMax: "",
  kmMax: "",
  ordem: "marca",
}

// Filtros a partir da URL do estoque (?q=&marca=&tipo=...)
export function filtersFromParams(params: URLSearchParams): FilterState {
  const get = (key: string) => params.get(key) || ""
  const tipo = get("tipo")
  return {
    ...EMPTY_FILTERS,
    q: get("q"),
    marca: get("marca"),
    modelo: get("modelo"),
    tipo: (["suv", "picape", "sedan", "esportivo", "hatch"].includes(tipo) ? tipo : "") as FilterState["tipo"],
    ano: get("ano"),
    precoMin: get("precoMin"),
    precoMax: get("precoMax"),
    kmMax: get("kmMax"),
    ordem: get("ordem") || "marca",
  }
}

export function filterVehicles(list: PublicVehicle[], f: FilterState) {
  const q = f.q.trim().toLowerCase()
  return list.filter((v) => {
    if (f.marca && v.brand.toLowerCase() !== f.marca.toLowerCase()) return false
    if (f.modelo && v.model.toLowerCase() !== f.modelo.toLowerCase()) return false
    if (f.tipo && v.bodyType !== f.tipo) return false
    if (f.ano && String(v.yearModel) !== f.ano && String(v.yearMake) !== f.ano) return false
    const price = priceOf(v)
    if (f.precoMin && price < Number(f.precoMin)) return false
    if (f.precoMax && price > Number(f.precoMax)) return false
    if (f.kmMax && v.km > Number(f.kmMax)) return false
    if (q) {
      const hay = `${v.brand} ${v.model} ${v.version}`.toLowerCase()
      if (!hay.includes(q)) return false
    }
    return true
  })
}

export function sortVehicles(list: PublicVehicle[], ordem: string) {
  const copy = [...list]
  copy.sort((a, b) => {
    if (ordem === "preco-asc") return priceOf(a) - priceOf(b)
    if (ordem === "preco-desc") return priceOf(b) - priceOf(a)
    if (ordem === "ano") return b.yearModel - a.yearModel || b.yearMake - a.yearMake
    if (ordem === "km") return a.km - b.km
    return a.brand.localeCompare(b.brand, "pt-BR") || a.model.localeCompare(b.model, "pt-BR")
  })
  return copy
}

export function brandCounts(list: PublicVehicle[]) {
  const map = new Map<string, number>()
  for (const v of list) map.set(v.brand, (map.get(v.brand) || 0) + 1)
  return [...map.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "pt-BR"))
}

export function modelCounts(list: PublicVehicle[], brand?: string) {
  const map = new Map<string, number>()
  for (const v of list) {
    if (brand && v.brand.toLowerCase() !== brand.toLowerCase()) continue
    map.set(v.model, (map.get(v.model) || 0) + 1)
  }
  return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0], "pt-BR"))
}

export function coverOf(v: { photos: string[]; coverIndex: number }) {
  if (!v.photos.length) return ""
  return v.photos[v.coverIndex] || v.photos[0]
}
