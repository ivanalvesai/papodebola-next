// Ícones que o editor pode escolher (nomes do lucide-react). Mapa nome→componente fica no render.
export const ICON_NAMES = ["check","star","trophy","calendar","clock","map-pin","tv","users","user","heart","shield","flag","goal","ticket","newspaper","play","video","camera","phone","mail","message-circle","link","globe","award","zap","sparkles","list","info","alert-circle","chevron-right"] as const;
export type IconName = (typeof ICON_NAMES)[number];
export const ICON_OPTIONS = ICON_NAMES.map((n) => ({ label: n, value: n }));
export const SOCIAL_NETWORKS = [
  { label: "Instagram", value: "instagram" }, { label: "X (Twitter)", value: "x" }, { label: "YouTube", value: "youtube" },
  { label: "Facebook", value: "facebook" }, { label: "TikTok", value: "tiktok" }, { label: "WhatsApp", value: "whatsapp" }, { label: "Site", value: "site" },
];
