"use client";

import { useEffect, useState } from "react";

// true quando a página é o preview do CMS (/cms-preview/*). Começa false e só vira
// true após montar, pra não divergir da hidratação (o servidor não sabe o caminho
// sem headers(), que deixaria o site inteiro dinâmico).
export function useIsCmsPreview(): boolean {
  const [isPreview, setIsPreview] = useState(false);
  useEffect(() => {
    setIsPreview(window.location.pathname.startsWith("/cms-preview"));
  }, []);
  return isPreview;
}
