import { getTeamPageDataFor, getTeamLastLineup } from "@/lib/data/team";
import { buildTeamNarrative, type TeamNarrativePage } from "@/lib/team-narrative";
import { TeamNarrativeSection, ProbableLineup } from "@/components/team/team-narrative";
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
export async function TeamCmsView({ doc, page }: { doc: PayloadTeam; page: TeamNarrativePage }) {
  const data = await getTeamPageDataFor(teamInfoFromDoc(doc));
  const layout = doc[FIELD_BY_KEY[page]] as unknown as unknown[] | undefined;
  const blocks = layout && layout.length ? layout : DEFAULT_TEAM_LAYOUTS[page];
  const lineup = page === "escalacao" ? await getTeamLastLineup(data.id, 3).catch(() => null) : null;
  // O H1 vem do layout do cluster (cabeçalho do time) — não duplicar aqui. O texto de
  // contexto (gerado dos dados) entra depois dos blocos, em todo time do CMS.
  return (
    <>
      <TeamBlockRenderer data={data} blocks={blocks} />
      <div className="mx-auto max-w-[860px] px-4 pb-6 space-y-5">
        {page === "escalacao" && <ProbableLineup lineup={lineup} />}
        <TeamNarrativeSection narrative={buildTeamNarrative(data, page, { lineup })} />
      </div>
    </>
  );
}
