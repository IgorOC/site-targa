"use client"

import dynamic from "next/dynamic"
import { useCallback, useEffect, useRef, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowRight, ChevronDown, MessageCircle } from "lucide-react"
import { useContent } from "@/components/providers"
import { CAR_BOX, PHOTO, heroFrame, type HeroFrame } from "@/components/home/hero-frame"
import { waLink } from "@/lib/format"
import { track } from "@/lib/track"

const HeroAssembly = dynamic(() => import("@/components/home/hero-assembly").then((mod) => mod.HeroAssembly), { ssr: false })

// Foto de exemplo do 911 Targa (trocar pela foto definitiva da Targa, com direito de uso):
// o fundo sem o carro, a sombra do carro no chão e o recorte que vira o mosaico 3D
const HERO_BACKGROUND = "/hero/targa-fundo.jpg"
const HERO_SHADOW = "/hero/targa-sombra.png"
const HERO_CAR = "/hero/porsche-911-targa-vermelho-recorte.png"

const pct = (value: number, total: number) => `${(value / total) * 100}%`

export function Hero({ total }: { total: number }) {
  const { hero, contact } = useContent()
  const [frame, setFrame] = useState<HeroFrame | null>(null)
  // Carro parado só como plano B, se o 3D (WebGL) não carregar a tempo
  const [ready, setReady] = useState(false)
  const [fallback, setFallback] = useState(false)
  const onReady = useCallback(() => setReady(true), [])
  const stage = useRef<HTMLElement>(null)
  const pinned = useRef<HTMLDivElement>(null)
  const shadow = useRef<HTMLDivElement>(null)
  const hint = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const timer = window.setTimeout(() => setFallback(true), 4000)
    const onResize = () => {
      if (pinned.current) setFrame(heroFrame(pinned.current.clientWidth, pinned.current.clientHeight))
    }
    // A sombra no chão acompanha o fim da montagem; o aviso "role para montar" some ao rolar
    const onScroll = () => {
      const section = stage.current
      if (!section) return
      const rect = section.getBoundingClientRect()
      const progress = Math.min(1, Math.max(0, -rect.top / Math.max(1, rect.height - window.innerHeight) / 0.85))
      if (shadow.current) shadow.current.style.opacity = String(Math.max(0, (progress - 0.6) / 0.4))
      if (hint.current) hint.current.style.opacity = progress > 0.03 ? "0" : "1"
    }
    onResize()
    onScroll()
    window.addEventListener("resize", onResize)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => {
      window.clearTimeout(timer)
      window.removeEventListener("resize", onResize)
      window.removeEventListener("scroll", onScroll)
    }
  }, [])

  return (
    // O hero fica preso na tela por mais uma altura de tela: é essa rolagem que monta o carro
    <section ref={stage} className="relative h-[200svh]">
      <div ref={pinned} className="sticky top-0 isolate flex h-[100svh] min-h-[640px] items-start overflow-hidden pt-28 md:pt-36">
        <div className="absolute inset-0 -z-10 bg-obsidian">
          {frame && (
            <div
              className="hero-plate hero-in absolute"
              style={{ left: frame.left, top: frame.top, width: PHOTO.width * frame.scale, height: PHOTO.height * frame.scale }}
            >
              <Image src={HERO_BACKGROUND} alt="" fill priority sizes="(min-width: 1024px) 90vw, 100vw" className="object-cover" />
              <div ref={shadow} className="absolute inset-0 opacity-0 transition-opacity duration-300">
                <Image src={HERO_SHADOW} alt="" fill sizes="(min-width: 1024px) 90vw, 100vw" />
              </div>
              <div
                className={`absolute transition-opacity duration-500 ${fallback && !ready ? "opacity-100" : "opacity-0"}`}
                style={{ left: pct(CAR_BOX.x, PHOTO.width), top: pct(CAR_BOX.y, PHOTO.height), width: pct(CAR_BOX.width, PHOTO.width), height: pct(CAR_BOX.height, PHOTO.height) }}
              >
                <Image src={HERO_CAR} alt="Porsche 911 Targa vermelho, visto de lado, com o teto Targa aberto" fill sizes="(min-width: 1024px) 60vw, 100vw" />
              </div>
            </div>
          )}
          <HeroAssembly src={HERO_CAR} track={stage} onReady={onReady} />
          {/* Escurece o alto da foto para o texto branco ler bem */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-2/3 bg-gradient-to-b from-obsidian/80 to-transparent" />
        </div>

        <div className="mx-auto w-full max-w-[1280px] px-5">
          <div className="hero-in">
            <p className="text-[11px] uppercase tracking-[0.28em] text-porcelain/70">{hero.kicker}</p>
            <h1 className="mt-4 max-w-2xl font-display text-[clamp(2.4rem,4.6vw,4.6rem)] font-semibold leading-[0.95] tracking-[-0.045em]">
              {hero.lines[0]}
            </h1>
            <p className="mt-5 max-w-lg text-base text-porcelain/80 md:text-lg">{hero.sub}</p>
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

        <div ref={hint} className="pointer-events-none absolute bottom-6 left-1/2 flex -translate-x-1/2 items-center gap-2 text-[11px] uppercase tracking-[0.28em] text-porcelain/70 transition-opacity duration-500">
          Role para montar <ChevronDown size={14} className="animate-bounce" />
        </div>
      </div>
    </section>
  )
}
