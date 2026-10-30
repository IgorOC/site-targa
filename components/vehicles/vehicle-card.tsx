"use client"

import Link from "next/link"
import { useContent, useSite } from "@/components/providers"
import { badges, coverOf, priceOf } from "@/lib/catalog"
import { kmLabel, refCode, vehicleInterestMessage, waLink } from "@/lib/format"
import { track } from "@/lib/track"
import type { PublicVehicle } from "@/lib/types"
import { Badges } from "./badges"
import { BrandLogo } from "./brand-logo"
import { Price } from "./price"
import { CarPhoto } from "./car-photo"
import { VehicleArt } from "./vehicle-art"
import { recordWhatsappLead } from "@/lib/actions"

export function VehicleCard({ vehicle, priority = false }: { vehicle: PublicVehicle; priority?: boolean }) {
  const { contact } = useContent()
  const { favs, compare, toggleFav, toggleCompare } = useSite()
  const photo = coverOf(vehicle)
  const saved = favs.includes(vehicle.slug)
  const selected = compare.some((item) => item.slug === vehicle.slug)
  const label = `${vehicle.brand} ${vehicle.model}`

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-[24px] border border-white/10 bg-graphite transition-colors hover:border-white/25">
      <Link
        href={`/veiculo/${vehicle.slug}`}
        className="block"
        onClick={() => track({ type: "card_click", vehicleSlug: vehicle.slug })}
      >
        <div className="relative aspect-[4/3] overflow-hidden bg-ink">
          {photo ? (
            <CarPhoto src={photo} alt={`${label}, foto de capa`} fill className="object-cover object-[50%_75%]" priority={priority} sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw" />
          ) : (
            <VehicleArt bodyType={vehicle.bodyType} brand={vehicle.brand} />
          )}
          <div className="absolute left-3 top-3">
            <Badges items={badges(vehicle)} />
          </div>
        </div>
        <div className="space-y-2 px-5 pt-5">
          <p className="flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-steel">
            <BrandLogo brand={vehicle.brand} className="h-5 w-5 text-porcelain" />
            {vehicle.brand}
          </p>
          <h3 className="font-display text-2xl tracking-[-0.03em]">{vehicle.model}</h3>
          <p className="line-clamp-2 min-h-10 text-sm text-steel">{vehicle.version}</p>
          <p className="text-sm">
            {vehicle.yearMake}/{vehicle.yearModel}
            <span className="px-2 text-steel">·</span>
            {kmLabel(vehicle.km)}
          </p>
          {vehicle.promoPrice && vehicle.promoPrice < vehicle.price && (
            <p className="text-xs text-steel line-through tabular">{vehicle.price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</p>
          )}
          <Price value={priceOf(vehicle)} className="block text-xl font-medium text-accent" />
        </div>
      </Link>
      <div className="mt-auto flex flex-wrap gap-2 px-5 py-5">
        <button
          className={`rounded-full border px-3 py-1.5 text-xs ${saved ? "border-accent text-accent" : "border-white/15 text-steel"}`}
          aria-pressed={saved}
          onClick={() => toggleFav(vehicle.slug)}
        >
          {saved ? "Salvo" : "Favorito"}
        </button>
        <button
          className={`rounded-full border px-3 py-1.5 text-xs ${selected ? "border-accent text-accent" : "border-white/15 text-steel"}`}
          aria-pressed={selected}
          onClick={() => toggleCompare({ slug: vehicle.slug, label })}
        >
          {selected ? "Na comparação" : "Comparar"}
        </button>
        <a
          className="rounded-full bg-accent px-3 py-1.5 text-xs font-medium text-obsidian"
          href={waLink(contact.whatsappTel, vehicleInterestMessage(vehicle))}
          target="_blank"
          rel="noreferrer"
          onClick={() => {
            track({ type: "whatsapp", vehicleSlug: vehicle.slug, explicit: true })
            void recordWhatsappLead({
              slug: vehicle.slug,
              label,
              ref: refCode(vehicle.slug),
              sid: sessionStorage.getItem("targa-sid") || "",
            })
          }}
        >
          WhatsApp
        </a>
      </div>
    </article>
  )
}
