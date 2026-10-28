"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { PageShell } from "@/components/layout/chrome"
import { useSite } from "@/components/providers"
import { VehicleCard } from "@/components/vehicles/vehicle-card"
import type { PublicVehicle } from "@/lib/types"

export default function FavoritesPage() {
  const { favs } = useSite()
  const [vehicles, setVehicles] = useState<PublicVehicle[]>([])
  useEffect(() => {
    void fetch("/api/catalog").then((response) => response.json()).then(setVehicles)
  }, [])
  const saved = vehicles.filter((vehicle) => favs.includes(vehicle.slug))
  return (
    <PageShell title="Favoritos" lede="Ficam salvos neste aparelho, para você voltar nos carros que já viu.">
      <div className="mx-auto max-w-[1280px] px-5 pb-20">
        {saved.length === 0 ? (
          <p className="text-steel">Nenhum favorito ainda. <Link href="/estoque" className="text-accent">Abrir o estoque</Link></p>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {saved.map((vehicle) => <VehicleCard key={vehicle.slug} vehicle={vehicle} />)}
          </div>
        )}
      </div>
    </PageShell>
  )
}
