import type { Metadata } from "next"
import { Suspense } from "react"
import { PageShell } from "@/components/layout/chrome"
import { Explorer, ExplorerFromUrl } from "@/components/vehicles/explorer"
import { isPublic, toPublic } from "@/lib/catalog"
import { JsonLd } from "@/components/seo/json-ld"
import { breadcrumbJsonLd, itemListJsonLd } from "@/lib/seo"
import { getDb } from "@/lib/store"

export const metadata: Metadata = {
  title: "Estoque de seminovos em Uberlândia",
  description: "Veja os seminovos premium à venda na Targa Motors em Uberlândia-MG: Porsche, Land Rover, Jeep, Toyota, Fiat e mais. Preço, ano e km de cada carro.",
  alternates: { canonical: "/estoque" },
}

export default async function EstoquePage() {
  const db = await getDb()
  const vehicles = db.vehicles.filter(isPublic).map(toPublic)
  return (
    <PageShell title="Estoque" lede="Encontre o seminovo por uso, marca ou preço. Dá para comparar até três e guardar favoritos neste aparelho.">
      <JsonLd data={[itemListJsonLd(vehicles), breadcrumbJsonLd([{ name: "Início", path: "/" }, { name: "Estoque", path: "/estoque" }])]} />
      <Suspense fallback={<Explorer vehicles={vehicles} />}>
        <ExplorerFromUrl vehicles={vehicles} />
      </Suspense>
    </PageShell>
  )
}
