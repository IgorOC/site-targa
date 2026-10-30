"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { X } from "lucide-react"
import { useContent, useSite } from "@/components/providers"

export function CompareBar() {
  const pathname = usePathname()
  const { compare, clearCompare, toast } = useSite()
  if (pathname.startsWith("/estoque/comparar")) return toast ? <p className="fixed inset-x-4 bottom-4 z-40 rounded-[22px] bg-signal px-4 py-2 text-center text-sm">{toast}</p> : null
  if (!compare.length && !toast) return null
  return (
    <div className="fixed inset-x-0 bottom-4 z-40 mx-auto flex max-w-[720px] flex-col gap-2 px-4">
      {toast && <p className="rounded-[22px] bg-signal px-4 py-2 text-center text-sm">{toast}</p>}
      {compare.length > 0 && (
        <div className="glass flex flex-wrap items-center gap-3 rounded-[24px] px-4 py-3">
          <p className="text-sm text-steel">{compare.length} de 3 para comparar</p>
          <div className="flex flex-1 flex-wrap gap-2">
            {compare.map((item) => (
              <span key={item.slug} className="rounded-full border border-white/15 px-3 py-1 text-xs">{item.label}</span>
            ))}
          </div>
          <button className="text-xs text-steel" onClick={clearCompare}>Limpar</button>
          <Link href="/estoque/comparar" className="rounded-[22px] bg-accent px-4 py-2 text-sm font-medium text-obsidian">
            Comparar
          </Link>
        </div>
      )}
    </div>
  )
}

export function CookieBanner() {
  const { consent, ready, setConsent } = useSite()
  if (!ready || consent !== "unknown") return null
  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-graphite/95 px-5 py-4 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1100px] flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <p className="max-w-3xl text-sm leading-6 text-steel">
          Medimos visitas só se você permitir, para saber quais carros despertam interesse. O essencial do site funciona sem isso.{" "}
          <Link href="/privacidade" className="text-porcelain underline">Política de Privacidade</Link>
        </p>
        <div className="flex gap-2">
          <button className="rounded-[22px] border border-white/15 px-4 py-2 text-sm" onClick={() => setConsent("essential")}>Só essenciais</button>
          <button className="rounded-[22px] bg-accent px-4 py-2 text-sm font-medium text-obsidian" onClick={() => setConsent("all")}>Aceitar medição</button>
        </div>
      </div>
    </div>
  )
}

export function PageShell({ title, lede, children }: { title?: string; lede?: string; children: React.ReactNode }) {
  const { banners } = useContent()
  const today = new Date()
  const key = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`
  const live = banners.filter((banner) => banner.active && banner.start <= key && banner.end >= key)
  return (
    <div className="pt-28">
      {live[0] && (
        <div className="mx-auto max-w-[1280px] px-5 pb-6">
          {live[0].href ? (
            <Link href={live[0].href} className="glass block rounded-[22px] px-5 py-3 text-sm text-accent">{live[0].text}</Link>
          ) : (
            <p className="glass rounded-[22px] px-5 py-3 text-sm text-accent">{live[0].text}</p>
          )}
        </div>
      )}
      {(title || lede) && (
        <header className="mx-auto max-w-[1280px] px-5 pb-8">
          {title && <h1 className="max-w-full text-balance break-words font-display text-[clamp(2rem,8vw,3.75rem)] tracking-[-0.04em] md:text-6xl">{title}</h1>}
          {lede && <p className="mt-4 max-w-2xl text-steel">{lede}</p>}
        </header>
      )}
      {children}
    </div>
  )
}

export function ToastClose() {
  return <X size={14} />
}
