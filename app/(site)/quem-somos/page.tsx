import type { Metadata } from "next"
import { PageShell } from "@/components/layout/chrome"
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
      <div className="mx-auto max-w-3xl space-y-4 px-5 pb-10 text-porcelain/90">
        {about.body.split("\n").filter(Boolean).map((paragraph) => (
          <p key={paragraph.slice(0, 24)}>{paragraph}</p>
        ))}
      </div>
      {team.length > 0 && (
        <section className="mx-auto grid max-w-[1100px] gap-4 px-5 pb-12 md:grid-cols-3">
          {team.map((person) => (
            <article key={person.name} className="rounded-[24px] border border-white/10 p-5">
              <h2 className="font-display text-2xl">{person.name}</h2>
              <p className="text-sm text-steel">{person.role}</p>
            </article>
          ))}
        </section>
      )}
      {testimonials.length > 0 && (
        <section className="mx-auto grid max-w-[1100px] gap-4 px-5 pb-12 md:grid-cols-3">
          {testimonials.map((item) => (
            <blockquote key={item.name} className="rounded-[24px] border border-white/10 p-5">
              <p>{item.text}</p>
              <footer className="mt-3 text-sm text-steel">{item.name}{item.source ? ` · ${item.source}` : ""}</footer>
            </blockquote>
          ))}
        </section>
      )}
      <section className="mx-auto max-w-[1100px] px-5 pb-20">
        <iframe title="Mapa da Targa Motors" src={contact.mapsEmbed} className="h-[380px] w-full rounded-[24px] border border-white/10 grayscale" loading="lazy" />
      </section>
    </PageShell>
  )
}
