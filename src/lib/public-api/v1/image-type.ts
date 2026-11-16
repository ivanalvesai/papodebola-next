// Tipo real da imagem pelos magic bytes (a API devolve webp ou png com qualquer extensão).
export function imageType(b: Uint8Array): "image/png" | "image/webp" | "image/jpeg" | null {
  if (b[0] === 0x89 && b[1] === 0x50) return "image/png";
  if (b[0] === 0xff && b[1] === 0xd8) return "image/jpeg";
  if (b.length >= 12 && String.fromCharCode(...b.subarray(0, 4)) === "RIFF" && String.fromCharCode(...b.subarray(8, 12)) === "WEBP") return "image/webp";
  return null;
}
