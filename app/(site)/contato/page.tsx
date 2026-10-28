import type { Metadata } from "next"
import { PageShell } from "@/components/layout/chrome"
import { ContactForm } from "@/components/forms/lead-forms"
import { getDb } from "@/lib/store"

export const metadata: Metadata = {
  title: "Contato",
  alternates: { canonical: "/contato" },
  description: "Telefones, WhatsApp, endereço (Rua das Papoulas, 60, Cidade Jardim) e horário da Targa Motors, loja de seminovos premium em Uberlândia-MG.",
}

export default async function ContactPage() {
  const { contact } = (await getDb()).content
  return (
    <PageShell title="Contato" lede="O caminho mais curto é o WhatsApp. Telefone e formulário também chegam na loja.">
      <div className="mx-auto grid max-w-[1100px] gap-10 px-5 pb-20 md:grid-cols-2">
        <div>
          <p className="text-2xl">{contact.hoursWeek}</p>
          <p className="text-2xl text-accent">{contact.hoursSat}</p>
          <p className="mt-6 text-steel">{contact.street}<br />{contact.area}</p>
          <div className="mt-6 flex flex-col gap-2 text-lg">
            <a href={`tel:+${contact.phone1Tel}`}>{contact.phone1}</a>
            <a href={`tel:+${contact.phone2Tel}`}>{contact.phone2}</a>
            <a href={`https://wa.me/${contact.whatsappTel}`} target="_blank" rel="noreferrer">WhatsApp {contact.whatsapp}</a>
            {contact.email && <a href={`mailto:${contact.email}`}>{contact.email}</a>}
            {contact.instagram && <a href={contact.instagram} target="_blank" rel="noreferrer">Instagram</a>}
          </div>
          <a href={contact.mapsUrl} className="mt-6 inline-flex text-sm text-accent" target="_blank" rel="noreferrer">Abrir no mapa</a>
        </div>
        <ContactForm />
      </div>
    </PageShell>
  )
}
