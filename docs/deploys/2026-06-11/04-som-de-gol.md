---
area: feature-som-de-gol
data: 2026-06-11
---

# Som de gol (torcida) na página do jogo

## O que faz
Quando o placar do jogo aumenta (gol), toca um **roar de torcida** sintetizado via **Web Audio
API** (ruído filtrado bandpass+lowpass com swell de ~2,6s). Tudo em `live-match.tsx`.

## Escopo (importante — definido com o usuário)
- Toca **só na partida com a página aberta** — o detector vive no componente `LiveMatch`
  daquele jogo, observando o placar **daquele** jogo. Não há nada tocando "no site inteiro".
- O **botão liga/desliga** fica no **cabeçalho de cada página de jogo ao vivo** (não é botão
  global solto no site). Quem está na home não vê botão de som.
- **Ligado por padrão**; a pessoa desliga se quiser (ícone Volume2/VolumeX).

## Detalhes técnicos
- `playGoalRoar()` + `getAudioCtx()` (AudioContext compartilhado, module-level).
- Detecção: `useEffect` em `[event.homeScore, event.awayScore, event.statusType]` — toca quando
  o total de gols aumenta, **exceto no carregamento** (ref `prevGoals` inicializa sem tocar).
- **Autoplay dos navegadores:** áudio só libera após um gesto do usuário. Desbloqueamos no 1º
  `pointerdown` na página (e no clique do próprio botão de som). Antes disso, não toca (sem erro).
