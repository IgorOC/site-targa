"use client"

import { useEffect, useState } from "react"
import { useSite } from "@/components/providers"
import { badges, coverOf, priceOf } from "@/lib/catalog"
import { BODY_LABEL, brl, kmLabel, refCode } from "@/lib/format"
import { track } from "@/lib/track"
import { submitVisit } from "@/lib/actions"
import type { PublicVehicle } from "@/lib/types"
import { Badges } from "./badges"
import { BrandLogo } from "./brand-logo"
import { Price } from "./price"
import { CarPhoto } from "./car-photo"
import { useActiveTime } from "./use-active-time"
import { VehicleArt } from "./vehicle-art"

export function VehicleView({ vehicle, related }: { vehicle: PublicVehicle; related: PublicVehicle[] }) {
  const { setInterest } = useSite()
  const [photo, setPhoto] = useState(0)
  const [spin, setSpin] = useState(0)
  const [sent, setSent] = useState("")
  const photos = vehicle.photos
  const active = photos[photo] || coverOf(vehicle)

  useEffect(() => {
    setInterest({ slug: vehicle.slug, label: `${vehicle.brand} ${vehicle.model}`, ref: refCode(vehicle.slug) })
    track({ type: "vehicle_view", vehicleSlug: vehicle.slug })
    return () => setInterest(null)
  }, [setInterest, vehicle.brand, vehicle.model, vehicle.slug])
  useActiveTime(vehicle.slug)

  return (
    <div className="mx-auto grid max-w-[1280px] gap-10 px-5 pb-20 lg:grid-cols-[1.3fr_0.7fr]">
      <div>
        <div className="relative aspect-[4/5] overflow-hidden rounded-[28px] border border-white/10 bg-ink sm:aspect-[4/3]" data-cursor={vehicle.spinFrames.length > 1 ? "Arraste" : undefined}>
          {active ? (
            <>
              <CarPhoto src={active} alt="" aria-hidden fill className="scale-110 object-cover opacity-40 blur-2xl grayscale" priority sizes="64px" />
              <CarPhoto src={active} alt={`${vehicle.brand} ${vehicle.model}`} fill className="object-contain" priority sizes="(max-width: 1024px) 100vw, 60vw" />
            </>
          ) : (
            <VehicleArt bodyType={vehicle.bodyType} brand={vehicle.brand} />
          )}
        </div>
        {photos.length > 1 && (
          <div className="mt-3 flex gap-2 overflow-x-auto" onClick={() => track({ type: "gallery", vehicleSlug: vehicle.slug })}>
            {photos.map((src, index) => (
              <button key={src} className={`relative h-24 w-[72px] shrink-0 overflow-hidden rounded-2xl border ${index === photo ? "border-accent" : "border-white/10"}`} onClick={() => {
                  setPhoto(index)
                  track({ type: "photo_view", vehicleSlug: vehicle.slug, meta: { index: index + 1 } })
                }} aria-label={`Ver foto ${index + 1} de ${photos.length}`} aria-pressed={index === photo}>
                <CarPhoto src={src} alt="" fill className="object-cover" sizes="96px" />
              </button>
            ))}
          </div>
        )}
        {vehicle.spinFrames.length > 1 && (
          <div
            className="relative mt-4 aspect-[16/9] overflow-hidden rounded-[28px] border border-white/10"
            data-cursor="Arraste"
            onPointerDown={(event) => {
              const startX = event.clientX
              const start = spin
              const move = (ev: PointerEvent) => {
                const delta = Math.round((ev.clientX - startX) / 12)
                const count = vehicle.spinFrames.length
                setSpin((start + delta + count * 4) % count)
              }
              const up = () => {
                window.removeEventListener("pointermove", move)
                window.removeEventListener("pointerup", up)
                track({ type: "spin", vehicleSlug: vehicle.slug })
              }
              window.addEventListener("pointermove", move)
              window.addEventListener("pointerup", up)
            }}
          >
            <CarPhoto src={vehicle.spinFrames[spin]} alt="Giro do veículo" fill className="object-cover" sizes="70vw" />
            <p className="absolute bottom-3 left-3 text-xs uppercase tracking-[0.16em]">Arraste para girar</p>
          </div>
        )}
        {!photos.length && (
          <p className="mt-4 text-sm text-steel">As fotos deste anúncio entram pelo painel, a partir dos arquivos da loja. Os dados de preço, ano e km já são os do estoque.</p>
        )}
        <article className="prose-targa mt-8 max-w-3xl whitespace-pre-wrap text-porcelain/90">{vehicle.description}</article>
        {vehicle.options.length > 0 && (
          <ul className="mt-6 list-disc space-y-1 pl-5 text-sm text-steel">
            {vehicle.options.map((option) => <li key={option}>{option}</li>)}
          </ul>
        )}
        {vehicle.videoUrl && (
          <a href={vehicle.videoUrl} className="mt-6 inline-flex text-accent" target="_blank" rel="noreferrer">Assistir vídeo</a>
        )}
        <h2 className="mt-12 font-display text-3xl">Outros {BODY_LABEL[vehicle.bodyType].toLowerCase()}s</h2>
        <div className="mt-4 grid gap-3">
          {related.map((item) => (
            <a key={item.slug} href={`/veiculo/${item.slug}`} className="flex items-center justify-between gap-3 rounded-[20px] border border-white/10 px-4 py-3">
              <span className="flex min-w-0 items-center gap-2">
                <BrandLogo brand={item.brand} className="h-5 w-5 shrink-0 text-porcelain" />
                <span className="min-w-0">{item.brand} {item.model}</span>
              </span>
              <span className="shrink-0 text-accent tabular">{brl(priceOf(item))}</span>
            </a>
          ))}
        </div>
      </div>
      <aside className="h-fit rounded-[28px] border border-white/10 bg-graphite p-6 lg:sticky lg:top-28">
        <p className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-steel">
          <BrandLogo brand={vehicle.brand} className="h-6 w-6 text-porcelain" />
          {vehicle.brand}
        </p>
        <h1 className="mt-2 text-balance font-display text-[clamp(1.8rem,6vw,2.25rem)] tracking-[-0.04em]">{vehicle.model}</h1>
        <p className="mt-2 text-sm text-steel">{vehicle.version}</p>
        <div className="mt-4"><Badges items={badges(vehicle)} /></div>
        {vehicle.promoPrice && vehicle.promoPrice < vehicle.price && (
          <p className="mt-4 text-sm text-steel line-through tabular">{brl(vehicle.price)}</p>
        )}
        <Price value={priceOf(vehicle)} glow className="mt-2 block text-3xl text-accent" />
        <dl className="mt-6 grid grid-cols-2 gap-3 text-sm">
          <Spec k="Ano" v={`${vehicle.yearMake}/${vehicle.yearModel}`} />
          <Spec k="Km" v={kmLabel(vehicle.km)} />
          <Spec k="Câmbio" v={vehicle.transmission || "—"} />
          <Spec k="Combustível" v={vehicle.fuel || "—"} />
          <Spec k="Motor" v={vehicle.engine || "—"} />
          <Spec k="Portas" v={String(vehicle.doors)} />
          {vehicle.color && <Spec k="Cor" v={vehicle.color} />}
          {vehicle.plateEnd && <Spec k="Final" v={vehicle.plateEnd} />}
          {vehicle.power && <Spec k="Potência" v={vehicle.power} />}
        </dl>
        <p className="mt-6 text-sm text-steel">A simulação de parcela só entra quando a Targa informar taxas e prazos reais. Até lá, a ficha segue para a loja.</p>
        <a href={`/financiamento?veiculo=${vehicle.slug}`} className="mt-4 inline-flex rounded-[22px] border border-white/15 px-4 py-2 text-sm" onClick={() => track({ type: "finance_start", vehicleSlug: vehicle.slug })}>
          Quero financiar
        </a>
        <form
          className="mt-6 space-y-3 border-t border-white/10 pt-6"
          onSubmit={async (event) => {
            event.preventDefault()
            const data = new FormData(event.currentTarget)
            data.set("vehicleSlug", vehicle.slug)
            data.set("vehicleLabel", `${vehicle.brand} ${vehicle.model}`)
            data.set("refCode", refCode(vehicle.slug))
            data.set("sid", sessionStorage.getItem("targa-sid") || "")
            const response = await submitVisit(data)
            if (response.ok) track({ type: "visit_submit", vehicleSlug: vehicle.slug, explicit: true })
            setSent(response.ok ? "Pedido de visita enviado." : response.error || "Não foi possível enviar.")
          }}
        >
          <h2 className="font-display text-xl">Agendar visita</h2>
          <input name="company" className="hp" tabIndex={-1} autoComplete="off" aria-label="Não preencha este campo" />
          <input name="name" required placeholder="Nome" className="w-full rounded-[16px] border border-white/10 bg-obsidian px-3 py-2" />
          <input name="phone" required placeholder="Telefone" className="w-full rounded-[16px] border border-white/10 bg-obsidian px-3 py-2" />
          <input name="when" placeholder="Dia e horário" className="w-full rounded-[16px] border border-white/10 bg-obsidian px-3 py-2" />
          <label className="flex gap-2 text-xs text-steel">
            <input type="checkbox" name="consent" required />
            Aceito o uso destes dados para a Targa retornar o contato, conforme a política de privacidade.
          </label>
          <button className="rounded-[22px] bg-accent px-4 py-2 text-sm font-medium text-obsidian">Pedir horário</button>
          {sent && <p className="text-sm">{sent}</p>}
        </form>
      </aside>
    </div>
  )
}

function Spec({ k, v }: { k: string; v: string }) {
  return (
    <div className="rounded-2xl border border-white/10 px-3 py-2">
      <dt className="text-[11px] uppercase tracking-[0.14em] text-steel">{k}</dt>
      <dd className="tabular">{v}</dd>
    </div>
  )
}
