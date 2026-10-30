"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import { motion } from "motion/react"
import { useContent } from "@/components/providers"
import { VehicleCard } from "@/components/vehicles/vehicle-card"
import { BrandLogo } from "@/components/vehicles/brand-logo"
import { Price } from "@/components/vehicles/price"
import { CarPhoto } from "@/components/vehicles/car-photo"
import { VehicleArt } from "@/components/vehicles/vehicle-art"
import { BANDS, brandCounts, coverOf, inBand, modelCounts, priceOf } from "@/lib/catalog"
import { BODY_LABEL, brl, kmLabel } from "@/lib/format"
import type { BodyType, Faq, PublicVehicle } from "@/lib/types"

const types: BodyType[] = ["suv", "picape", "sedan", "esportivo", "hatch"]

export function HomeRest({ vehicles, featured, latest, faqs }: { vehicles: PublicVehicle[]; featured: PublicVehicle[]; latest: PublicVehicle[]; faqs: Faq[] }) {
  const content = useContent()
  const brands = brandCounts(vehicles)
  return (
    <>
      <Search vehicles={vehicles} />
      <Marquee brands={brands} />
      <Featured items={featured} />
      <section id="novidades" className="mx-auto max-w-[1280px] px-5 py-12">
        <h2 className="font-display text-4xl tracking-[-0.04em] md:text-5xl">Últimas novidades</h2>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {latest.map((vehicle) => (
            <VehicleCard key={vehicle.slug} vehicle={vehicle} />
          ))}
        </div>
        <Link href="/estoque" className="mt-8 inline-flex rounded-[22px] border border-white/15 px-5 py-3 text-sm">
          Clique e veja todo o estoque
        </Link>
      </section>
      <section className="mx-auto grid max-w-[1280px] gap-4 px-5 py-10 md:grid-cols-4">
        {BANDS.map((band) => {
          const count = vehicles.filter((vehicle) => inBand(priceOf(vehicle), band.id)).length
          const href = band.max ? `/estoque?precoMin=${band.min}&precoMax=${band.max}` : `/estoque?precoMin=${band.min}`
          return (
            <Link key={band.id} href={href} className="rounded-[24px] border border-white/10 bg-graphite p-5 transition hover:border-accent/50">
              <p className="text-xs uppercase tracking-[0.16em] text-steel">{band.hint}</p>
              <p className="mt-3 font-display text-2xl">{band.label}</p>
              <p className="mt-4 text-3xl text-accent tabular">{count}</p>
              <p className="text-sm text-steel">{count === 1 ? "veículo" : "veículos"}</p>
            </Link>
          )
        })}
      </section>
      <Sell />
      <Finance />
      <Trust count={vehicles.length} lead={content.about.lead} />
      <Faqs items={faqs} />
      <Location />
    </>
  )
}

function Search({ vehicles }: { vehicles: PublicVehicle[] }) {
  const [q, setQ] = useState("")
  const [marca, setMarca] = useState("")
  const [modelo, setModelo] = useState("")
  const [preco, setPreco] = useState(800000)
  const brands = brandCounts(vehicles).map(([name]) => name)
  const models = modelCounts(vehicles, marca || undefined).map(([name]) => name)
  const max = Math.max(800000, ...vehicles.map((vehicle) => priceOf(vehicle)))
  const suggestions = useMemo(() => {
    const query = q.trim().toLowerCase()
    if (query.length < 2) return []
    return vehicles
      .filter((vehicle) => `${vehicle.brand} ${vehicle.model} ${vehicle.version}`.toLowerCase().includes(query))
      .slice(0, 6)
  }, [q, vehicles])
  const params = new URLSearchParams()
  if (q) params.set("q", q)
  if (marca) params.set("marca", marca)
  if (modelo) params.set("modelo", modelo)
  if (preco < max) params.set("precoMax", String(preco))
  const href = params.size ? `/estoque?${params}` : "/estoque"

  return (
    <section id="busca" className="mx-auto max-w-[1100px] px-5 py-12">
      <p className="text-xs uppercase tracking-[0.22em] text-accent">Busca</p>
      <h2 className="mt-3 font-display text-4xl tracking-[-0.04em] md:text-5xl">Qual veículo você está buscando?</h2>
      <form action={href} className="glass mt-8 grid gap-4 rounded-[28px] p-5 md:grid-cols-4">
        <label className="text-xs uppercase tracking-[0.14em] text-steel md:col-span-4">
          Busca livre
          <input value={q} onChange={(event) => setQ(event.target.value)} placeholder="911, Compass, Hilux..." className="mt-2 w-full rounded-[18px] border border-white/10 bg-obsidian px-4 py-3 text-base text-porcelain outline-none" />
        </label>
        <label className="text-xs uppercase tracking-[0.14em] text-steel">
          Marca
          <select value={marca} onChange={(event) => { setMarca(event.target.value); setModelo("") }} className="mt-2 w-full rounded-[18px] border border-white/10 bg-obsidian px-4 py-3 text-base">
            <option value="">Todas</option>
            {brands.map((brand) => <option key={brand}>{brand}</option>)}
          </select>
        </label>
        <label className="text-xs uppercase tracking-[0.14em] text-steel">
          Modelo
          <select value={modelo} onChange={(event) => setModelo(event.target.value)} className="mt-2 w-full rounded-[18px] border border-white/10 bg-obsidian px-4 py-3 text-base">
            <option value="">Todos</option>
            {models.map((model) => <option key={model}>{model}</option>)}
          </select>
        </label>
        <label className="text-xs uppercase tracking-[0.14em] text-steel md:col-span-2">
          Até {brl(preco)}
          <input type="range" min={40000} max={max} step={5000} value={preco} onChange={(event) => setPreco(Number(event.target.value))} className="mt-4 w-full accent-accent" />
        </label>
        <div className="md:col-span-4 flex flex-wrap items-center gap-3">
          <button className="rounded-[22px] bg-accent px-5 py-3 text-sm font-medium text-obsidian">Localizar</button>
          <div className="flex flex-wrap gap-2">
            {types.map((type) => (
              <Link key={type} href={`/estoque?tipo=${type}`} className="rounded-full border border-white/15 px-3 py-1.5 text-xs uppercase tracking-[0.14em] text-steel">
                {BODY_LABEL[type]}
              </Link>
            ))}
          </div>
        </div>
        {suggestions.length > 0 && (
          <ul className="md:col-span-4 divide-y divide-white/10 rounded-[18px] border border-white/10">
            {suggestions.map((vehicle) => (
              <li key={vehicle.slug}>
                <Link href={`/veiculo/${vehicle.slug}`} className="flex items-center justify-between gap-4 px-4 py-3 hover:bg-white/5">
                  <span className="min-w-0">{vehicle.brand} {vehicle.model}</span>
                  <span className="shrink-0 text-accent tabular">{brl(priceOf(vehicle))}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </form>
    </section>
  )
}

function Marquee({ brands }: { brands: [string, number][] }) {
  const row = [...brands, ...brands]
  return (
    <section className="marquee overflow-hidden border-y border-white/10 py-6" aria-label="Marcas no estoque">
      <div className="marquee-track flex w-max gap-12 px-8">
        {row.map(([brand, count], index) => (
          <Link key={`${brand}-${index}`} href={`/estoque?marca=${encodeURIComponent(brand)}`} className="flex items-center gap-3 whitespace-nowrap">
            <BrandLogo brand={brand} className="h-9 w-9 text-porcelain" />
            <span className="font-display text-2xl tracking-[0.14em]">{brand.toUpperCase()}</span>
            <span className="text-sm text-steel">{count}</span>
          </Link>
        ))}
      </div>
    </section>
  )
}

function Featured({ items }: { items: PublicVehicle[] }) {
  if (!items.length) return null
  return (
    <section id="destaques" className="mx-auto max-w-[1280px] px-5 py-14">
      <p className="text-xs uppercase tracking-[0.2em] text-steel">Destaques</p>
      <h2 className="mt-3 font-display text-4xl tracking-[-0.04em] md:text-5xl">Escolhidos da vitrine</h2>
      <div className="mt-8 grid gap-5 md:grid-cols-2">
        {items.map((vehicle) => {
          const photo = coverOf(vehicle)
          return (
            <Link
              key={vehicle.slug}
              href={`/veiculo/${vehicle.slug}`}
              className="group grid overflow-hidden rounded-[28px] border border-white/10 bg-graphite transition-colors hover:border-white/25 md:grid-cols-[1fr_1fr]"
            >
              <div className="relative aspect-[4/3] bg-ink md:aspect-auto md:min-h-[300px]">
                {photo ? (
                  <CarPhoto src={photo} alt={`${vehicle.brand} ${vehicle.model}`} fill quality={85} sizes="(max-width: 768px) 100vw, 25vw" className="object-cover object-[50%_70%]" />
                ) : (
                  <VehicleArt bodyType={vehicle.bodyType} brand={vehicle.brand} />
                )}
              </div>
              <div className="flex flex-col justify-between gap-6 p-6">
                <div>
                  <p className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-steel">
                    <BrandLogo brand={vehicle.brand} className="h-6 w-6 text-porcelain" />
                    {vehicle.brand}
                  </p>
                  <h3 className="mt-2 font-display text-3xl tracking-[-0.03em] md:text-4xl">{vehicle.model}</h3>
                  <p className="mt-2 text-sm text-steel">{vehicle.version}</p>
                  <p className="mt-3 text-sm">{vehicle.yearMake}/{vehicle.yearModel} · {kmLabel(vehicle.km)}</p>
                </div>
                <div>
                  <Price value={priceOf(vehicle)} className="block text-2xl font-medium" />
                  <span className="mt-4 inline-flex items-center gap-2 text-sm text-porcelain/80 group-hover:text-porcelain">Ver detalhes →</span>
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}

function Sell() {
  return (
    <section className="mx-auto max-w-[1280px] px-5 py-12">
      <div className="rounded-[28px] border border-white/10 bg-graphite px-6 py-12 md:px-12">
        <p className="text-xs uppercase tracking-[0.2em] text-accent">Venda seu veículo</p>
        <h2 className="mt-4 max-w-3xl font-display text-4xl tracking-[-0.04em] md:text-6xl">Seu carro pode ser o próximo da vitrine.</h2>
        <a href="/venda" className="mt-8 inline-flex rounded-[22px] bg-accent px-6 py-3 text-sm font-medium text-obsidian">
          Avaliar meu veículo
        </a>
      </div>
    </section>
  )
}

function Finance() {
  const steps = [
    ["01", "Você escolhe o carro", "No estoque, com preço e quilometragem à vista."],
    ["02", "Envia a ficha", "Poucos passos, com aviso de privacidade antes do envio."],
    ["03", "A Targa retorna", "Com as condições reais. O site não inventa parcela."],
  ]
  return (
    <section className="mx-auto max-w-[1280px] px-5 py-12">
      <h2 className="font-display text-4xl tracking-[-0.04em]">Financiamento em três passos</h2>
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {steps.map(([index, title, text], step) => (
          <motion.article
            key={index}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ duration: 0.45, delay: step * 0.08 }}
            className="rounded-[24px] border border-white/10 p-6"
          >
            <p className="text-accent">{index}</p>
            <h3 className="mt-3 font-display text-2xl">{title}</h3>
            <p className="mt-2 text-sm text-steel">{text}</p>
          </motion.article>
        ))}
      </div>
      <Link href="/financiamento" className="mt-6 inline-flex text-sm text-accent">Abrir a ficha</Link>
    </section>
  )
}

function Trust({ count, lead }: { count: number; lead: string }) {
  return (
    <section className="mx-auto grid max-w-[1280px] gap-8 px-5 py-16 md:grid-cols-3">
      <div className="md:col-span-2">
        <p className="text-xs uppercase tracking-[0.2em] text-accent">Quem somos</p>
        <h2 className="mt-3 font-display text-4xl tracking-[-0.04em]">{lead}</h2>
        <Link href="/quem-somos" className="mt-6 inline-flex rounded-[22px] border border-white/15 px-5 py-3 text-sm">Conhecer a loja</Link>
      </div>
      <div className="rounded-[24px] border border-white/10 p-6">
        <p className="font-display text-5xl text-accent tabular">{count}</p>
        <p className="mt-2 text-steel">seminovos publicados agora</p>
      </div>
    </section>
  )
}

function Faqs({ items }: { items: Faq[] }) {
  if (!items.length) return null
  return (
    <section className="mx-auto max-w-[1280px] px-5 py-12">
      <h2 className="font-display text-4xl tracking-[-0.04em]">Perguntas frequentes</h2>
      <div className="mt-6 divide-y divide-white/10 rounded-[24px] border border-white/10">
        {items.map((faq) => (
          <details key={faq.q} className="group px-6 py-5">
            <summary className="flex list-none items-center justify-between gap-4 text-lg">
              {faq.q}
              <span className="text-steel transition-transform group-open:rotate-45">+</span>
            </summary>
            <p className="mt-3 max-w-3xl text-steel">{faq.a}</p>
          </details>
        ))}
      </div>
    </section>
  )
}

function Location() {
  const { contact } = useContent()
  return (
    <section className="mx-auto grid max-w-[1280px] gap-6 px-5 py-16 md:grid-cols-2">
      <div>
        <h2 className="font-display text-4xl">Onde estamos</h2>
        <p className="mt-4 text-steel">{contact.street}<br />{contact.area}</p>
        <p className="mt-4 text-lg">{contact.hoursWeek}<br />{contact.hoursSat}</p>
        <div className="mt-4 flex flex-col gap-1">
          <a href={`tel:+${contact.phone1Tel}`}>{contact.phone1}</a>
          <a href={`tel:+${contact.phone2Tel}`}>{contact.phone2}</a>
          <a href={`tel:+${contact.whatsappTel}`}>WhatsApp {contact.whatsapp}</a>
          {contact.instagram && (
            <a href={contact.instagram} target="_blank" rel="noreferrer">Instagram @targa__motors</a>
          )}
          <a href={contact.mapsUrl} target="_blank" rel="noreferrer" className="mt-2 text-steel underline">Como chegar</a>
        </div>
      </div>
      <iframe title="Mapa da Targa Motors no bairro Cidade Jardim, em Uberlândia" src={contact.mapsEmbed} className="h-[360px] w-full rounded-[24px] border border-white/10" loading="lazy" />
    </section>
  )
}
