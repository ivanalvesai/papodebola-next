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

  // location é OBRIGATÓRIO no SportsEvent (Google marca "Missing field location" como
  // crítico e o item perde o rich result). O feed às vezes não traz o estádio de jogos
  // distantes no crawl → SEMPRE emitimos um location: estádio/cidade real quando houver,
  // senão um fallback por país (nível de país é válido pro Google e some quando o
  // estádio real popula via ISR).
  const hasVenue = !!(venue?.stadium || venue?.city || venue?.country);
  const location = hasVenue
    ? {
        "@type": "Place",
        name: venue!.stadium || venue!.city || venue!.country,
        ...(venue!.city || venue!.country
          ? {
              address: {
                "@type": "PostalAddress",
                ...(venue!.city ? { addressLocality: venue!.city } : {}),
                ...(venue!.country ? { addressCountry: venue!.country } : {}),
              },
            }
          : {}),
      }
    : isCopa
      ? { "@type": "Place", name: "Sede da Copa do Mundo FIFA 2026" }
      : {
          "@type": "Place",
          name: "Brasil",
          address: { "@type": "PostalAddress", addressCountry: "Brazil" },
        };

  // organizer (recomendado): entidade que organiza a competição. FIFA na Copa, CBF nos
  // campeonatos brasileiros, CONMEBOL nas competições continentais. Corrige o aviso
  // "Missing field organizer".
  const organizer = isCopa
    ? { name: "FIFA", url: "https://www.fifa.com" }
    : /libertadores|sudamericana|conmebol/i.test(competition)
      ? { name: "CONMEBOL", url: "https://www.conmebol.com" }
      : /s[eé]rie|brasileir|copa do brasil/i.test(competition)
        ? { name: "CBF", url: "https://www.cbf.com.br" }
        : null;

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
    location,
    // organizer derivado da competição (ver acima). NÃO usar superEvent: o Google o valida
    // como um 2º Event (o torneio inteiro) e acusa "Missing field" em toda página, sem ganho
    // de rich result. O vínculo com o torneio fica no organizer + no name/description do jogo.
    ...(organizer ? { organizer: { "@type": "Organization", ...organizer } } : {}),
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
