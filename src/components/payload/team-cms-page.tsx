import { getTeamPageDataFor, getTeamLastLineup } from "@/lib/data/team";
import { buildTeamNarrative, type TeamNarrativePage } from "@/lib/team-narrative";
import { TeamNarrativeSection, ProbableLineup } from "@/components/team/team-narrative";
import { getPayloadTeamSlugs, teamInfoFromDoc, type PayloadTeam } from "@/lib/data/payload-teams";
import { ALL_CLUSTER_TEAMS } from "@/lib/config";
import { needsAutoTextAppend } from "@/lib/team-layout";
import { TeamBlockRenderer } from "./team-blocks";
import { ClassicTeamHub } from "@/components/team/classic/hub";
import { ClassicTeamJogoHoje } from "@/components/team/classic/jogo-hoje";
import { ClassicTeamOndeAssistir } from "@/components/team/classic/onde-assistir";
import { ClassicTeamEscalacao } from "@/components/team/classic/escalacao";
import { ClassicTeamProximos } from "@/components/team/classic/proximos";
import { ClassicTeamEstatisticas } from "@/components/team/classic/estatisticas";

// generateStaticParams compartilhado: une os slugs do config (Série A/EU) com os times
// publicados no Payload (Série B). Cada rota de time chama isto.
export async function teamRouteStaticParams() {
  const cfg = ALL_CLUSTER_TEAMS.map((t) => t.slug);
  const cms = await getPayloadTeamSlugs();
  return Array.from(new Set([...cfg, ...cms])).map((slug) => ({ slug }));
}

const FIELD_BY_KEY: Record<TeamNarrativePage, keyof PayloadTeam> = {
  hub: "layoutHub",
  jogoHoje: "layoutJogoHoje",
  ondeAssistir: "layoutOndeAssistir",
  escalacao: "layoutEscalacao",
  proximos: "layoutProximos",
  estatisticas: "layoutEstatisticas",
};

// Página clássica (a mesma dos times do config) por aba — usada quando a aba está vazia.
const CLASSIC = {
  hub: ClassicTeamHub,
  jogoHoje: ClassicTeamJogoHoje,
  ondeAssistir: ClassicTeamOndeAssistir,
  proximos: ClassicTeamProximos,
  estatisticas: ClassicTeamEstatisticas,
} as const;

// Renderiza uma página de time do CMS: busca os dados ao vivo e renderiza os blocos da
// aba pedida. Aba vazia = página clássica do site (igual aos times do config).
export async function TeamCmsView({ doc, page }: { doc: PayloadTeam; page: TeamNarrativePage }) {
  const data = await getTeamPageDataFor(teamInfoFromDoc(doc));
  const layout = (doc[FIELD_BY_KEY[page]] as unknown as { blockType?: string }[] | undefined) || [];
  const lineup = page === "escalacao" ? await getTeamLastLineup(data.id, 3).catch(() => null) : null;
  if (!layout.length) {
    if (page === "escalacao") return <ClassicTeamEscalacao data={data} lineup={lineup} />;
    const Classic = CLASSIC[page];
    return <Classic data={data} />;
  }
  // O H1 vem do layout do cluster (cabeçalho do time) — não duplicar aqui. O texto de
  // contexto (gerado dos dados) entra onde o editor pôs o bloco "Texto automático" ou,
  // se ele não pôs, depois dos blocos.
  return (
    <>
      <TeamBlockRenderer data={data} blocks={layout} page={page} lineup={lineup} />
      {needsAutoTextAppend(layout) && (
        <div className="mx-auto max-w-[860px] px-4 pb-6 space-y-5">
          {page === "escalacao" && <ProbableLineup lineup={lineup} />}
          <TeamNarrativeSection narrative={buildTeamNarrative(data, page, { lineup })} />
        </div>
      )}
    </>
  );
}
