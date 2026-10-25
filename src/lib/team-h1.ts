// H1 de cada aba do cluster de time (/futebol/times/{slug}/{aba}). O layout do cluster
// renderiza o H1 e só conhece o pathname — por isso o texto sai daqui.
const BY_TAB: Record<string, (n: string) => string> = {
  "proximos-jogos": (n) => `Próximos jogos do ${n}`,
  "jogo-hoje": (n) => `Jogo do ${n} hoje`,
  "onde-assistir": (n) => `Onde assistir ${n} hoje`,
  escalacao: (n) => `Escalação do ${n}`,
  estatisticas: (n) => `Estatísticas do ${n}`,
};

export function teamTabH1(pathname: string, name: string): string {
  const tab = pathname.replace(/\/+$/, "").split("/")[4] || "";
  return (BY_TAB[tab] || ((n: string) => `${n}: notícias, jogos e classificação`))(name);
}
