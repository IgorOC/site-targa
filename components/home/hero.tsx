"use client"

import { useEffect, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowRight, ChevronDown, MessageCircle } from "lucide-react"
import { useContent } from "@/components/providers"
import { waLink } from "@/lib/format"
import { track } from "@/lib/track"

// Hero: ao entrar, só a logo da Targa no preto. Conforme a rolagem avança, a foto do 911 Targa se
// revela a partir do centro (uma janela que se abre, com leve zoom) e, no fim, entram o texto, o
// cabeçalho e o botão de WhatsApp. Foto: confirmar o direito de uso antes de publicar.

const HERO_PHOTO = "/hero/targa-cafe.jpg"
const clamp = (value: number) => Math.min(1, Math.max(0, value))
const ease = (value: number) => 1 - Math.pow(1 - value, 3)

export function Hero({ total }: { total: number }) {
  const { hero, contact } = useContent()
  const section = useRef<HTMLElement>(null)
  const pin = useRef<HTMLDivElement>(null)
  const photo = useRef<HTMLDivElement>(null)
  const zoom = useRef<HTMLDivElement>(null)
  const brand = useRef<HTMLDivElement>(null)
  const shade = useRef<HTMLDivElement>(null)
  const copy = useRef<HTMLDivElement>(null)
  const bar = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const root = document.documentElement
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    let frame = 0

    const draw = () => {
      const el = section.current
      const view = pin.current
      if (!el || !view) return
      const rect = el.getBoundingClientRect()
      const progress = reduce ? 1 : clamp(-rect.top / Math.max(1, el.offsetHeight - window.innerHeight))
      const width = view.clientWidth
      const height = view.clientHeight
      // A janela abre a partir da altura do carro na tela (--car-y, em % da altura)
      const carY = parseFloat(getComputedStyle(view).getPropertyValue("--car-y")) || 70
      const centerY = (carY / 100) * height

      // A janela abre entre 5% e 65% da rolagem
      const open = ease(clamp((progress - 0.05) / 0.6))
      const closed = 1 - open
      if (photo.current) {
        photo.current.style.clipPath = `inset(${centerY * closed}px ${(width / 2) * closed}px ${(height - centerY) * closed}px ${(width / 2) * closed}px round ${28 * closed}px)`
      }
      if (zoom.current) zoom.current.style.transform = `scale(${1 + 0.18 * closed})`

      // A logo sobe um pouco, encolhe e some enquanto a foto aparece
      const leave = ease(clamp(progress / 0.35))
      if (brand.current) {
        brand.current.style.opacity = String(1 - leave)
        brand.current.style.transform = `translateY(${-40 * leave}px) scale(${1 - 0.12 * leave})`
      }

      const shown = clamp((progress - 0.62) / 0.2)
      if (shade.current) shade.current.style.opacity = String(shown)
      if (copy.current) {
        copy.current.style.opacity = String(shown)
        copy.current.style.transform = `translateY(${(1 - shown) * 24}px)`
        copy.current.style.pointerEvents = shown > 0.5 ? "auto" : "none"
      }
      if (bar.current) bar.current.style.width = `${progress * 100}%`
      // Cabeçalho e WhatsApp só entram quando a foto está aberta
      root.dataset.hero = progress > 0.7 ? "done" : "intro"
    }

    const schedule = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(draw)
    }

    draw()
    window.addEventListener("scroll", schedule, { passive: true })
    window.addEventListener("resize", schedule)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener("scroll", schedule)
      window.removeEventListener("resize", schedule)
      delete root.dataset.hero
    }
  }, [])

  return (
    // O hero fica preso na tela por mais uma vez e meia a altura da tela: é essa rolagem que revela a foto
    <section ref={section} className="relative h-[250svh]">
      <div ref={pin} className="hero-pin sticky top-0 h-[100svh] min-h-[600px] overflow-hidden bg-obsidian">
        <div ref={photo} className="absolute inset-0" style={{ clipPath: "inset(50% 50% 50% 50%)" }}>
          <div ref={zoom} className="hero-photo">
            <Image src={HERO_PHOTO} alt="Porsche 911 Targa cinza estacionado em frente a um café" fill priority sizes="max(100vw, 480px)" className="object-cover" />
          </div>
          {/* Escurece o alto e a base da foto: texto legível e transição para o preto da página */}
          <div
            ref={shade}
            className="pointer-events-none absolute inset-0 opacity-0 bg-[linear-gradient(180deg,rgba(10,10,10,0.9)_0%,rgba(10,10,10,0.2)_42%,rgba(10,10,10,0)_62%,rgba(10,10,10,0.95)_100%)]"
          />
        </div>

        {/* Entrada: só a logo */}
        <div ref={brand} className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-6 px-6 text-center">
          <Image src="/brand/logo.png" alt="Targa Motors" width={340} height={90} priority className="hero-logo h-auto w-[min(64vw,340px)]" />
          <p className="hero-logo-sub text-[11px] uppercase tracking-[0.36em] text-porcelain/60">Seminovos premium · Uberlândia</p>
          <p className="absolute bottom-12 flex items-center gap-2 text-[11px] uppercase tracking-[0.28em] text-porcelain/70">
            Role para descobrir <ChevronDown size={14} className="animate-bounce" />
          </p>
        </div>

        {/* Fim: o texto entra com a foto aberta */}
        <div ref={copy} className="pointer-events-none absolute inset-x-0 top-0 pt-28 opacity-0 md:pt-32">
          <div className="mx-auto w-full max-w-[1280px] px-5">
            <p className="text-[11px] uppercase tracking-[0.28em] text-porcelain/70">{hero.kicker}</p>
            <h1 className="mt-4 max-w-2xl font-display text-[clamp(2.4rem,min(4.6vw,9svh),4.6rem)] font-semibold leading-[0.95] tracking-[-0.045em]">
              {hero.lines[0]}
            </h1>
            <p className="hero-sub mt-5 max-w-lg text-base text-porcelain/80 md:text-lg">{hero.sub}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/estoque" className="inline-flex items-center gap-2 rounded-[22px] bg-accent px-6 py-3 text-sm font-medium text-obsidian">
                Ver estoque ({total}) <ArrowRight size={16} />
              </Link>
              <a
                href={waLink(contact.whatsappTel, "Olá! Vim pelo site da Targa Motors e quero conhecer o estoque.")}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-[22px] border border-white/25 bg-obsidian/30 px-6 py-3 text-sm backdrop-blur-sm"
                onClick={() => track({ type: "whatsapp", explicit: true })}
              >
                <MessageCircle size={16} /> Falar no WhatsApp
              </a>
            </div>
          </div>
        </div>

        <div className="pointer-events-none absolute inset-x-5 bottom-5 h-px bg-white/10 md:inset-x-10">
          <span ref={bar} className="block h-full w-0 bg-white/80" />
        </div>
      </div>
    </section>
  )
}
