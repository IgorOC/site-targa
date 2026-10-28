import type { Metadata } from "next"
import { PageShell } from "@/components/layout/chrome"
import { FinanceForm } from "@/components/forms/lead-forms"
import { isPublic } from "@/lib/catalog"
import { refCode } from "@/lib/format"
import { getDb } from "@/lib/store"

export const metadata: Metadata = {
  title: "Financiamento de seminovos em Uberlândia",
  alternates: { canonical: "/financiamento" },
  description: "Ficha de financiamento da Targa Motors. A loja retorna com as condições reais, sem parcela estimada no site.",
}

export default async function FinancePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const params = await searchParams
  const slug = typeof params.veiculo === "string" ? params.veiculo : ""
  const db = await getDb()
  const vehicle = db.vehicles.find((item) => item.slug === slug && isPublic(item))
  const label = vehicle ? `${vehicle.brand} ${vehicle.model}` : ""
  return (
    <PageShell title="Financiamento" lede="A ficha é curta de propósito. O site não calcula parcela: quem responde com banco, prazo e entrada é a Targa.">
      <div className="mx-auto grid max-w-[1100px] gap-10 px-5 pb-20 md:grid-cols-[1fr_280px]">
        <FinanceForm vehicleLabel={label} vehicleSlug={vehicle?.slug || ""} refCode={vehicle ? refCode(vehicle.slug) : ""} />
        <aside className="space-y-4 text-sm text-steel">
          {db.content.faqs.map((faq) => (
            <article key={faq.q}>
              <h2 className="text-porcelain">{faq.q}</h2>
              <p className="mt-1">{faq.a}</p>
            </article>
          ))}
        </aside>
      </div>
    </PageShell>
  )
}
