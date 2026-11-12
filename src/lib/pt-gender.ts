// Contrações com o nome do campeonato: "pelo Brasileirão" x "pela Liga das Nações".
// Masculinos: Brasileirão e estaduais (o Paulista, o Carioca...) e "Campeonato ...".
// O resto (Copa, Liga, Série, Champions/Premier/Europa League, Bundesliga, Ligue 1,
// Sudamericana, Serie A...) é feminino.
const MASC = /^(brasileir|paulista|carioca|mineiro|ga[uú]cho|paranaense|pernambucano|campeonato|torneio|mundial)/i;

export function isMasculine(name: string): boolean {
  return MASC.test(name.trim());
}
/** "pelo"/"pela" + nome */
export function pelo(name: string): string {
  return `${isMasculine(name) ? "pelo" : "pela"} ${name}`;
}
/** "do"/"da" + nome */
export function doDa(name: string): string {
  return `${isMasculine(name) ? "do" : "da"} ${name}`;
}
