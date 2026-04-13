import Image from "next/image";
import Link from "next/link";
import { ListOrdered, ChevronUp, ChevronDown, Minus } from "lucide-react";
import type { StandingsGroup, FormResult } from "@/types/standings";

interface StandingsWidgetProps {
  standings: StandingsGroup[];
}

function FormDot({ result }: { result: FormResult }) {
  const colors = {
    W: "bg-green",
    D: "bg-text-muted",
    L: "bg-red",
  };
  const titles = { W: "Vitoria", D: "Empate", L: "Derrota" };
  return (
    <span
      className={`inline-block w-2 h-2 rounded-full ${colors[result]}`}
      title={titles[result]}
    />
  );
}

function PosArrow({ change }: { change: number }) {
  if (change > 0) return <ChevronUp className="h-3 w-3 text-green" />;
  if (change < 0) return <ChevronDown className="h-3 w-3 text-red" />;
  return <Minus className="h-2.5 w-2.5 text-text-muted opacity-40" />;
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
                <th className="py-2 px-1 font-semibold w-6">P</th>
                <th className="py-2 px-1 font-semibold w-6">J</th>
                <th className="py-2 px-1 font-semibold w-6">V</th>
                <th className="py-2 px-1 font-semibold w-6">SG</th>
                <th className="py-2 px-1 font-semibold text-center">Forma</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                let borderColor = "";
                if (r.pos <= 4) borderColor = "border-l-2 border-l-green";
                else if (r.pos <= 6) borderColor = "border-l-2 border-l-orange";

                return (
                  <tr
                    key={r.teamId}
                    className={`border-b border-border-light last:border-0 hover:bg-card-hover ${borderColor}`}
                  >
                    <td className="py-2 px-3">
                      <div className="flex items-center gap-1.5">
                        <span className="text-text-muted w-3 text-center font-semibold text-[10px]">
                          {r.pos}
                        </span>
                        <PosArrow change={r.posChange} />
                        <Image
                          src={`/img/team/${r.teamId}/image`}
                          alt=""
                          width={18}
                          height={18}
                          className="rounded-full"
                          unoptimized
                        />
                        <span className="font-semibold text-text-primary truncate max-w-[80px]">
                          {r.team}
                        </span>
                      </div>
                    </td>
                    <td className="py-2 px-1 text-center font-bold text-text-primary">
                      {r.pts}
                    </td>
                    <td className="py-2 px-1 text-center text-text-muted">
                      {r.matches}
                    </td>
                    <td className="py-2 px-1 text-center text-text-muted">
                      {r.wins}
                    </td>
                    <td className="py-2 px-1 text-center text-text-muted">
                      {r.gd > 0 ? `+${r.gd}` : r.gd}
                    </td>
                    <td className="py-2 px-1">
                      <div className="flex items-center justify-center gap-0.5">
                        {r.recentForm.length > 0
                          ? r.recentForm.map((f, i) => <FormDot key={i} result={f} />)
                          : <span className="text-[9px] text-text-muted">-</span>
                        }
                      </div>
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
