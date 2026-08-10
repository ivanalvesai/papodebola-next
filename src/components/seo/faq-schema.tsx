// JSON-LD FAQPage — alimentado pelo bloco "Perguntas frequentes" do editor.
// Nota: desde 2023 o Google só mostra rich result de FAQ para sites de saúde/governo.
// Mantemos o schema porque ele continua sendo lido por AI Overviews/LLMs e ajuda o
// entendimento da página — não espere estrelinha/sanfona na SERP.
export function FaqSchema({ items }: { items: { question: string; answer: string }[] }) {
  if (!items?.length) return null;
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((it) => ({
      "@type": "Question",
      name: it.question,
      acceptedAnswer: { "@type": "Answer", text: it.answer },
    })),
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.papodebola.com.br";

// ItemList de um ranking editorial (ex.: as casas de apostas do guia). Os itens são
// entidades (Thing), não produtos com nota — de propósito: Review/AggregateRating
// atribuído a casa de aposta tem regra própria do Google e pode ser lido como endosso.
export function RankingSchema({
  items,
  name,
}: {
  items: { name: string; href?: string }[];
  name?: string;
}) {
  if (!items?.length) return null;
  const abs = (u: string) => (u.startsWith("http") ? u : `${SITE_URL}${u}`);
  const schema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    ...(name ? { name } : {}),
    itemListOrder: "https://schema.org/ItemListOrderDescending",
    numberOfItems: items.length,
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "Thing",
        name: it.name,
        // Só link interno vira `url` — link de afiliado não entra no schema.
        ...(it.href && it.href.startsWith("/") ? { url: abs(it.href) } : {}),
      },
    })),
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
