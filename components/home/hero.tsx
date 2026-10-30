"use client"

import { useEffect, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowRight, MessageCircle } from "lucide-react"
import { useContent } from "@/components/providers"
import { waLink } from "@/lib/format"
import { track } from "@/lib/track"

// Hero: ao entrar, só a logo da Targa no preto. Quando a abertura da página (PageIntro) sai, a foto do 911
// se abre sozinha a partir do centro, sem pedir rolagem. No fim entram o texto (um item de cada vez) e o cabeçalho. Foto: confirmar o direito de uso antes de publicar.

const HERO_PHOTO = "/hero/targa-cafe.jpg"
const clamp = (value: number) => Math.min(1, Math.max(0, value))
const ease = (value: number) => 1 - Math.pow(1 - value, 3)

export function Hero({ total }: { total: number }) {
  const { hero, contact } = useContent()
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
    const progress = { value: reduce ? 1 : 0 }
    let start = -1
    const hold = 200
    const duration = 3000
    let frame = 0
    let began = false

    const draw = () => {
      const view = pin.current
      if (!view) return
      const amount = progress.value
      const width = view.clientWidth
      const height = view.clientHeight
      const carY = parseFloat(getComputedStyle(view).getPropertyValue("--car-y")) || 70
      const centerY = (carY / 100) * height

      const open = ease(clamp((amount - 0.05) / 0.6))
      const closed = 1 - open
      if (photo.current) {
        photo.current.style.clipPath = `inset(${centerY * closed}px ${(width / 2) * closed}px ${(height - centerY) * closed}px ${(width / 2) * closed}px round ${28 * closed}px)`
      }
      if (zoom.current) zoom.current.style.transform = `scale(${1 + 0.18 * closed})`

      const leave = ease(clamp(amount / 0.35))
      if (brand.current) {
        brand.current.style.opacity = String(1 - leave)
        brand.current.style.transform = `translateY(${-40 * leave}px) scale(${1 - 0.12 * leave})`
      }

      const shown = clamp((amount - 0.62) / 0.2)
      if (shade.current) shade.current.style.opacity = String(shown)
      if (copy.current) {
        copy.current.style.opacity = "1"
        copy.current.style.pointerEvents = shown > 0.5 ? "auto" : "none"
        // chamada, título, texto e botões entram em sequência
        const items = copy.current.firstElementChild?.children ?? []
        Array.from(items).forEach((item, index) => {
          const step = ease(clamp((amount - 0.6 - index * 0.07) / 0.2))
          const node = item as HTMLElement
          node.style.opacity = String(step)
          node.style.transform = `translateY(${(1 - step) * 28}px)`
        })
      }
      if (bar.current) bar.current.style.width = `${amount * 100}%`
      if (amount > 0.7) root.dataset.hero = "done"
    }

    const tick = (now: number) => {
      if (!reduce) {
        if (start < 0) start = now
        const elapsed = now - start
        progress.value = elapsed <= hold ? 0 : clamp((elapsed - hold) / duration)
      }
      draw()
      if (progress.value < 1) frame = requestAnimationFrame(tick)
    }

    const revealIfPassed = () => {
      const view = pin.current
      if (view && view.getBoundingClientRect().bottom < 64) root.dataset.hero = "done"
    }

    // a abertura só começa quando a tela de entrada some, para ser vista inteira
    const begin = () => {
      if (began) return
      began = true
      frame = requestAnimationFrame(tick)
    }
    root.dataset.hero = reduce ? "done" : "intro"
    draw()
    if (reduce) begin()
    window.addEventListener("targa-intro-done", begin)
    const fallback = window.setTimeout(begin, 2500)
    window.addEventListener("resize", draw)
    window.addEventListener("scroll", revealIfPassed, { passive: true })
    return () => {
      cancelAnimationFrame(frame)
      window.clearTimeout(fallback)
      window.removeEventListener("targa-intro-done", begin)
      window.removeEventListener("resize", draw)
      window.removeEventListener("scroll", revealIfPassed)
      delete root.dataset.hero
    }
  }, [])

  return (
    <section className="relative h-[100svh]">
      <div ref={pin} className="hero-pin relative h-full overflow-hidden bg-obsidian">
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
