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

export function track(event: TrackInput) {
  if (typeof window === "undefined") return
  if (!event.explicit && localStorage.getItem("targa-consent") !== "all") return
  const body = JSON.stringify({
    type: event.type,
    path: event.path || window.location.pathname,
    vehicleSlug: event.vehicleSlug || "",
    meta: event.meta || {},
    sid: sessionId(),
    ...firstTouch(),
  })
  const blob = new Blob([body], { type: "application/json" })
  if (!navigator.sendBeacon?.("/api/track", blob)) {
    void fetch("/api/track", { method: "POST", body: blob, keepalive: true })
  }
}
