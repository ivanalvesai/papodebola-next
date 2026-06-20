"use client";

import { useState } from "react";
import { X, ZoomIn, ZoomOut } from "lucide-react";

// Visualizador de imagem em tela cheia com zoom (clique na imagem alterna 1x/2x).
export function ImageLightbox({ src, onClose }: { src: string; onClose: () => void }) {
  const [zoom, setZoom] = useState(false);
  return (
    <div className="fixed inset-0 z-[60] bg-black/85 flex items-center justify-center p-4" onClick={onClose}>
      <button onClick={onClose} className="absolute top-4 right-4 p-2 text-white/80 hover:text-white" title="Fechar">
        <X className="h-6 w-6" />
      </button>
      <div className="absolute top-4 left-4 flex items-center gap-1 text-white/70 text-xs">
        {zoom ? <ZoomOut className="h-4 w-4" /> : <ZoomIn className="h-4 w-4" />}
        clique na imagem pra {zoom ? "reduzir" : "ampliar"}
      </div>
      <div className="max-h-[92vh] max-w-[95vw] overflow-auto" onClick={(e) => e.stopPropagation()}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt=""
          onClick={() => setZoom((z) => !z)}
          className={`object-contain transition-transform origin-top ${zoom ? "scale-[1.8] cursor-zoom-out" : "max-h-[92vh] max-w-[95vw] cursor-zoom-in"}`}
        />
      </div>
    </div>
  );
}
