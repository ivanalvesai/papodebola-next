"use client";

import { useEffect } from "react";

// Liga os botões "Copiar" dos cupons (HTML vindo do Lexical, sem React): um listener
// delegado no documento copia o data-code e mostra "Copiado!" por 2s. Nos
// .pdb-coupon-copygo (link "copiar e ir") copia e deixa o link abrir a loja.
export function CouponCopyLoader() {
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const el = (e.target as HTMLElement | null)?.closest?.(".pdb-coupon-copy, .pdb-coupon-copygo") as HTMLElement | null;
      if (!el) return;
      const code = el.dataset.code || "";
      if (!code) return;
      // "Copiar e ir": copia o código e deixa o link abrir a loja normalmente.
      const go = el.classList.contains("pdb-coupon-copygo");
      const btn = el;
      const done = () => {
        if (go) {
          btn.setAttribute("data-copied", "1");
          setTimeout(() => btn.removeAttribute("data-copied"), 2500);
          return;
        }
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
