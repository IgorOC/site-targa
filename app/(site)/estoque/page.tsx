import type { Metadata } from "next"
import { PageShell } from "@/components/layout/chrome"
import { Explorer } from "@/components/vehicles/explorer"
import { EMPTY_FILTERS, isPublic, toPublic, type FilterState } from "@/lib/catalog"
import { JsonLd } from "@/components/seo/json-ld"
import { breadcrumbJsonLd, itemListJsonLd } from "@/lib/seo"
import { getDb } from "@/lib/store"
import type { BodyType } from "@/lib/types"

export const metadata: Metadata = {
  title: "Estoque de seminovos em Uberlândia",
  description: "Veja os seminovos premium à venda na Targa Motors em Uberlândia-MG: Porsche, Land Rover, Jeep, Toyota, Fiat e mais. Preço, ano e km de cada carro.",
  alternates: { canonical: "/estoque" },
}

function one(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] || "" : value || ""
}

export default async function EstoquePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const params = await searchParams
  const db = await getDb()
  const vehicles = db.vehicles.filter(isPublic).map(toPublic)
  const tipo = one(params.tipo)
  const initial: FilterState = {
    ...EMPTY_FILTERS,
    q: one(params.q),
    marca: one(params.marca),
    modelo: one(params.modelo),
    tipo: (["suv", "picape", "sedan", "esportivo", "hatch"].includes(tipo) ? tipo : "") as FilterState["tipo"],
    ano: one(params.ano),
    precoMin: one(params.precoMin),
    precoMax: one(params.precoMax),
    kmMax: one(params.kmMax),
    ordem: one(params.ordem) || "marca",
  }
  void (tipo as BodyType)
  return (
    <PageShell title="Estoque" lede="Encontre o seminovo por uso, marca ou preço. Dá para comparar até três e guardar favoritos neste aparelho.">
      <JsonLd data={[itemListJsonLd(vehicles), breadcrumbJsonLd([{ name: "Início", path: "/" }, { name: "Estoque", path: "/estoque" }])]} />
      <Explorer vehicles={vehicles} initial={initial} />
    </PageShell>
  )
}
