import { CheckCircle2 } from "lucide-react";

// Bloco de "resposta rápida" no topo da página — responde a query exata em 1 frase
// (ex: "O Palmeiras joga hoje?"). Mira featured snippet do Google + AI Overview.
// Texto limpo e direto = fácil de extrair.
export function QuickAnswer({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2.5 rounded-lg border-l-4 border-green bg-green-light/50 p-4">
      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green" />
      <p className="text-sm leading-relaxed text-text-primary sm:text-base">{children}</p>
    </div>
  );
}
