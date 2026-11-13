// "Onde assistir": dados editoriais do post (canal de transmissão) guardados no bloco
// Lexical `matchInfo` ("Ficha do jogo"). O resto da ficha (data, hora, estádio, árbitro,
// bandeiras) sai do jogo (post.matchId → snapshot), nunca digitado à mão, pra não divergir.
// Puro (sem Payload) pra rodar no node:test.

export interface WatchInfo {
  channels: string;
  confirmed: boolean;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function findBlock(node: any, type: string): any | null {
  if (!node || typeof node !== "object") return null;
  if (node.type === "block" && node.fields?.blockType === type) return node.fields;
  for (const child of node.children || []) {
    const hit = findBlock(child, type);
    if (hit) return hit;
  }
  return null;
}

export function extractWatchInfo(content: any): WatchInfo | null {
  if (!content || typeof content !== "object" || !content.root) return null;
  const f = findBlock(content.root, "matchInfo");
  const channels = String(f?.channels ?? "").trim();
  if (!channels) return null;
  return { channels, confirmed: !!f.channelsConfirmed };
}
