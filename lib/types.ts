export type BodyType = "suv" | "picape" | "sedan" | "esportivo" | "hatch"
export type VehicleStatus = "disponivel" | "reservado" | "vendido" | "oculto"
export type Tri = boolean | null
export type Role = "dono" | "gerente" | "vendedor"
export type LeadOrigin = "whatsapp" | "financiamento" | "venda" | "contato" | "visita"

export type Vehicle = {
  id: string
  slug: string
  brand: string
  model: string
  version: string
  yearMake: number
  yearModel: number
  km: number
  price: number
  promoPrice: number | null
  color: string
  fuel: string
  transmission: string
  doors: number
  engine: string
  power: string
  plateEnd: string
  singleOwner: Tri
  ipvaPaid: Tri
  inspection: Tri
  acceptsTrade: Tri
  options: string[]
  description: string
  photos: string[]
  coverIndex: number
  videoUrl: string
  spinFrames: string[]
  status: VehicleStatus
  featured: boolean
  featuredOrder: number
  enteredAt: string
  cost: number | null
  plate: string | null
  soldViaSite: boolean
  soldAt: string | null
  seoTitle: string
  seoDescription: string
  bodyType: BodyType
}

export type PublicVehicle = Omit<Vehicle, "cost" | "plate">

export type TeamMember = { name: string; role: string; photo: string }
export type Testimonial = { name: string; text: string; source: string }
export type Faq = { q: string; a: string }
export type Banner = { id: string; text: string; href: string; start: string; end: string; active: boolean }

export type Content = {
  hero: {
    kicker: string
    lines: [string, string, string]
    sub: string
    skipLabel: string
  }
  about: { title: string; lead: string; body: string }
  team: TeamMember[]
  testimonials: Testimonial[]
  faqs: Faq[]
  banners: Banner[]
  contact: {
    street: string
    area: string
    hoursWeek: string
    hoursSat: string
    phone1: string
    phone1Tel: string
    phone2: string
    phone2Tel: string
    whatsapp: string
    whatsappTel: string
    email: string
    instagram: string
    mapsUrl: string
    mapsEmbed: string
  }
  privacy: { updatedAt: string; text: string }
  ranking: { coldDays: number; hotShare: number; coldShare: number }
}

export type Lead = {
  id: string
  origin: LeadOrigin
  status: string
  createdAt: string
  updatedAt: string
  name: string
  phone: string
  email: string
  message: string
  vehicleSlug: string
  vehicleLabel: string
  refCode: string
  payload: Record<string, string>
  photos: string[]
  sid: string
}

export type AnalyticsEvent = {
  id: string
  type: string
  ts: string
  path: string
  vehicleSlug: string
  sid: string
  referrer: string
  source: string
  device: "mobile" | "tablet" | "desktop"
  bot: boolean
  staff: boolean
  meta: Record<string, string | number>
}

export type AuditEntry = {
  id: string
  at: string
  user: string
  action: string
  entity: string
  entityId: string
  summary: string
}

export type Db = {
  vehicles: Vehicle[]
  content: Content
  leads: Lead[]
  events: AnalyticsEvent[]
  audit: AuditEntry[]
}

export type Session = {
  email: string
  name: string
  role: Role
  exp: number
}
