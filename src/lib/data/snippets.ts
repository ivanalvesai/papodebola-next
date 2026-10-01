import { unstable_cache } from "next/cache";
import { getPayload } from "payload";
import config from "@payload-config";

// Trechos (collection `snippets`): seções reutilizáveis inseridas nas Páginas pelo bloco
// "snippet". Cache de 5 min com tag `snippets` (o hook da collection expira ao salvar).
// Erro (Postgres fora) NÃO é cacheado: a função cacheada lança e o null é devolvido fora do
// cache. No build → null (sem tocar no banco).
/* eslint-disable @typescript-eslint/no-explicit-any */

export interface SnippetDoc {
  id: number | string;
  title?: string | null;
  layout?: any[] | null;
}

const isBuild = () => process.env.NEXT_PHASE === "phase-production-build";

export async function getSnippet(id: number | string): Promise<SnippetDoc | null> {
  if (id === undefined || id === null || id === "") return null;
  if (isBuild()) return null;
  try {
    const fetchOne = unstable_cache(
      async (): Promise<SnippetDoc | null> => {
        const payload = await getPayload({ config });
        const doc = await payload.findByID({ collection: "snippets" as any, id, depth: 2 });
        return (doc as unknown as SnippetDoc) ?? null;
      },
      ["snippet", String(id)],
      { tags: ["snippets"], revalidate: 300 }
    );
    return await fetchOne();
  } catch {
    return null;
  }
}
