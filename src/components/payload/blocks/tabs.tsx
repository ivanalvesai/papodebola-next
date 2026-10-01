/* eslint-disable @typescript-eslint/no-explicit-any */
import { lexicalToHtml } from "@/lib/data/articles-payload";
import { ProseBody } from "@/components/article/prose-body";
import { TabsClient } from "./tabs-client";

// SERVER-ONLY (lexicalToHtml). Converte o conteúdo de cada aba no servidor e entrega os
// painéis prontos ao cliente (que só alterna qual aparece).
export function TabsBlock({ block }: { block: any }) {
  const items = (block.items || []).filter((it: any) => it?.label);
  if (!items.length) return null;
  const labels = items.map((it: any) => String(it.label));
  const panels = items.map((it: any, i: number) => {
    let html = "";
    try { html = lexicalToHtml(it.content); } catch { html = ""; }
    return html ? <ProseBody key={i} html={html} /> : null;
  });
  return <TabsClient labels={labels} panels={panels} />;
}
