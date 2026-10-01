import { revalidateTag } from "next/cache";

// Expira a tag na hora (Next 16 exige o 2º argumento). Fora de request (scripts,
// `payload run`) o Next lança — ignoramos: o ISR revalida sozinho depois.
export function expireTag(tag: string): void {
  try { revalidateTag(tag, { expire: 0 }); } catch { /* fora de request */ }
}
