"use client"

import { useState } from "react"
import { saveContent } from "@/lib/actions"
import type { Content } from "@/lib/types"

const field = "mt-1 w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm"

export function ContentEditor({ content }: { content: Content }) {
  const [note, setNote] = useState("")
  async function save(section: keyof Content, data: unknown) {
    const response = await saveContent(section, JSON.stringify(data))
    setNote(response.ok ? "Salvo." : response.error)
  }
  return (
    <div className="space-y-8">
      {note && <p className="text-sm text-[#8a6a32]">{note}</p>}
      <HeroBlock content={content} onSave={save} />
      <AboutBlock content={content} onSave={save} />
      <ContactBlock content={content} onSave={save} />
      <ListBlock title="Perguntas frequentes" items={content.faqs} blank={{ q: "", a: "" }} fields={["q", "a"]} labels={["Pergunta", "Resposta"]} onSave={(items) => save("faqs", items)} />
      <ListBlock title="Depoimentos" items={content.testimonials} blank={{ name: "", text: "", source: "" }} fields={["name", "text", "source"]} labels={["Nome", "Texto", "Origem"]} onSave={(items) => save("testimonials", items)} />
      <ListBlock title="Equipe" items={content.team} blank={{ name: "", role: "", photo: "" }} fields={["name", "role", "photo"]} labels={["Nome", "Função", "Foto (URL)"]} onSave={(items) => save("team", items)} />
      <ListBlock title="Avisos" items={content.banners} blank={{ id: crypto.randomUUID(), text: "", href: "", start: "", end: "", active: true }} fields={["text", "href", "start", "end"]} labels={["Texto", "Link", "Início", "Fim"]} onSave={(items) => save("banners", items)} />
      <PrivacyBlock content={content} onSave={save} />
      <RankingBlock content={content} onSave={save} />
    </div>
  )
}

function HeroBlock({ content, onSave }: { content: Content; onSave: (section: keyof Content, data: unknown) => void }) {
  const [hero, setHero] = useState(content.hero)
  return (
    <section className="rounded-2xl bg-white p-5">
      <h2 className="font-display text-2xl">Hero</h2>
      <label className="mt-3 block text-xs uppercase tracking-[0.12em]">Linha de apoio<input value={hero.kicker} onChange={(event) => setHero({ ...hero, kicker: event.target.value })} className={field} /></label>
      {hero.lines.map((line, index) => (
        <label key={index} className="mt-3 block text-xs uppercase tracking-[0.12em]">
          Frase {index + 1}
          <input value={line} onChange={(event) => {
            const lines = [...hero.lines] as [string, string, string]
            lines[index] = event.target.value
            setHero({ ...hero, lines })
          }} className={field} />
        </label>
      ))}
      <label className="mt-3 block text-xs uppercase tracking-[0.12em]">Subtítulo<input value={hero.sub} onChange={(event) => setHero({ ...hero, sub: event.target.value })} className={field} /></label>
      <button type="button" className="mt-4 rounded-xl bg-[#17181b] px-4 py-2 text-sm text-white" onClick={() => onSave("hero", hero)}>Salvar hero</button>
    </section>
  )
}

function AboutBlock({ content, onSave }: { content: Content; onSave: (section: keyof Content, data: unknown) => void }) {
  const [about, setAbout] = useState(content.about)
  return (
    <section className="rounded-2xl bg-white p-5">
      <h2 className="font-display text-2xl">Quem somos</h2>
      <label className="mt-3 block text-xs uppercase tracking-[0.12em]">Título<input value={about.title} onChange={(event) => setAbout({ ...about, title: event.target.value })} className={field} /></label>
      <label className="mt-3 block text-xs uppercase tracking-[0.12em]">Frase<input value={about.lead} onChange={(event) => setAbout({ ...about, lead: event.target.value })} className={field} /></label>
      <label className="mt-3 block text-xs uppercase tracking-[0.12em]">Texto<textarea value={about.body} onChange={(event) => setAbout({ ...about, body: event.target.value })} className={`${field} min-h-40`} /></label>
      <button type="button" className="mt-4 rounded-xl bg-[#17181b] px-4 py-2 text-sm text-white" onClick={() => onSave("about", about)}>Salvar quem somos</button>
    </section>
  )
}

function ContactBlock({ content, onSave }: { content: Content; onSave: (section: keyof Content, data: unknown) => void }) {
  const [contact, setContact] = useState(content.contact)
  const keys = Object.keys(contact) as (keyof Content["contact"])[]
  return (
    <section className="rounded-2xl bg-white p-5">
      <h2 className="font-display text-2xl">Contato</h2>
      <div className="mt-3 grid gap-3 md:grid-cols-2">
        {keys.map((key) => (
          <label key={key} className="text-xs uppercase tracking-[0.12em]">
            {key}
            <input value={contact[key]} onChange={(event) => setContact({ ...contact, [key]: event.target.value })} className={field} />
          </label>
        ))}
      </div>
      <button type="button" className="mt-4 rounded-xl bg-[#17181b] px-4 py-2 text-sm text-white" onClick={() => onSave("contact", contact)}>Salvar contato</button>
    </section>
  )
}

function PrivacyBlock({ content, onSave }: { content: Content; onSave: (section: keyof Content, data: unknown) => void }) {
  const [privacy, setPrivacy] = useState(content.privacy)
  return (
    <section className="rounded-2xl bg-white p-5">
      <h2 className="font-display text-2xl">Privacidade</h2>
      <label className="mt-3 block text-xs uppercase tracking-[0.12em]">Atualização<input type="date" value={privacy.updatedAt} onChange={(event) => setPrivacy({ ...privacy, updatedAt: event.target.value })} className={field} /></label>
      <textarea value={privacy.text} onChange={(event) => setPrivacy({ ...privacy, text: event.target.value })} className={`${field} min-h-48`} />
      <button type="button" className="mt-4 rounded-xl bg-[#17181b] px-4 py-2 text-sm text-white" onClick={() => onSave("privacy", privacy)}>Salvar política</button>
    </section>
  )
}

function RankingBlock({ content, onSave }: { content: Content; onSave: (section: keyof Content, data: unknown) => void }) {
  const [ranking, setRanking] = useState(content.ranking)
  return (
    <section className="rounded-2xl bg-white p-5">
      <h2 className="font-display text-2xl">Regras do ranking</h2>
      <div className="mt-3 grid gap-3 md:grid-cols-3">
        <label className="text-xs uppercase tracking-[0.12em]">Dias para alerta<input type="number" value={ranking.coldDays} onChange={(event) => setRanking({ ...ranking, coldDays: Number(event.target.value) })} className={field} /></label>
        <label className="text-xs uppercase tracking-[0.12em]">Faixa quente<input type="number" step="0.05" value={ranking.hotShare} onChange={(event) => setRanking({ ...ranking, hotShare: Number(event.target.value) })} className={field} /></label>
        <label className="text-xs uppercase tracking-[0.12em]">Faixa fria<input type="number" step="0.05" value={ranking.coldShare} onChange={(event) => setRanking({ ...ranking, coldShare: Number(event.target.value) })} className={field} /></label>
      </div>
      <button type="button" className="mt-4 rounded-xl bg-[#17181b] px-4 py-2 text-sm text-white" onClick={() => onSave("ranking", ranking)}>Salvar regras</button>
    </section>
  )
}

function ListBlock<T extends Record<string, unknown>>({
  title,
  items,
  blank,
  fields,
  labels,
  onSave,
}: {
  title: string
  items: T[]
  blank: T
  fields: string[]
  labels: string[]
  onSave: (items: T[]) => void
}) {
  const [rows, setRows] = useState(items)
  return (
    <section className="rounded-2xl bg-white p-5">
      <h2 className="font-display text-2xl">{title}</h2>
      <div className="mt-3 space-y-4">
        {rows.map((row, index) => (
          <div key={index} className="grid gap-2 rounded-xl border border-black/10 p-3 md:grid-cols-2">
            {fields.map((key, fieldIndex) => (
              <label key={key} className="text-xs uppercase tracking-[0.12em]">
                {labels[fieldIndex]}
                {key === "text" || key === "a" ? (
                  <textarea value={String(row[key] ?? "")} onChange={(event) => setRows((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, [key]: event.target.value } : item))} className={`${field} min-h-20`} />
                ) : (
                  <input value={String(row[key] ?? "")} onChange={(event) => setRows((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, [key]: event.target.value } : item))} className={field} />
                )}
              </label>
            ))}
            <button type="button" className="text-left text-sm text-[#d7263d]" onClick={() => setRows((current) => current.filter((_, itemIndex) => itemIndex !== index))}>Remover</button>
          </div>
        ))}
      </div>
      <div className="mt-4 flex gap-3">
        <button type="button" className="rounded-xl border border-black/10 px-4 py-2 text-sm" onClick={() => setRows((current) => [...current, structuredClone(blank)])}>Adicionar</button>
        <button type="button" className="rounded-xl bg-[#17181b] px-4 py-2 text-sm text-white" onClick={() => onSave(rows)}>Salvar</button>
      </div>
    </section>
  )
}
