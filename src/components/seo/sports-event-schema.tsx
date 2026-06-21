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

  const schema = {
    "@context": "https://schema.org",
    "@type": "SportsEvent",
    name: `${home} x ${away}`,
    sport: "Soccer",
    url: `${SITE_URL}${url}`,
    // image/description: campos recomendados do rich result de Event. O Google só
    // renderiza UMA imagem por evento (não as bandeiras dos 2 times); usamos o OG
    // genérico do site só pra satisfazer o "Missing field image".
    image: [`${SITE_URL}/og-image.jpg`],
    description: `${home} x ${away} pela Copa do Mundo FIFA 2026: escalações, lance a lance, estatísticas e onde assistir ao vivo.`,
    ...(startTimestamp ? { startDate: new Date(startTimestamp * 1000).toISOString() } : {}),
    // endDate estimado (apito + ~2h: 90' + intervalo + acréscimos). Recomendado em
    // todo Event, não só no encerrado — senão o Google acusa "Missing field endDate".
    ...(startTimestamp
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
    // superEvent é validado pelo Google como um Event próprio: precisa de startDate
    // + location, senão o torneio aparece como "2º item inválido" e derruba o rich
    // result da página inteira ("2 items detected: Some are invalid").
    superEvent: {
      "@type": "SportsEvent",
      name: "Copa do Mundo FIFA 2026",
      startDate: "2026-06-11",
      location: { "@type": "Place", name: "Estados Unidos, Canadá e México" },
    },
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
    // performer: campo que o rich result de Event realmente lê (homeTeam/awayTeam o
    // Google ignora no card). Resolve o "Missing field performer".
    performer: [
      {
        "@type": "SportsTeam",
        name: home,
        ...(homeId ? { logo: `${SITE_URL}/img/team/${homeId}/image` } : {}),
      },
      {
        "@type": "SportsTeam",
        name: away,
        ...(awayId ? { logo: `${SITE_URL}/img/team/${awayId}/image` } : {}),
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
