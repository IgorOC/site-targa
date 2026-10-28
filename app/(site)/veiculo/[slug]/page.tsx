import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { PageShell } from "@/components/layout/chrome"
import { VehicleView } from "@/components/vehicles/vehicle-view"
import { JsonLd } from "@/components/seo/json-ld"
import { coverOf, isPublic, priceOf, toPublic } from "@/lib/catalog"
import { brl, kmLabel } from "@/lib/format"
import { breadcrumbJsonLd, carJsonLd, photoAbsolute, vehicleTitle } from "@/lib/seo"
import { getDb } from "@/lib/store"

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const db = await getDb()
  const vehicle = db.vehicles.find((item) => item.slug === slug && isPublic(item))
  if (!vehicle) return { title: "Veículo" }
  const cover = photoAbsolute(coverOf(vehicle), 1200)
  const title = vehicle.seoTitle || `${vehicleTitle(vehicle)} seminovo em Uberlândia`
  const description = `${vehicleTitle(vehicle)} ${vehicle.version}, ${kmLabel(vehicle.km)}, por ${brl(priceOf(vehicle))}. Seminovo à venda na Targa Motors, Cidade Jardim, Uberlândia-MG.`
  return {
    title,
    description: vehicle.seoDescription || description,
    alternates: { canonical: `/veiculo/${vehicle.slug}` },
    openGraph: { type: "website", title, description, url: `/veiculo/${vehicle.slug}`, images: cover ? [{ url: cover, alt: vehicleTitle(vehicle) }] : undefined },
    twitter: { card: "summary_large_image", title, description, images: cover ? [cover] : undefined },
  }
}

export default async function VehiclePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const db = await getDb()
  const vehicle = db.vehicles.find((item) => item.slug === slug && isPublic(item))
  if (!vehicle) notFound()
  const pub = toPublic(vehicle)
  const related = db.vehicles
    .filter((item) => isPublic(item) && item.bodyType === vehicle.bodyType && item.slug !== vehicle.slug)
    .slice(0, 3)
    .map(toPublic)
  return (
    <PageShell>
      <JsonLd
        data={[
          carJsonLd(pub),
          breadcrumbJsonLd([
            { name: "Início", path: "/" },
            { name: "Estoque", path: "/estoque" },
            { name: vehicleTitle(vehicle), path: `/veiculo/${vehicle.slug}` },
          ]),
        ]}
      />
      <VehicleView vehicle={pub} related={related} />
    </PageShell>
  )
}
