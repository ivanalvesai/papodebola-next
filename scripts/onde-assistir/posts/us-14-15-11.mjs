// Guias de NBA (sáb 14/11) e NFL (dom 15/11). Canais: 2 fontes por jogo (O Tempo + Overdrive
// na NBA; 365Scores + Lance/Sportune na NFL). Cowboys x 49ers ficou de fora: canal em 1 fonte só.
// Campanhas, tabela e resultados: API (facts.json, puxado em 14/11 13h20).
import { readFileSync } from "node:fs";
import { usPost, SAB14, DOM15, B, P, LK } from "../template-us.mjs";

const F = JSON.parse(readFileSync(process.env.OA_FACTS, "utf8"));
const group = (k, name) => F[k].find((g) => g.name === name).rows;
const slice = (k, name, a, b) => group(k, name).filter((r) => r.pos >= a && r.pos <= b);

const LP = "NBA League Pass";
const nbaAssistir = (extra) => [
  extra ||
    `O jogo não tem transmissão na TV brasileira. Ele passa só no ${LP}, o serviço de streaming da própria NBA, que exige assinatura e funciona no site, no aplicativo e em smart TVs.`,
  "As grades das emissoras podem mudar até a hora do jogo; vale conferir a programação antes de começar.",
];
const nflAssistir = (tv) => [
  `${tv} Todos os jogos da temporada também estão no NFL Game Pass, disponível no Brasil pela DAZN, com assinatura.`,
  "As grades das emissoras podem mudar até a hora do jogo; vale conferir a programação antes do kickoff.",
];
const linksNba = (pagina) => ["Veja a tabela completa e os próximos jogos na ", LK("página da NBA", "/nba"), ". Confira também os ", LK("outros guias de onde assistir", "/onde-assistir"), " e os ", LK("jogos de hoje", "/jogos-de-hoje"), pagina ? pagina : "", "."];
const linksNfl = ["Veja a classificação e os próximos jogos na ", LK("página de futebol americano", "/futebol-americano"), ". Confira também os ", LK("outros guias de onde assistir", "/onde-assistir"), " e os ", LK("jogos de hoje", "/jogos-de-hoje"), "."];

const NBA = { liga: "nba", data: SAB14 };
const NFL = { liga: "nfl", data: DOM15 };

export const posts = [
  // ===================== NBA, sábado 14/11 =====================
  {
    ...NBA, at: "2026-11-14T14:30:00-03:00", authorId: 2, matchId: 16824867, homeId: 5539, awayId: 3417,
    A: "Pelicans", Bn: "Nuggets", hora: "21h", canal: LP, canalLongo: `${LP} (streaming, por assinatura)`, canalCapa: "NBA LEAGUE PASS", canalCapaAlt: "no NBA League Pass",
    localCurto: "Smoothie King Center, em Nova Orleans",
    ondeFrase: "no Smoothie King Center, em Nova Orleans (Louisiana), com capacidade para 16.867 torcedores",
    lead: P("O ", B("New Orleans Pelicans"), " recebe o ", B("Denver Nuggets"), " neste sábado (14/11), às ", B("21h (de Brasília)"), ", no Smoothie King Center, pela temporada regular da NBA. O jogo tem transmissão do ", B(LP), ", por assinatura."),
    comoChegam: [
      "Os Pelicans vivem a pior fase da temporada: são cinco derrotas seguidas, quatro delas por mais de 15 pontos. Na sexta-feira (13), perderam em casa para o Memphis Grizzlies por 142 a 111, e na quarta (11) já tinham levado 145 a 111 do Brooklyn Nets. Com 4 vitórias e 9 derrotas, o time é o 12º do Oeste.",
      "O time ainda entra em quadra na segunda noite seguida, sem descanso depois do jogo de sexta.",
      "Os Nuggets chegam descansados e em melhor momento. Na quarta (11), venceram o Grizzlies em Memphis por 123 a 118. Com 6 vitórias e 4 derrotas, Denver é o 9º do Oeste, com menos jogos disputados que a maioria dos rivais.",
    ],
    cardRows: [
      ["Pelicans", "4 V e 9 D · 12º do Oeste"],
      ["Nuggets", "6 V e 4 D · 9º do Oeste"],
      ["Último jogo dos Pelicans", "Pelicans 111 x 142 Grizzlies (13/11)"],
      ["Último jogo dos Nuggets", "Grizzlies 118 x 123 Nuggets (11/11)"],
    ],
    tabelaTitulo: "Classificação da Conferência Oeste",
    tabela: slice("st132", "Western Conference", 6, 15),
    tabelaNota: "Do 7º ao 10º lugar, os times disputam o play-in; os seis primeiros vão direto aos playoffs.",
    emJogo: [
      "Para os Pelicans, é a chance de interromper a sequência negativa antes que a distância para a zona do play-in aumente. O 10º colocado, o Dallas Mavericks, tem 7 vitórias, três a mais.",
      "Para os Nuggets, uma vitória fora de casa aproxima o time do grupo que briga pelas seis primeiras vagas do Oeste.",
    ],
    comoAssistir: nbaAssistir(),
    links: linksNba(),
    faqCanal: `A partida passa no ${LP}, serviço de streaming da NBA, por assinatura. Não há transmissão na TV aberta ou fechada.`,
    faqExtra: [["Como estão Pelicans e Nuggets na temporada?", "Os Pelicans têm 4 vitórias e 9 derrotas (12º do Oeste) e perderam os últimos cinco jogos. Os Nuggets têm 6 vitórias e 4 derrotas (9º do Oeste)."]],
    excerpt: "Pelicans e Nuggets se enfrentam às 21h deste sábado (14/11), em Nova Orleans. Veja onde assistir ao jogo da NBA e como chegam os dois times.",
    metaDescription: "Saiba onde assistir a Pelicans x Nuggets neste sábado (14/11), às 21h, pela NBA. Transmissão no NBA League Pass, campanha dos times e classificação do Oeste.",
  },
  {
    ...NBA, at: "2026-11-14T15:30:00-03:00", authorId: 1, matchId: 16824865, homeId: 3432, awayId: 3411,
    A: "Cavaliers", Bn: "Mavericks", hora: "21h30", canal: LP, canalLongo: `${LP} (streaming, por assinatura)`, canalCapa: "NBA LEAGUE PASS", canalCapaAlt: "no NBA League Pass",
    localCurto: "Rocket Arena, em Cleveland",
    ondeFrase: "na Rocket Arena, em Cleveland (Ohio), com capacidade para 19.432 torcedores",
    lead: P("O ", B("Cleveland Cavaliers"), " recebe o ", B("Dallas Mavericks"), " neste sábado (14/11), às ", B("21h30 (de Brasília)"), ", na Rocket Arena, pela temporada regular da NBA. A transmissão é do ", B(LP), ", por assinatura."),
    comoChegam: [
      "Os Cavaliers oscilam no começo da temporada. Na sexta-feira (13), perderam para o Miami Heat por 133 a 121, em Miami, e voltam a jogar na noite seguinte, já em casa. Na quarta (11), tinham vencido o New York Knicks por 115 a 107. Com 6 vitórias e 7 derrotas, Cleveland é o 7º do Leste.",
      "Os Mavericks vêm de uma derrota pesada: na quinta (12), levaram 133 a 94 do Minnesota Timberwolves. Antes disso, tinham ganhado três seguidas, contra Jazz, Nets e Pacers. Com 7 vitórias e 5 derrotas, Dallas é o 10º do Oeste.",
    ],
    cardRows: [
      ["Cavaliers", "6 V e 7 D · 7º do Leste"],
      ["Mavericks", "7 V e 5 D · 10º do Oeste"],
      ["Último jogo dos Cavaliers", "Heat 133 x 121 Cavaliers (13/11)"],
      ["Último jogo dos Mavericks", "Timberwolves 133 x 94 Mavericks (12/11)"],
    ],
    tabelaTitulo: "Classificação da Conferência Leste",
    tabela: slice("st132", "Eastern Conference", 1, 10),
    tabelaNota: "No Oeste, os Mavericks são o 10º, com 7 vitórias e 5 derrotas, a última posição do play-in.",
    emJogo: [
      "Como o jogo é entre conferências diferentes, o resultado não muda a disputa direta de nenhum dos dois, mas pesa na campanha. Os Cavaliers tentam equilibrar a campanha e se aproximar do Atlanta Hawks, 4º do Leste, com 7 vitórias.",
      "Os Mavericks buscam reagir depois da derrota por 39 pontos e se afastar da zona de fora do play-in.",
    ],
    comoAssistir: nbaAssistir(),
    links: linksNba(),
    faqCanal: `A partida passa no ${LP}, serviço de streaming da NBA, por assinatura. Não há transmissão na TV aberta ou fechada.`,
    faqExtra: [["Como estão Cavaliers e Mavericks na temporada?", "Os Cavaliers têm 6 vitórias e 7 derrotas (7º do Leste). Os Mavericks têm 7 vitórias e 5 derrotas (10º do Oeste)."]],
    excerpt: "Cavaliers e Mavericks se enfrentam às 21h30 deste sábado (14/11), em Cleveland. Veja onde assistir ao jogo da NBA e como chegam os dois times.",
    metaDescription: "Saiba onde assistir a Cavaliers x Mavericks neste sábado (14/11), às 21h30, pela NBA. Transmissão no NBA League Pass, campanha e classificação.",
  },
  {
    ...NBA, at: "2026-11-14T16:30:00-03:00", authorId: 2, matchId: 16824869, homeId: 3435, awayId: 3424,
    A: "Heat", Bn: "Pistons", hora: "22h", canal: "ESPN 2, Disney+ e NBA League Pass", canalLongo: `ESPN 2 (TV fechada), Disney+ Premium e ${LP} (streaming)`, canalCapa: "ESPN 2 E DISNEY+", canalCapaAlt: "na ESPN 2 e no Disney+",
    title: "Heat x Pistons: onde assistir e horário do jogo da NBA na ESPN",
    localCurto: "Kaseya Center, em Miami",
    ondeFrase: "no Kaseya Center, em Miami (Flórida), com capacidade para 19.600 torcedores",
    lead: P("O ", B("Miami Heat"), " recebe o ", B("Detroit Pistons"), " neste sábado (14/11), às ", B("22h (de Brasília)"), ", no Kaseya Center. É o destaque da rodada da NBA na TV brasileira, com transmissão da ", B("ESPN 2"), " e do ", B("Disney+ Premium"), ", além do ", B(LP), "."),
    comoChegam: [
      "Os Pistons estão entre os melhores do Leste: com 8 vitórias e 3 derrotas, são o 3º da conferência e lideram a Divisão Central. Vêm de duas vitórias sobre o Washington Wizards, a última por 144 a 140, na quinta (12), depois de duas prorrogações.",
      "O Heat ganhou os três últimos jogos: Kings, Jazz e, na sexta-feira (13), o Cleveland Cavaliers, por 133 a 121, em casa. Com 6 vitórias e 6 derrotas, Miami é o 6º do Leste e joga pela segunda noite seguida.",
    ],
    cardRows: [
      ["Heat", "6 V e 6 D · 6º do Leste"],
      ["Pistons", "8 V e 3 D · 3º do Leste"],
      ["Sequência do Heat", "3 vitórias seguidas"],
      ["Último jogo dos Pistons", "Wizards 140 x 144 Pistons (12/11, 2 prorrogações)"],
    ],
    tabelaTitulo: "Classificação da Conferência Leste",
    tabela: slice("st132", "Eastern Conference", 1, 10),
    emJogo: [
      "É um confronto direto do Leste. Com uma vitória, o Heat chega a quatro jogos seguidos sem perder e encosta no grupo de cima; os Pistons querem manter a distância para o 4º colocado e seguir perto de Celtics e 76ers.",
    ],
    comoAssistir: nbaAssistir(`Na TV fechada, o jogo passa na ESPN 2. No streaming, está no Disney+ Premium e no ${LP}, que exige assinatura própria.`),
    links: linksNba(),
    faqCanal: `A partida tem transmissão da ESPN 2, na TV fechada, e do Disney+ Premium e do ${LP}, no streaming, às 22h de Brasília.`,
    faqExtra: [["Como estão Heat e Pistons na temporada?", "O Heat tem 6 vitórias e 6 derrotas (6º do Leste) e vem de três vitórias. Os Pistons têm 8 vitórias e 3 derrotas (3º do Leste) e lideram a Divisão Central."]],
    excerpt: "Heat e Pistons se enfrentam às 22h deste sábado (14/11), em Miami, com transmissão da ESPN 2 e do Disney+. Veja como chegam os dois times.",
    metaDescription: "Saiba onde assistir a Heat x Pistons neste sábado (14/11), às 22h, pela NBA. Transmissão da ESPN 2, Disney+ e NBA League Pass, campanha e classificação.",
  },
  {
    ...NBA, at: "2026-11-14T17:00:00-03:00", authorId: 1, matchId: 16824871, homeId: 3426, awayId: 3409,
    A: "Timberwolves", Bn: "Bulls", hora: "22h", canal: LP, canalLongo: `${LP} (streaming, por assinatura)`, canalCapa: "NBA LEAGUE PASS", canalCapaAlt: "no NBA League Pass",
    localCurto: "Target Center, em Minneapolis",
    ondeFrase: "no Target Center, em Minneapolis (Minnesota), com capacidade para 19.356 torcedores",
    lead: P("O ", B("Minnesota Timberwolves"), " recebe o ", B("Chicago Bulls"), " neste sábado (14/11), às ", B("22h (de Brasília)"), ", no Target Center, pela temporada regular da NBA. O jogo passa no ", B(LP), ", por assinatura."),
    comoChegam: [
      "Os Timberwolves estão embalados: são cinco vitórias seguidas, a última por 133 a 94 sobre o Dallas Mavericks, na quinta (12). Com 9 vitórias e 3 derrotas, Minnesota é o 5º do Oeste, colado no Portland Trail Blazers, que tem a mesma campanha.",
      "Os Bulls começaram mal a temporada, com 2 vitórias e 9 derrotas, e são o 14º do Leste. Na sexta-feira (13), venceram o Atlanta Hawks por 125 a 117 e encerraram uma série de cinco derrotas. O time joga pela segunda noite seguida.",
    ],
    cardRows: [
      ["Timberwolves", "9 V e 3 D · 5º do Oeste"],
      ["Bulls", "2 V e 9 D · 14º do Leste"],
      ["Sequência dos Timberwolves", "5 vitórias seguidas"],
      ["Último jogo dos Bulls", "Bulls 125 x 117 Hawks (13/11)"],
    ],
    tabelaTitulo: "Classificação da Conferência Oeste",
    tabela: slice("st132", "Western Conference", 1, 10),
    tabelaNota: "No Leste, os Bulls são o 14º, com 2 vitórias e 9 derrotas, à frente apenas do Milwaukee Bucks.",
    emJogo: [
      "Os Timberwolves podem chegar a seis vitórias seguidas e seguem na briga pelas primeiras posições do Oeste, onde Spurs e Lakers lideram com 11 vitórias.",
      "Os Bulls tentam emendar a segunda vitória seguida, agora fora de casa, contra um dos melhores times do Oeste.",
    ],
    comoAssistir: nbaAssistir(),
    links: linksNba(),
    faqCanal: `A partida passa no ${LP}, serviço de streaming da NBA, por assinatura. Não há transmissão na TV aberta ou fechada.`,
    faqExtra: [["Como estão Timberwolves e Bulls na temporada?", "Os Timberwolves têm 9 vitórias e 3 derrotas (5º do Oeste) e vêm de cinco vitórias. Os Bulls têm 2 vitórias e 9 derrotas (14º do Leste)."]],
    excerpt: "Timberwolves e Bulls se enfrentam às 22h deste sábado (14/11), em Minneapolis. Veja onde assistir ao jogo da NBA e como chegam os dois times.",
    metaDescription: "Saiba onde assistir a Timberwolves x Bulls neste sábado (14/11), às 22h, pela NBA. Transmissão no NBA League Pass, campanha e classificação.",
  },
  {
    ...NBA, at: "2026-11-14T17:30:00-03:00", authorId: 2, matchId: 16824870, homeId: 3415, awayId: 3436,
    A: "Grizzlies", Bn: "Nets", hora: "22h", canal: LP, canalLongo: `${LP} (streaming, por assinatura)`, canalCapa: "NBA LEAGUE PASS", canalCapaAlt: "no NBA League Pass",
    localCurto: "FedExForum, em Memphis",
    ondeFrase: "no FedExForum, em Memphis (Tennessee), com capacidade para 19.000 torcedores",
    lead: P("O ", B("Memphis Grizzlies"), " recebe o ", B("Brooklyn Nets"), " neste sábado (14/11), às ", B("22h (de Brasília)"), ", no FedExForum, pela temporada regular da NBA. A transmissão é do ", B(LP), ", por assinatura."),
    comoChegam: [
      "Os Grizzlies vêm de uma vitória larga: na sexta-feira (13), bateram o New Orleans Pelicans por 142 a 111, fora de casa, e voltam a jogar na noite seguinte, agora em Memphis. Com 8 vitórias e 4 derrotas, o time é o 6º do Oeste.",
      "Os Nets têm 3 vitórias e 8 derrotas e são o 13º do Leste. No último jogo, venceram com folga: 145 a 111 sobre os Pelicans, em Nova Orleans, na quarta (11).",
    ],
    cardRows: [
      ["Grizzlies", "8 V e 4 D · 6º do Oeste"],
      ["Nets", "3 V e 8 D · 13º do Leste"],
      ["Último jogo dos Grizzlies", "Pelicans 111 x 142 Grizzlies (13/11)"],
      ["Último jogo dos Nets", "Pelicans 111 x 145 Nets (11/11)"],
    ],
    tabelaTitulo: "Classificação da Conferência Oeste",
    tabela: slice("st132", "Western Conference", 1, 10),
    tabelaNota: "No Leste, os Nets são o 13º, com 3 vitórias e 8 derrotas.",
    emJogo: [
      "Para os Grizzlies, vencer em casa mantém o time entre os seis primeiros do Oeste, que vão direto aos playoffs. Golden State e Oklahoma City, logo atrás, têm 8 vitórias e 5 derrotas.",
      "Os Nets chegam descansados, sem jogo desde quarta, e tentam ganhar a segunda seguida.",
    ],
    comoAssistir: nbaAssistir(),
    links: linksNba(),
    faqCanal: `A partida passa no ${LP}, serviço de streaming da NBA, por assinatura. Não há transmissão na TV aberta ou fechada.`,
    faqExtra: [["Como estão Grizzlies e Nets na temporada?", "Os Grizzlies têm 8 vitórias e 4 derrotas (6º do Oeste). Os Nets têm 3 vitórias e 8 derrotas (13º do Leste)."]],
    excerpt: "Grizzlies e Nets se enfrentam às 22h deste sábado (14/11), em Memphis. Veja onde assistir ao jogo da NBA e como chegam os dois times.",
    metaDescription: "Saiba onde assistir a Grizzlies x Nets neste sábado (14/11), às 22h, pela NBA. Transmissão no NBA League Pass, campanha e classificação do Oeste.",
  },

  // ===================== NFL, domingo 15/11 (semana 10) =====================
  {
    ...NFL, at: "2026-11-14T19:00:00-03:00", authorId: 1, matchId: 16175305, homeId: 4419, awayId: 4424,
    A: "Lions", Bn: "Patriots", hora: "11h30", canal: "SporTV 4, ge tv e NFL Game Pass", canalLongo: "SporTV 4 (TV fechada), ge tv (YouTube, grátis) e NFL Game Pass (DAZN)", canalCapa: "SPORTV 4 E GE TV", canalCapaAlt: "no SporTV 4 e no ge tv",
    title: "Lions x Patriots em Munique: onde assistir e horário do jogo da NFL",
    localCurto: "Allianz Arena, em Munique (Alemanha)",
    ondeFrase: "na Allianz Arena, em Munique, na Alemanha, pela série de jogos internacionais da NFL",
    lead: P("O ", B("Detroit Lions"), " e o ", B("New England Patriots"), " se enfrentam neste domingo (15/11), às ", B("11h30 (de Brasília)"), ", na ", B("Allianz Arena, em Munique"), ", pela semana 10 da NFL. O jogo tem transmissão do ", B("SporTV 4"), " e do ", B("ge tv"), ", além do NFL Game Pass."),
    comoChegam: [
      "Os Lions vêm de quatro vitórias seguidas: 45 a 21 no Arizona Cardinals, 20 a 17 no Green Bay Packers, 19 a 15 no Minnesota Vikings e, no domingo passado (8), 19 a 9 no Miami Dolphins, fora de casa. Com 6 vitórias e 2 derrotas, Detroit é o 2º da Divisão Norte da NFC.",
      "Os Patriots têm 5 vitórias e 4 derrotas e são o 2º da Divisão Leste da AFC, atrás do Buffalo Bills. Na última rodada, perderam em casa para os Packers por 45 a 27, uma semana depois de vencer os Dolphins por 24 a 19.",
    ],
    cardRows: [
      ["Lions", "6 V e 2 D · 2º da NFC Norte"],
      ["Patriots", "5 V e 4 D · 2º da AFC Leste"],
      ["Sequência dos Lions", "4 vitórias seguidas"],
      ["Último jogo dos Patriots", "Patriots 27 x 45 Packers (8/11)"],
    ],
    tabelaTitulo: "Classificação da Divisão Norte da NFC",
    tabela: group("st9464", "NFC North"),
    tabelaNota: "Os Patriots são o 2º da Divisão Leste da AFC (5 V e 4 D), atrás do Buffalo Bills (7 V e 1 D).",
    emJogo: [
      "A Divisão Norte da NFC é a mais apertada da liga: os quatro times estão separados por uma vitória. O Chicago Bears, líder com 7 vitórias, folga nesta semana, e os Lions podem empatar com ele no número de vitórias.",
      "Para os Patriots, o jogo vale a manutenção na zona de classificação da AFC: o time é o 7º da conferência, a última vaga para os playoffs.",
    ],
    comoAssistir: nflAssistir("Na TV fechada, o jogo passa no SporTV 4. Na internet, o ge tv transmite de graça no YouTube."),
    links: linksNfl,
    faqCanal: "A partida tem transmissão do SporTV 4, na TV fechada, do ge tv, de graça no YouTube, e do NFL Game Pass, na DAZN, às 11h30 de Brasília.",
    faqExtra: [["Por que Lions x Patriots é na Alemanha?", "O jogo faz parte da série internacional da NFL, que leva partidas da temporada regular para fora dos Estados Unidos. Por isso começa às 11h30 de Brasília, bem mais cedo que os outros jogos de domingo."]],
    excerpt: "Lions e Patriots jogam às 11h30 deste domingo (15/11), em Munique, pela NFL. Veja onde assistir no SporTV 4 e no ge tv e como chegam os times.",
    metaDescription: "Saiba onde assistir a Lions x Patriots neste domingo (15/11), às 11h30, em Munique. Transmissão do SporTV 4, ge tv e NFL Game Pass e a situação na tabela.",
  },
  {
    ...NFL, at: "2026-11-14T20:00:00-03:00", authorId: 2, matchId: 16184636, homeId: 4393, awayId: 4422,
    A: "Falcons", Bn: "Chiefs", hora: "15h", canal: "ESPN 2, Disney+ e NFL Game Pass", canalLongo: "ESPN 2 (TV fechada), Disney+ e NFL Game Pass (DAZN)", canalCapa: "ESPN 2 E DISNEY+", canalCapaAlt: "na ESPN 2 e no Disney+",
    localCurto: "Mercedes-Benz Stadium, em Atlanta",
    ondeFrase: "no Mercedes-Benz Stadium, em Atlanta (Geórgia), com capacidade para 71 mil torcedores",
    lead: P("O ", B("Atlanta Falcons"), " recebe o ", B("Kansas City Chiefs"), " neste domingo (15/11), às ", B("15h (de Brasília)"), ", no Mercedes-Benz Stadium, pela semana 10 da NFL. A transmissão é da ", B("ESPN 2"), " e do ", B("Disney+"), ", além do NFL Game Pass."),
    comoChegam: [
      "Os Chiefs têm 6 vitórias e 2 derrotas e são o 2º da Divisão Oeste da AFC, uma vitória atrás do Denver Broncos. No domingo passado (8), bateram o New York Jets por 35 a 12, em casa, depois de duas derrotas seguidas, para Seahawks e Broncos.",
      "Os Falcons vivem fase ruim: perderam as duas últimas, por 16 a 0 para o Tampa Bay Buccaneers e por 34 a 17 para o Cincinnati Bengals. Com 3 vitórias e 6 derrotas, o time é o último da Divisão Sul da NFC, embora os quatro times da chave estejam com 3 vitórias.",
    ],
    cardRows: [
      ["Falcons", "3 V e 6 D · 4º da NFC Sul"],
      ["Chiefs", "6 V e 2 D · 2º da AFC Oeste"],
      ["Último jogo dos Falcons", "Falcons 17 x 34 Bengals (8/11)"],
      ["Último jogo dos Chiefs", "Chiefs 35 x 12 Jets (8/11)"],
    ],
    tabelaTitulo: "Classificação da Divisão Oeste da AFC",
    tabela: group("st9464", "AFC West"),
    tabelaNota: "Na Divisão Sul da NFC, os quatro times têm 3 vitórias: Panthers e Saints (3-5) estão à frente de Buccaneers e Falcons (3-6).",
    emJogo: [
      "Para os Chiefs, vencer fora de casa mantém a pressão sobre os Broncos na briga pela liderança da divisão e pelas primeiras vagas da AFC.",
      "Para os Falcons, apesar da campanha negativa, a divisão segue aberta: uma vitória pode colocar o time de volta na disputa pela liderança da NFC Sul.",
    ],
    comoAssistir: nflAssistir("Na TV fechada, o jogo passa na ESPN 2. No streaming, está no Disney+."),
    links: linksNfl,
    faqCanal: "A partida tem transmissão da ESPN 2, na TV fechada, do Disney+ e do NFL Game Pass, na DAZN, às 15h de Brasília.",
    faqExtra: [["Como estão Falcons e Chiefs na temporada?", "Os Falcons têm 3 vitórias e 6 derrotas e são o 4º da NFC Sul. Os Chiefs têm 6 vitórias e 2 derrotas e são o 2º da AFC Oeste."]],
    excerpt: "Falcons e Chiefs se enfrentam às 15h deste domingo (15/11), em Atlanta, pela NFL. Veja onde assistir na ESPN 2 e no Disney+ e como chegam os times.",
    metaDescription: "Saiba onde assistir a Falcons x Chiefs neste domingo (15/11), às 15h, pela semana 10 da NFL. Transmissão da ESPN 2, Disney+ e NFL Game Pass e classificação.",
  },
  {
    ...NFL, at: "2026-11-14T21:00:00-03:00", authorId: 1, matchId: 16184638, homeId: 4420, awayId: 4423,
    A: "Packers", Bn: "Vikings", hora: "15h", canal: "SporTV 4 e NFL Game Pass", canalLongo: "SporTV 4 (TV fechada) e NFL Game Pass (DAZN)", canalCapa: "SPORTV 4", canalCapaAlt: "no SporTV 4",
    localCurto: "Lambeau Field, em Green Bay",
    ondeFrase: "no Lambeau Field, em Green Bay (Wisconsin), com capacidade para 81.441 torcedores",
    lead: P("O ", B("Green Bay Packers"), " recebe o ", B("Minnesota Vikings"), " neste domingo (15/11), às ", B("15h (de Brasília)"), ", no Lambeau Field, em clássico da Divisão Norte da NFC. O jogo passa no ", B("SporTV 4"), " e no NFL Game Pass."),
    comoChegam: [
      "Os Packers vêm de uma vitória larga: 45 a 27 sobre o New England Patriots, fora de casa, no domingo passado (8). Com 6 vitórias e 3 derrotas, Green Bay é o 4º da divisão.",
      "Os Vikings têm 6 vitórias e 2 derrotas e a defesa menos vazada da NFC, com 116 pontos sofridos em oito jogos. Na última rodada, porém, o ataque travou na derrota por 23 a 6 para o Buffalo Bills.",
    ],
    cardRows: [
      ["Packers", "6 V e 3 D · 4º da NFC Norte"],
      ["Vikings", "6 V e 2 D · 3º da NFC Norte"],
      ["Último jogo dos Packers", "Patriots 27 x 45 Packers (8/11)"],
      ["Último jogo dos Vikings", "Vikings 6 x 23 Bills (9/11)"],
    ],
    tabelaTitulo: "Classificação da Divisão Norte da NFC",
    tabela: group("st9464", "NFC North"),
    emJogo: [
      "A divisão está embolada: os quatro times estão separados por uma vitória, e o líder, o Chicago Bears, folga nesta semana. Quem vencer em Green Bay pode empatar com os Bears no número de vitórias, enquanto o perdedor fica para trás num grupo em que só o campeão da divisão tem vaga garantida nos playoffs.",
    ],
    comoAssistir: nflAssistir("Na TV fechada, o jogo passa no SporTV 4."),
    links: linksNfl,
    faqCanal: "A partida tem transmissão do SporTV 4, na TV fechada, e do NFL Game Pass, na DAZN, às 15h de Brasília.",
    faqExtra: [["Como estão Packers e Vikings na temporada?", "Os Packers têm 6 vitórias e 3 derrotas. Os Vikings têm 6 vitórias e 2 derrotas. Os dois estão na Divisão Norte da NFC, liderada pelo Chicago Bears (7 vitórias e 2 derrotas)."]],
    excerpt: "Packers e Vikings fazem clássico da NFC Norte às 15h deste domingo (15/11), em Green Bay. Veja onde assistir no SporTV 4 e a situação da divisão.",
    metaDescription: "Saiba onde assistir a Packers x Vikings neste domingo (15/11), às 15h, pela NFL. Transmissão do SporTV 4 e NFL Game Pass e a classificação da NFC Norte.",
  },
  {
    ...NFL, at: "2026-11-15T07:00:00-03:00", authorId: 2, matchId: 16184643, homeId: 4390, awayId: 4430,
    A: "Raiders", Bn: "Seahawks", hora: "18h05", canal: "SporTV 2, ge tv e NFL Game Pass", canalLongo: "SporTV 2 (TV fechada), ge tv (YouTube, grátis) e NFL Game Pass (DAZN)", canalCapa: "SPORTV 2 E GE TV", canalCapaAlt: "no SporTV 2 e no ge tv",
    localCurto: "Allegiant Stadium, em Las Vegas",
    ondeFrase: "no Allegiant Stadium, em Las Vegas (Nevada), com capacidade para 65 mil torcedores",
    lead: P("O ", B("Las Vegas Raiders"), " recebe o ", B("Seattle Seahawks"), " neste domingo (15/11), às ", B("18h05 (de Brasília)"), ", no Allegiant Stadium, pela semana 10 da NFL. O jogo tem transmissão do ", B("SporTV 2"), " e do ", B("ge tv"), ", além do NFL Game Pass."),
    comoChegam: [
      "Os Seahawks têm 5 vitórias e 4 derrotas e são o 2º da Divisão Oeste da NFC, atrás do San Francisco 49ers. No domingo passado (8), venceram o Arizona Cardinals por 17 a 3, em casa.",
      "Os Raiders têm 4 vitórias e 5 derrotas e a defesa mais vazada da AFC, com 268 pontos sofridos. Na última rodada, perderam para os 49ers por 38 a 17, fora de casa.",
    ],
    cardRows: [
      ["Raiders", "4 V e 5 D · 3º da AFC Oeste"],
      ["Seahawks", "5 V e 4 D · 2º da NFC Oeste"],
      ["Último jogo dos Raiders", "49ers 38 x 17 Raiders (8/11)"],
      ["Último jogo dos Seahawks", "Seahawks 17 x 3 Cardinals (8/11)"],
    ],
    tabelaTitulo: "Classificação da Divisão Oeste da NFC",
    tabela: group("st9464", "NFC West"),
    tabelaNota: "Os Raiders são o 3º da Divisão Oeste da AFC (4 V e 5 D), atrás de Broncos e Chiefs.",
    emJogo: [
      "Para os Seahawks, vencer fora de casa ajuda na briga por uma vaga de repescagem (wild card) da NFC, em que o time está empatado com o Los Angeles Rams.",
      "Os Raiders, 9º da AFC, precisam ganhar para não se afastar da zona de classificação.",
    ],
    comoAssistir: nflAssistir("Na TV fechada, o jogo passa no SporTV 2. Na internet, o ge tv transmite de graça no YouTube."),
    links: linksNfl,
    faqCanal: "A partida tem transmissão do SporTV 2, na TV fechada, do ge tv, de graça no YouTube, e do NFL Game Pass, na DAZN, às 18h05 de Brasília.",
    faqExtra: [["Como estão Raiders e Seahawks na temporada?", "Os Raiders têm 4 vitórias e 5 derrotas (3º da AFC Oeste). Os Seahawks têm 5 vitórias e 4 derrotas (2º da NFC Oeste)."]],
    excerpt: "Raiders e Seahawks se enfrentam às 18h05 deste domingo (15/11), em Las Vegas. Veja onde assistir no SporTV 2 e no ge tv e como chegam os times.",
    metaDescription: "Saiba onde assistir a Raiders x Seahawks neste domingo (15/11), às 18h05, pela NFL. Transmissão do SporTV 2, ge tv e NFL Game Pass e classificação.",
  },
  {
    ...NFL, at: "2026-11-15T08:00:00-03:00", authorId: 1, matchId: 16184646, homeId: 4416, awayId: 4345,
    A: "Bengals", Bn: "Steelers", hora: "22h20", canal: "SporTV 2 e NFL Game Pass", canalLongo: "SporTV 2 (TV fechada) e NFL Game Pass (DAZN)", canalCapa: "SPORTV 2", canalCapaAlt: "no SporTV 2",
    title: "Bengals x Steelers no Sunday Night Football: onde assistir e horário",
    localCurto: "Paycor Stadium, em Cincinnati",
    ondeFrase: "no Paycor Stadium, em Cincinnati (Ohio), com capacidade para 65.515 torcedores",
    lead: P("O ", B("Cincinnati Bengals"), " recebe o ", B("Pittsburgh Steelers"), " neste domingo (15/11), às ", B("22h20 (de Brasília)"), ", no Paycor Stadium, no Sunday Night Football da semana 10 da NFL. O jogo vale a liderança da Divisão Norte da AFC e passa no ", B("SporTV 2"), " e no NFL Game Pass."),
    comoChegam: [
      "Os dois chegam com 6 vitórias e 2 derrotas e quatro vitórias seguidas. Os Steelers lideram a divisão pelo critério de desempate, porque venceram o primeiro confronto, por 30 a 27, em Pittsburgh, em 27 de setembro. Depois disso, perdeu para o Cleveland Browns, mas não perdeu mais, e vem de folga na última rodada.",
      "Os Bengals têm o ataque mais produtivo da divisão, com 240 pontos marcados. No domingo passado (8), venceram o Atlanta Falcons por 34 a 17, fora de casa, e antes tinham batido Titans (43 a 36), Ravens (35 a 13) e Dolphins (31 a 24).",
    ],
    cardRows: [
      ["Bengals", "6 V e 2 D · 2º da AFC Norte"],
      ["Steelers", "6 V e 2 D · 1º da AFC Norte"],
      ["Primeiro turno", "Steelers 30 x 27 Bengals (27/9)"],
      ["Sequência", "4 vitórias seguidas para os dois"],
    ],
    tabelaTitulo: "Classificação da Divisão Norte da AFC",
    tabela: group("st9464", "AFC North"),
    emJogo: [
      "Quem vencer assume sozinho a liderança da divisão. Se os Steelers ganharem, também ficam com a vantagem no confronto direto, que pesa no desempate ao fim da temporada. Uma vitória dos Bengals iguala a série e coloca Cincinnati na frente.",
    ],
    comoAssistir: nflAssistir("Na TV fechada, o jogo passa no SporTV 2."),
    links: linksNfl,
    faqCanal: "A partida tem transmissão do SporTV 2, na TV fechada, e do NFL Game Pass, na DAZN, às 22h20 de Brasília.",
    faqExtra: [["Quem venceu o primeiro jogo entre Bengals e Steelers em 2026?", "Os Steelers venceram por 30 a 27, em Pittsburgh, em 27 de setembro."]],
    excerpt: "Bengals e Steelers decidem a liderança da AFC Norte às 22h20 deste domingo (15/11), no Sunday Night Football. Veja onde assistir no SporTV 2.",
    metaDescription: "Saiba onde assistir a Bengals x Steelers neste domingo (15/11), às 22h20, no Sunday Night Football. Transmissão do SporTV 2 e NFL Game Pass e classificação.",
  },
];

export default () => posts.map((o) => ({ at: o.at, ...usPost(o) }));
