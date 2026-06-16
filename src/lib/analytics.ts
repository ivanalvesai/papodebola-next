// Empurra eventos pro dataLayer do GTM (o GA4 é carregado via GTM-MMRXG48R).
// No-op no servidor. Pra os eventos chegarem ao GA4, criar no GTM uma tag
// "GA4 Event" disparada por um trigger de Custom Event (ver checklist no doc
// docs/deploys/2026-06-16/analytics.md).

type Params = Record<string, unknown>;

declare global {
  interface Window {
    dataLayer?: Params[];
  }
}

export function track(event: string, params: Params = {}): void {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event, ...params });
}
