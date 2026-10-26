import type { MetadataRoute } from "next";

const BASE = process.env.NEXT_PUBLIC_SITE_URL || "https://www.papodebola.com.br";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        // Escudos/fotos ficam rastreáveis (regra mais longa vence o Disallow /api/) pra o
        // Google ler o X-Robots-Tag: noindex do next.config e desindexar essas URLs.
        allow: ["/", "/api/team-img/", "/api/player-img/"],
        // "/*_rsc=" bloqueia os requests internos de RSC/prefetch do Next (?_rsc=... e
        // &_rsc=...). Não são páginas — o Google já os ignora, mas o bloqueio evita que
        // crawlers/ferramentas (ex: Screaming Frog) desperdicem budget: numa auditoria de
        // 01/07, 95% das ~85k URLs rastreadas eram só variações de _rsc. Não afeta
        // indexação (o HTML real das páginas não tem _rsc).
        // "/parceiro/" são redirects de saída pra patrocinadores (link rastreado); não são
        // páginas indexáveis e não devem passar autoridade pro site do parceiro (par com o
        // rel="sponsored" dos links). Bloquear evita que o Google siga o redirect.
        disallow: ["/painel-pdb-9x/", "/admin/", "/api/", "/parceiro/", "/*_rsc="],
      },
    ],
    sitemap: [`${BASE}/sitemap.xml`, `${BASE}/news-sitemap.xml`],
  };
}
