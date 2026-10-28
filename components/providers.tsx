"use client"

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"
import { usePathname } from "next/navigation"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import Lenis from "lenis"
import "lenis/dist/lenis.css"
import { scrollBus } from "@/lib/scroll-bus"
import { track } from "@/lib/track"
import type { Content } from "@/lib/types"

type CompareItem = { slug: string; label: string }
type Interest = { slug: string; label: string; ref: string } | null
type Consent = "unknown" | "essential" | "all"

type SiteState = {
  compare: CompareItem[]
  favs: string[]
  toast: string
  interest: Interest
  consent: Consent
  ready: boolean
  toggleCompare: (item: CompareItem) => void
  toggleFav: (slug: string) => void
  clearCompare: () => void
  setInterest: (value: Interest) => void
  setConsent: (value: Exclude<Consent, "unknown">) => void
}

const ContentContext = createContext<Content | null>(null)
const SiteContext = createContext<SiteState | null>(null)

export function useContent() {
  const value = useContext(ContentContext)
  if (!value) throw new Error("Conteúdo indisponível")
  return value
}

export function useSite() {
  const value = useContext(SiteContext)
  if (!value) throw new Error("Estado indisponível")
  return value
}

export function Providers({ content, children }: { content: Content; children: React.ReactNode }) {
  const pathname = usePathname()
  const [compare, setCompare] = useState<CompareItem[]>([])
  const [favs, setFavs] = useState<string[]>([])
  const [toast, setToast] = useState("")
  const [interest, setInterestState] = useState<Interest>(null)
  const [consent, setConsentState] = useState<Consent>("unknown")
  const [ready, setReady] = useState(false)

  useEffect(() => {
    try {
      setCompare(JSON.parse(localStorage.getItem("targa-compare") || "[]"))
      setFavs(JSON.parse(localStorage.getItem("targa-favs") || "[]"))
      const saved = localStorage.getItem("targa-consent")
      if (saved === "essential" || saved === "all") setConsentState(saved)
    } catch {
      setCompare([])
      setFavs([])
    }
    setReady(true)
  }, [])

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (reduce) return
    const lenis = new Lenis({ lerp: 0.085 })
    scrollBus.lenis = lenis
    lenis.on("scroll", ScrollTrigger.update)
    const tick = (time: number) => lenis.raf(time * 1000)
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)
    return () => {
      gsap.ticker.remove(tick)
      lenis.destroy()
      scrollBus.lenis = null
    }
  }, [])

  useEffect(() => {
    ScrollTrigger.refresh()
  }, [pathname])

  useEffect(() => {
    if (consent !== "all") return
    track({ type: "pageview", path: pathname })
  }, [consent, pathname])

  const setInterest = useCallback((value: Interest) => setInterestState(value), [])

  const toggleCompare = useCallback((item: CompareItem) => {
    setCompare((current) => {
      const exists = current.some((entry) => entry.slug === item.slug)
      const next = exists ? current.filter((entry) => entry.slug !== item.slug) : current.length >= 3 ? current : [...current, item]
      if (!exists && current.length >= 3) {
        setToast("Você pode comparar até 3 carros.")
        window.setTimeout(() => setToast(""), 2400)
        return current
      }
      localStorage.setItem("targa-compare", JSON.stringify(next))
      if (!exists) track({ type: "compare", vehicleSlug: item.slug })
      return next
    })
  }, [])

  const toggleFav = useCallback((slug: string) => {
    setFavs((current) => {
      const next = current.includes(slug) ? current.filter((item) => item !== slug) : [...current, slug]
      localStorage.setItem("targa-favs", JSON.stringify(next))
      if (!current.includes(slug)) track({ type: "favorite", vehicleSlug: slug })
      return next
    })
  }, [])

  const clearCompare = useCallback(() => {
    setCompare([])
    localStorage.setItem("targa-compare", "[]")
  }, [])

  const setConsent = useCallback((value: Exclude<Consent, "unknown">) => {
    localStorage.setItem("targa-consent", value)
    setConsentState(value)
  }, [])

  const state = useMemo<SiteState>(
    () => ({ compare, favs, toast, interest, consent, ready, toggleCompare, toggleFav, clearCompare, setInterest, setConsent }),
    [compare, favs, toast, interest, consent, ready, toggleCompare, toggleFav, clearCompare, setInterest, setConsent],
  )

  return (
    <ContentContext.Provider value={content}>
      <SiteContext.Provider value={state}>{children}</SiteContext.Provider>
    </ContentContext.Provider>
  )
}
