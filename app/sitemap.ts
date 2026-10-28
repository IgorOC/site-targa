import type { MetadataRoute } from "next"
import { isPublic } from "@/lib/catalog"
import { photoAbsolute } from "@/lib/seo"
import { SITE } from "@/lib/site"
import { getDb } from "@/lib/store"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const db = await getDb()
  const now = new Date()
  const staticRoutes = ["", "/estoque", "/venda", "/financiamento", "/quem-somos", "/contato", "/privacidade"].map((path) => ({
    url: `${SITE.url}${path || "/"}`,
    lastModified: now,
    changeFrequency: path === "" || path === "/estoque" ? ("daily" as const) : ("monthly" as const),
    priority: path === "" ? 1 : path === "/estoque" ? 0.9 : 0.6,
  }))
  const vehicles = db.vehicles.filter(isPublic).map((vehicle) => ({
    url: `${SITE.url}/veiculo/${vehicle.slug}`,
    lastModified: new Date(vehicle.enteredAt),
    changeFrequency: "daily" as const,
    priority: 0.8,
    images: vehicle.photos.slice(0, 5).map((src) => photoAbsolute(src)),
  }))
  return [...staticRoutes, ...vehicles]
}
