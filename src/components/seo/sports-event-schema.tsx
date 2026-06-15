const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.papodebola.com.br";

// JSON-LD SportsEvent para as páginas de jogo da Copa. É o dado mais citável de
// um portal de placares (times, data, status) — habilita rich results de partida.
export function SportsEventSchema({
  home,
  away,
  homeId,
  awayId,
  startTimestamp,
  statusType,
  url,
}: {
  home: string;
  away: string;
  homeId: number;
  awayId: number;
  startTimestamp: number;
  statusType?: string; // notstarted | inprogress | finished
  url: string;
}) {
  // schema.org não tem status "ao vivo"/"encerrado"; cancelado/adiado têm tipo
  // próprio, o resto fica como EventScheduled.
  const eventStatus =
    statusType === "canceled"
      ? "https://schema.org/EventCancelled"
      : statusType === "postponed"
        ? "https://schema.org/EventPostponed"
        : "https://schema.org/EventScheduled";

  const schema = {
    "@context": "https://schema.org",
    "@type": "SportsEvent",
    name: `${home} x ${away}`,
    sport: "Soccer",
    url: `${SITE_URL}${url}`,
    ...(startTimestamp
      ? { startDate: new Date(startTimestamp * 1000).toISOString() }
      : {}),
    eventStatus,
    homeTeam: {
      "@type": "SportsTeam",
      name: home,
      ...(homeId ? { logo: `${SITE_URL}/img/team/${homeId}/image` } : {}),
    },
    awayTeam: {
      "@type": "SportsTeam",
      name: away,
      ...(awayId ? { logo: `${SITE_URL}/img/team/${awayId}/image` } : {}),
    },
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
