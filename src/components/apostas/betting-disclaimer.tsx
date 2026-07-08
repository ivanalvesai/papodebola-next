/**
 * Aviso de responsabilidade para conteúdo de apostas — linha única discreta no topo
 * (estilo lance.com.br), sem virar card chamativo. É a peça de compliance que
 * (1) mantém o AdSense no Brasil (país-exceção exige info de jogo responsável na página) e
 * (2) cumpre a Lei 14.790/2023 (selo +18, sem apresentar aposta como renda/investimento).
 * Reutilizado no índice /casas-de-apostas e no topo dos posts da categoria.
 */
export function BettingDisclaimer({ className = "" }: { className?: string }) {
  return (
    <p className={`text-[11px] leading-relaxed text-text-muted ${className}`}>
      <span className="font-semibold text-text-secondary">+18 · Jogue com responsabilidade.</span> O
      Papo de Bola não realiza apostas · conteúdo informativo com links de casas autorizadas pela SPA
      (.bet.br) · proibido para menores de 18 anos ·{" "}
      <a
        href="https://www.cvv.org.br"
        target="_blank"
        rel="noopener noreferrer nofollow"
        className="underline hover:text-green"
      >
        CVV 188
      </a>
    </p>
  );
}
