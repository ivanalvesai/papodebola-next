"use client";
import { RefreshRouteOnSave } from "@payloadcms/live-preview-react";
import { useRouter } from "next/navigation";

// Dentro do iframe do Live Preview do /cms: ao salvar/autosalvar, refaz o render do servidor.
export function LivePreviewListener() {
  const router = useRouter();
  const serverURL = typeof window !== "undefined" ? window.location.origin : "";
  return <RefreshRouteOnSave refresh={() => router.refresh()} serverURL={serverURL} />;
}

export function PreviewBanner({ children }: { children?: React.ReactNode }) {
  return (
    <div className="bg-green px-4 py-2 text-center text-sm font-semibold text-white">
      Pré-visualização do CMS &middot; rascunho &middot; esta página é privada e ainda NÃO está publicada
      {children}
    </div>
  );
}
