"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { PageShell } from "@/components/layout/chrome"
import { useContent, useSite } from "@/components/providers"
import { priceOf } from "@/lib/catalog"
import { BODY_LABEL, brl, kmLabel, refCode, vehicleInterestMessage, waLink } from "@/lib/format"
import type { PublicVehicle } from "@/lib/types"

export default function ComparePage() {
  const { compare, toggleCompare, ready } = useSite()
  const { contact } = useContent()
  const [vehicles, setVehicles] = useState<PublicVehicle[]>([])
  useEffect(() => {
    void fetch("/api/catalog").then((response) => response.json()).then(setVehicles)
  }, [])
  const rows = compare.map((item) => vehicles.find((vehicle) => vehicle.slug === item.slug)).filter((item): item is PublicVehicle => Boolean(item))
  const fields: [string, (vehicle: PublicVehicle) => string][] = [
    ["Preço", (vehicle) => brl(priceOf(vehicle))],
    ["Ano", (vehicle) => `${vehicle.yearMake}/${vehicle.yearModel}`],
    ["Km", (vehicle) => kmLabel(vehicle.km)],
    ["Tipo", (vehicle) => BODY_LABEL[vehicle.bodyType]],
    ["Câmbio", (vehicle) => vehicle.transmission || "—"],
    ["Combustível", (vehicle) => vehicle.fuel || "—"],
    ["Motor", (vehicle) => vehicle.engine || "—"],
  ]
  return (
    <PageShell title="Comparar" lede="Até três carros, lado a lado.">
      <div className="mx-auto max-w-[1100px] px-5 pb-20">
        {!ready || (compare.length > 0 && vehicles.length === 0) ? (
          <p className="text-steel">Carregando comparação.</p>
        ) : rows.length === 0 ? (
          <p className="text-steel">Nenhum carro na comparação. <Link href="/estoque" className="text-accent">Escolher no estoque</Link></p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr>
                  <th className="p-3 text-steel"> </th>
                  {rows.map((vehicle) => (
                    <th key={vehicle.slug} className="p-3 font-display text-xl font-medium">
                      {vehicle.brand} {vehicle.model}
                      <span className="mt-1 block font-sans text-xs font-normal text-steel">{vehicle.version}</span>
                      <button className="mt-2 block text-xs font-sans text-steel" onClick={() => toggleCompare({ slug: vehicle.slug, label: vehicle.model })}>Remover</button>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {fields.map(([label, read]) => (
                  <tr key={label} className="border-t border-white/10">
                    <th className="p-3 font-normal text-steel">{label}</th>
                    {rows.map((vehicle) => <td key={vehicle.slug} className="p-3 tabular">{read(vehicle)}</td>)}
                  </tr>
                ))}
                <tr className="border-t border-white/10">
                  <th className="p-3 font-normal text-steel">Falar</th>
                  {rows.map((vehicle) => (
                    <td key={vehicle.slug} className="p-3">
                      <a className="text-accent" href={waLink(contact.whatsappTel, vehicleInterestMessage(vehicle))} target="_blank" rel="noreferrer">
                        WhatsApp {refCode(vehicle.slug)}
                      </a>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </PageShell>
  )
}
