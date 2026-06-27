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
  competition = "Copa do Mundo FIFA 2026",
}: {
  home: string;
  away: string;
  homeId: number;
  awayId: number;
  startTimestamp: number;
  statusType?: string; // notstarted | inprogress | finished
  venue?: { stadium: string; city: string; country: string } | null;
  url: string;
  competition?: string;
}) {
  // FIFA/superEvent só fazem sentido na Copa; outros campeonatos usam o nome real.
  const isCopa = competition.toLowerCase().includes("copa do mundo");
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
    description: `${home} x ${away} — ${competition}: escalações, lance a lance, estatísticas e onde assistir ao vivo.`,
    ...(startTimestamp ? { startDate: new Date(startTimestamp * 1000).toISOString() } : {}),
    // endDate estimado (apito + ~2h: 90' + intervalo + acréscimos). Recomendado em
    // todo Event, não só no encerrado — senão o Google acusa "Missing field endDate".
    ...(startTimestamp
      ? { endDate: new Date((startTimestamp + 7200) * 1000).toISOString() }
      : {}),
    eventStatus,
    // location é OBRIGATÓRIO no SportsEvent. Emite com o que tiver (estádio, cidade ou
    // país) — assim não acusa "Missing field location" quando o feed não traz o estádio.
    ...(venue?.stadium || venue?.city || venue?.country
      ? {
          location: {
            "@type": "Place",
            name: venue.stadium || venue.city || venue.country,
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
    // FIFA como organizer só na Copa (senão um jogo de Série B vira "parte da Copa" pro
    // Google). NÃO usar superEvent: o Google o valida como um 2º Event (o torneio inteiro)
    // e acusa "Missing field" (startDate/location/offers/performer...) em TODA página da
    // Copa, sem nenhum ganho de rich result (o card usa o evento do JOGO). O vínculo com
    // o torneio fica no organizer (FIFA) + no name/description do próprio jogo.
    ...(isCopa
      ? { organizer: { "@type": "Organization", name: "FIFA", url: "https://www.fifa.com" } }
      : {}),
    homeTeam: {
      "@type": "SportsTeam",
      name: home,
      ...(homeId ? { logo: `${SITE_URL}/api/team-img/${homeId}` } : {}),
    },
    awayTeam: {
      "@type": "SportsTeam",
      name: away,
      ...(awayId ? { logo: `${SITE_URL}/api/team-img/${awayId}` } : {}),
    },
    // performer: campo que o rich result de Event realmente lê (homeTeam/awayTeam o
    // Google ignora no card). Resolve o "Missing field performer".
    performer: [
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
