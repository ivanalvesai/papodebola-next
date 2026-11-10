// Aviso de links de afiliado (transparência: CONAR / Código de Defesa do Consumidor).
// Aparece em todo post da categoria "Cupons" e pode ser usado nas páginas /cupons/*.
export function AffiliateDisclosure({ className = "" }: { className?: string }) {
  return (
    <p className={`rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-relaxed text-amber-900 ${className}`}>
      <strong>Transparência:</strong> este conteúdo tem links de afiliado. Se você comprar por eles, o Papo de Bola
      pode receber uma comissão da loja, sem custo a mais para você. Preços e cupons podem mudar sem aviso; confira as
      condições na loja antes de finalizar a compra.
    </p>
  );
}
