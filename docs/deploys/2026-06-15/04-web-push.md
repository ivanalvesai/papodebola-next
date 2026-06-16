---
area: notificacoes
data: 2026-06-15
---

# Web push próprio (VAPID) — opt-in, painel e disparo automático da Copa

Sistema de notificação push **próprio** (sem OneSignal), com chaves VAPID. Lib: `web-push`.

## Componentes

| Parte | Arquivo |
|---|---|
| Service worker (push + notificationclick) | `public/sw.js` |
| Util cliente (suporte/subscribe/unsubscribe) | `src/lib/push-client.ts` |
| Botão "Ativar alertas" no menu lateral | `src/components/push/push-opt-in.tsx` |
| Modal centralizado "Eu quero" (sino animado) | `src/components/push/push-prompt-modal.tsx` (montado no `layout.tsx`) |
| Store de assinaturas | `src/lib/data/push-store.ts` → `data/push-subscriptions.json` |
| Serviço de envio | `src/lib/services/push.ts` (`sendToAll`) |
| Rotas | `/api/push/subscribe`, `/api/push/unsubscribe` (públicas), `/api/push/send` (GET=contagem, POST=envio; protegida JWT) |
| Painel admin | `src/app/painel-pdb-9x/notificacoes/page.tsx` (aba "Notificações") |

## Chaves / env (dev E prod, MESMO par)

A store de assinaturas fica no volume **compartilhado** dev/prod → o par VAPID **tem que ser
idêntico** nos dois. No `.env.local`:

```
NEXT_PUBLIC_VAPID_PUBLIC_KEY=...   # build-time, vai pro cliente
VAPID_PUBLIC_KEY=...
VAPID_PRIVATE_KEY=...              # secreto
VAPID_SUBJECT=mailto:contato@papodebola.com.br
```

## Detalhes importantes

- O prompt nativo do navegador **não é controlável** pelo site (Chrome mostra Permitir/Bloquear;
  Firefox mostra opções de tempo). É igual pro Terra/Globo — é decisão do navegador.
- **iOS**: web push só funciona em PWA instalado (Adicionar à Tela de Início), não no Safari normal.
- `web-push` é **bundlado dentro do server do Next** (não fica em `/app/node_modules`), então
  script avulso no container dá `MODULE_NOT_FOUND`. Pra enviar sem o painel, use a rota
  `/api/push/send` com um JWT mintado a partir do `JWT_SECRET` (cookie `pdb_auth`, HS256, `jose`).
- Inscrições mortas/expiradas (404/410) são removidas automaticamente no envio.

## Disparo automático da Copa (cron)

Endpoint **`/api/push/cron/copa-kickoff?secret=<REVALIDATION_SECRET>`** faz, num tick:
1. **Porteira (custo ~zero):** só prossegue se houver jogo da Copa na janela em torno do
   horário marcado — `[-5min, +200min]` (cobre o jogo inteiro + atraso). Usa
   `getTodayMatches`/`getTomorrowMatches` (em cache, reusado da home), filtrados por
   `WORLD_CUP_LEAGUE_ID` (16). Fora disso, retorna sem bater no feed ao vivo.
2. **Feed ao vivo fresco:** `getWorldCupLiveMatches()` = `matches/live` (revalidate 30s)
   filtrado por torneio id 16 → **pega qualquer fase futura** (oitavas, final…) sem mudar código.
3. **"🟢 Começou o jogo"** — 1x por jogo, só se o apito REAL foi nos últimos 20min
   (`SEND_RECENT_S`); dedup em `data/push-kickoffs.json`.
4. **"⚽ GOL!"** — compara `home+away` com o maior total já visto (**highwater**,
   `data/push-scores.json`); se subiu, dispara com o placar na hora. Semeia o placar na 1ª
   vez (não anuncia gols passados). Tag `copa-goal-<id>` por jogo (mostra sempre o placar atual).

### Cron no servidor

No crontab do user `ivan` (aponta pro **dev**, que é quem consulta a API):

```
* * * * * curl -fsS "https://development.papodebola.com.br/api/push/cron/copa-kickoff?secret=<SECRET>" >/dev/null 2>&1 # copa-kickoff-push
```

Roda de 1/min (só um `curl`; a parte cara só roda na janela dos jogos). **Desligar após a
Copa** comentando a linha (`crontab -e`).

## Fases

- **Fase 1**: opt-in (modal + menu), store, envio manual no painel. ✅
- **Fase 2**: início de jogo + GOL da Copa, automático. ✅ (testado: disparou no Irã x N.Zelândia).
- **Próximo**: alertas por time/campeonato (o cadastro já tem campo `topics`); push ao publicar
  post no WP.
