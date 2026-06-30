---
area: frontend
data: 2026-06-09
arquivos:
  - src/components/home/news-section.tsx
  - src/app/page.tsx
  - src/components/layout/header.tsx
---

# Home: seção de notícias, destaques e rolagem

## "PAPO DE BOLA" cortando letras + eyebrow redundante

Na seção "Últimas Notícias" (`src/components/home/news-section.tsx`), cada item mostrava
um eyebrow `Papo de Bola` acima do título — redundante e com a ponta das letras cortando.

### Correção
- Trocado o texto fixo `Papo de Bola` pela **categoria do post** (`article.category`),
  consistente com o resto do site e estilo ge.globo.
- Adicionado `leading-4` ao eyebrow para não cortar as letras.
- (O wordmark "PAPO DE BOLA" do `header.tsx` é único, no topo, e não tem corte no CSS.)

## 3 posts em destaque (estilo ge.globo)

A seção de notícias ganhou um bloco de **3 destaques**: 1 card grande à esquerda + 2
menores empilhados à direita, alinhados em altura. Cada card é imagem de fundo com
gradiente e título sobreposto em branco. Implementado via CSS grid
(`lg:grid-cols-2 lg:grid-rows-2` + `lg:row-span-2` no card grande).

## Destaques e Melhores Momentos — desativado

A `HighlightsSection` foi **comentada** em `src/app/page.tsx` (import, fetch `getHighlights`
e JSX), reativável depois. Comentar o fetch também evita gastar request à toa.

## Rolagem infinita → 10 + botão "Mostrar mais" (só na home)

O feed da home usava rolagem infinita, mas isso **nunca deixava chegar no rodapé** (sempre
carregava mais ao rolar). Pedido do Ivan: limitar a 10 com botão.

### Correção
- A home passa `infinite={false}` e `initialVisible={10}` ao componente `NewsFeed`
  (ver doc do componente compartilhado). Mostra 10 e cresce só no clique.
- A **página da Copa mantém** a rolagem infinita.

## Feed em coluna única (foto à esquerda, título + trecho à direita)

O feed era grid de 2 colunas; passou a **coluna única** estilo ge.globo: imagem 16/9 à
esquerda, editoria (cinza) + título em negrito + trecho do conteúdo à direita, com
divisória fina entre os itens.
