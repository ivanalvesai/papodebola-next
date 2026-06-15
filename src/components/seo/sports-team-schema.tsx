const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.papodebola.com.br";

// JSON-LD SportsTeam para os hubs de time (cluster SEO). Sinal de entidade pro
// Google/IA num dos maiores ativos de SEO do site (37 times × 6 páginas).
export function SportsTeamSchema({
  name,
  teamId,
  slug,
}: {
  name: string;
  teamId: number;
  slug: string;
}) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "SportsTeam",
    name,
    sport: "Soccer",
    url: `${SITE_URL}/futebol/times/${slug}`,
    logo: `${SITE_URL}/img/team/${teamId}/image`,
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
