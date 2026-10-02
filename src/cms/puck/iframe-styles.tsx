"use client";
// Override `iframe` do Puck: o canvas recebe o CSS REAL do site (o mesmo das páginas
// públicas, descoberto por /api/cms/site-css) em vez do CSS do admin (syncHostStyles: false).
// Só as regras do próprio Puck (contorno de seleção, barra de ações, linhas de soltar) são
// copiadas do /cms, senão a seleção dos blocos fica invisível.
import { useEffect, type ReactNode } from "react";

const PUCK_RULE = /_(DraggableComponent|DropZone|DropLine|ActionBar|Loader)[-_]|--puck-/;

function copyPuckRules(doc: Document) {
  if (doc.getElementById("pdb-puck-rules")) return;
  const parts: string[] = [];
  for (const sheet of Array.from(document.styleSheets)) {
    let rules: CSSRuleList;
    try {
      rules = sheet.cssRules;
    } catch {
      continue; // folha de outro domínio
    }
    for (const rule of Array.from(rules)) {
      if (PUCK_RULE.test(rule.cssText)) parts.push(rule.cssText);
    }
  }
  const style = doc.createElement("style");
  style.id = "pdb-puck-rules";
  style.textContent = parts.join("\n");
  doc.head.appendChild(style);
}

export function SiteStylesIframe({ children, document: doc }: { children: ReactNode; document?: Document }) {
  useEffect(() => {
    if (!doc) return;
    try {
      copyPuckRules(doc);
    } catch {
      /* sem as regras do Puck o canvas continua funcionando */
    }
    doc.body.style.background = "#F2F3F5";
    doc.body.style.padding = "16px";
    let alive = true;
    fetch("/api/cms/site-css", { credentials: "include" })
      .then((r) => r.json())
      .then(({ hrefs, bodyClass, htmlClass }: { hrefs?: string[]; bodyClass?: string; htmlClass?: string }) => {
        if (!alive) return;
        if (!doc.querySelector("base")) {
          const base = doc.createElement("base");
          base.href = `${window.location.origin}/`;
          doc.head.prepend(base);
        }
        for (const href of hrefs || []) {
          if (doc.querySelector(`link[href="${href}"]`)) continue;
          const l = doc.createElement("link");
          l.rel = "stylesheet";
          l.href = href;
          doc.head.appendChild(l);
        }
        // A fonte (next/font) declara a variável numa classe do <html>.
        for (const c of String(htmlClass || "").split(/\s+/).filter(Boolean)) doc.documentElement.classList.add(c);
        if (bodyClass) {
          doc.body.className = bodyClass;
          doc.body.style.minHeight = "0";
        }
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [doc]);
  return <>{children}</>;
}
