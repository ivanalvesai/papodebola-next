"use client";

import { useEffect } from "react";

// Liga os botões "Copiar" dos cupons (HTML vindo do Lexical, sem React): um listener
// delegado no documento copia o data-code e mostra "Copiado!" por 2s.
export function CouponCopyLoader() {
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const btn = (e.target as HTMLElement | null)?.closest?.(".pdb-coupon-copy") as HTMLButtonElement | null;
      if (!btn) return;
      const code = btn.dataset.code || "";
      const done = () => {
        const old = btn.textContent;
        btn.textContent = "Copiado!";
        setTimeout(() => (btn.textContent = old), 2000);
      };
      if (navigator.clipboard?.writeText) navigator.clipboard.writeText(code).then(done).catch(() => {});
      else {
        const ta = document.createElement("textarea");
        ta.value = code;
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand("copy"); done(); } catch { /* sem clipboard */ }
        ta.remove();
      }
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);
  return null;
}
