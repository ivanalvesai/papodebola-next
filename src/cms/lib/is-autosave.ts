// Autosave do Payload chega com ?autosave=true; não deve invalidar o cache do site a cada 1,5s.
/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
export function isAutosave(req: any): boolean {
  const q = req?.query?.autosave;
  return q === true || q === "true";
}
