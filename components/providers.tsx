"use client"

import { createContext, useCallback, useContext, useEffect, useMemo, useState, useSyncExternalStore } from "react"
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

// Preferências guardadas no navegador (comparação, favoritos, consentimento). São lidas como uma fonte
// externa: o servidor renderiza com os valores padrão e o navegador assume os salvos ao hidratar.
const COMPARE_KEY = "targa-compare"
const FAVS_KEY = "targa-favs"
const CONSENT_KEY = "targa-consent"
const storageListeners = new Set<() => void>()

function subscribeStorage(listener: () => void) {
  storageListeners.add(listener)
  window.addEventListener("storage", listener)
  return () => {
    storageListeners.delete(listener)
    window.removeEventListener("storage", listener)
  }
}

function readStorage(key: string) {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

function writeStorage(key: string, value: string) {
  try {
    localStorage.setItem(key, value)
  } catch {
    // Navegação privada ou armazenamento bloqueado: segue sem guardar
  }
  storageListeners.forEach((listener) => listener())
}

function parseList<T>(raw: string | null): T[] {
  try {
    const value = JSON.parse(raw || "[]")
    return Array.isArray(value) ? value : []
  } catch {
    return []
  }
}

function useStored(key: string) {
  return useSyncExternalStore(subscribeStorage, () => readStorage(key), () => null)
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
  const compareRaw = useStored(COMPARE_KEY)
  const favsRaw = useStored(FAVS_KEY)
  const consentRaw = useStored(CONSENT_KEY)
  const compare = useMemo(() => parseList<CompareItem>(compareRaw), [compareRaw])
  const favs = useMemo(() => parseList<string>(favsRaw), [favsRaw])
  const consent: Consent = consentRaw === "essential" || consentRaw === "all" ? consentRaw : "unknown"
  // Falso no servidor e na hidratação; verdadeiro assim que o navegador assume os dados salvos
  const ready = useSyncExternalStore(subscribeStorage, () => true, () => false)
  const [toast, setToast] = useState("")
  const [interest, setInterestState] = useState<Interest>(null)

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
    const current = parseList<CompareItem>(readStorage(COMPARE_KEY))
    const exists = current.some((entry) => entry.slug === item.slug)
    if (!exists && current.length >= 3) {
      setToast("Você pode comparar até 3 carros.")
      window.setTimeout(() => setToast(""), 2400)
      return
    }
    const next = exists ? current.filter((entry) => entry.slug !== item.slug) : [...current, item]
    writeStorage(COMPARE_KEY, JSON.stringify(next))
    if (!exists) track({ type: "compare", vehicleSlug: item.slug })
  }, [])

  const toggleFav = useCallback((slug: string) => {
    const current = parseList<string>(readStorage(FAVS_KEY))
    const exists = current.includes(slug)
    writeStorage(FAVS_KEY, JSON.stringify(exists ? current.filter((item) => item !== slug) : [...current, slug]))
    if (!exists) track({ type: "favorite", vehicleSlug: slug })
  }, [])

  const clearCompare = useCallback(() => writeStorage(COMPARE_KEY, "[]"), [])

  const setConsent = useCallback((value: Exclude<Consent, "unknown">) => writeStorage(CONSENT_KEY, value), [])

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
