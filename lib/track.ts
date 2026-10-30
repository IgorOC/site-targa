export type TrackInput = {
  type: string
  path?: string
  vehicleSlug?: string
  meta?: Record<string, string | number>
  explicit?: boolean
}

function sessionId() {
  let id = sessionStorage.getItem("targa-sid")
  if (!id) {
    id = crypto.randomUUID()
    sessionStorage.setItem("targa-sid", id)
  }
  return id
}

// Origem da sessão (primeiro toque): referência e parâmetros UTM/gclid da página de entrada
function firstTouch() {
  const saved = sessionStorage.getItem("targa-origin")
  if (saved) return JSON.parse(saved) as { referrer: string; landing: string }
  const origin = { referrer: document.referrer || "", landing: window.location.search.slice(0, 300) }
  sessionStorage.setItem("targa-origin", JSON.stringify(origin))
  return origin
}

// Visitante anônimo por aparelho (para "voltou ao anúncio"): só existe com consentimento "todos"
function visitorId() {
  if (localStorage.getItem("targa-consent") !== "all") return ""
  let id = localStorage.getItem("targa-vid")
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem("targa-vid", id)
  }
  return id
}

// Coletor próprio (app/audiencia/route.ts). Nome neutro: bloqueadores costumam barrar "/track", "/analytics".
const ENDPOINT = "/audiencia"

export function track(event: TrackInput) {
  if (typeof window === "undefined") return
  if (!event.explicit && localStorage.getItem("targa-consent") !== "all") return
  const body = JSON.stringify({
    id: crypto.randomUUID(),
    type: event.type,
    path: event.path || window.location.pathname,
    vehicleSlug: event.vehicleSlug || "",
    meta: event.meta || {},
    sid: sessionId(),
    vid: visitorId(),
    ...firstTouch(),
  })
  const blob = new Blob([body], { type: "application/json" })
  if (!navigator.sendBeacon?.(ENDPOINT, blob)) {
    void fetch(ENDPOINT, { method: "POST", body: blob, keepalive: true })
  }
}
