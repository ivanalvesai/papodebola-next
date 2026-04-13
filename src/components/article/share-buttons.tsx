"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

interface ShareButtonsProps {
  url: string;
  title: string;
}

export function ShareButtons({ url, title }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  const encoded = {
    url: encodeURIComponent(url),
    title: encodeURIComponent(title),
  };

  function copyLink() {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex gap-2.5 flex-wrap">
      <a
        href={`https://api.whatsapp.com/send?text=${encoded.title}%20${encoded.url}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-md text-[13px] font-semibold text-white bg-[#25D366] hover:opacity-85 transition-opacity"
      >
        WhatsApp
      </a>
      <a
        href={`https://twitter.com/intent/tweet?text=${encoded.title}&url=${encoded.url}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-md text-[13px] font-semibold text-white bg-[#1DA1F2] hover:opacity-85 transition-opacity"
      >
        X
      </a>
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${encoded.url}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-md text-[13px] font-semibold text-white bg-[#1877F2] hover:opacity-85 transition-opacity"
      >
        Facebook
      </a>
      <a
        href={`https://t.me/share/url?url=${encoded.url}&text=${encoded.title}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-md text-[13px] font-semibold text-white bg-[#0088cc] hover:opacity-85 transition-opacity"
      >
        Telegram
      </a>
      <button
        onClick={copyLink}
        className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-md text-[13px] font-semibold text-white bg-text-secondary hover:opacity-85 transition-opacity"
      >
        {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
        {copied ? "Copiado!" : "Copiar Link"}
      </button>
    </div>
  );
}
