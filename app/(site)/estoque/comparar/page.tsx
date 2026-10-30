"use client"

import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { X } from "lucide-react"
import { PageShell } from "@/components/layout/chrome"
import { useContent, useSite } from "@/components/providers"
import { BrandLogo } from "@/components/vehicles/brand-logo"
import { priceOf } from "@/lib/catalog"
import { BODY_LABEL, brl, kmLabel, refCode, vehicleInterestMessage, waLink } from "@/lib/format"
import type { PublicVehicle } from "@/lib/types"

const col = "w-[min(260px,calc(100vw-13rem))] shrink-0 snap-start px-3"

export default function ComparePage() {
  const { compare, toggleCompare, ready } = useSite()
  const { contact } = useContent()
  const [vehicles, setVehicles] = useState<PublicVehicle[]>([])
  const namesRef = useRef<HTMLDivElement>(null)
  const specsRef = useRef<HTMLDivElement>(null)
  const syncing = useRef(false)

  useEffect(() => {
    void fetch("/api/catalog").then((response) => response.json()).then(setVehicles)
  }, [])

  const rows = compare
    .map((item) => vehicles.find((vehicle) => vehicle.slug === item.slug))
    .filter((item): item is PublicVehicle => Boolean(item))
  const chosen = new Set(rows.map((vehicle) => vehicle.slug))
  const others = vehicles.filter((vehicle) => !chosen.has(vehicle.slug))
  const fields: [string, (vehicle: PublicVehicle) => string][] = [
    ["Preço", (vehicle) => brl(priceOf(vehicle))],
    ["Ano", (vehicle) => `${vehicle.yearMake}/${vehicle.yearModel}`],
    ["Km", (vehicle) => kmLabel(vehicle.km)],
    ["Tipo", (vehicle) => BODY_LABEL[vehicle.bodyType]],
    ["Câmbio", (vehicle) => vehicle.transmission || "—"],
    ["Combustível", (vehicle) => vehicle.fuel || "—"],
    ["Motor", (vehicle) => vehicle.engine || "—"],
  ]

  function sync(source: HTMLDivElement | null, target: HTMLDivElement | null) {
    if (!source || !target || syncing.current) return
    syncing.current = true
    target.scrollLeft = source.scrollLeft
    syncing.current = false
  }

  return (
    <PageShell title="Comparar" lede="Os nomes ficam no lugar. Deslize para o lado e troque um carro no X.">
      <div className="mx-auto max-w-[1100px] px-5 pb-28">
        {!ready || (compare.length > 0 && vehicles.length === 0) ? (
          <p className="text-steel">Carregando comparação.</p>
        ) : rows.length === 0 ? (
          <p className="text-steel">
            Nenhum carro na comparação. <Link href="/estoque" className="text-accent">Escolher no estoque</Link>
          </p>
        ) : (
          <>
            <div className="sticky top-[5.25rem] z-30 -mx-5 bg-[#0b0b0d] px-5">
              <div className="flex border-b border-white/10">
                <div className="w-[7.5rem] shrink-0" />
                <div
                  ref={namesRef}
                  className="no-scrollbar flex min-w-0 flex-1 snap-x snap-mandatory overflow-x-auto"
                  onScroll={() => sync(namesRef.current, specsRef.current)}
                >
                  {rows.map((vehicle) => (
                    <div key={vehicle.slug} className={`${col} flex items-start justify-between gap-2 py-3`}>
                      <div className="min-w-0">
                        <BrandLogo brand={vehicle.brand} className="h-8 w-8 text-porcelain" />
                        <p className="mt-2 font-display text-xl font-medium leading-tight">{vehicle.brand}</p>
                        <p className="font-display text-xl font-medium leading-tight">{vehicle.model}</p>
                        <p className="mt-1 line-clamp-2 font-sans text-xs font-normal text-steel">{vehicle.version}</p>
                      </div>
                      <button
                        type="button"
                        className="shrink-0 rounded-full border border-white/15 p-1.5 text-steel"
                        aria-label={`Tirar ${vehicle.brand} ${vehicle.model} da comparação`}
                        onClick={() => toggleCompare({ slug: vehicle.slug, label: `${vehicle.brand} ${vehicle.model}` })}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex">
              <div className="w-[7.5rem] shrink-0">
                {fields.map(([label]) => (
                  <div key={label} className="flex min-h-12 items-center border-b border-white/10 pr-2 text-sm text-steel">
                    {label}
                  </div>
                ))}
                <div className="flex min-h-14 items-center border-b border-white/10 pr-2 text-sm text-steel">Falar</div>
              </div>
              <div
                ref={specsRef}
                className="flex min-w-0 flex-1 snap-x snap-mandatory overflow-x-auto"
                onScroll={() => sync(specsRef.current, namesRef.current)}
              >
                {rows.map((vehicle) => (
                  <div key={vehicle.slug} className="shrink-0 snap-start">
                    {fields.map(([label, read]) => (
                      <div key={label} className={`${col} flex min-h-12 items-center border-b border-white/10 text-sm tabular`}>
                        {read(vehicle)}
                      </div>
                    ))}
                    <div className={`${col} flex min-h-14 items-center border-b border-white/10`}>
                      <a
                        className="text-sm text-accent"
                        href={waLink(contact.whatsappTel, vehicleInterestMessage(vehicle))}
                        target="_blank"
                        rel="noreferrer"
                      >
                        WhatsApp {refCode(vehicle.slug)}
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {rows.length > 1 && (
              <p className="mt-3 text-xs uppercase tracking-[0.16em] text-steel md:hidden">Deslize para o lado</p>
            )}
          </>
        )}

        {ready && vehicles.length > 0 && rows.length > 0 && others.length > 0 && (
          <section className="mt-10">
            <h2 className="font-display text-2xl tracking-[-0.03em]">Escolher outro carro</h2>
            <p className="mt-2 max-w-xl text-sm text-steel">
              {rows.length >= 3
                ? "A comparação já tem três. Tire um no X e toque no próximo."
                : "Toque para incluir. Dá para comparar até três."}
            </p>
            <div className="no-scrollbar mt-4 flex gap-3 overflow-x-auto pb-2">
              {others.map((vehicle) => (
                <button
                  key={vehicle.slug}
                  type="button"
                  className="flex w-40 shrink-0 flex-col items-start rounded-[20px] border border-white/10 bg-graphite p-3 text-left"
                  onClick={() => toggleCompare({ slug: vehicle.slug, label: `${vehicle.brand} ${vehicle.model}` })}
                >
                  <BrandLogo brand={vehicle.brand} className="h-7 w-7 text-porcelain" />
                  <span className="mt-2 text-xs uppercase tracking-[0.14em] text-steel">{vehicle.brand}</span>
                  <span className="font-display text-lg leading-tight">{vehicle.model}</span>
                  <span className="mt-2 text-sm text-accent tabular">{brl(priceOf(vehicle))}</span>
                </button>
              ))}
            </div>
          </section>
        )}
      </div>
    </PageShell>
  )
}
