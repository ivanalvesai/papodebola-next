import { test } from "node:test";
import assert from "node:assert/strict";
import { findRescheduled, type RescheduleCandidate } from "./match-slug-fuzzy.ts";

// Candidatos reais (API de prod, 27/09/2026 — /api/championship/{slug}): nomes já no
// slug atual (slugifyCategory do nome da API), incluindo o jogo de mando invertido e o
// jogo da fase de grupos do mesmo par.
function c(champ: string, dateSlug: string, timestamp: number, homeSlug: string, awaySlug: string): RescheduleCandidate {
  return { dateSlug, timestamp, homeSlug, awaySlug, href: `/futebol/${champ}/jogo/${dateSlug}/${homeSlug}-${awaySlug}` };
}

const LIBERTADORES: RescheduleCandidate[] = [
  c("libertadores", "09-04-2026", 1775786400, "independiente-santa-fe", "club-atletico-penarol"),
  c("libertadores", "16-04-2026", 1776385800, "club-atletico-penarol", "club-atletico-platense"),
  c("libertadores", "07-05-2026", 1778191200, "club-atletico-platense", "club-atletico-penarol"),
  c("libertadores", "27-05-2026", 1779928200, "club-atletico-penarol", "independiente-santa-fe"),
  c("libertadores", "06-05-2026", 1778113800, "independiente-rivadavia", "fluminense"),
  c("libertadores", "07-05-2026", 1778200200, "independiente-medellin", "flamengo"),
  c("libertadores", "29-04-2026", 1777509000, "estudiantes-de-la-plata", "flamengo"),
  c("libertadores", "20-05-2026", 1779323400, "flamengo", "estudiantes-de-la-plata"),
  c("libertadores", "10-09-2026", 1789086600, "independiente-del-valle", "flamengo"),
  c("libertadores", "14-10-2026", 1792024200, "fluminense", "palmeiras"),
  c("libertadores", "15-10-2026", 1792110600, "estudiantes-de-la-plata", "flamengo"),
  c("libertadores", "21-10-2026", 1792629000, "palmeiras", "fluminense"),
  c("libertadores", "22-10-2026", 1792715400, "flamengo", "estudiantes-de-la-plata"),
];

const SUDAMERICANA: RescheduleCandidate[] = [
  c("sudamericana", "08-04-2026", 1775694600, "montevideo-city-torque", "gremio"),
  c("sudamericana", "19-08-2026", 1787185800, "montevideo-city-torque", "tigre"),
  c("sudamericana", "14-10-2026", 1792015200, "atletico-mineiro", "montevideo-city-torque"),
  c("sudamericana", "21-10-2026", 1792620000, "montevideo-city-torque", "atletico-mineiro"),
];

const COPA_DO_BRASIL: RescheduleCandidate[] = [
  c("copa-do-brasil", "05-08-2026", 1785967200, "cruzeiro", "chapecoense"),
  c("copa-do-brasil", "25-08-2026", 1787702400, "cruzeiro", "atletico-mineiro"),
  c("copa-do-brasil", "01-09-2026", 1788307200, "atletico-mineiro", "cruzeiro"),
  c("copa-do-brasil", "12-05-2026", 1778632200, "cruzeiro", "goias"),
];

test("slug do par mudou (Peñarol virou 'Club Atlético Peñarol'), mesma data", () => {
  assert.equal(
    findRescheduled("09-04-2026", "independiente-santa-fe-penarol", LIBERTADORES),
    "/futebol/libertadores/jogo/09-04-2026/independiente-santa-fe-club-atletico-penarol"
  );
});

test("remarcado +2 dias (Estudiantes x Flamengo), ignora a volta e o jogo de grupos", () => {
  assert.equal(
    findRescheduled("13-10-2026", "estudiantes-de-la-plata-flamengo", LIBERTADORES),
    "/futebol/libertadores/jogo/15-10-2026/estudiantes-de-la-plata-flamengo"
  );
});

test("remarcado +1 dia (Palmeiras x Fluminense); a ida com mando invertido (14-10) não casa", () => {
  assert.equal(
    findRescheduled("20-10-2026", "palmeiras-fluminense", LIBERTADORES),
    "/futebol/libertadores/jogo/21-10-2026/palmeiras-fluminense"
  );
});

test("remarcado +1 dia (Montevideo City Torque x Atlético Mineiro)", () => {
  assert.equal(
    findRescheduled("20-10-2026", "montevideo-city-torque-atletico-mineiro", SUDAMERICANA),
    "/futebol/sudamericana/jogo/21-10-2026/montevideo-city-torque-atletico-mineiro"
  );
});

test("remarcado -1 dia (Cruzeiro x Atlético Mineiro); a volta invertida (01-09) não casa", () => {
  assert.equal(
    findRescheduled("26-08-2026", "cruzeiro-atletico-mineiro", COPA_DO_BRASIL),
    "/futebol/copa-do-brasil/jogo/25-08-2026/cruzeiro-atletico-mineiro"
  );
});

test("mando invertido sozinho na janela: não redireciona pro jogo do outro mandante", () => {
  // URL da ida (Fluminense x Palmeiras) com data errada perto só da volta (Palmeiras x Fluminense)
  const onlyReturn = LIBERTADORES.filter((x) => x.dateSlug !== "14-10-2026");
  assert.equal(findRescheduled("20-10-2026", "fluminense-palmeiras", onlyReturn), null);
  // e com a ida presente, vai pra ela (6 dias), nunca pra volta (1 dia)
  assert.equal(
    findRescheduled("20-10-2026", "fluminense-palmeiras", LIBERTADORES),
    "/futebol/libertadores/jogo/14-10-2026/fluminense-palmeiras"
  );
});

test("sem candidato compatível -> null", () => {
  assert.equal(findRescheduled("09-04-2026", "penarol-flamengo", LIBERTADORES), null);
  assert.equal(findRescheduled("20-10-2026", "palmeiras-fluminense", LIBERTADORES, 0), null); // fora da janela
  assert.equal(findRescheduled("01-01-2026", "palmeiras-fluminense", LIBERTADORES), null);
  assert.equal(findRescheduled("20-10-2026", "palmeiras-fluminense", []), null);
});

test("ambíguo (dois jogos à mesma distância) -> null", () => {
  // "independiente" casa Independiente Medellín e Independiente del Valle; os dois a 3 dias
  const cands = [
    c("libertadores", "07-05-2026", 1778200200, "independiente-medellin", "flamengo"),
    c("libertadores", "13-05-2026", 1778718600, "independiente-del-valle", "flamengo"),
  ];
  assert.equal(findRescheduled("10-05-2026", "independiente-flamengo", cands), null);
  // desempatado pela distância -> resolve
  assert.equal(
    findRescheduled("08-05-2026", "independiente-flamengo", cands),
    "/futebol/libertadores/jogo/07-05-2026/independiente-medellin-flamengo"
  );
});

test("nunca redireciona pra própria URL", () => {
  assert.equal(findRescheduled("21-10-2026", "palmeiras-fluminense", LIBERTADORES.filter((x) => x.dateSlug === "21-10-2026")), null);
});

test("token que não é de nenhum dos dois times -> não casa", () => {
  assert.equal(findRescheduled("20-10-2026", "palmeiras-fluminense-bolivar", LIBERTADORES), null);
});
