import { permanentRedirect } from "next/navigation";

// A aba "Páginas" foi aposentada: textos e SEO agora vivem no /cms
// (Conteúdo → Textos e SEO das páginas / Configurações do site).
export default function Page() {
  permanentRedirect("/cms/collections/pageTexts");
}
