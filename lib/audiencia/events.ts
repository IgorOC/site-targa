// Catálogo dos eventos da audiência. Os nomes são os que o site já gravava (o painel e as visões do
// Supabase dependem deles); a coluna "plano" é o nome usado no documento de métricas.
export const EVENTS = {
  pageview: "Abriu uma página (plano: page_view)",
  vehicle_view: "Abriu a página de um veículo",
  vehicle_active_time: "Tempo ativo no veículo: meta.ms acumulado desde o último envio (aba visível, janela em foco, sem 60 s parado)",
  gallery: "Mexeu na galeria de miniaturas (plano: vehicle_gallery_open)",
  photo_view: "Trocou a foto principal; meta.index = número da foto (plano: vehicle_photo_view)",
  spin: "Girou o veículo (fotos 360)",
  card_click: "Clicou no card de um veículo numa listagem",
  favorite: "Favoritou um veículo (plano: vehicle_favorite)",
  compare: "Pôs um veículo na comparação (plano: vehicle_compare)",
  search: "Buscou ou filtrou no estoque; meta.q e meta.results (0 = busca sem resultado)",
  whatsapp: "Clicou no WhatsApp (plano: whatsapp_click); vehicleSlug quando foi num veículo",
  phone: "Clicou para ligar (plano: phone_click)",
  finance_start: "Abriu a simulação de financiamento de um veículo",
  finance_submit: "Enviou a ficha de financiamento (plano: financing_submitted)",
  sell_submit: "Enviou o pedido de avaliação/venda do carro (plano: vehicle_evaluation_submitted)",
  visit_submit: "Pediu horário de visita para um veículo",
  contact_submit: "Enviou o formulário de contato",
} as const

export type EventType = keyof typeof EVENTS

export function isEventType(value: string): value is EventType {
  return Object.prototype.hasOwnProperty.call(EVENTS, value)
}
