// Aviso de links de afiliado no FIM dos posts de Cupons (linha discreta, sem quadro).
// A frase "Como Associado da Amazon..." é exigência do contrato do Associados da Amazon:
// não remover enquanto houver link da Amazon. A frase de cada loja só aparece quando o
// post tem link dela (o post da Shopee não fala da Amazon e vice-versa).
export function AffiliateDisclosure({ className = "", html = "" }: { className?: string; html?: string }) {
  const hasShopee = /shopee\.com\.br/i.test(html);
  // sem nenhum link reconhecido, mantém a frase da Amazon (comportamento antigo)
  const hasAmazon = /amazon\.com\.br|amzn\.to/i.test(html) || !hasShopee;
  return (
    <p className={`text-xs leading-relaxed text-gray-500 ${className}`}>
      Este conteúdo tem links de afiliado: o Papo de Bola pode receber comissão por compras feitas por eles, sem custo a
      mais para você.
      {hasAmazon && " Como Associado da Amazon, o Papo de Bola recebe por compras qualificadas."}
      {hasShopee && " Como afiliado da Shopee, o Papo de Bola recebe comissão por compras qualificadas."} Preços e
      cupons podem mudar sem aviso.
    </p>
  );
}
