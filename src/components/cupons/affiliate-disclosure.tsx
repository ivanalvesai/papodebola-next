// Aviso de links de afiliado no FIM dos posts de Cupons (linha discreta, sem quadro).
// A frase "Como Associado da Amazon..." é exigência do contrato do Associados da Amazon:
// não remover enquanto houver link da Amazon.
export function AffiliateDisclosure({ className = "" }: { className?: string }) {
  return (
    <p className={`text-xs leading-relaxed text-gray-500 ${className}`}>
      Este conteúdo tem links de afiliado: o Papo de Bola pode receber comissão por compras feitas por eles, sem custo a
      mais para você. Como Associado da Amazon, o Papo de Bola recebe por compras qualificadas. Preços e cupons podem
      mudar sem aviso.
    </p>
  );
}
