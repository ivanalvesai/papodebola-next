---
area: seo
data: 2026-06-09
arquivos:
  - public/ads.txt
  - src/app/layout.tsx
  - src/middleware.ts
---

# ads.txt e Google AdSense

## ads.txt na raiz
Criado `public/ads.txt` (servido em `/ads.txt`):
```
google.com, pub-5802007717322888, DIRECT, f08c47fec0942fa0
```
- O middleware (`src/middleware.ts`) **não** bloqueia `/ads.txt` (só intercepta painel/studio/
  api/admin/noticias).
- O apex `papodebola.com.br` faz 301 → `www`; o ads.txt é servido em ambos (HTTP 200, text/plain).

## O que ativa o AdSense (resumo)
- **Verificação/autorização (já prontos):** meta tag `google-adsense-account: ca-pub-5802007717322888`
  (em `src/app/layout.tsx`, mesmo publisher do ads.txt) + ads.txt.
- **Falta para EXIBIR anúncios:** (a) o site ser aprovado no painel do AdSense; (b) o **script
  Auto Ads** (`adsbygoogle.js`) no `<head>`, ou blocos `<ins class="adsbygoogle">`. Hoje o site
  só tem a meta de verificação — não mostra anúncio ainda.
- O Google leva algumas horas até ~1 dia para rastrear o ads.txt (normal aparecer "não encontrado"
  nesse meio-tempo).
