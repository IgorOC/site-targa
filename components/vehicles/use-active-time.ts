"use client"

import { useEffect } from "react"
import { track } from "@/lib/track"

// Tempo ativo na página do veículo: só conta com a aba visível, a janela em foco e alguma ação do
// visitante (mouse, toque, rolagem, tecla) nos últimos 60 s. Envia o acumulado a cada 15 s e ao sair,
// em pedaços (meta.ms): se o navegador fechar de repente, perde no máximo os últimos 15 s.
// É uma estimativa de atividade, não prova de atenção.
const IDLE_MS = 60_000
const FLUSH_MS = 15_000
const MIN_MS = 1_000

export function useActiveTime(vehicleSlug: string) {
  useEffect(() => {
    let pending = 0
    let lastTick = Date.now()
    let lastInput = Date.now()

    const isActive = () => document.visibilityState === "visible" && document.hasFocus() && Date.now() - lastInput < IDLE_MS

    // soma o tempo desde a última marcação, se a página estava ativa
    const tick = () => {
      const now = Date.now()
      if (isActive()) pending += now - lastTick
      lastTick = now
    }

    const flush = () => {
      tick()
      if (pending < MIN_MS) return
      const ms = Math.round(pending)
      pending = 0
      track({ type: "vehicle_active_time", vehicleSlug, meta: { ms } })
    }

    const onInput = () => {
      tick()
      lastInput = Date.now()
    }
    const onVisibility = () => (document.visibilityState === "hidden" ? flush() : tick())

    const inputs = ["pointermove", "pointerdown", "keydown", "scroll", "touchstart"] as const
    inputs.forEach((name) => window.addEventListener(name, onInput, { passive: true }))
    window.addEventListener("focus", tick)
    window.addEventListener("blur", tick)
    document.addEventListener("visibilitychange", onVisibility)
    window.addEventListener("pagehide", flush)
    const timer = window.setInterval(flush, FLUSH_MS)

    return () => {
      // troca de página no próprio site (navegação do Next): envia o que sobrou deste veículo
      flush()
      window.clearInterval(timer)
      inputs.forEach((name) => window.removeEventListener(name, onInput))
      window.removeEventListener("focus", tick)
      window.removeEventListener("blur", tick)
      document.removeEventListener("visibilitychange", onVisibility)
      window.removeEventListener("pagehide", flush)
    }
  }, [vehicleSlug])
}
