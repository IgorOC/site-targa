import type { Metadata } from "next"
import Image from "next/image"
import { MapPin, MessageCircle } from "lucide-react"
import { PageShell } from "@/components/layout/chrome"
import { waLink } from "@/lib/format"
import { getDb } from "@/lib/store"

export const metadata: Metadata = {
  title: "Quem Somos",
  alternates: { canonical: "/quem-somos" },
  description: "Targa Motors, loja de seminovos premium no bairro Cidade Jardim, em Uberlândia-MG.",
}

export default async function AboutPage() {
  const db = await getDb()
  const { about, team, testimonials, contact } = db.content
  return (
    <PageShell title={about.title} lede={about.lead}>
      <div className="mx-auto max-w-[1280px] px-5 pb-12">
        <div className="max-w-3xl space-y-4 text-lg text-porcelain/90">
          {about.body.split("\n").filter(Boolean).map((paragraph) => (
            <p key={paragraph.slice(0, 24)}>{paragraph}</p>
          ))}
        </div>
      </div>

      {/* Showroom: a fachada ao lado de endereço, horário e mapa, ocupando a mesma altura */}
      <section className="mx-auto max-w-[1280px] px-5 pb-12">
        <div className="grid overflow-hidden rounded-[28px] border border-white/10 bg-graphite md:grid-cols-[minmax(0,420px)_1fr]">
          <div className="relative aspect-[4/5] md:aspect-auto md:min-h-[560px]">
            <Image
              src="/loja/fachada-targa.jpg"
              alt="Fachada da Targa Motors na Rua das Papoulas, 60, Cidade Jardim, Uberlândia"
              fill
              sizes="(min-width: 768px) 420px, 100vw"
              className="object-cover object-[50%_35%]"
            />
          </div>
          <div className="flex flex-col gap-6 p-6 md:p-10">
            <div>
              <p className="text-[11px] uppercase tracking-[0.28em] text-steel">Showroom</p>
              <h2 className="mt-3 font-display text-3xl tracking-[-0.03em] md:text-4xl">Venha ver de perto</h2>
              <p className="mt-4 text-lg text-porcelain/90">
                {contact.street}
                <br />
                {contact.area}
              </p>
              <p className="mt-3 text-steel">
                {contact.hoursWeek}
                <br />
                {contact.hoursSat}
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <a href={contact.mapsUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-[22px] bg-accent px-5 py-3 text-sm font-medium text-obsidian">
                  <MapPin size={16} /> Como chegar
                </a>
                <a
                  href={waLink(contact.whatsappTel, "Olá! Quero visitar o showroom da Targa Motors.")}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-[22px] border border-white/20 px-5 py-3 text-sm"
                >
                  <MessageCircle size={16} /> Agendar visita
                </a>
              </div>
            </div>
            <iframe
              title="Mapa da Targa Motors"
              src={contact.mapsEmbed}
              className="min-h-[240px] w-full flex-1 rounded-[20px] border border-white/10"
              loading="lazy"
            />
          </div>
        </div>
      </section>

      {team.length > 0 && (
        <section className="mx-auto grid max-w-[1280px] gap-4 px-5 pb-12 md:grid-cols-3">
          {team.map((person) => (
            <article key={person.name} className="rounded-[24px] border border-white/10 p-5">
              <h2 className="font-display text-2xl">{person.name}</h2>
              <p className="text-sm text-steel">{person.role}</p>
            </article>
          ))}
        </section>
      )}
      {testimonials.length > 0 && (
        <section className="mx-auto grid max-w-[1280px] gap-4 px-5 pb-20 md:grid-cols-3">
          {testimonials.map((item) => (
            <blockquote key={item.name} className="rounded-[24px] border border-white/10 p-5">
              <p>{item.text}</p>
              <footer className="mt-3 text-sm text-steel">{item.name}{item.source ? ` · ${item.source}` : ""}</footer>
            </blockquote>
          ))}
        </section>
      )}
    </PageShell>
  )
}
