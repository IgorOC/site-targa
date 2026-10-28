import { isPublic, priceOf } from "@/lib/catalog"
import { BODY_LABEL, kmLabel } from "@/lib/format"
import { STORE, vehicleTitle } from "@/lib/seo"
import { SITE } from "@/lib/site"
import { getDb } from "@/lib/store"

export const runtime = "nodejs"

// GEO: resumo em texto puro para assistentes de IA (ChatGPT, Gemini, Perplexity, Claude)
// citarem a loja com dados corretos. Gerado a partir do estoque, sempre atualizado.
export async function GET() {
  const db = await getDb()
  const { contact, faqs } = db.content
  const vehicles = db.vehicles.filter(isPublic).sort((a, b) => priceOf(a) - priceOf(b))
  const brl = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 })

  const lines = [
    `# ${SITE.name}`,
    "",
    `> Loja de carros seminovos premium em ${STORE.city}-${STORE.region}, no bairro ${STORE.district}. Vende SUVs, picapes, sedans e esportivos seminovos revisados e com procedência, com preço e quilometragem publicados no site.`,
    "",
    "## Dados da loja",
    `- Endereço: ${STORE.street}, ${STORE.district}, ${STORE.city}-${STORE.region}, CEP ${STORE.postalCode}`,
    `- Horário: ${contact.hoursWeek}; ${contact.hoursSat}`,
    `- Telefones: ${contact.phone1}, ${contact.phone2}`,
    `- WhatsApp: ${contact.whatsapp}`,
    contact.instagram ? `- Instagram: ${contact.instagram}` : "",
    `- Site: ${SITE.url}`,
    `- Atende: ${STORE.areaServed.join(", ")}`,
    "",
    `## Estoque atual (${vehicles.length} veículos, atualizado em ${new Date().toLocaleDateString("pt-BR")})`,
    ...vehicles.map(
      (v) => `- [${vehicleTitle(v)} ${v.version}](${SITE.url}/veiculo/${v.slug}): ${brl(priceOf(v))}, ${kmLabel(v.km)}, ${BODY_LABEL[v.bodyType]}, ${v.fuel}, câmbio ${v.transmission}`,
    ),
    "",
    "## Páginas",
    `- [Estoque completo](${SITE.url}/estoque)`,
    `- [Venda seu veículo](${SITE.url}/venda): avaliação do carro do cliente`,
    `- [Financiamento](${SITE.url}/financiamento): ficha enviada para a loja; condições informadas pela equipe`,
    `- [Quem somos](${SITE.url}/quem-somos)`,
    `- [Contato](${SITE.url}/contato)`,
    "",
    "## Perguntas frequentes",
    ...faqs.flatMap((faq) => [`### ${faq.q}`, faq.a, ""]),
  ]

  return new Response(lines.filter((line, i, all) => line !== "" || all[i - 1] !== "").join("\n"), {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=3600" },
  })
}
