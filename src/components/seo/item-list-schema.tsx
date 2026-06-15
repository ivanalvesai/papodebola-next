const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.papodebola.com.br";

// JSON-LD ItemList para páginas de listagem (notícias, jogos, etc.) — ajuda o
// Google a entender a ordem/itens da lista (e habilita listas enriquecidas).
export function ItemListSchema({
  items,
}: {
  items: { url: string; name?: string }[];
}) {
  if (items.length === 0) return null;
  const schema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: it.url.startsWith("http") ? it.url : `${SITE_URL}${it.url}`,
      ...(it.name ? { name: it.name } : {}),
    })),
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
