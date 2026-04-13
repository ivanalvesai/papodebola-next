import Image from "next/image";
import Link from "next/link";
import { ListOrdered } from "lucide-react";
import type { StandingsGroup } from "@/types/standings";

interface StandingsWidgetProps {
  standings: StandingsGroup[];
}

export function StandingsWidget({ standings }: StandingsWidgetProps) {
  const rows = standings[0]?.rows?.slice(0, 10) || [];

  return (
    <div className="bg-card-bg rounded-lg border border-border-custom">
      <h3 className="text-sm font-bold text-text-primary px-4 py-3 border-b border-border-custom flex items-center gap-2">
        <ListOrdered className="h-4 w-4 text-green" />
        Classificacao - Brasileirao
      </h3>

      {rows.length === 0 ? (
        <p className="text-text-muted text-sm text-center py-6">
          Classificacao indisponivel
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-text-muted border-b border-border-light">
                <th className="text-left py-2 px-3 font-semibold">Time</th>
                <th className="py-2 px-2 font-semibold w-8">P</th>
                <th className="py-2 px-2 font-semibold w-8">J</th>
                <th className="py-2 px-2 font-semibold w-8">V</th>
                <th className="py-2 px-2 font-semibold w-8">SG</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => {
                const pos = i + 1;
                let borderColor = "";
                if (pos <= 4) borderColor = "border-l-2 border-l-green";
                else if (pos <= 6) borderColor = "border-l-2 border-l-orange";

                return (
                  <tr
                    key={r.teamId}
                    className={`border-b border-border-light last:border-0 hover:bg-card-hover ${borderColor}`}
                  >
                    <td className="py-2 px-3">
                      <div className="flex items-center gap-2">
                        <span className="text-text-muted w-4 text-center font-semibold">
                          {pos}
                        </span>
                        <Image
                          src={`/img/team/${r.teamId}/image`}
                          alt=""
                          width={18}
                          height={18}
                          className="rounded-full"
                          unoptimized
                        />
                        <span className="font-semibold text-text-primary truncate">
                          {r.team}
                        </span>
                      </div>
                    </td>
                    <td className="py-2 px-2 text-center font-bold text-text-primary">
                      {r.pts}
                    </td>
                    <td className="py-2 px-2 text-center text-text-muted">
                      {r.matches}
                    </td>
                    <td className="py-2 px-2 text-center text-text-muted">
                      {r.wins}
                    </td>
                    <td className="py-2 px-2 text-center text-text-muted">
                      {r.gd > 0 ? `+${r.gd}` : r.gd}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <Link
        href="/campeonato/brasileirao-serie-a"
        className="block text-center text-xs font-semibold text-green py-3 border-t border-border-custom hover:bg-card-hover transition-colors"
      >
        Ver tabela completa &rarr;
      </Link>
    </div>
  );
}
