import Link from "next/link";
import { TeamLogo } from "@/components/ui/team-logo";
import type { StandingsGroup } from "@/types/standings";

export function StandingsTableBlock({ groups, title, href, rows = 20 }: { groups: StandingsGroup[]; title: string; href?: string; rows?: number }) {
  const list = groups[0]?.rows?.slice(0, rows) || [];
  return (
    <div className="rounded-lg border border-border-custom bg-card-bg">
      <h3 className="border-b border-border-custom px-4 py-3 text-sm font-bold text-text-primary">
        {href ? <Link href={href} className="hover:text-green">{title}</Link> : title}
      </h3>
      {list.length === 0 ? (
        <p className="py-6 text-center text-sm text-text-muted">Classificação indisponível</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-border-light text-text-muted">
              <th className="px-3 py-2 text-left font-semibold">Time</th>
              {["P","J","V","E","D","SG"].map((h) => <th key={h} className="w-8 px-1 py-2 font-semibold">{h}</th>)}
            </tr></thead>
            <tbody>
              {list.map((r) => (
                <tr key={r.teamId} className="border-b border-border-light last:border-0">
                  <td className="px-3 py-2"><span className="flex items-center gap-2"><span className="w-5 text-right font-bold text-text-muted">{r.pos}</span><TeamLogo teamId={r.teamId} alt={r.team} size={20} /><span className="font-semibold text-text-primary">{r.team}</span></span></td>
                  <td className="px-1 py-2 text-center font-bold">{r.pts}</td>
                  <td className="px-1 py-2 text-center">{r.matches}</td>
                  <td className="px-1 py-2 text-center">{r.wins}</td>
                  <td className="px-1 py-2 text-center">{r.draws}</td>
                  <td className="px-1 py-2 text-center">{r.losses}</td>
                  <td className="px-1 py-2 text-center">{r.gd}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
