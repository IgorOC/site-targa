import type { MetadataRoute } from "next"
import { SITE } from "@/lib/site"

// Buscadores e assistentes de IA (GEO) podem ler o site público; painel e API ficam de fora.
const AI_BOTS = ["GPTBot", "OAI-SearchBot", "ChatGPT-User", "ClaudeBot", "Claude-SearchBot", "PerplexityBot", "Google-Extended", "Applebot-Extended", "Bingbot"]

export default function robots(): MetadataRoute.Robots {
  const disallow = ["/admin", "/api/admin", "/api/track", "/favoritos", "/estoque/comparar"]
  return {
    rules: [
      { userAgent: "*", allow: ["/", "/api/foto"], disallow },
      { userAgent: AI_BOTS, allow: ["/", "/llms.txt", "/api/foto"], disallow },
    ],
    sitemap: `${SITE.url}/sitemap.xml`,
    host: SITE.url,
  }
}
