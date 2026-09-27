// Helpers PUROS de slug/URL de tênis. Client-safe: nenhum import de fetch/API/node:*.
// Extraído de src/lib/data/tennis.ts pra não puxar fetchAllSports (e api-cache, que usa
// node:fs/promises) pro bundle do navegador via componentes "use client".

// Slug a partir do nome do atleta (acentos fora, espaços->-). PURO (client+server).
export function slugifyName(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

// slug do confronto pela API: "{casa}-{fora}" (ex: "ben-shelton-ethan-quinn").
export function tennisMatchSlug(homeName: string, awayName: string): string {
  return `${slugifyName(homeName)}-${slugifyName(awayName)}`;
}
