import type { Metadata } from "next"
import { Hero } from "@/components/home/hero"
import { HomeRest } from "@/components/home/home-rest"
import { isPublic, toPublic } from "@/lib/catalog"
import { JsonLd } from "@/components/seo/json-ld"
import { faqJsonLd } from "@/lib/seo"
import { getDb } from "@/lib/store"

export const metadata: Metadata = {
  alternates: { canonical: "/" },
}

export default async function HomePage() {
  const db = await getDb()
  const vehicles = db.vehicles.filter(isPublic).map(toPublic)
  const featured = vehicles.filter((vehicle) => vehicle.featured).sort((a, b) => a.featuredOrder - b.featuredOrder)
  const latest = [...vehicles].sort((a, b) => b.enteredAt.localeCompare(a.enteredAt)).slice(0, 8)
  return (
    <>
      <JsonLd data={faqJsonLd(db.content.faqs)} />
      <Hero total={vehicles.length} />
      <HomeRest vehicles={vehicles} featured={featured} latest={latest} faqs={db.content.faqs} />
    </>
  )
}
