const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.papodebola.com.br";

// JSON-LD do TORNEIO (Copa 2026), só na página-hub /futebol/copa-do-mundo. É o lugar
// canônico do dado rico do campeonato — em vez de duplicar nos 72 jogos via superEvent.
// Chaves em inglês (vocabulário schema.org, padrão mundial); textos visíveis em PT.
export function WorldCupTournamentSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "SportsEvent",
    name: "Copa do Mundo FIFA 2026",
    sport: "Soccer",
    url: `${SITE_URL}/futebol/copa-do-mundo`,
    startDate: "2026-06-11",
    endDate: "2026-07-19",
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    inLanguage: "pt-BR",
    image: [`${SITE_URL}/og-image.jpg`],
    description:
      "Copa do Mundo FIFA 2026 nos Estados Unidos, Canadá e México: tabela, classificação dos grupos, jogos, datas, horários e onde assistir.",
    // 3 países-sede (mundial com sede tripla). Country é subtipo de Place — válido em location.
    location: [
      { "@type": "Country", name: "Estados Unidos" },
      { "@type": "Country", name: "Canadá" },
      { "@type": "Country", name: "México" },
    ],
    organizer: { "@type": "Organization", name: "FIFA", url: "https://www.fifa.com" },
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
