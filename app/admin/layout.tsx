import type { Metadata } from "next"

// O painel lê sessão e dados a cada acesso; o site público é gerado com antecedência
export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Painel",
  robots: { index: false, follow: false },
}

export default function AdminRoot({ children }: { children: React.ReactNode }) {
  return children
}
