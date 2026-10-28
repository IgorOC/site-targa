import { notFound, redirect } from "next/navigation"
import { VehicleForm } from "@/components/admin/vehicle-form"
import { canSeeCosts, getSession } from "@/lib/auth"
import { getDb } from "@/lib/store"

export default async function EditVehiclePage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session) redirect("/admin/login")
  const { id } = await params
  const db = await getDb()
  const vehicle = db.vehicles.find((item) => item.id === id)
  if (!vehicle) notFound()
  const visible = canSeeCosts(session.role) ? vehicle : { ...vehicle, cost: null, plate: null }
  const audits = db.audit.filter((entry) => entry.entityId === id)
  return (
    <div>
      <h1 className="mb-6 font-display text-4xl">{vehicle.brand} {vehicle.model}</h1>
      <VehicleForm vehicle={visible} showCosts={canSeeCosts(session.role)} audits={audits} />
    </div>
  )
}
