import { AlertTriangle } from "lucide-react";

/**
 * Aviso de responsabilidade para conteúdo de apostas. É a peça de compliance que
 * (1) mantém o AdSense no Brasil (país-exceção exige info de jogo responsável na página) e
 * (2) cumpre a Lei 14.790/2023 (selo +18, sem apresentar aposta como renda/investimento).
 * Reutilizado no hub /casas-de-apostas, no card da home e no rodapé dos posts da categoria.
 */
export function BettingDisclaimer({ className = "" }: { className?: string }) {
  return (
    <aside
      role="note"
      className={`flex gap-3 rounded-lg border border-amber-300 bg-amber-50 p-4 text-xs leading-relaxed text-amber-900 ${className}`}
    >
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" aria-hidden />
      <p>
        <strong className="font-bold">+18 · Jogue com responsabilidade.</strong> O Papo de Bola não
        é uma casa de apostas e não realiza apostas. Este conteúdo é informativo e pode conter links
        de afiliados de plataformas autorizadas pela SPA/Ministério da Fazenda (domínios{" "}
        <span className="font-semibold">.bet.br</span>). Apostar envolve risco de perda financeira e
        não é fonte de renda nem forma de investimento. Proibido para menores de 18 anos. Se as
        apostas estiverem prejudicando você, procure ajuda:{" "}
        <a
          href="https://www.cvv.org.br"
          target="_blank"
          rel="noopener noreferrer nofollow"
          className="font-semibold underline"
        >
          CVV 188
        </a>
        .
      </p>
    </aside>
  );
}
