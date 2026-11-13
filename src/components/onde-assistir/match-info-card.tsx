import Link from "next/link";
import type { WatchMatch } from "@/lib/watch-info";

// Ficha do jogo dos posts "onde assistir". Dados do jogo (snapshot do match/{id}) + o
// canal editorial do bloco matchInfo. Linha sem dado não aparece (nada inventado).
const TZ = "America/Sao_Paulo";

function dayLabel(ts: number): string {
  const s = new Date(ts * 1000).toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    timeZone: TZ,
  });
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function timeLabel(ts: number): string {
  const t = new Date(ts * 1000).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", timeZone: TZ });
  return t.replace(":", "h").replace(/h00$/, "h");
}

function Flag({ id, name }: { id: number; name: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`/api/team-img/${id}`}
      alt={`Bandeira ${name}`}
      width={64}
      height={64}
      className="h-14 w-14 rounded-full border border-border-custom bg-white object-contain p-1 shadow-sm sm:h-16 sm:w-16"
    />
  );
}

export function MatchInfoCard({
  m,
  channels,
  confirmed,
}: {
  m: WatchMatch;
  channels: string;
  confirmed: boolean;
}) {
  const live = m.statusType === "inprogress";
  const finished = m.statusType === "finished";
  const hasScore = (live || finished) && m.homeScore !== null && m.awayScore !== null;
  const rows: { label: string; value: string }[] = [
    { label: "Data", value: dayLabel(m.timestamp) },
    { label: "Horário", value: `${timeLabel(m.timestamp)} (de Brasília)` },
  ];
  if (m.venue) {
    const cap = m.venue.capacity ? ` · ${m.venue.capacity.toLocaleString("pt-BR")} lugares` : "";
    rows.push({ label: "Local", value: `${m.venue.stadium}${m.venue.city ? `, ${m.venue.city}` : ""}${cap}` });
  }
  if (m.referee) {
    rows.push({ label: "Árbitro", value: `${m.referee.name}${m.referee.country ? ` (${m.referee.country})` : ""}` });
  }
  const meta = [m.tournament, m.group, m.round ? `${m.round}ª rodada` : ""].filter(Boolean).join(" · ");

  return (
    <section
      aria-label={`Ficha do jogo ${m.home} x ${m.away}`}
      className="not-prose my-8 overflow-hidden rounded-xl border border-border-custom bg-card-bg shadow-sm"
    >
      <div className="border-t-4 border-green px-4 pb-5 pt-4 sm:px-6">
        <p className="text-center text-xs font-bold uppercase tracking-wider text-green">{meta}</p>

        <div className="mt-4 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
          <div className="flex flex-col items-center gap-2 text-center">
            <Flag id={m.homeId} name={m.home} />
            <span className="text-base font-bold leading-tight text-text-primary sm:text-lg">{m.home}</span>
          </div>
          <div className="text-center">
            {hasScore ? (
              <span className={`text-3xl font-extrabold ${live ? "text-red" : "text-text-primary"}`}>
                {m.homeScore} <span className="text-text-muted">x</span> {m.awayScore}
              </span>
            ) : (
              <span className="text-2xl font-extrabold text-text-primary">{timeLabel(m.timestamp)}</span>
            )}
            <span className={`mt-1 block text-xs font-semibold ${live ? "text-red" : "text-text-muted"}`}>
              {live ? "AO VIVO" : finished ? "Encerrado" : "x"}
            </span>
          </div>
          <div className="flex flex-col items-center gap-2 text-center">
            <Flag id={m.awayId} name={m.away} />
            <span className="text-base font-bold leading-tight text-text-primary sm:text-lg">{m.away}</span>
          </div>
        </div>

        <dl className="mt-5 grid grid-cols-1 gap-x-6 gap-y-3 border-t border-border-light pt-4 sm:grid-cols-2">
          {rows.map((r) => (
            <div key={r.label}>
              <dt className="text-xs font-semibold uppercase tracking-wide text-text-muted">{r.label}</dt>
              <dd className="text-sm font-semibold text-text-primary">{r.value}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="flex flex-col gap-3 bg-green-light px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-green">Onde assistir</p>
          <p className="text-lg font-extrabold text-text-primary">{channels}</p>
          {!confirmed && <p className="text-xs text-text-secondary">Grade sujeita a confirmação.</p>}
        </div>
        {m.href && (
          <Link
            href={m.href}
            className="inline-flex items-center justify-center rounded-lg bg-green px-4 py-2.5 text-sm font-bold text-white hover:bg-green-hover"
          >
            {live ? "Acompanhe ao vivo" : finished ? "Veja como foi o jogo" : "Acompanhe o lance a lance"}
          </Link>
        )}
      </div>
    </section>
  );
}
