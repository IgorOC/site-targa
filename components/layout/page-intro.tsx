"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { INTRO_KEY as KEY } from "@/lib/intro"
import { scrollBus } from "@/lib/scroll-bus"

// A tela com a logo aparece só na primeira página aberta na sessão (aba). Depois disso, recargas e trocas
// de página vão direto ao conteúdo: o script INTRO_SEEN_SCRIPT (layout raiz) marca <html data-intro-done>
// antes de pintar, e o CSS esconde esta tela sem piscar.
const HOLD = 1400
const FADE = 450

function finish() {
  document.documentElement.dataset.introDone = "1"
  window.dispatchEvent(new Event("targa-intro-done"))
}

function lockPage() {
  document.documentElement.dataset.intro = "on"
  document.body.style.overflow = "hidden"
  window.scrollTo(0, 0)
  scrollBus.lenis?.stop()
  scrollBus.lenis?.scrollTo(0, { immediate: true })
  document.querySelectorAll<HTMLElement>(".site-header, #conteudo, footer").forEach((node) => {
    node.setAttribute("inert", "")
  })
}

function unlockPage() {
  delete document.documentElement.dataset.intro
  document.body.style.overflow = ""
  scrollBus.lenis?.start()
  document.querySelectorAll<HTMLElement>(".site-header, #conteudo, footer").forEach((node) => {
    node.removeAttribute("inert")
  })
}

export function PageIntro() {
  const [phase, setPhase] = useState<"show" | "leave" | "gone">("show")

  useEffect(() => {
    if (document.documentElement.dataset.introDone) {
      finish()
      const skip = window.setTimeout(() => setPhase("gone"), 0)
      return () => window.clearTimeout(skip)
    }
    try {
      sessionStorage.setItem(KEY, "1")
    } catch {
      // sem sessionStorage (aba privada bloqueada): a tela volta a aparecer na próxima carga
    }
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const hold = reduce ? 280 : HOLD
    const fade = reduce ? 0 : FADE
    lockPage()
    const leaveAt = window.setTimeout(() => {
      setPhase("leave")
      finish()
    }, hold)
    const goneAt = window.setTimeout(() => {
      setPhase("gone")
      unlockPage()
    }, hold + fade)
    return () => {
      window.clearTimeout(leaveAt)
      window.clearTimeout(goneAt)
      unlockPage()
    }
  }, [])

  if (phase === "gone") return null

  return (
    <div
      className={`page-intro fixed inset-0 z-[80] flex flex-col items-center justify-center gap-6 bg-obsidian px-6 text-center transition-opacity ease-out ${phase === "leave" ? "pointer-events-none opacity-0" : "opacity-100"}`}
      style={{ transitionDuration: `${FADE}ms` }}
      role="status"
      aria-live="polite"
      aria-label="Abrindo a Targa Motors"
    >
      <Image src="/brand/logo.png" alt="" width={340} height={90} priority className="hero-logo h-auto w-[min(64vw,340px)]" />
      <p className="hero-logo-sub text-[11px] uppercase tracking-[0.36em] text-porcelain/60">Seminovos premium · Uberlândia</p>
    </div>
  )
}
