# Audiência do site: esqueleto pronto para o Supabase

O site já coleta os eventos e os grava em `data/db.json`. Em hospedagem sem disco gravável (Netlify), **os eventos se perdem até o Supabase ser ligado**.
Para ligar, basta criar as tabelas e pôr duas variáveis de ambiente. Não é preciso mudar código.

## Como funciona

```
navegador (lib/track.ts)  ──POST /audiencia──▶  app/audiencia/route.ts  ──▶  lib/audiencia/sink.ts
  sessão anônima, visitante        valida, limita (120/min por sessão),        Supabase (com as chaves)
  anônimo (só com consentimento),  origem, campanha, aparelho, região,         ou data/db.json (sem elas)
  id do evento                     robô/equipe
```

- **Catálogo dos eventos:** `lib/audiencia/events.ts`, com a correspondência para os nomes do plano de métricas (`page_view` = `pageview`, `whatsapp_click` = `whatsapp` etc.).
- **Tempo ativo no veículo:** `components/vehicles/use-active-time.ts`. Conta só com a aba visível, a janela em foco e alguma ação do visitante nos últimos 60 s. É enviado em pedaços a cada 15 s e ao sair da página.
- **Leitura para o painel:** `lib/audiencia/read.ts` (`readView("analytics_vehicle_stats", "order=views.desc")`). Enquanto o Supabase não estiver ligado, devolve `null`, e o painel atual (`lib/analytics.ts`) segue lendo o `db.json`.
- **Endereço antigo:** `/api/track` continua funcionando e repassa para `/audiencia`.

## Ligar o Supabase (em casa)

1. Crie o projeto no Supabase, na região São Paulo (`sa-east-1`).
2. Abra o **SQL Editor**, cole o arquivo `supabase/migrations/20261030000000_audiencia.sql` e rode. Ele pode ser rodado de novo sem estragar nada.
   - Com a CLI do Supabase, o caminho é `supabase link` e depois `supabase db push`.
3. Em **Project Settings > API**, copie a *Project URL* e a chave **service_role**.
4. Ponha as duas no `.env.local`, para testar local, e no Netlify, em *Site configuration > Environment variables*:
   ```
   SUPABASE_URL=https://xxxx.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=eyJ...
   ```
   A `service_role` é **secreta**: ela ignora o RLS. Use só no servidor e **nunca** com o prefixo `NEXT_PUBLIC_`.
5. Faça um novo deploy no Netlify, para ele ler as variáveis.
6. Confira:
   - abra um carro no site, aceite os cookies e espere uns 20 s;
   - no Supabase, rode `select type, vehicle_slug, meta from analytics_events order by ts desc limit 20;`;
   - a resposta do `POST /audiencia` traz o cabeçalho `X-Audiencia-Store: supabase` quando está gravando lá (`json` quando não está).

## O que o banco entrega (visões)

| Visão | Para quê |
|---|---|
| `analytics_vehicle_stats` | Por veículo, em 30 dias: visualizações, visitantes, quem voltou, tempo ativo médio, fotos, galeria, favoritos, comparações, WhatsApp, telefone, financiamento e **taxa de contato** (WhatsApp ÷ visitantes) |
| `analytics_stock_intelligence` | Classifica cada carro contra a mediana do estoque: Alta procura · Alto interesse · Interesse sem conversão · Baixa procura |
| `analytics_daily` | Por dia: sessões, visitantes, páginas, veículos vistos, WhatsApp, telefone, formulários |
| `analytics_sources` | Sessões e contatos por canal, origem, campanha (`utm_campaign`) e aparelho |
| `analytics_searches` | Termos buscados e quantos não tiveram resultado |

Todas descontam robôs (Lighthouse e similares) e os acessos da equipe logada no painel.

## Próximos passos (fora do esqueleto)

- Trocar o painel `/admin/analytics` para ler de `readView(...)` quando o Supabase estiver ligado: cards por veículo, inteligência do estoque, origem e buscas.
- Comparar períodos (esta semana × a anterior), criar alertas ("muitas visitas, poucos contatos") e o relatório com IA.
- Agendar a retenção: com a extensão `pg_cron` ligada, rodar `select cron.schedule('audiencia-retencao', '0 4 * * *', 'select public.analytics_purge()');`. Isso apaga eventos com mais de 13 meses.
- Se o volume crescer, criar uma tabela de agregação diária em vez de ler os eventos brutos.

## LGPD

- **Não gravamos** IP, nome, e-mail nem telefone. A região é só a cidade/UF informada pela CDN.
- **Sem consentimento "todos"** no aviso de cookies, só são gravados os cliques explícitos (WhatsApp, telefone e envio de formulário), sem identificador de visitante.
- **Política de privacidade:** mencionar a coleta de navegação anônima para melhorar o site e o atendimento, e o prazo de 13 meses.
