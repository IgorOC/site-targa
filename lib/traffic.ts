// Classifica a origem da visita por canal, para o painel separar tráfego orgânico,
// pago, social, IA (GEO) e direto. A origem é a da primeira página da sessão.

const SEARCH = [
  { re: /(^|\.)google\./, name: "Google" },
  { re: /(^|\.)bing\.com$/, name: "Bing" },
  { re: /(^|\.)yahoo\./, name: "Yahoo" },
  { re: /(^|\.)duckduckgo\.com$/, name: "DuckDuckGo" },
  { re: /(^|\.)ecosia\.org$/, name: "Ecosia" },
]

const AI = [
  { re: /(^|\.)chatgpt\.com$|(^|\.)openai\.com$/, name: "ChatGPT" },
  { re: /(^|\.)perplexity\.ai$/, name: "Perplexity" },
  { re: /(^|\.)gemini\.google\.com$|(^|\.)bard\.google\.com$/, name: "Gemini" },
  { re: /(^|\.)claude\.ai$/, name: "Claude" },
  { re: /(^|\.)copilot\.microsoft\.com$/, name: "Copilot" },
]

const SOCIAL = [
  { re: /instagram\.com$|^l\.instagram\.com$/, name: "Instagram" },
  { re: /facebook\.com$|^fb\.|^m\.facebook\.com$|^l\.facebook\.com$/, name: "Facebook" },
  { re: /whatsapp\.com$|^wa\.me$/, name: "WhatsApp" },
  { re: /youtube\.com$|^youtu\.be$/, name: "YouTube" },
  { re: /tiktok\.com$/, name: "TikTok" },
  { re: /linkedin\.com$|^lnkd\.in$/, name: "LinkedIn" },
]

export type Channel = "Orgânico" | "Pago" | "Social" | "IA" | "Referência" | "Direto" | "Campanha"

export function classifySource(referrer: string, landing: string, siteHost: string) {
  const query = new URLSearchParams(landing.startsWith("?") ? landing.slice(1) : landing)
  const utmSource = (query.get("utm_source") || "").toLowerCase()
  const utmMedium = (query.get("utm_medium") || "").toLowerCase()
  const paid = query.has("gclid") || query.has("gbraid") || query.has("wbraid") || /cpc|ppc|paid|ads/.test(utmMedium)

  let host = ""
  try {
    host = referrer ? new URL(referrer).hostname.replace(/^www\./, "").toLowerCase() : ""
  } catch {
    host = ""
  }
  if (host && host === siteHost.replace(/^www\./, "")) host = ""

  const ai = AI.find((item) => item.re.test(host) || item.name.toLowerCase() === utmSource || (utmSource === "chatgpt.com" && item.name === "ChatGPT"))
  if (ai) return { channel: "IA" as Channel, source: `IA · ${ai.name}` }

  const search = SEARCH.find((item) => item.re.test(host) || item.name.toLowerCase() === utmSource)
  if (search) return paid ? { channel: "Pago" as Channel, source: `Pago · ${search.name}` } : { channel: "Orgânico" as Channel, source: `Orgânico · ${search.name}` }

  const social = SOCIAL.find((item) => item.re.test(host) || item.name.toLowerCase() === utmSource || (utmSource === "ig" && item.name === "Instagram"))
  if (social) return paid ? { channel: "Pago" as Channel, source: `Pago · ${social.name}` } : { channel: "Social" as Channel, source: `Social · ${social.name}` }

  if (utmSource) return { channel: (paid ? "Pago" : "Campanha") as Channel, source: `${paid ? "Pago" : "Campanha"} · ${utmSource}` }
  if (paid) return { channel: "Pago" as Channel, source: "Pago · Google Ads" }
  if (host) return { channel: "Referência" as Channel, source: `Referência · ${host}` }
  return { channel: "Direto" as Channel, source: "Direto" }
}
