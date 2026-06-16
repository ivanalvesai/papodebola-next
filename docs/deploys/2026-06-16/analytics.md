---
area: analytics
data: 2026-06-16
---

# Analytics (GA4) — ativação

Aplicação da skill `analytics`. Estado: **GTM `GTM-MMRXG48R`** já carrega **GA4 `G-GPNEBS61PX`**
+ Clarity. Pageview é automático. Faltavam eventos customizados e o link com o Search Console.

## (A) Feito no código — eventos no dataLayer

Helper `src/lib/analytics.ts` → `track(event, params)` empurra pro `dataLayer`. Instrumentado o
**funil de opt-in de push** (a feature nova):

| Evento (dataLayer) | Quando | Params |
|---|---|---|
| `push_prompt_shown` | modal "Eu quero" aparece | source: modal |
| `push_subscribed` | usuário ativou os alertas | source: modal\|menu |
| `push_blocked` | bloqueou no prompt nativo | source |
| `push_prompt_dismissed` | fechou o modal | source: modal |
| `push_unsubscribed` | desativou no menu | source: menu |

> Esses eventos **só chegam ao GA4 depois** de criar a tag no GTM (passo B3).

## (B) Painel — você faz (não é código)

**B1. Linkar GA4 ↔ Search Console** (você já tem GSC)
GA4 → Admin → *Vínculos de produtos* → **Search Console** → vincular a propriedade. Depois,
em *Relatórios → Biblioteca*, publique a coleção "Search Console" pra ver consultas/cliques no GA4.

**B2. Enhanced Measurement (medição avançada)**
GA4 → Admin → Streams de dados → (web) → **Medição avançada** ligada. Em *site search*,
configure o parâmetro de busca **`search`** (nossa busca é `/noticias?search=`). Assim
`view_search_results`, `scroll`, `outbound click` e `file_download` vêm automáticos.

**B3. Encaminhar os eventos do dataLayer pro GA4 (no GTM)**
Pra cada evento (ou um genérico): GTM → **Acionadores** → Novo → *Evento personalizado* →
nome = `push_subscribed` (etc.). GTM → **Tags** → Novo → *GA4 Event* → config tag = o GA4,
*Event name* = `{{Event}}` (variável Event) → dispara no acionador acima → **Publicar**.
(Atalho: um acionador "Custom Event" com regex `push_.*` + uma tag GA4 Event com nome dinâmico.)

**B4. Marcar conversões (eventos-chave)**
GA4 → Admin → *Eventos* (ou *Eventos-chave*) → marcar **`push_subscribed`** como evento-chave.
(Quando tiver afiliados/"onde assistir", marcar os cliques de saída também.)

## (C) Próximos eventos fáceis (quando quiser)
Usando o mesmo `track(...)`: clique em card de jogo (`match_card_clicked`), clique em "onde
assistir"/afiliado (`outbound_click` — ou deixar o automático do GA4), e (futuro) seguir time.

## Validação
GA4 → **DebugView** (ou extensão Tag Assistant) + GTM **Preview**. Ativar os alertas no site
e ver `push_subscribed` aparecer em tempo real.
