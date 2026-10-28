import Link from "next/link"
import { canSeeCosts, getSession } from "@/lib/auth"
import { priceOf } from "@/lib/catalog"
import { brl, daysInStock, STATUS_LABEL } from "@/lib/format"
import { getDb } from "@/lib/store"

export default async function VehiclesAdminPage() {
  const session = await getSession()
  const db = await getDb()
  const costs = session ? canSeeCosts(session.role) : false
  const vehicles = [...db.vehicles].sort((a, b) => a.brand.localeCompare(b.brand, "pt-BR") || a.model.localeCompare(b.model, "pt-BR"))
  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <h1 className="font-display text-4xl">Veículos</h1>
        <Link href="/admin/veiculos/novo" className="rounded-xl bg-[#17181b] px-4 py-2 text-sm text-white">Adicionar</Link>
      </div>
      <div className="mt-6 overflow-x-auto rounded-2xl bg-white">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="text-xs uppercase tracking-[0.12em] text-[#5c616a]">
            <tr>
              <th className="p-3">Carro</th>
              <th className="p-3">Preço</th>
              <th className="p-3">Status</th>
              <th className="p-3">Dias</th>
              {costs && <th className="p-3">Custo</th>}
            </tr>
          </thead>
          <tbody>
            {vehicles.map((vehicle) => (
              <tr key={vehicle.id} className="border-t border-black/5">
                <td className="p-3">
                  <Link href={`/admin/veiculos/${vehicle.id}`} className="font-medium">{vehicle.brand} {vehicle.model}</Link>
                  <p className="text-xs text-[#5c616a]">{vehicle.version}</p>
                </td>
                <td className="p-3 tabular">{brl(priceOf(vehicle))}</td>
                <td className="p-3">{STATUS_LABEL[vehicle.status]}{vehicle.featured ? " · destaque" : ""}</td>
                <td className="p-3 tabular">{daysInStock(vehicle.enteredAt)}</td>
                {costs && <td className="p-3 tabular">{vehicle.cost ? brl(vehicle.cost) : "—"}</td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
