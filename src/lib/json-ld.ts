// Serializa JSON-LD pra <script type="application/ld+json"> sem permitir fechar a tag:
// escapa < > & como \uXXXX (o JSON continua válido e idêntico ao parsear).
export function jsonLd(obj: unknown): string {
  return JSON.stringify(obj).replace(/</g, "\\u003c").replace(/>/g, "\\u003e").replace(/&/g, "\\u0026");
}
