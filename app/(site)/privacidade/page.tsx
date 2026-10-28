import type { Metadata } from "next"
import { PageShell } from "@/components/layout/chrome"
import { getDb } from "@/lib/store"

export const metadata: Metadata = {
  title: "Política de Privacidade",
  alternates: { canonical: "/privacidade" },
  description: "Como a Targa Motors trata os dados enviados pelo site.",
}

export default async function PrivacyPage() {
  const { privacy } = (await getDb()).content
  return (
    <PageShell title="Política de Privacidade" lede={`Atualizada em ${privacy.updatedAt.split("-").reverse().join("/")}.`}>
      <div className="mx-auto max-w-3xl space-y-4 px-5 pb-20 text-porcelain/90">
        {privacy.text.split("\n").filter(Boolean).map((paragraph) => (
          <p key={paragraph.slice(0, 32)}>{paragraph}</p>
        ))}
      </div>
    </PageShell>
  )
}
