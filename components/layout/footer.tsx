"use client"

import Link from "next/link"
import { useContent } from "@/components/providers"
import { Camera } from "lucide-react"
import { track } from "@/lib/track"

export function Footer() {
  const { contact } = useContent()
  return (
    <footer className="border-t border-white/10 bg-graphite">
      <div className="mx-auto grid max-w-[1280px] gap-10 px-5 py-14 md:grid-cols-3">
        <div>
          <h2 className="font-display text-xl">Onde estamos</h2>
          <p className="mt-3 text-sm leading-6 text-steel">
            <a href={contact.mapsUrl} target="_blank" rel="noreferrer" className="hover:text-porcelain">{contact.street}</a>
            <br />
            {contact.area}
          </p>
          <p className="mt-4 text-sm text-porcelain">
            {contact.hoursWeek}
            <br />
            {contact.hoursSat}
          </p>
        </div>
        <div>
          <h2 className="font-display text-xl">Contato</h2>
          <div className="mt-3 flex flex-col gap-2 text-sm">
            <a href={`tel:+${contact.phone1Tel}`} onClick={() => track({ type: "phone", explicit: true })}>{contact.phone1}</a>
            <a href={`tel:+${contact.phone2Tel}`} onClick={() => track({ type: "phone", explicit: true })}>{contact.phone2}</a>
            <a href={`tel:+${contact.whatsappTel}`} onClick={() => track({ type: "phone", explicit: true })}>WhatsApp {contact.whatsapp}</a>
            {contact.instagram && (
              <a href={contact.instagram} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2">
                <Camera size={16} /> @targa__motors
              </a>
            )}
          </div>
          <Link href="/contato" className="mt-4 inline-flex rounded-[22px] bg-accent px-4 py-2 text-sm font-medium text-obsidian">
            Fale conosco
          </Link>
        </div>
        <div>
          <h2 className="font-display text-xl">Mapa do site</h2>
          <div className="mt-3 flex flex-col gap-2 text-sm text-steel">
            <Link href="/quem-somos" className="hover:text-porcelain">Quem Somos</Link>
            <Link href="/estoque" className="hover:text-porcelain">Estoque</Link>
            <Link href="/venda" className="hover:text-porcelain">Venda seu Veículo</Link>
            <Link href="/financiamento" className="hover:text-porcelain">Financiamento</Link>
            <Link href="/favoritos" className="hover:text-porcelain">Favoritos</Link>
            <Link href="/privacidade" className="hover:text-porcelain">Política de Privacidade</Link>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 px-5 py-5 text-center text-xs text-steel">
        © Targa Motors — {contact.area}
      </div>
    </footer>
  )
}
