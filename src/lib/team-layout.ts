// Layout personalizado de time: o texto automático aparece onde o editor pôs o bloco
// "teamAutoText". Se ele não pôs, anexa no fim (uma vez), como sempre foi.
export function needsAutoTextAppend(blocks: { blockType?: string }[]): boolean {
  return !blocks.some((b) => b?.blockType === "teamAutoText");
}
