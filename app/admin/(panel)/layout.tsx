import Link from "next/link"
import { redirect } from "next/navigation"
import { logout } from "@/lib/actions"
import { getSession } from "@/lib/auth"

const links = [
  ["/admin", "Visão geral"],
  ["/admin/veiculos", "Veículos"],
  ["/admin/conteudo", "Conteúdo"],
  ["/admin/leads", "Leads"],
  ["/admin/analytics", "Analytics"],
]

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()
  if (!session) redirect("/admin/login")
  return (
    <div className="fixed inset-0 overflow-y-auto bg-[#e7e5e1] text-[#17181b]">
      <div className="mx-auto grid min-h-full max-w-[1400px] md:grid-cols-[220px_1fr]">
        <aside className="border-b border-black/10 p-5 md:border-b-0 md:border-r">
          <p className="text-xs uppercase tracking-[0.18em] text-[#8a6a32]">Targa Motors</p>
          <p className="mt-1 font-display text-2xl">Painel</p>
          <p className="mt-1 text-xs text-[#5c616a]">{session.name} · {session.role}</p>
          <nav className="mt-6 flex flex-col gap-1 text-sm">
            {links.map(([href, label]) => (
              <Link key={href} href={href} className="rounded-xl px-3 py-2 hover:bg-black/5">{label}</Link>
            ))}
            <Link href="/" className="rounded-xl px-3 py-2 hover:bg-black/5">Ver site</Link>
          </nav>
          <form action={logout} className="mt-6">
            <button className="text-sm text-[#5c616a]">Sair</button>
          </form>
        </aside>
        <div className="p-5 md:p-8">{children}</div>
      </div>
    </div>
  )
}
