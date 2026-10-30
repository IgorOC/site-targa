import { updateDb } from "@/lib/store"
import type { AnalyticsEvent } from "@/lib/types"

// Onde os eventos da audiência são gravados. Escolha automática:
//  - Supabase, quando SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY existem (produção);
//  - data/db.json, senão (desenvolvimento; em hospedagem sem disco gravável, como Netlify/Vercel,
//    os eventos se perdem até o Supabase ser ligado).
// AUDIENCIA_STORE=json força o arquivo mesmo com as chaves (útil para testar local).

export type StoredEvent = AnalyticsEvent & {
  visitorId: string
  channel: string
  campaign: string
  region: string
}

export interface EventSink {
  name: "supabase" | "json"
  save(event: StoredEvent): Promise<void>
}

export function supabaseConfig() {
  const url = process.env.SUPABASE_URL?.replace(/\/+$/, "")
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  return url && key ? { url, key } : null
}

const jsonSink: EventSink = {
  name: "json",
  async save(event) {
    const { visitorId, channel, campaign, region, ...base } = event
    await updateDb((db) => {
      db.events.push({ ...base, meta: { ...base.meta, channel, ...(campaign ? { campaign } : {}), ...(region ? { region } : {}), ...(visitorId ? { vid: visitorId } : {}) } })
    })
  },
}

function supabaseSink(config: { url: string; key: string }): EventSink {
  return {
    name: "supabase",
    async save(event) {
      // PostgREST do Supabase; o id repetido é ignorado (reenvio do navegador não duplica)
      const response = await fetch(`${config.url}/rest/v1/analytics_events?on_conflict=id`, {
        method: "POST",
        headers: {
          apikey: config.key,
          Authorization: `Bearer ${config.key}`,
          "Content-Type": "application/json",
          Prefer: "resolution=ignore-duplicates,return=minimal",
        },
        body: JSON.stringify({
          id: event.id,
          type: event.type,
          ts: event.ts,
          path: event.path,
          vehicle_slug: event.vehicleSlug,
          session_id: event.sid,
          visitor_id: event.visitorId,
          referrer: event.referrer,
          source: event.source,
          channel: event.channel,
          campaign: event.campaign,
          device: event.device,
          region: event.region,
          bot: event.bot,
          staff: event.staff,
          meta: event.meta,
        }),
        cache: "no-store",
      })
      if (!response.ok) throw new Error(`Supabase ${response.status}: ${await response.text()}`)
    },
  }
}

export function eventSink(): EventSink {
  const config = supabaseConfig()
  if (config && process.env.AUDIENCIA_STORE !== "json") return supabaseSink(config)
  return jsonSink
}
