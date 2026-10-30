"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { scrollBus } from "@/lib/scroll-bus"

const HOLD = 2000
const FADE = 550

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
  const pathname = usePathname()
  const [track, setTrack] = useState(pathname)
  const [phase, setPhase] = useState<"show" | "leave" | "gone">("show")

  if (track !== pathname) {
    setTrack(pathname)
    setPhase("show")
  }

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const hold = reduce ? 280 : HOLD
    const fade = reduce ? 0 : FADE
    lockPage()
    const leaveAt = window.setTimeout(() => {
      setPhase("leave")
      window.dispatchEvent(new Event("targa-intro-done"))
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
  }, [pathname])

  if (phase === "gone") return null

  return (
    <div
      className={`fixed inset-0 z-[80] flex flex-col items-center justify-center gap-6 bg-obsidian px-6 text-center transition-opacity duration-500 ease-out ${phase === "leave" ? "pointer-events-none opacity-0" : "opacity-100"}`}
      role="status"
      aria-live="polite"
      aria-label="Abrindo a Targa Motors"
    >
      <Image src="/brand/logo.png" alt="" width={340} height={90} priority className="hero-logo h-auto w-[min(64vw,340px)]" />
      <p className="hero-logo-sub text-[11px] uppercase tracking-[0.36em] text-porcelain/60">Seminovos premium · Uberlândia</p>
    </div>
  )
}
