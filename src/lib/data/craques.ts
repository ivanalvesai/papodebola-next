// Perfis de craques históricos — recriação do antigo "Vida de Craque" do Papo de
// Bola (2004–2013), pra recapturar os backlinks (Wikipedia etc.) que apontavam
// pras páginas .htm antigas. Escalável: adicionar uma entrada por craque.

export interface CraqueSecao {
  titulo: string;
  paragrafos: string[];
}

export interface Craque {
  slug: string;
  nome: string;
  nomeCompleto: string;
  apelido?: string;
  posicao: string;
  nascimento: string; // "19 de fevereiro de 1954, Belém (PA)"
  falecimento?: string; // "4 de dezembro de 2011, São Paulo (SP)"
  nacionalidade: string;
  clubes: string[];
  selecao: string;
  resumo: string; // resposta direta de 1–2 frases (featured snippet / IA)
  secoes: CraqueSecao[];
  dadosRapidos: { label: string; valor: string }[];
  // datas ISO pro schema Person
  birthDate?: string;
  deathDate?: string;
  legacyUrl: string; // URL .htm antiga (pro 301)
}

export const CRAQUES: Record<string, Craque> = {
  socrates: {
    slug: "socrates",
    nome: "Sócrates",
    nomeCompleto: "Sócrates Brasileiro Sampaio de Souza Vieira de Oliveira",
    apelido: "Doutor Sócrates",
    posicao: "Meia",
    nascimento: "19 de fevereiro de 1954, em Belém (PA)",
    falecimento: "4 de dezembro de 2011, em São Paulo (SP)",
    nacionalidade: "Brasil",
    clubes: ["Botafogo-SP", "Corinthians", "Fiorentina (Itália)", "Flamengo", "Santos"],
    selecao: "Seleção Brasileira (Copas do Mundo de 1982 e 1986)",
    resumo:
      "Sócrates foi um meia da Seleção Brasileira, capitão do time de 1982 e ídolo do Corinthians, onde liderou a Democracia Corinthiana. Médico de formação, ficou conhecido como 'Doutor Sócrates' e é lembrado como um dos jogadores mais inteligentes e influentes da história do futebol brasileiro.",
    birthDate: "1954-02-19",
    deathDate: "2011-12-04",
    legacyUrl: "/vidadecraque/20050410.htm",
    secoes: [
      {
        titulo: "Quem foi Sócrates",
        paragrafos: [
          "Sócrates Brasileiro Sampaio de Souza Vieira de Oliveira foi um dos meias mais admirados da história do futebol brasileiro. Alto, elegante e dono de uma visão de jogo privilegiada, ficou eternizado pelo passe de calcanhar — sua marca registrada — e pela liderança dentro e fora de campo.",
          "Formado em Medicina, conciliou os estudos com o futebol no início da carreira, o que lhe rendeu o apelido de 'Doutor Sócrates'. Intelectual e politicamente atuante, tornou-se um símbolo de inteligência e consciência social no esporte.",
        ],
      },
      {
        titulo: "Corinthians e a Democracia Corinthiana",
        paragrafos: [
          "É no Corinthians que Sócrates se torna ídolo. Como capitão, liderou no início dos anos 1980 a Democracia Corinthiana, movimento em que jogadores e funcionários decidiam em conjunto os rumos do clube — das contratações aos detalhes do dia a dia.",
          "Em plena ditadura militar, o movimento ganhou contornos políticos e virou símbolo de resistência e liberdade, com a palavra 'Democracia' estampada nas camisas do time. Sócrates foi seu maior porta-voz.",
        ],
      },
      {
        titulo: "Seleção Brasileira (1982 e 1986)",
        paragrafos: [
          "Sócrates foi o capitão da Seleção Brasileira na Copa do Mundo de 1982, considerada uma das equipes mais encantadoras a não vencer o torneio. Ao lado de Zico, Falcão e Cerezo, formou um meio-campo lembrado até hoje pela qualidade técnica.",
          "Disputou também a Copa de 1986, no México. Pela Seleção, é lembrado mais pela elegância e influência no jogo do que por títulos.",
        ],
      },
      {
        titulo: "Carreira em clubes",
        paragrafos: [
          "Revelado pelo Botafogo de Ribeirão Preto, brilhou no Corinthians antes de se transferir para a Fiorentina, da Itália. De volta ao Brasil, defendeu ainda Flamengo e Santos.",
          "Em todos os clubes, manteve o estilo inconfundível: cadência, passes precisos e a capacidade de organizar o time como poucos.",
        ],
      },
      {
        titulo: "Fora dos gramados e legado",
        paragrafos: [
          "Após pendurar as chuteiras, Sócrates atuou como médico, escritor e comentarista esportivo, sempre com posicionamentos políticos e sociais marcantes. É irmão de Raí, campeão do mundo em 1994.",
          "Faleceu em 4 de dezembro de 2011, aos 57 anos. Permanece como referência de futebol-arte, liderança e cidadania — um craque que extrapolou as quatro linhas.",
        ],
      },
    ],
    dadosRapidos: [
      { label: "Nome completo", valor: "Sócrates Brasileiro Sampaio de Souza Vieira de Oliveira" },
      { label: "Posição", valor: "Meia" },
      { label: "Nascimento", valor: "19/02/1954, Belém (PA)" },
      { label: "Falecimento", valor: "04/12/2011, São Paulo (SP)" },
      { label: "Principais clubes", valor: "Corinthians, Fiorentina, Flamengo, Santos" },
      { label: "Seleção", valor: "Copas de 1982 e 1986 (capitão em 82)" },
    ],
  },
};

export function getCraque(slug: string): Craque | null {
  return CRAQUES[slug] || null;
}
