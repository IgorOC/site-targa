import { redirect } from "next/navigation"
import { VehicleForm } from "@/components/admin/vehicle-form"
import { canSeeCosts, getSession } from "@/lib/auth"

export default async function NewVehiclePage() {
  const session = await getSession()
  if (!session) redirect("/admin/login")
  return (
    <div>
      <h1 className="mb-6 font-display text-4xl">Novo veículo</h1>
      <VehicleForm vehicle={null} showCosts={canSeeCosts(session.role)} audits={[]} />
    </div>
  )
}
