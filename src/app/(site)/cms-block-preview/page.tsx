// Mini-preview de UM bloco pro canvas do Construtor (Puck): renderiza o PageBlock real do
// site (dados ao vivo, Lexical, formulário, trecho) dentro de um iframe do editor. Recebe o
// bloco em base64url (`?b=`), só abre pra quem está logado no /cms e avisa a altura ao pai
// por postMessage. O cabeçalho/rodapé do layout do site ficam escondidos aqui.
import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { assertPreviewAccess } from "@/lib/cms-preview-auth";
import { PageBlock } from "@/components/payload/page-blocks";
/* eslint-disable @typescript-eslint/no-explicit-any */

export const dynamic = "force-dynamic";
export const metadata = { robots: "noindex, nofollow", title: "Prévia do bloco" };

function decode(b?: string): { block: any; width?: string } | null {
  if (!b) return null;
  try {
    const json = Buffer.from(b.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf8");
    const v = JSON.parse(json);
    return v && typeof v === "object" && v.block && typeof v.block === "object" && typeof v.block.blockType === "string" ? v : null;
  } catch {
    return null;
  }
}

// Esconde tudo do layout que não é o preview (header, nav, rodapé, cookie, push).
const CSS = `
body{min-height:0!important;background:transparent!important}
body *:not(:has(#pdb-bp)):not(#pdb-bp):not(#pdb-bp *){display:none!important}
`;

const script = (id: string) => `(function(){
  var id=${JSON.stringify(id)};
  function send(){var el=document.getElementById("pdb-bp");if(!el)return;
    var h=Math.ceil(el.getBoundingClientRect().bottom+window.scrollY);
    try{window.parent.postMessage({pdbPreviewHeight:h,id:id},"*")}catch(e){}}
  window.addEventListener("load",send);send();
  if(window.ResizeObserver){var el=document.getElementById("pdb-bp");if(el)new ResizeObserver(send).observe(el);}
  setTimeout(send,1500);
})();`;

export default async function CmsBlockPreview({
  searchParams,
}: {
  searchParams: Promise<{ b?: string; id?: string; previewSecret?: string }>;
}) {
  const { b, id, previewSecret } = await searchParams;
  if (!(await assertPreviewAccess(previewSecret))) notFound();
  const data = decode(b);
  let node: ReactNode;
  if (!data) {
    node = <p className="text-sm text-text-muted">Bloco inválido.</p>;
  } else {
    try {
      node = await PageBlock({ block: data.block, pageWidth: data.width || "wide" });
    } catch {
      node = <p className="text-sm text-text-muted">Não foi possível mostrar este bloco agora.</p>;
    }
    if (!node) node = <p className="text-sm text-text-muted">Este bloco não tem nada pra mostrar ainda (confira os campos).</p>;
  }
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div id="pdb-bp" className="mx-auto max-w-[1240px] p-4">
        {node}
      </div>
      <script dangerouslySetInnerHTML={{ __html: script(String(id || "")) }} />
    </>
  );
}
