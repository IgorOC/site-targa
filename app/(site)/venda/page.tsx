import type { Metadata } from "next"
import { PageShell } from "@/components/layout/chrome"
import { SellForm } from "@/components/forms/lead-forms"

export const metadata: Metadata = {
  title: "Venda seu carro em Uberlândia",
  alternates: { canonical: "/venda" },
  description: "Envie os dados e as fotos do seu carro para a Targa Motors avaliar em Uberlândia.",
}

export default function VendaPage() {
  return (
    <PageShell title="Venda seu veículo" lede="Três passos: seu contato, o carro e as fotos. A proposta não sai automática — a equipe avalia e retorna.">
      <div className="mx-auto max-w-xl px-5 pb-20">
        <SellForm />
      </div>
    </PageShell>
  )
}
