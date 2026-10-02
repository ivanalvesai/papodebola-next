/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ReactNode } from "react";

// Ícones simples por rede (SVG inline, sem lib). viewBox 24x24, cor = currentColor.
const NETWORKS: Record<string, { label: string; icon: ReactNode }> = {
  instagram: {
    label: "Instagram",
    icon: (
      <g fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" stroke="none" />
      </g>
    ),
  },
  x: {
    label: "X (Twitter)",
    icon: (
      <path
        fill="currentColor"
        d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"
      />
    ),
  },
  youtube: {
    label: "YouTube",
    icon: (
      <path
        fill="currentColor"
        fillRule="evenodd"
        d="M6 5h12a4 4 0 0 1 4 4v6a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V9a4 4 0 0 1 4-4zm4 4v6l5-3z"
      />
    ),
  },
  facebook: {
    label: "Facebook",
    icon: (
      <path
        fill="currentColor"
        d="M14 8h3V4h-3c-2.76 0-4 1.79-4 4.5V10H7v4h3v8h4v-8h3l1-4h-4V8.5c0-.3.2-.5.5-.5z"
      />
    ),
  },
  tiktok: {
    label: "TikTok",
    icon: (
      <path
        fill="currentColor"
        d="M16 3c.4 2.6 2 4.2 4.5 4.5v3.2c-1.7 0-3.2-.5-4.5-1.4V15a6 6 0 1 1-6-6h.5v3.3a2.8 2.8 0 1 0 2.3 2.7V3z"
      />
    ),
  },
  whatsapp: {
    label: "WhatsApp",
    icon: (
      <g>
        <path
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
          d="M3.5 20.5l1.3-4A8.5 8.5 0 1 1 8 19.3z"
        />
        <path
          fill="currentColor"
          d="M9.2 7.8c.3-.3.7-.3.9 0l1 1.6c.2.3.1.6-.1.8l-.6.6c.5 1 1.3 1.8 2.3 2.3l.6-.6c.2-.2.5-.3.8-.1l1.6 1c.3.2.3.6 0 .9l-.8.8c-.5.5-1.3.6-2 .3a8 8 0 0 1-4.4-4.4c-.3-.7-.2-1.5.3-2z"
        />
      </g>
    ),
  },
  site: {
    label: "Site",
    icon: (
      <g fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18M12 3c2.5 2.5 3.8 5.5 3.8 9s-1.3 6.5-3.8 9c-2.5-2.5-3.8-5.5-3.8-9S9.5 5.5 12 3z" />
      </g>
    ),
  },
};

const SIZE: Record<string, { box: string; icon: string }> = {
  sm: { box: "h-8 w-8", icon: "h-4 w-4" },
  md: { box: "h-10 w-10", icon: "h-5 w-5" },
  lg: { box: "h-12 w-12", icon: "h-6 w-6" },
};

export function SocialBlock({ block }: { block: any }) {
  const items = (block.items || []).filter((it: any) => it?.url && NETWORKS[it.network]);
  if (!items.length) return null;
  const size = SIZE[block.size] || SIZE.md;
  return (
    <ul className="flex flex-wrap gap-3">
      {items.map((it: any, i: number) => {
        const n = NETWORKS[it.network];
        return (
          <li key={i}>
            <a
              href={it.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={n.label}
              title={n.label}
              className={`flex items-center justify-center rounded-full bg-green text-white transition-colors hover:bg-green-hover ${size.box}`}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true" className={size.icon}>
                {n.icon}
              </svg>
            </a>
          </li>
        );
      })}
    </ul>
  );
}
