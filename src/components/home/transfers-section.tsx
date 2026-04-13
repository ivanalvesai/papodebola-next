import Image from "next/image";
import { ArrowRight, Repeat } from "lucide-react";
import type { Transfer } from "@/types/team";

interface TransfersSectionProps {
  transfers: Transfer[];
}

export function TransfersSection({ transfers }: TransfersSectionProps) {
  if (transfers.length === 0) {
    return (
      <section className="bg-card-bg rounded-lg border border-border-custom p-6">
        <h2 className="text-base font-bold text-text-primary mb-4 flex items-center gap-2">
          <Repeat className="h-5 w-5 text-green" />
          Mercado da Bola
        </h2>
        <p className="text-text-muted text-sm text-center py-6">
          Nenhuma transferencia recente
        </p>
      </section>
    );
  }

  return (
    <section className="bg-card-bg rounded-lg border border-border-custom p-6">
      <h2 className="text-base font-bold text-text-primary mb-4 flex items-center gap-2">
        <Repeat className="h-5 w-5 text-green" />
        Mercado da Bola
      </h2>

      <div className="space-y-0">
        {transfers.slice(0, 10).map((t, i) => {
          const feeDisplay =
            typeof t.fee === "number" && t.fee > 0
              ? `€${(t.fee / 1000000).toFixed(1)}M`
              : typeof t.fee === "string" && t.fee
                ? t.fee
                : "Sem custo";

          return (
            <div
              key={i}
              className="flex items-center gap-3 py-3 border-b border-border-light last:border-0"
            >
              {/* Player photo */}
              <div className="w-10 h-10 rounded-full bg-body overflow-hidden shrink-0 flex items-center justify-center">
                {t.playerId ? (
                  <Image
                    src={`/img/player/${t.playerId}/image`}
                    alt={t.player}
                    width={40}
                    height={40}
                    className="w-full h-full object-cover"
                    unoptimized
                  />
                ) : (
                  <span className="text-text-muted text-sm">?</span>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-text-primary">
                  {t.player}
                </div>
                <div className="flex items-center gap-1 text-xs text-text-muted">
                  <span>{t.fromTeam || "?"}</span>
                  <ArrowRight className="h-3 w-3 text-green" />
                  <span className="font-semibold text-text-primary">
                    {t.toTeam}
                  </span>
                </div>
              </div>

              {/* Fee */}
              <div className="text-right shrink-0">
                <div className="text-sm font-bold text-green">{feeDisplay}</div>
                <div className="text-[10px] text-text-muted">{t.type}</div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
