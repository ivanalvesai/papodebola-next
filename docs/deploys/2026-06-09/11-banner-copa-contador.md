---
area: frontend
data: 2026-06-10
arquivos:
  - src/components/world-cup-banner.tsx
---

# Banner da Copa: contador e botão "Acompanhe"

Ajustes no `src/components/world-cup-banner.tsx` (o banner com contagem regressiva no topo
do site). Relacionado ao doc `04-copa-do-mundo.md` (correção do link do mesmo banner).

## Contador apontava para o horário errado

O contador terminava à **meia-noite (00:00) de 11/06** em Brasília
(`TARGET = new Date("2026-06-11T00:00:00-03:00")`), mas a Copa só abre às **16h de Brasília**
de 11/06 (jogo inaugural México × África do Sul). Resultado: ficava ~**16h adiantado**, e
isso ficou gritante a ~1 dia do evento (mostrava ~5h quando faltavam ~21h).

**Causa:** só o horário-alvo estava errado (meia-noite em vez de 16h). A matemática de fuso
sempre esteve certa — `Date.now()` é em UTC e o `TARGET` tem offset `-03:00` (Brasil sem
horário de verão desde 2019, então junho = UTC-3). NÃO teve relação com as mudanças de cache.

**Correção:** `TARGET = new Date("2026-06-11T16:00:00-03:00")`. Validado na origem da prod:
passou a mostrar ~21h (até as 16h de 11/06), batendo com o real.

Nota: o contador é client-side (`useState(calcTimeLeft)` + `setInterval`), então o SSR
renderiza um valor inicial (congelado no momento do render/cache) e o navegador atualiza a
cada segundo após hidratar. Alternativa possível: apontar para a cerimônia de abertura
(~14h30 Brasília) em vez do jogo.

## Botão "Acompanhe" — seta removida

O botão amarelo mostrava `Acompanhe →` (`&rarr;`). A pedido do Ivan, ficou **só "Acompanhe"**
(sem a seta). O banner inteiro continua sendo um `<Link>` clicável para `/futebol/copa-do-mundo`.
