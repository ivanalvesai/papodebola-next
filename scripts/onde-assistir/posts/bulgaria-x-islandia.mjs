// Bulgária x Islândia — Liga C · Grupo 4, 5ª rodada, 13/11/2026 16h45. Jogo 15534234. Autor: Ivan Alves (1). Disney+.
import { B, P } from "../lexical.mjs";
import { watchPost } from "../template.mjs";
export default (ctx) => watchPost({
  matchId: 15534234, authorId: 1, A: "Bulgária", Bn: "Islândia", hora: "16h45",
  canal: "Disney+", canalLongo: "Disney+ (streaming)", canalCapaAlt: "no Disney+",
  competicao: "Liga C, Grupo 4", grupoNome: "Grupo 4 da Liga C",
  localCurto: "Estádio Hristo Botev, em Plovdiv (Bulgária)", ondeFrase: "no Estádio Hristo Botev, em Plovdiv, na Bulgária",
  lead: P("A líder ", B("Islândia"), " visita a ", B("Bulgária"), " nesta sexta-feira (13/11), às ", B("16h45 (de Brasília)"), ", em Plovdiv, pela 5ª rodada do Grupo 4 da Liga C da ", B("Liga das Nações"), ". O jogo tem transmissão do ", B("Disney+"), "."),
  comoChegam: [
    "A Islândia está invicta e lidera com 8 pontos. Venceu Luxemburgo (3 a 0, fora) e a própria Bulgária (3 a 0, em casa, na 3ª rodada), e empatou duas vezes com a Estônia (1 a 1 e 0 a 0). Tem o melhor saldo do grupo, com 7 gols marcados e apenas 1 sofrido. No ataque, Orri Óskarsson e Andri Guðjohnsen dividem as atenções com o veterano Gylfi Sigurðsson.",
    "A Bulgária soma 4 pontos e está em 3º. Começou mal, com derrota em casa para Luxemburgo (2 a 1) e empate sem gols com a Estônia, levou 3 a 0 da Islândia em Reykjavík e se recuperou na rodada passada, ao vencer Luxemburgo por 2 a 0 fora de casa.",
  ],
  extraRows: [["Vice-líder (playoff de acesso)", "Estônia, 6 pontos"], ["Acesso à Liga B", "1º sobe direto; 2º vai ao playoff"]],
  emJogo: [
    "A Islândia busca encaminhar o acesso direto à Liga B. Com uma vitória, chega a 11 pontos; se a Estônia não vencer Luxemburgo no mesmo horário, os islandeses garantem o 1º lugar com uma rodada de folga. Na última rodada, recebem Luxemburgo.",
    "Para a Bulgária, vencer é a única forma de seguir na briga pelo 2º lugar. Com 7 pontos, passaria a Estônia caso os estonianos tropecem, e o confronto direto entre os dois fecha o grupo, em Tallinn.",
  ],
  local: [
    "O jogo é no Estádio Hristo Botev, em Plovdiv, a segunda maior cidade da Bulgária.",
  ],
  faqCanal: "A partida tem transmissão do Disney+, no streaming, às 16h45 de Brasília.",
  faqExtra: [
    ["Como está o Grupo 4 da Liga C da Liga das Nações?", "Antes da 5ª rodada: Islândia com 8 pontos, Estônia com 6, Bulgária com 4 e Luxemburgo com 3. O 1º sobe para a Liga B e o 2º vai ao playoff de acesso."],
  ],
  excerpt: "A líder Islândia visita a Bulgária às 16h45 desta sexta (13/11), em Plovdiv, pela Liga das Nações. Veja onde assistir, as prováveis escalações e a tabela do Grupo 4.",
  metaDescription: "Saiba onde assistir a Bulgária x Islândia pela Liga das Nações nesta sexta (13/11), às 16h45, em Plovdiv. Veja canal, prováveis escalações e a tabela do grupo.",
}, ctx);
