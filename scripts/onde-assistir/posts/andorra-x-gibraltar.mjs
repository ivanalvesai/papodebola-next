// Andorra x Gibraltar — Liga D · Grupo 1, 5ª rodada, 13/11/2026 16h45. Jogo 15537775. Autor: Lucas Lima (2). Disney+.
import { B, P } from "../lexical.mjs";
import { watchPost } from "../template.mjs";
export default (ctx) => watchPost({
  matchId: 15537775, authorId: 2, A: "Andorra", Bn: "Gibraltar", hora: "16h45",
  canal: "Disney+", canalLongo: "Disney+ (streaming)", canalCapaAlt: "no Disney+",
  competicao: "Liga D, Grupo 1", grupoNome: "Grupo 1 da Liga D",
  localCurto: "Estadi de la FAF, em Encamp (Andorra)", ondeFrase: "no Estadi de la FAF, em Encamp, em Andorra",
  lead: P(B("Andorra"), " e ", B("Gibraltar"), " fazem nesta sexta-feira (13/11), às ", B("16h45 (de Brasília)"), ", o segundo duelo entre elas na ", B("Liga das Nações"), ", agora em Encamp, pelo Grupo 1 da Liga D. O jogo tem transmissão do ", B("Disney+"), "."),
  comoChegam: [
    "Gibraltar tem 2 pontos em dois jogos e ainda não perdeu. Empatou com Andorra por 0 a 0 em casa, na 2ª rodada, e arrancou um 1 a 1 da líder Malta fora de casa. Entra na reta final com dois jogos por fazer, um a mais que Andorra.",
    "Andorra fecha a sua participação na fase de liga nesta sexta. Somou só 1 ponto, no 0 a 0 em Gibraltar, e perdeu as duas partidas para Malta: 2 a 1 em casa e 1 a 0 fora. Marcou apenas 1 gol em três jogos.",
  ],
  extraRows: [["Líder", "Malta, 7 pontos (3 jogos)"], ["Acesso à Liga C", "o líder do grupo sobe"]],
  emJogo: [
    "Só o 1º colocado sobe para a Liga C, e Malta lidera com 7 pontos. Gibraltar ainda pode alcançá-la, mas precisa vencer os dois jogos que restam: com 5 pontos depois desta sexta, receberia Malta na última rodada precisando de mais uma vitória para chegar a 8 e passar os malteses.",
    "Andorra já não tem como terminar em 1º. O objetivo é se despedir da fase de liga com a primeira vitória e, de quebra, encerrar a chance de Gibraltar, o que daria o acesso a Malta.",
  ],
  local: [
    "O jogo é no Estadi de la FAF, em Encamp, campo da federação andorrana, nos Pireneus.",
  ],
  faqCanal: "A partida tem transmissão do Disney+, no streaming, às 16h45 de Brasília.",
  faqExtra: [
    ["Como está o Grupo 1 da Liga D da Liga das Nações?", "Antes da 5ª rodada: Malta com 7 pontos em 3 jogos, Gibraltar com 2 em 2 e Andorra com 1 em 3. Só o líder sobe para a Liga C."],
  ],
  excerpt: "Andorra recebe Gibraltar às 16h45 desta sexta (13/11), em Encamp, pela Liga das Nações. Veja onde assistir, as prováveis escalações e a situação do Grupo 1 da Liga D.",
  metaDescription: "Saiba onde assistir a Andorra x Gibraltar pela Liga das Nações nesta sexta (13/11), às 16h45, em Encamp. Veja canal, prováveis escalações e a tabela do grupo.",
}, ctx);
