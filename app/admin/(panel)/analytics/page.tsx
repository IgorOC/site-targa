import { BarList, VisitsChart } from "@/components/admin/charts"
import { buildReport } from "@/lib/analytics"
import { brl } from "@/lib/format"
import { getDb } from "@/lib/store"

const flagLabel: Record<string, string> = {
  alerta: "Parado e frio",
  "conversao-alta": "Conversão alta",
  "conversao-baixa": "Conversão baixa",
}

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const params = await searchParams
  const raw = typeof params.dias === "string" ? Number(params.dias) : 30
  const days = raw === 7 || raw === 90 ? raw : 30
  const db = await getDb()
  const report = buildReport(db, days)
  const maxHeat = Math.max(1, ...report.heatmap.flat())
  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl">Analytics</h1>
          <p className="mt-2 text-sm text-[#5c616a]">Quente é o quarto mais visto. Frio é o quarto menos visto. Alerta junta frio com mais de {db.content.ranking.coldDays} dias em estoque.</p>
        </div>
        <div className="flex gap-2 text-sm">
          {[7, 30, 90].map((option) => (
            <a key={option} href={`/admin/analytics?dias=${option}`} className={`rounded-full px-3 py-1 ${option === days ? "bg-[#17181b] text-white" : "bg-white"}`}>{option} dias</a>
          ))}
        </div>
      </div>
      <div className="mt-6 rounded-2xl bg-white p-4">
        <h2 className="font-display text-xl">Visitas</h2>
        <VisitsChart data={report.visitsByDay} />
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <section className="rounded-2xl bg-white p-4">
          <h2 className="font-display text-xl">Funil</h2>
          <BarList data={report.funnel} label="Eventos" />
        </section>
        <section className="rounded-2xl bg-white p-4">
          <h2 className="font-display text-xl">Canais</h2>
          <p className="text-xs text-[#5c616a]">Orgânico (Google/Bing), IA (ChatGPT, Gemini, Perplexity), Social, Pago, Campanha (UTM), Referência e Direto.</p>
          <BarList data={report.channels} label="Sessões" />
        </section>
        <section className="rounded-2xl bg-white p-4">
          <h2 className="font-display text-xl">Origem detalhada</h2>
          <BarList data={report.sources} label="Sessões" />
        </section>
        <section className="rounded-2xl bg-white p-4">
          <h2 className="font-display text-xl">Entradas por busca orgânica e IA</h2>
          {report.landings.length === 0 ? <p className="mt-3 text-sm text-[#5c616a]">Ainda sem visitas vindas do Google ou de IAs.</p> : <BarList data={report.landings} label="Sessões" />}
        </section>
        <section className="rounded-2xl bg-white p-4">
          <h2 className="font-display text-xl">Aparelhos</h2>
          <BarList data={report.devices} label="Páginas" />
        </section>
        <section className="rounded-2xl bg-white p-4">
          <h2 className="font-display text-xl">Buscas</h2>
          {report.searches.length === 0 ? <p className="mt-3 text-sm text-[#5c616a]">Nenhuma busca medida.</p> : (
            <ul className="mt-3 space-y-2 text-sm">
              {report.searches.map((search) => (
                <li key={search.term} className="flex justify-between gap-3">
                  <span>{search.term}</span>
                  <span className="text-[#5c616a]">{search.count}{search.empty ? ` · ${search.empty} sem resultado` : ""}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
      <section className="mt-4 overflow-x-auto rounded-2xl bg-white p-4">
        <h2 className="font-display text-xl">Horários</h2>
        <div className="mt-3 grid grid-cols-[80px_repeat(24,minmax(14px,1fr))] gap-1 text-[10px]">
          <span />
          {Array.from({ length: 24 }, (_, hour) => <span key={hour} className="text-center text-[#5c616a]">{hour}</span>)}
          {["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"].map((day, index) => (
            <>
              <span key={day} className="self-center">{day}</span>
              {report.heatmap[index].map((value, hour) => (
                <span key={`${day}-${hour}`} title={`${day} ${hour}h: ${value}`} className="aspect-square rounded-sm" style={{ background: `rgba(23,24,27,${0.08 + (value / maxHeat) * 0.92})` }} />
              ))}
            </>
          ))}
        </div>
      </section>
      <section className="mt-4 overflow-x-auto rounded-2xl bg-white">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="text-xs uppercase tracking-[0.12em] text-[#5c616a]">
            <tr>
              <th className="p-3">Carro</th>
              <th className="p-3">Classe</th>
              <th className="p-3">Vistas</th>
              <th className="p-3">WhatsApp</th>
              <th className="p-3">Favoritos</th>
              <th className="p-3">Dias</th>
              <th className="p-3">Preço</th>
            </tr>
          </thead>
          <tbody>
            {report.vehicles.map((vehicle) => (
              <tr key={vehicle.slug} className="border-t border-black/5">
                <td className="p-3">{vehicle.name}</td>
                <td className="p-3">
                  <span className={vehicle.klass === "quente" ? "text-[#1f6b45]" : vehicle.klass === "frio" ? "text-[#d7263d]" : ""}>{vehicle.klass}</span>
                  {vehicle.flags.map((flag) => <span key={flag} className="ml-2 text-xs text-[#5c616a]">{flagLabel[flag]}</span>)}
                </td>
                <td className="p-3 tabular">{vehicle.views}</td>
                <td className="p-3 tabular">{vehicle.whatsapp}</td>
                <td className="p-3 tabular">{vehicle.favorites}</td>
                <td className="p-3 tabular">{vehicle.daysInStock}</td>
                <td className="p-3 tabular">{brl(vehicle.price)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  )
}
