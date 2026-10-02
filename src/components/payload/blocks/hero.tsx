/* eslint-disable @typescript-eslint/no-explicit-any, @next/next/no-img-element */
import { BlockButtons } from "./buttons";

// Destaque (hero). Com imagem de fundo, a imagem manda (texto branco + película escura) —
// o `bgColor` padrão do schema é "green", então ele não pode sobrepor a imagem.
export function HeroBlock({ block }: { block: any }) {
  const img = block.bgImage && typeof block.bgImage === "object" && block.bgImage.url ? block.bgImage : null;
  const custom = block.bgColor === "custom" && block.bgHex;
  const bg = img
    ? "bg-[#111827] text-white"
    : block.bgColor === "green"
      ? "bg-green text-white"
      : block.bgColor === "dark"
        ? "bg-[#111827] text-white"
        : custom
          ? "text-white"
          : "bg-body text-text-primary";
  const align = block.align === "left" ? "text-left items-start" : "text-center items-center";
  return (
    <section
      className={`relative overflow-hidden rounded-lg ${bg} ${block.height === "tall" ? "flex min-h-[420px] flex-col justify-center" : ""}`}
      style={!img && custom ? { backgroundColor: block.bgHex } : undefined}
    >
      {img && <img src={img.url} alt={img.alt || ""} className="absolute inset-0 h-full w-full object-cover" />}
      {img && <div className="absolute inset-0 bg-black" style={{ opacity: Number(block.overlay ?? 40) / 100 }} />}
      <div className={`relative flex flex-col gap-4 px-6 py-14 sm:px-10 ${align}`}>
        {block.title && <h2 className="text-3xl font-bold leading-tight sm:text-4xl">{block.title}</h2>}
        {block.subtitle && <p className="max-w-2xl text-base opacity-90">{block.subtitle}</p>}
        <BlockButtons items={block.buttons} onDark={bg.includes("text-white")} className={block.align === "left" ? "" : "justify-center"} />
      </div>
    </section>
  );
}
