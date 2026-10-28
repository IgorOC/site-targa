import { LeadsBoard } from "@/components/admin/leads-board"
import { canSeeSensitiveLead, getSession } from "@/lib/auth"
import { getDb } from "@/lib/store"
import { redirect } from "next/navigation"

export default async function LeadsPage() {
  const session = await getSession()
  if (!session) redirect("/admin/login")
  const db = await getDb()
  const leads = db.leads.map((lead) => {
    if (canSeeSensitiveLead(session.role)) return lead
    const payload = { ...lead.payload }
    delete payload.cpf
    delete payload.renda
    return { ...lead, payload }
  })
  return (
    <div>
      <h1 className="font-display text-4xl">Leads</h1>
      <p className="mt-2 max-w-2xl text-sm text-[#5c616a]">O clique no WhatsApp vira um lead com o código do anúncio. A conversa em si não entra aqui: quando a venda fechar, marque o carro como vendido via site.</p>
      <div className="mt-6">
        <LeadsBoard leads={leads} role={session.role} />
      </div>
    </div>
  )
}
