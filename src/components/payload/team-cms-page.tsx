import { getTeamPageDataFor } from "@/lib/data/team";
import { getPayloadTeamSlugs, teamInfoFromDoc, type PayloadTeam } from "@/lib/data/payload-teams";
import { ALL_CLUSTER_TEAMS } from "@/lib/config";
import { TeamBlockRenderer, DEFAULT_TEAM_LAYOUTS } from "./team-blocks";

// generateStaticParams compartilhado: une os slugs do config (Série A/EU) com os times
// publicados no Payload (Série B). Cada rota de time chama isto.
export async function teamRouteStaticParams() {
  const cfg = ALL_CLUSTER_TEAMS.map((t) => t.slug);
  const cms = await getPayloadTeamSlugs();
  return Array.from(new Set([...cfg, ...cms])).map((slug) => ({ slug }));
}

type LayoutKey = keyof typeof DEFAULT_TEAM_LAYOUTS;
const FIELD_BY_KEY: Record<LayoutKey, keyof PayloadTeam> = {
  hub: "layoutHub",
  jogoHoje: "layoutJogoHoje",
  ondeAssistir: "layoutOndeAssistir",
  escalacao: "layoutEscalacao",
  proximos: "layoutProximos",
  estatisticas: "layoutEstatisticas",
};

// Renderiza uma página de time do CMS: busca os dados ao vivo e renderiza os blocos da
// aba pedida (ou o layout padrão se a aba estiver vazia).
export async function TeamCmsView({ doc, page }: { doc: PayloadTeam; page: LayoutKey }) {
  const data = await getTeamPageDataFor(teamInfoFromDoc(doc));
  const layout = doc[FIELD_BY_KEY[page]] as unknown as unknown[] | undefined;
  const blocks = layout && layout.length ? layout : DEFAULT_TEAM_LAYOUTS[page];
  return <TeamBlockRenderer data={data} blocks={blocks} heading={doc.name} />;
}
