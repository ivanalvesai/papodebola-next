/* eslint-disable @typescript-eslint/no-explicit-any */

// Grupo de botões reutilizado por hero, CTA, imagem+texto e pelo bloco "Botões".
// `onDark` = o fundo é escuro/verde: o "Contorno" usa a cor do texto (branco) em vez do verde.
export function BlockButtons({ items, onDark = false, className = "" }: { items?: any[]; onDark?: boolean; className?: string }) {
  const list = (items || []).filter((b: any) => b?.label && b?.href);
  if (!list.length) return null;
  return (
    <div className={`flex flex-wrap gap-3 ${className}`}>
      {list.map((b: any, i: number) => {
        const style =
          b.style === "outline"
            ? onDark ? "border border-current" : "border border-green text-green hover:bg-green-light"
            : b.style === "white"
              ? "bg-white text-green hover:bg-green-light"
              : "bg-green text-white hover:bg-green-hover";
        return (
          <a key={i} href={b.href} className={`inline-block rounded-lg px-5 py-2.5 text-sm font-semibold transition-colors ${style}`}>
            {b.label}
          </a>
        );
      })}
    </div>
  );
}

const ALIGN: Record<string, string> = { left: "justify-start", center: "justify-center", right: "justify-end" };

export function ButtonsBlock({ block }: { block: any }) {
  return <BlockButtons items={block.items} className={ALIGN[block.align] || ALIGN.left} />;
}
