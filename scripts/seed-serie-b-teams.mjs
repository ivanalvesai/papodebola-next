// Semeia os 20 times do Brasileirão Série B 2026 na collection `teams` do Payload.
// Roda DENTRO do container (dev) via Payload local API — sem auth (overrideAccess).
//   docker exec papodebola-next-dev node scripts/seed-serie-b-teams.mjs
// Idempotente: se o slug já existe, atualiza identidade; senão cria. Publica (_status).
import { getPayload } from "payload";
import config from "../src/payload.config.ts";

const TEAMS = [
  { name: "Vila Nova", slug: "vila-nova", sofascoreId: 2021 },
  { name: "São Bernardo", slug: "sao-bernardo", sofascoreId: 47504 },
  { name: "Sport", slug: "sport-recife", sofascoreId: 1959 },
  { name: "Novorizontino", slug: "novorizontino", sofascoreId: 135514 },
  { name: "Criciúma", slug: "criciuma", sofascoreId: 1984 },
  { name: "Juventude", slug: "juventude", sofascoreId: 1980 },
  { name: "Operário-PR", slug: "operario-pr", sofascoreId: 39634 },
  { name: "Fortaleza", slug: "fortaleza", sofascoreId: 2020 },
  { name: "Náutico", slug: "nautico", sofascoreId: 2011 },
  { name: "Cuiabá", slug: "cuiaba", sofascoreId: 49202 },
  { name: "Athletic", slug: "athletic-club", sofascoreId: 342775 },
  { name: "Goiás", slug: "goias", sofascoreId: 1960 },
  { name: "Atlético-GO", slug: "atletico-goianiense", sofascoreId: 7314 },
  { name: "Ceará", slug: "ceara", sofascoreId: 2001 },
  { name: "Botafogo-SP", slug: "botafogo-sp", sofascoreId: 1979 },
  { name: "CRB", slug: "crb", sofascoreId: 22032 },
  { name: "Londrina", slug: "londrina", sofascoreId: 2022 },
  { name: "Avaí", slug: "avai", sofascoreId: 7315 },
  { name: "Ponte Preta", slug: "ponte-preta", sofascoreId: 1969 },
  { name: "América-MG", slug: "america-mineiro", sofascoreId: 1973 },
];

const payload = await getPayload({ config });
let created = 0, updated = 0;
for (const t of TEAMS) {
  const data = { ...t, tournament: "serie-b", _status: "published" };
  const existing = await payload.find({ collection: "teams", where: { slug: { equals: t.slug } }, limit: 1 });
  if (existing.docs[0]) {
    await payload.update({ collection: "teams", id: existing.docs[0].id, data });
    updated++;
    console.log(`~ atualizado: ${t.slug}`);
  } else {
    await payload.create({ collection: "teams", data });
    created++;
    console.log(`+ criado: ${t.slug}`);
  }
}
console.log(`\nSeed concluído: ${created} criados, ${updated} atualizados.`);
process.exit(0);
