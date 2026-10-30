"use client"

import Image from "next/image"
import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { Menu, Phone, X } from "lucide-react"
import { useContent } from "@/components/providers"
import { track } from "@/lib/track"
import { waLink } from "@/lib/format"

const links = [
  { href: "/", label: "Home" },
  { href: "/estoque", label: "Estoque" },
  { href: "/venda", label: "Venda seu Veículo" },
  { href: "/financiamento", label: "Financiamento" },
  { href: "/quem-somos", label: "Quem Somos" },
  { href: "/contato", label: "Contato" },
]

export function Header() {
  const { contact } = useContent()
  const [open, setOpen] = useState(false)
  const [phones, setPhones] = useState(false)
  const phonesRef = useRef<HTMLDivElement>(null)

  // Fecha o menu de telefones ao clicar fora, ao apertar Esc ou ao rolar a página
  useEffect(() => {
    if (!phones) return
    const outside = (event: PointerEvent) => {
      if (!phonesRef.current?.contains(event.target as Node)) setPhones(false)
    }
    const close = () => setPhones(false)
    const key = (event: KeyboardEvent) => {
      if (event.key === "Escape") setPhones(false)
    }
    document.addEventListener("pointerdown", outside)
    document.addEventListener("keydown", key)
    window.addEventListener("scroll", close, { passive: true })
    return () => {
      document.removeEventListener("pointerdown", outside)
      document.removeEventListener("keydown", key)
      window.removeEventListener("scroll", close)
    }
  }, [phones])

  return (
    <header className="site-header fixed inset-x-0 top-0 z-40 px-3 sm:px-4 md:px-5">
      <div className="glass mx-auto mt-3 flex max-w-[1280px] items-center justify-between gap-4 rounded-[24px] px-4 py-3 md:px-6">
        <Link href="/" aria-label="Targa Motors" className="shrink-0">
          <Image src="/brand/logo.png" alt="Targa Motors" width={128} height={34} priority className="h-8 w-auto" />
        </Link>
        <nav className="hidden items-center gap-4 whitespace-nowrap text-sm text-porcelain/90 lg:flex" aria-label="Principal">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-white/60">
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <div ref={phonesRef} className="relative hidden lg:block" onMouseLeave={() => setPhones(false)}>
            <button
              className="inline-flex items-center gap-2 rounded-[22px] border border-white/15 px-3 py-2 text-sm"
              aria-expanded={phones}
              onClick={() => setPhones((value) => !value)}
            >
              <Phone size={16} /> Telefones
            </button>
            {phones && (
              <div className="glass absolute right-0 top-full w-64 rounded-[22px] p-3 text-sm" onClick={() => setPhones(false)}>
                <a className="block rounded-xl px-3 py-2 hover:bg-white/5" href={`tel:+${contact.phone1Tel}`} onClick={() => track({ type: "phone", explicit: true })}>
                  {contact.phone1}
                </a>
                <a className="block rounded-xl px-3 py-2 hover:bg-white/5" href={`tel:+${contact.phone2Tel}`} onClick={() => track({ type: "phone", explicit: true })}>
                  {contact.phone2}
                </a>
                <a
                  className="block rounded-xl px-3 py-2 text-accent hover:bg-white/5"
                  href={waLink(contact.whatsappTel, "Olá, vim pelo site da Targa Motors.")}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => track({ type: "whatsapp", explicit: true })}
                >
                  WhatsApp {contact.whatsapp}
                </a>
              </div>
            )}
          </div>
          <Link href="/estoque" className="hidden shrink-0 rounded-[22px] bg-accent px-4 py-2 text-sm font-medium text-obsidian xl:inline-flex">
            Ver estoque
          </Link>
          <button className="rounded-[22px] border border-white/15 p-2 lg:hidden" aria-label={open ? "Fechar menu" : "Abrir menu"} onClick={() => setOpen((value) => !value)}>
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>
      {open && (
        <nav className="glass mx-auto mt-2 flex max-w-[1280px] flex-col rounded-[24px] p-4 lg:hidden" aria-label="Celular">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="rounded-xl px-3 py-3 hover:bg-white/5" onClick={() => setOpen(false)}>
              {link.label}
            </Link>
          ))}
          <a className="rounded-xl px-3 py-3 hover:bg-white/5" href={`tel:+${contact.phone1Tel}`} onClick={() => track({ type: "phone", explicit: true })}>
            {contact.phone1}
          </a>
          <a className="rounded-xl px-3 py-3 hover:bg-white/5" href={`tel:+${contact.phone2Tel}`} onClick={() => track({ type: "phone", explicit: true })}>
            {contact.phone2}
          </a>
          <a
            className="rounded-xl px-3 py-3 text-accent hover:bg-white/5"
            href={waLink(contact.whatsappTel, "Olá, vim pelo site da Targa Motors.")}
            target="_blank"
            rel="noreferrer"
            onClick={() => {
              track({ type: "whatsapp", explicit: true })
              setOpen(false)
            }}
          >
            WhatsApp {contact.whatsapp}
          </a>
        </nav>
      )}
    </header>
  )
}
