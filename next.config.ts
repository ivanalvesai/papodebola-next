import type { NextConfig } from "next";
import { withPayload } from "@payloadcms/next/withPayload";

const nextConfig: NextConfig = {
  output: "standalone",
  // jsdom (usado no convertHTMLToLexical do envio do kanban) não é bundlado — fica
  // externo e carrega do node_modules em runtime (recomendação do Payload).
  serverExternalPackages: ["jsdom"],
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
  images: {
    // AVIF primeiro (≈20-30% menor que WebP), com WebP de fallback → ganho de CWV
    // nas capas/imagens otimizadas pelo next/image.
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "papodebola.com.br",
      },
      {
        protocol: "https",
        hostname: "admin.papodebola.com.br",
      },
      {
        protocol: "https",
        hostname: "images.pexels.com",
      },
    ],
    unoptimized: false,
  },
  async headers() {
    // Áreas de admin nunca devem ser indexadas (são client components protegidos
    // por auth, sem como exportar `robots` via metadata — daí o header global).
    return [
      {
        source: "/painel-pdb-9x/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
      {
        source: "/studio-pdb/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
    ];
  },
  async redirects() {
    return [
      // Páginas legais renomeadas pra slugs descritivos (jun/2026)
      { source: "/privacidade", destination: "/politica-de-privacidade", permanent: true },
      { source: "/termos", destination: "/termos-de-uso", permanent: true },
      // /agenda renomeada pra /jogos-de-hoje (jun/2026) — termo mais forte de SEO
      { source: "/agenda", destination: "/jogos-de-hoje", permanent: true },
      { source: "/agenda/:path*", destination: "/jogos-de-hoje/:path*", permanent: true },
      // /municipal virou /sp/santana-de-parnaiba/municipal (hierarquia geográfica)
      { source: "/municipal", destination: "/sp/santana-de-parnaiba/municipal", permanent: true },
      // Basquete = NBA (NBB depois): removida a landing genérica /basquete -> /nba.
      { source: "/basquete", destination: "/nba", permanent: true },
      { source: "/basquete/nba", destination: "/nba", permanent: true },
      // Apostas: slug encurtada /casas-de-apostas -> /apostas (a antiga chegou a ir pra prod).
      { source: "/casas-de-apostas", destination: "/apostas", permanent: true },
      { source: "/casas-de-apostas/:slug*", destination: "/apostas/:slug*", permanent: true },
      // Craques: o post do WP abre tanto em /artigos/[slug] (rota genérica) quanto em
      // /futebol/craque/[slug] (página canônica) = conteúdo duplicado. Redireciona a
      // genérica na camada de roteamento (308 real, antes do streaming do RSC, que
      // senão devolveria 200 e o crawler não veria o redirect). Manter em sincronia
      // com CRAQUE_SLUGS em src/lib/data/craques.ts.
      ...["socrates"].map((s) => ({
        source: `/artigos/${s}`,
        destination: `/futebol/craque/${s}`,
        permanent: true,
      })),
      // jogos de hoje por esporte vivem sob /jogos-de-hoje/{esporte} (futebol, volei, basquete...)
      { source: "/futebol/jogos-hoje", destination: "/jogos-de-hoje/futebol", permanent: true },
      // Notícias de futebol moram em /futebol/{torneio|bucket}/{slug}. Os "pais" (2 seg) que NÃO
      // têm campeonato/hub próprio redirecionam pra um destino sensato (só o path exato; o
      // /futebol/{x}/{artigo} de 3 seg continua na rota de artigo). Os com hub (copa-do-mundo,
      // selecao-brasileira, libertadores, sudamericana, champions-league, premier-league, la-liga,
      // copa-do-brasil) já resolvem sozinhos.
      { source: "/futebol/brasileirao", destination: "/futebol/brasileirao-serie-a", permanent: true },
      { source: "/futebol/internacional", destination: "/noticias/futebol-internacional", permanent: true },
      { source: "/futebol/mercado-da-bola", destination: "/noticias/mercado-da-bola", permanent: true },
      { source: "/futebol/eliminatorias", destination: "/noticias/eliminatorias", permanent: true },
      { source: "/futebol/brasileiro", destination: "/noticias/futebol-brasileiro", permanent: true },
      // Específica ANTES da genérica: /futebol/brasileirao redireciona de novo (2 saltos).
      { source: "/campeonato/brasileirao", destination: "/futebol/brasileirao-serie-a", permanent: true },
      { source: "/campeonato/:slug", destination: "/futebol/:slug", permanent: true },
      { source: "/times/:slug", destination: "/futebol/times/:slug", permanent: true },
      { source: "/times/:slug/:sub*", destination: "/futebol/times/:slug/:sub*", permanent: true },
      // /esporte/* virou URL top-level por esporte (abr/2026)
      { source: "/esporte/nba", destination: "/nba", permanent: true },
      { source: "/esporte/tenis", destination: "/tenis", permanent: true },
      { source: "/esporte/f1", destination: "/formula-1", permanent: true },
      { source: "/esporte/mma", destination: "/combate", permanent: true },
      { source: "/esporte/volei", destination: "/volei", permanent: true },
      { source: "/esporte/esports", destination: "/esports", permanent: true },
      { source: "/esporte/nfl", destination: "/futebol-americano", permanent: true },

      // Raízes de categoria sem hub próprio (27/09): o artigo mora em /{categoria}/{slug}
      // (200), mas /{categoria} sozinho dava 404. Só o path exato — os artigos continuam.
      { source: "/futebol-brasileiro", destination: "/noticias/futebol-brasileiro", permanent: true },
      { source: "/futebol-internacional", destination: "/noticias/futebol-internacional", permanent: true },
      { source: "/mma", destination: "/combate", permanent: true },
      { source: "/nfl", destination: "/futebol-americano", permanent: true },
      { source: "/paginas", destination: "/", permanent: true },
      { source: "/autor", destination: "/sobre", permanent: true },

      // Times: slugs antigos (URLs do GSC com impressões). `:sub*` também casa o hub
      // (path sem subpágina). Destino tem slug diferente => não casa a própria regra.
      { source: "/futebol/times/sport/:sub*", destination: "/futebol/times/sport-recife/:sub*", permanent: true },
      { source: "/futebol/times/atletico-go/:sub*", destination: "/futebol/times/atletico-goianiense/:sub*", permanent: true },
      { source: "/futebol/times/athletic-club-mg/:sub*", destination: "/futebol/times/athletic-club/:sub*", permanent: true },
      // /futebol/times/proximos-jogos (sem time) — exata, antes das variações por time.
      { source: "/futebol/times/proximos-jogos", destination: "/jogos-de-hoje/futebol", permanent: true },
      // Variações de "próximos jogos" que o Google conhece. A lista NÃO inclui
      // "proximos-jogos" (o destino) e "proximos-jogos-do-*" exige o "-do-" => sem loop.
      {
        source:
          "/futebol/times/:slug/:sub(proximos-jos|proximos-jogo|proximas-jogos|proximos-jogos-2026|proximos-calendario-2026|proximos-jogos-calendario-2026|calendario|proximos-jogos-do-[^/]+)",
        destination: "/futebol/times/:slug/proximos-jogos",
        permanent: true,
      },
      { source: "/futebol/times/:slug/estatisticas-2026", destination: "/futebol/times/:slug/estatisticas", permanent: true },
      // Jogos de futebol: URLs antigas/inventadas -> página de jogos de hoje do futebol.
      { source: "/proximos-jogos", destination: "/jogos-de-hoje/futebol", permanent: true },
      { source: "/jogos-de-futebol/:path*", destination: "/jogos-de-hoje/futebol", permanent: true },
      { source: "/jogos-de-jogos-de-hoje/:path*", destination: "/jogos-de-hoje/futebol", permanent: true },
      // Copa com underscore (link antigo) -> slug com hífen, preservando o resto do path.
      { source: "/futebol/copa_do_mundo/:path*", destination: "/futebol/copa-do-mundo/:path*", permanent: true },
      // Jogos com o slug antigo do CRB ("clube-de-regatas-brasil") -> slug atual "crb",
      // como mandante ou visitante. O destino não contém "clube-de-regatas-brasil" => sem loop.
      {
        source: "/futebol/:champ/jogo/:data/clube-de-regatas-brasil-:rest",
        destination: "/futebol/:champ/jogo/:data/crb-:rest",
        permanent: true,
      },
      {
        source: "/futebol/:champ/jogo/:data/:first-clube-de-regatas-brasil",
        destination: "/futebol/:champ/jogo/:data/:first-crb",
        permanent: true,
      },
      // Municipal: URL antiga de 1 segmento (jogo/{slug}-{hash}, sem data) -> hub. `:old` é um
      // segmento só, então não casa a rota atual jogo/{data}/{slug} (2 segmentos).
      { source: "/sp/santana-de-parnaiba/municipal/jogo/:old", destination: "/sp/santana-de-parnaiba/municipal", permanent: true },

      // Artigos do portal anterior: a URL era /artigos/{slug}.html; hoje o mesmo artigo
      // vive em /{categoria}/{slug}. Tirando o .html cai em /artigos/{slug}, que já faz
      // 308 pra URL canônica por categoria → recupera o SEO das 260 URLs que ainda
      // existem. As 24 apagadas (spam de cassino + ciberseguranca-* duplicado) caem em
      // 404 de propósito. Descoberto na auditoria Screaming Frog de 01/07.
      { source: "/artigos/:slug.html", destination: "/artigos/:slug", permanent: true },

      // Site legado (.htm, 2004–2013): recupera o equity dos backlinks (Wikipedia
      // DR97, portais) que apontam pra páginas antigas hoje em 404. Sem equivalente
      // 1:1 (não há páginas de jogador/jornalista), então 301 pro hub mais relevante:
      // perfis de jogador → /futebol; conteúdo editorial/mídia → /noticias.
      // Quando o conteúdo for recriado, trocar o destino pra URL específica.
      // Páginas de craque recriadas (piloto) — 301 específico ANTES da regra genérica.
      { source: "/vidadecraque/20050410.htm", destination: "/futebol/craque/socrates", permanent: true },
      { source: "/vidadecraque/:path*", destination: "/futebol", permanent: true },
      { source: "/goleiros/:path*", destination: "/futebol", permanent: true },
      { source: "/papodemidia/:path*", destination: "/noticias", permanent: true },
      { source: "/papoespecial/:path*", destination: "/noticias", permanent: true },
      { source: "/24horas/:path*", destination: "/noticias", permanent: true },
      { source: "/20perguntas/:path*", destination: "/noticias", permanent: true },
      { source: "/toquedeclasse/:path*", destination: "/noticias", permanent: true },
      { source: "/chutandodebrito/:path*", destination: "/noticias", permanent: true },
      { source: "/futebolestranho/:path*", destination: "/noticias", permanent: true },
      { source: "/futebolnarede/:path*", destination: "/noticias", permanent: true },
      { source: "/especiais/:path*", destination: "/noticias", permanent: true },
      { source: "/premiobrasileirao2006/:path*", destination: "/noticias", permanent: true },
      { source: "/naturmadoamendoim/:path*", destination: "/noticias", permanent: true },
      { source: "/index.htm", destination: "/", permanent: true },
    ];
  },
};

export default withPayload(nextConfig);
