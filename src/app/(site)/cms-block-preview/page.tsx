// Mini-preview de UM bloco pro canvas do Construtor (Puck): renderiza o PageBlock real do
// site (dados ao vivo, Lexical, formulário, trecho) dentro de um iframe do editor. Lê o
// bloco do store em memória (`?k=`, gravado por POST /api/cms/block-preview e preso ao
// usuário que o criou), só abre pra quem está logado no /cms e avisa a altura ao pai por postMessage. O cabeçalho e o
// rodapé do layout do site ficam escondidos aqui.
import type { ReactNode } from "react";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { getPayload } from "payload";
import config from "@payload-config";
import { assertPreviewAccess } from "@/lib/cms-preview-auth";
import { PageBlock } from "@/components/payload/page-blocks";
import { isFramedBlockType, isPreviewKey, isValidPreviewId, previewStore } from "@/cms/puck/preview-guard";
import { jsonLd } from "@/lib/json-ld";
/* eslint-disable @typescript-eslint/no-explicit-any */

export const dynamic = "force-dynamic";
export const metadata = { robots: "noindex, nofollow", title: "Prévia do bloco" };

// Esconde tudo do layout que não é o preview (header, nav, rodapé, cookie, push).
const CSS = `
body{min-height:0!important;background:transparent!important}
body *:not(:has(#pdb-bp)):not(#pdb-bp):not(#pdb-bp *){display:none!important}
`;

// `id` já passou por isValidPreviewId; jsonLd ainda escapa `<` (nunca fecha o <script>).
const script = (id: string) => `(function(){
  var id=${jsonLd(id)};
  function send(){var el=document.getElementById("pdb-bp");if(!el)return;
    var h=Math.ceil(el.getBoundingClientRect().bottom+window.scrollY);
    try{window.parent.postMessage({pdbPreviewHeight:h,id:id},"*")}catch(e){}}
  window.addEventListener("load",send);send();
  if(window.ResizeObserver){var el=document.getElementById("pdb-bp");if(el)new ResizeObserver(send).observe(el);}
  setTimeout(send,1500);
})();`;

async function currentUserId(): Promise<string | number | null> {
  try {
    const payload = await getPayload({ config });
    const { user } = await payload.auth({ headers: await headers() });
    return user ? user.id : null;
  } catch {
    return null;
  }
}

export default async function CmsBlockPreview({
  searchParams,
}: {
  searchParams: Promise<{ k?: string; id?: string; previewSecret?: string }>;
}) {
  const { k, id, previewSecret } = await searchParams;
  if (!(await assertPreviewAccess(previewSecret))) notFound();
  if (!isValidPreviewId(id)) notFound();
  const found = isPreviewKey(k) ? previewStore().get(String(k)) : null;
  // A prévia só abre pro mesmo usuário que a criou (chave vazada não serve pra outro).
  const userId = await currentUserId();
  const entry = found && userId !== null && String(found.userId) === String(userId) ? found : null;
  let node: ReactNode;
  if (!entry) {
    node = <p className="text-sm text-text-muted">Prévia expirada, edite o bloco pra recarregar.</p>;
  } else if (!isFramedBlockType(entry.block?.blockType)) {
    node = <p className="text-sm text-text-muted">Bloco não suportado na prévia.</p>;
  } else {
    try {
      node = await PageBlock({ block: entry.block, pageWidth: entry.width || "wide" });
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
