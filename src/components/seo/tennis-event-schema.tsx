const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.papodebola.com.br";

// JSON-LD SportsEvent pra páginas de jogo de tênis (chave de ATP/WTA). Habilita
// rich results de partida (data, local, atletas, torneio).
export function TennisEventSchema({
  home,
  away,
  homeId,
  awayId,
  startTimestamp,
  statusType,
  venue,
  tournamentName,
  url,
}: {
  home: string;
  away: string;
  homeId: number;
  awayId: number;
  startTimestamp: number;
  statusType?: string; // notstarted | inprogress | finished
  venue?: { stadium: string; city: string; country: string } | null;
  tournamentName: string;
  url: string;
}) {
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
    sport: "Tennis",
    description: `${home} x ${away} — ${tournamentName}: placar ao vivo, sets, games e estatísticas em tempo real.`,
    url: `${SITE_URL}${url}`,
    ...(startTimestamp ? { startDate: new Date(startTimestamp * 1000).toISOString() } : {}),
    // tênis raramente passa de 4h; usamos 4h como fim aproximado no encerrado.
    ...(startTimestamp && finished
      ? { endDate: new Date((startTimestamp + 14400) * 1000).toISOString() }
      : {}),
    eventStatus,
    ...(venue?.stadium || venue?.city
      ? {
          location: {
            "@type": "Place",
            name: venue.stadium || venue.city,
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
    organizer: { "@type": "Organization", name: "ATP Tour", url: "https://www.atptour.com" },
    // Sem superEvent: o Google o valida como um 2º Event e acusa "Missing field"
    // (startDate/location...) sem ganho de rich result. O torneio fica no organizer + name.
    competitor: [
      {
        "@type": "SportsTeam",
        name: home,
        ...(homeId ? { logo: `${SITE_URL}/api/team-img/${homeId}` } : {}),
      },
      {
        "@type": "SportsTeam",
        name: away,
        ...(awayId ? { logo: `${SITE_URL}/api/team-img/${awayId}` } : {}),
      },
    ],
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
