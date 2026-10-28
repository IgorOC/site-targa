"use client"

import { useState } from "react"
import { updateLead } from "@/lib/actions"
import { LEAD_STATUSES, ORIGIN_LABEL } from "@/lib/format"
import type { Lead, Role } from "@/lib/types"

export function LeadsBoard({ leads, role }: { leads: Lead[]; role: Role }) {
  const [origin, setOrigin] = useState<Lead["origin"] | "">("")
  const [items, setItems] = useState(leads)
  const visible = items.filter((lead) => !origin || lead.origin === origin)
  const statuses = origin ? LEAD_STATUSES[origin] : ["Novo", "Em conversa", "Respondido", "Vendido", "Perdido"]
  return (
    <div>
      <div className="flex flex-wrap gap-2">
        <Filter label="Todos" active={origin === ""} onClick={() => setOrigin("")} />
        {(Object.keys(ORIGIN_LABEL) as Lead["origin"][]).map((key) => (
          <Filter key={key} label={ORIGIN_LABEL[key]} active={origin === key} onClick={() => setOrigin(key)} />
        ))}
      </div>
      <div className="mt-6 grid gap-3 md:grid-cols-3 xl:grid-cols-5">
        {statuses.map((status) => (
          <section key={status} className="rounded-2xl bg-white p-3">
            <h2 className="text-sm font-medium">{status}</h2>
            <p className="text-xs text-[#5c616a]">{visible.filter((lead) => lead.status === status).length}</p>
            <div className="mt-3 space-y-2">
              {visible.filter((lead) => lead.status === status).map((lead) => (
                <article key={lead.id} className="rounded-xl border border-black/10 p-3 text-sm">
                  <p className="font-medium">{lead.name || lead.vehicleLabel || "Sem nome"}</p>
                  <p className="text-xs text-[#5c616a]">{ORIGIN_LABEL[lead.origin]}{lead.refCode ? ` · ${lead.refCode}` : ""}</p>
                  {lead.phone && <p>{lead.phone}</p>}
                  {lead.message && <p className="mt-1 text-[#5c616a]">{lead.message}</p>}
                  {Object.entries(lead.payload).filter(([, value]) => value).map(([key, value]) => (
                    <p key={key} className="text-xs"><span className="text-[#5c616a]">{key}:</span> {role === "vendedor" && (key === "cpf" || key === "renda") ? "restrito" : value}</p>
                  ))}
                  {lead.photos.length > 0 && (
                    <div className="mt-2 flex gap-1">
                      {lead.photos.map((name) => (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img key={name} src={`/api/admin/lead-file?name=${name}`} alt="" className="h-14 w-14 rounded-lg object-cover" />
                      ))}
                    </div>
                  )}
                  <select
                    className="mt-2 w-full rounded-lg border border-black/10 px-2 py-1 text-xs"
                    value={lead.status}
                    onChange={async (event) => {
                      const status = event.target.value
                      setItems((current) => current.map((item) => item.id === lead.id ? { ...item, status } : item))
                      await updateLead(lead.id, status)
                    }}
                  >
                    {(origin ? LEAD_STATUSES[lead.origin] : Array.from(new Set([...LEAD_STATUSES[lead.origin], lead.status]))).map((item) => (
                      <option key={item}>{item}</option>
                    ))}
                  </select>
                </article>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}

function Filter({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className={`rounded-full px-3 py-1 text-sm ${active ? "bg-[#17181b] text-white" : "bg-white"}`}>
      {label}
    </button>
  )
}
