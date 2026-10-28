import Link from "next/link"
import { buildReport } from "@/lib/analytics"
import { brl } from "@/lib/format"
import { canSeeCosts } from "@/lib/auth"
import { getSession } from "@/lib/auth"
import { getDb } from "@/lib/store"
import { VisitsChart } from "@/components/admin/charts"

export default async function OverviewPage() {
  const session = await getSession()
  const db = await getDb()
  const report = buildReport(db, 30)
  const cards = [
    ["Sessões", report.totals.sessions, report.deltas.sessions],
    ["Carros vistos", report.totals.vehicleViews, report.deltas.vehicleViews],
    ["WhatsApp", report.totals.whatsapp, report.deltas.whatsapp],
    ["Leads", report.totals.leads, report.deltas.leads],
    ["Vendas via site", report.totals.sales, report.deltas.sales],
  ]
  const recent = db.leads.slice(0, 6)
  return (
    <div>
      <h1 className="font-display text-4xl">Visão geral</h1>
      <p className="mt-2 text-sm text-[#5c616a]">Últimos 30 dias, comparado com os 30 anteriores. Visitas só entram depois que a pessoa aceita a medição.</p>
      <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {cards.map(([label, value, delta]) => (
          <article key={String(label)} className="rounded-2xl bg-white p-4">
            <p className="text-xs uppercase tracking-[0.14em] text-[#5c616a]">{label}</p>
            <p className="mt-2 text-3xl tabular">{value}</p>
            <p className="text-xs text-[#5c616a]">{Number(delta) > 0 ? "+" : ""}{delta}% vs. período anterior</p>
          </article>
        ))}
      </div>
      <div className="mt-6 rounded-2xl bg-white p-4">
        <h2 className="font-display text-xl">Visitas por dia</h2>
        <VisitsChart data={report.visitsByDay} />
      </div>
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <section className="rounded-2xl bg-white p-4">
          <h2 className="font-display text-xl">Leads recentes</h2>
          <ul className="mt-3 divide-y divide-black/5 text-sm">
            {recent.length === 0 && <li className="py-3 text-[#5c616a]">Nenhum lead ainda.</li>}
            {recent.map((lead) => (
              <li key={lead.id} className="flex items-center justify-between py-3">
                <span>{lead.name || lead.vehicleLabel || lead.origin}</span>
                <span className="text-[#5c616a]">{lead.status}</span>
              </li>
            ))}
          </ul>
          <Link href="/admin/leads" className="text-sm text-[#8a6a32]">Abrir leads</Link>
        </section>
        <section className="rounded-2xl bg-white p-4">
          <h2 className="font-display text-xl">Estoque</h2>
          <p className="mt-3 text-sm">{db.vehicles.filter((vehicle) => vehicle.status === "disponivel").length} disponíveis · {db.vehicles.length} cadastrados</p>
          {session && canSeeCosts(session.role) && (
            <p className="mt-2 text-sm text-[#5c616a]">
              Custo preenchido em {db.vehicles.filter((vehicle) => vehicle.cost).length} anúncios. Soma {brl(db.vehicles.reduce((sum, vehicle) => sum + (vehicle.cost || 0), 0))}.
            </p>
          )}
          <Link href="/admin/veiculos" className="mt-3 inline-flex text-sm text-[#8a6a32]">Gerir veículos</Link>
        </section>
      </div>
    </div>
  )
}
