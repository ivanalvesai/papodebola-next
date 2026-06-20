const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.papodebola.com.br";

// JSON-LD SportsEvent para as páginas de jogo da Copa. É o dado mais citável de
// um portal de placares (times, data, local, torneio) — habilita rich results.
export function SportsEventSchema({
  home,
  away,
  homeId,
  awayId,
  startTimestamp,
  statusType,
  venue,
  url,
}: {
  home: string;
  away: string;
  homeId: number;
  awayId: number;
  startTimestamp: number;
  statusType?: string; // notstarted | inprogress | finished
  venue?: { stadium: string; city: string; country: string } | null;
  url: string;
}) {
  // schema.org não tem status "ao vivo"/"encerrado" (nem "Completed"); cancelado/
  // adiado têm tipo próprio, o resto fica como EventScheduled.
  const eventStatus =
    statusType === "canceled"
      ? "https://schema.org/EventCancelled"
      : statusType === "postponed"
        ? "https://schema.org/EventPostponed"
        : "https://schema.org/EventScheduled";
  const finished = statusType === "finished";

  const schema = {
    "@context": "https://schema.org",
    "@type": "SportsEvent",
    name: `${home} x ${away}`,
    sport: "Soccer",
    url: `${SITE_URL}${url}`,
    ...(startTimestamp ? { startDate: new Date(startTimestamp * 1000).toISOString() } : {}),
    // endDate só no encerrado (apito + ~2h: 90' + intervalo + acréscimos).
    ...(startTimestamp && finished
      ? { endDate: new Date((startTimestamp + 7200) * 1000).toISOString() }
      : {}),
    eventStatus,
    ...(venue?.stadium
      ? {
          location: {
            "@type": "Place",
            name: venue.stadium,
            ...(venue.city || venue.country
              ? {
                  address: {
                    "@type": "PostalAddress",
                    ...(venue.city ? { addressLocality: venue.city } : {}),
                    ...(venue.country ? { addressCountry: venue.country } : {}),
                  },
                }
              : {}),
          },
        }
      : {}),
    organizer: { "@type": "Organization", name: "FIFA", url: "https://www.fifa.com" },
    superEvent: { "@type": "SportsEvent", name: "Copa do Mundo FIFA 2026" },
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
