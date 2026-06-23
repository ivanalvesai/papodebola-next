import { Goal } from "lucide-react";
import { TeamLogo } from "@/components/ui/team-logo";
import type { Scorer } from "@/types/team";

interface WorldCupScorersProps {
  scorers: Scorer[];
}

export function WorldCupScorers({ scorers }: WorldCupScorersProps) {
  return (
    <section className="mt-10 pt-6 border-t border-border-custom">
      <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
        <Goal className="h-5 w-5 text-green" />
        Artilharia
      </h2>
      <p className="text-xs text-text-muted mb-4">
        Maiores goleadores da Copa do Mundo 2026 (atualiza durante o torneio)
      </p>

      {scorers.length === 0 ? (
        <div className="bg-card-bg rounded-lg border border-border-custom px-4 py-8 text-center text-sm text-text-muted">
          A artilharia será atualizada automaticamente assim que a Copa começar.
        </div>
      ) : (
        <div className="bg-card-bg rounded-lg border border-border-custom overflow-hidden max-w-[640px]">
          {/* Cabecalho da tabela */}
          <div className="grid grid-cols-[28px_1fr_92px_46px] sm:grid-cols-[32px_1fr_150px_56px] items-center gap-2 px-3 sm:px-4 py-2 border-b border-border-custom text-[10px] font-bold uppercase tracking-wide text-text-muted">
            <span className="text-center">#</span>
            <span>Jogador</span>
            <span>País</span>
            <span className="text-center">Gols</span>
          </div>

          <div className="divide-y divide-border-light">
            {scorers.map((s, i) => (
              <div
                key={s.player.id}
                className="grid grid-cols-[28px_1fr_92px_46px] sm:grid-cols-[32px_1fr_150px_56px] items-center gap-2 px-3 sm:px-4 py-2.5"
              >
                <span
                  className={`text-center text-xs font-bold ${
                    i < 3 ? "text-yellow-500" : "text-text-muted"
                  }`}
                >
                  {i + 1}
                </span>

                {/* Jogador: foto + nome */}
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-body overflow-hidden shrink-0">
                    <TeamLogo
                      src={`/api/player-img/${s.player.id}`}
                      alt={s.player.name}
                      size={32}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="text-sm font-semibold text-text-primary truncate">
                    {s.player.name}
                  </span>
                </div>

                {/* Pais: bandeira + nome */}
                <div className="flex items-center gap-1.5 min-w-0 text-xs text-text-secondary">
                  <TeamLogo teamId={s.team.id} alt={s.team.name} size={16} />
                  <span className="truncate">{s.team.name}</span>
                </div>

                <span className="text-center text-base font-bold text-green tabular-nums">
                  {s.goals}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
