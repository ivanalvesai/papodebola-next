import type { Metadata } from "next";
import { Calendar } from "lucide-react";
import { PageBreadcrumb } from "@/components/seo/page-breadcrumb";
import { AgendaTabs } from "@/components/agenda/agenda-tabs";
import { LiveScoreProvider } from "@/components/world-cup/copa-live-provider";
import { AgendaBlockRenderer, DEFAULT_AGENDA_LAYOUT } from "@/components/payload/agenda-blocks";
import { getStoredFootballAgenda } from "@/lib/data/agenda";
import { getPayloadPage } from "@/lib/data/payload-pages";

// Página gerida no CMS (collection `pages`, slug abaixo): textos + SEO + ORDEM dos widgets
// de jogos editáveis. Os jogos vêm do STORE (dev grava; prod só lê — não bate na API).
// Fallback no DEFAULT_AGENDA_LAYOUT se a Página não existir no CMS. revalidate curto pra
// refletir o store (leitura barata).
export const revalidate = 60;

const CMS_SLUG = "jogos-de-hoje-futebol";

const DEFAULT_TITLE = "Jogos de Futebol: Agenda, Datas e Horários | Papo de Bola";
const DEFAULT_DESC =
  "Acompanhe os jogos de futebol de hoje no Brasil e no mundo com datas, horários e informações atualizadas.";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPayloadPage(CMS_SLUG).catch(() => null);
  const title = page?.seo?.metaTitle || DEFAULT_TITLE;
  const description = page?.seo?.metaDescription || DEFAULT_DESC;
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: "/jogos-de-hoje/futebol" },
    openGraph: { title, description, images: [{ url: "/og-image.jpg", width: 1200, height: 630 }] },
  };
}

export default async function AgendaFutebolPage() {
  const [page, leagues] = await Promise.all([
    getPayloadPage(CMS_SLUG).catch(() => null),
    getStoredFootballAgenda().catch(() => []),
  ]);

  const h1 = page?.hero?.h1 || "Agenda dos Jogos de Hoje de Futebol";
  const layout = page?.layout && page.layout.length ? page.layout : DEFAULT_AGENDA_LAYOUT;
  // Liga o polling ao vivo se houver jogo da Copa hoje (mesmo padrão da home/agenda).
  const hasCopa = leagues.some((lg) => lg.league === "Copa do Mundo");

  return (
    <div className="mx-auto max-w-[1240px] px-4 py-8">
      <PageBreadcrumb
        className="mb-4"
        items={[
          { label: "Início", href: "/" },
          { label: "Jogos de Hoje", href: "/jogos-de-hoje" },
          { label: "Futebol" },
        ]}
      />
      <h1 className="mb-4 flex items-center gap-2 text-xl font-bold text-text-primary">
        <Calendar className="h-6 w-6 text-green" />
        {h1}
      </h1>

      <AgendaTabs active="futebol" />

      <LiveScoreProvider endpoints={hasCopa ? ["/api/copa/ao-vivo"] : []}>
        <AgendaBlockRenderer leagues={leagues} blocks={layout} />
      </LiveScoreProvider>
    </div>
  );
}
