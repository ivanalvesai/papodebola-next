// Luxemburgo x Estônia — Liga C · Grupo 4, 5ª rodada, 13/11/2026 16h45. Jogo 15537774. Autor: Lucas Lima (2). Disney+.
import { B, P } from "../lexical.mjs";
import { watchPost } from "../template.mjs";
export default (ctx) => watchPost({
  matchId: 15537774, authorId: 2, A: "Luxemburgo", Bn: "Estônia", hora: "16h45",
  canal: "Disney+", canalLongo: "Disney+ (streaming)", canalCapaAlt: "no Disney+",
  competicao: "Liga C, Grupo 4", grupoNome: "Grupo 4 da Liga C",
  localCurto: "Stade de Luxembourg, na cidade de Luxemburgo", ondeFrase: "no Stade de Luxembourg, na cidade de Luxemburgo",
  lead: P(B("Luxemburgo"), " e ", B("Estônia"), " se enfrentam nesta sexta-feira (13/11), às ", B("16h45 (de Brasília)"), ", no Stade de Luxembourg, pela 5ª rodada do Grupo 4 da Liga C da ", B("Liga das Nações"), ". A transmissão é do ", B("Disney+"), "."),
  comoChegam: [
    "A Estônia ainda não perdeu na competição, mas venceu só uma vez: foi 1 a 0 justamente sobre Luxemburgo, em casa, na 3ª rodada. Os outros três jogos terminaram empatados, dois deles com a líder Islândia (1 a 1 e 0 a 0). É a defesa mais sólida do grupo, com apenas 1 gol sofrido, e também um dos ataques mais tímidos, com 2 gols em quatro partidas.",
    "Luxemburgo é o lanterna, com 3 pontos. Estreou com uma vitória por 2 a 1 sobre a Bulgária em Sófia, mas perdeu os três jogos seguintes sem marcar: 3 a 0 para a Islândia e 2 a 0 para a Bulgária, ambos em casa, e 1 a 0 para a Estônia, fora.",
  ],
  extraRows: [["Líder", "Islândia, 8 pontos"], ["3º lugar", "Bulgária, 4 pontos"]],
  emJogo: [
    "O 2º lugar, que dá vaga no playoff de acesso à Liga B, está nas mãos da Estônia. Uma vitória leva o time a 9 pontos e o mantém na briga até pelo 1º lugar, já que a líder Islândia visita a Bulgária no mesmo horário. A rodada final é um confronto direto com os búlgaros, em casa.",
    "Luxemburgo precisa vencer para deixar a lanterna. Com 6 pontos, o time passaria a Bulgária caso os búlgaros percam para a Islândia, e chegaria vivo à última rodada, na Islândia.",
  ],
  local: [
    "O jogo é no Stade de Luxembourg, o estádio nacional do país, inaugurado em 2021 na capital.",
  ],
  faqCanal: "A partida tem transmissão do Disney+, no streaming, às 16h45 de Brasília.",
  faqExtra: [
    ["Como está o Grupo 4 da Liga C da Liga das Nações?", "Antes da 5ª rodada: Islândia com 8 pontos, Estônia com 6, Bulgária com 4 e Luxemburgo com 3. O 1º sobe para a Liga B e o 2º vai ao playoff de acesso."],
  ],
  excerpt: "Luxemburgo recebe a Estônia às 16h45 desta sexta (13/11), pela Liga das Nações. Veja onde assistir, as prováveis escalações e a briga pelo 2º lugar do Grupo 4 da Liga C.",
  metaDescription: "Saiba onde assistir a Luxemburgo x Estônia pela Liga das Nações nesta sexta (13/11), às 16h45, no Stade de Luxembourg. Veja canal, escalações e a tabela.",
}, ctx);
