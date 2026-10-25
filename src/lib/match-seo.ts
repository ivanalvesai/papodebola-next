// Título/descrição da página de jogo de campeonato conforme o status: antes do jogo a
// busca é "horário/onde assistir/escalação"; depois, "resultado/lance a lance".
// Status desconhecido (sem detalhe da API) cai no título "ao vivo" de sempre.
type Input = {
  home: string;
  away: string;
  tournamentName: string;
  timestamp: number;
  status: string;
  homeScore?: number | null;
  awayScore?: number | null;
};

export function championshipMatchSeo(f: Input): { title: string; description: string } {
  const vs = `${f.home} x ${f.away}`;
  if (f.status === "notstarted") {
    const date = new Date(f.timestamp * 1000).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      timeZone: "America/Sao_Paulo",
    });
    return {
      title: `${vs}: horário, onde assistir e escalações (${date})`,
      description: `Veja horário, estádio, onde assistir e a provável escalação de ${vs} pelo ${f.tournamentName}.`,
    };
  }
  if (f.status === "finished") {
    const hasScore = f.homeScore != null && f.awayScore != null;
    const line = hasScore ? `${f.home} ${f.homeScore}x${f.awayScore} ${f.away}` : vs;
    return {
      title: `${line}: resultado e lance a lance`,
      description: `Resultado de ${line} pelo ${f.tournamentName}: gols, lance a lance, escalações e estatísticas.`,
    };
  }
  return {
    title: `${vs} ao vivo - ${f.tournamentName}`,
    description: `${vs} pelo ${f.tournamentName}: placar ao vivo, lance a lance, escalações e estatísticas em tempo real (horário de Brasília).`,
  };
}
