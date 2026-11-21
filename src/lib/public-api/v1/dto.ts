import type { StatusV1 } from "./status.ts";

// Contrato público v1 (campos em português, ids do Sofascore). Mudança que quebra formato = /v2.
export interface TimeRefV1 { id: number; nome: string; escudo: string }       // escudo = "/v1/imagens/time/{id}"
export interface PlacarV1 { mandante: number | null; visitante: number | null; penaltisMandante?: number | null; penaltisVisitante?: number | null }
export interface JogoResumoV1 { id: number; campeonato?: string; rodada?: number; inicio: string; inicioTs: number; status: StatusV1; statusTexto: string; mandante: TimeRefV1; visitante: TimeRefV1; placar: PlacarV1 }
export interface LinhaTabelaV1 { posicao: number; time: TimeRefV1; pontos: number; jogos: number; vitorias: number; empates: number; derrotas: number; golsPro: number; golsContra: number; saldo: number; zona: string; variacao: number; ultimos: ("V" | "E" | "D")[] }
export interface GrupoTabelaV1 { nome: string; linhas: LinhaTabelaV1[] }
export interface RodadaRefV1 { chave: string; numero: number; nome: string; mataMata: boolean }
export interface CampeonatoResumoV1 { slug: string; nome: string; id: number; temporadaId: number | null }
export interface CampeonatoV1 extends CampeonatoResumoV1 { rodadaAtual: string; rodadas: RodadaRefV1[]; tabela: GrupoTabelaV1[]; temJogoAoVivo: boolean }
export interface ArtilheiroV1 { posicao: number; jogador: { id: number; nome: string; foto: string }; time: TimeRefV1; gols: number; nota: number | null }
type Lado = "mandante" | "visitante" | null;
// minuto/acrescimo = null no lugar do sentinela 999 da API; `rotulo` nomeia os marcadores de período.
export interface LanceV1 { tipo: string; detalhe: string; minuto: number | null; acrescimo: number | null; rotulo: string | null; jogador: string | null; jogadorId: number | null; assistencia: string | null; assistenciaId: number | null; entrou: string | null; entrouId: number | null; saiu: string | null; saiuId: number | null; motivo: string | null; lado: Lado; placarMandante: number | null; placarVisitante: number | null; texto: string | null }
export interface GolV1 { jogador: string | null; jogadorId: number | null; assistencia: string | null; minuto: number | null; acrescimo: number | null; lado: Lado; tipo: "normal" | "penalti" | "contra" }
export interface EventoJogadorV1 { tipo: "gol" | "golPenalti" | "golContra" | "assistencia" | "amarelo" | "segundoAmarelo" | "vermelho" | "entrou" | "saiu"; minuto: number | null; acrescimo: number | null; motivo?: string | null }
export interface FaseV1 { nome: string; mataMata: boolean; chave: string | null }
export interface NarracaoV1 { id: number; tipo: string; texto: string; minuto: number | null; rotuloMinuto: string | null; lado: "mandante" | "visitante" | null; jogador: string | null; jogadorId: number | null; motivo: string | null; html: string | null }
export interface JogadorEscalacaoV1 { id: number; nome: string; numero: number | null; posicao: string; nota: string | null; capitao: boolean; foto: string; eventos: EventoJogadorV1[] }
export interface EscalacaoV1 { formacao: string | null; titulares: JogadorEscalacaoV1[]; reservas: JogadorEscalacaoV1[] }
export interface EstatisticaV1 { nome: string; mandante: string; visitante: string }
export interface CobrancaPenaltiV1 { ordem: number; jogador: string; jogadorId: number | null; lado: "mandante" | "visitante"; converteu: boolean; motivo: string }
export interface JogoV1 extends JogoResumoV1 {
  estadio: { nome: string; cidade: string; pais: string; capacidade: number | null } | null; arbitro: string | null; vencedor: Lado; inicioPeriodoTs: number;
  fase: FaseV1 | null; agregado: { mandante: number; visitante: number } | null; avancou: Lado; jogoIdaId: number | null;
  tecnicos: { mandante: string | null; visitante: string | null } | null;
  gols: GolV1[]; resumo: string | null;
  lances: LanceV1[]; narracao: NarracaoV1[]; estatisticas: EstatisticaV1[]; penaltis: CobrancaPenaltiV1[];
}
export interface JogoCompletoV1 extends JogoV1 { escalacoes: { confirmadas: boolean; mandante: EscalacaoV1 | null; visitante: EscalacaoV1 | null } }
export interface DiaCampeonatoV1 { campeonato: string; jogos: JogoResumoV1[] }
export interface TimeV1 { id: number; nome: string; escudo: string; proximos: JogoResumoV1[]; ultimos: JogoResumoV1[] }
