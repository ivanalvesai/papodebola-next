// Páginas do CMS (collection `pages`) que têm rota DEDICADA no site. Elas NÃO respondem
// em /paginas/{slug} (seria conteúdo duplicado da rota dedicada): a rota genérica faz
// 308 pra URL dedicada e o sitemap não lista /paginas/{slug} desses slugs.
// Slug no CMS -> URL canônica da rota dedicada.
export const DEDICATED_PAGE_ROUTES: Record<string, string> = {
  sobre: "/sobre",
  contato: "/contato",
  parceiros: "/parceiros",
  "politica-de-privacidade": "/politica-de-privacidade",
  "termos-de-uso": "/termos-de-uso",
  apostas: "/apostas", // índice de apostas + SEO da página CMS
  "jogos-de-hoje-futebol": "/jogos-de-hoje/futebol", // blocos dinâmicos
  "santana-de-parnaiba-municipal": "/sp/santana-de-parnaiba/municipal", // rodapé do municipal
};

export function dedicatedPageRoute(slug: string): string | null {
  return Object.prototype.hasOwnProperty.call(DEDICATED_PAGE_ROUTES, slug)
    ? DEDICATED_PAGE_ROUTES[slug]
    : null;
}
