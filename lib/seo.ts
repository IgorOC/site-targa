import { coverOf, priceOf } from "./catalog"
import { SITE } from "./site"
import type { Content, Faq, PublicVehicle, Vehicle } from "./types"

// Dados fixos da loja usados em SEO local (Google, Bing) e GEO (respostas de IA).
export const STORE = {
  legalName: "Targa Motors",
  street: "Rua das Papoulas, 60",
  district: "Cidade Jardim",
  city: "Uberlândia",
  region: "MG",
  postalCode: "38412-204",
  country: "BR",
  areaServed: ["Uberlândia", "Triângulo Mineiro", "Minas Gerais"],
  keywords: [
    "seminovos premium Uberlândia",
    "carros seminovos Uberlândia",
    "loja de carros Uberlândia",
    "Porsche seminovo Uberlândia",
    "Land Rover seminovo Uberlândia",
    "SUV seminovo Uberlândia",
    "picape seminova Uberlândia",
  ],
}

export const absolute = (path: string) => (path.startsWith("http") ? path : `${SITE.url}${path}`)

// Fotos do estoque passam pela rota que corta as faixas brancas (vale também para o Google Imagens).
export function photoAbsolute(src: string, width = 1200) {
  if (!src) return ""
  if (src.startsWith("/")) return absolute(src)
  return absolute(`/api/foto?src=${encodeURIComponent(src)}&w=${width}`)
}

function hours(content: Content) {
  // Os horários do painel são texto livre; o schema usa o horário padrão da loja.
  void content
  return [
    { "@type": "OpeningHoursSpecification", dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], opens: "09:00", closes: "18:00" },
    { "@type": "OpeningHoursSpecification", dayOfWeek: "Saturday", opens: "09:00", closes: "12:00" },
  ]
}

export function dealerJsonLd(content: Content) {
  const { contact } = content
  const sameAs = [contact.instagram].filter(Boolean)
  return {
    "@context": "https://schema.org",
    "@type": "AutoDealer",
    "@id": `${SITE.url}/#loja`,
    name: SITE.name,
    legalName: STORE.legalName,
    description: "Loja de carros seminovos premium em Uberlândia-MG: SUVs, picapes, sedans e esportivos revisados, com procedência, preço e quilometragem publicados.",
    url: SITE.url,
    logo: absolute("/brand/logo.png"),
    // Foto real da fachada ajuda o Google a reconhecer a loja; a imagem de compartilhamento fica de apoio
    image: [absolute("/loja/fachada-targa.jpg"), absolute("/opengraph-image")],
    telephone: `+${contact.phone1Tel}`,
    email: contact.email || undefined,
    priceRange: "R$ 40 mil – R$ 800 mil",
    currenciesAccepted: "BRL",
    paymentAccepted: "Dinheiro, PIX, transferência, financiamento",
    address: {
      "@type": "PostalAddress",
      streetAddress: STORE.street,
      addressLocality: STORE.city,
      addressRegion: STORE.region,
      postalCode: STORE.postalCode,
      addressCountry: STORE.country,
    },
    areaServed: STORE.areaServed.map((name) => ({ "@type": "Place", name })),
    hasMap: contact.mapsUrl,
    openingHoursSpecification: hours(content),
    contactPoint: [
      { "@type": "ContactPoint", telephone: `+${contact.phone1Tel}`, contactType: "sales", areaServed: "BR", availableLanguage: "Portuguese" },
      { "@type": "ContactPoint", telephone: `+${contact.whatsappTel}`, contactType: "sales", contactOption: "WhatsApp", availableLanguage: "Portuguese" },
    ],
    sameAs,
  }
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE.url}/#site`,
    name: SITE.name,
    url: SITE.url,
    inLanguage: "pt-BR",
    publisher: { "@id": `${SITE.url}/#loja` },
    potentialAction: {
      "@type": "SearchAction",
      target: { "@type": "EntryPoint", urlTemplate: `${SITE.url}/estoque?q={busca}` },
      "query-input": "required name=busca",
    },
  }
}

export function faqJsonLd(faqs: Faq[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({ "@type": "Question", name: faq.q, acceptedAnswer: { "@type": "Answer", text: faq.a } })),
  }
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({ "@type": "ListItem", position: index + 1, name: item.name, item: absolute(item.path) })),
  }
}

export function vehicleTitle(v: Pick<Vehicle, "brand" | "model" | "yearMake" | "yearModel">) {
  return `${v.brand} ${v.model} ${v.yearMake}/${v.yearModel}`
}

export function carJsonLd(vehicle: PublicVehicle) {
  const url = absolute(`/veiculo/${vehicle.slug}`)
  return {
    "@context": "https://schema.org",
    "@type": "Car",
    "@id": `${url}#carro`,
    name: `${vehicle.brand} ${vehicle.model} ${vehicle.version}`,
    description: vehicle.seoDescription || vehicle.description,
    url,
    image: vehicle.photos.slice(0, 8).map((src) => photoAbsolute(src)),
    brand: { "@type": "Brand", name: vehicle.brand },
    manufacturer: { "@type": "Organization", name: vehicle.brand },
    model: vehicle.model,
    vehicleConfiguration: vehicle.version,
    productionDate: String(vehicle.yearMake),
    vehicleModelDate: String(vehicle.yearModel),
    bodyType: vehicle.bodyType,
    itemCondition: "https://schema.org/UsedCondition",
    mileageFromOdometer: { "@type": "QuantitativeValue", value: vehicle.km, unitCode: "KMT" },
    fuelType: vehicle.fuel || undefined,
    vehicleTransmission: vehicle.transmission || undefined,
    numberOfDoors: vehicle.doors || undefined,
    color: vehicle.color || undefined,
    vehicleEngine: vehicle.engine ? { "@type": "EngineSpecification", name: vehicle.engine } : undefined,
    offers: {
      "@type": "Offer",
      priceCurrency: "BRL",
      price: priceOf(vehicle),
      availability: vehicle.status === "reservado" ? "https://schema.org/LimitedAvailability" : "https://schema.org/InStock",
      itemCondition: "https://schema.org/UsedCondition",
      url,
      seller: { "@id": `${SITE.url}/#loja` },
      areaServed: STORE.city,
    },
  }
}

export function itemListJsonLd(vehicles: PublicVehicle[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Estoque de seminovos da Targa Motors em Uberlândia",
    numberOfItems: vehicles.length,
    itemListElement: vehicles.map((vehicle, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: absolute(`/veiculo/${vehicle.slug}`),
      name: `${vehicleTitle(vehicle)} — R$ ${priceOf(vehicle).toLocaleString("pt-BR")}`,
      image: photoAbsolute(coverOf(vehicle), 640) || undefined,
    })),
  }
}

export function jsonLdString(data: unknown) {
  return JSON.stringify(data).replace(/</g, "\\u003c")
}
