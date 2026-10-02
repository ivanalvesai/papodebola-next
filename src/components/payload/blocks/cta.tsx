/* eslint-disable @typescript-eslint/no-explicit-any, @next/next/no-img-element */
import { BlockButtons } from "./buttons";

const BG: Record<string, string> = {
  green: "bg-green text-white",
  dark: "bg-[#111827] text-white",
  light: "bg-body text-text-primary",
  image: "bg-[#111827] text-white",
};

// Chamada (CTA): faixa com título, texto e até 2 botões.
export function CtaBlock({ block }: { block: any }) {
  const img =
    block.background === "image" && block.bgImage && typeof block.bgImage === "object" && block.bgImage.url
      ? block.bgImage
      : null;
  const bg = BG[block.background] || BG.green;
  const left = block.align === "left";
  return (
    <section className={`relative overflow-hidden rounded-lg p-8 sm:p-10 ${bg}`}>
      {img && <img src={img.url} alt={img.alt || ""} className="absolute inset-0 h-full w-full object-cover" />}
      {img && <div className="absolute inset-0 bg-black/55" />}
      <div className={`relative flex flex-col gap-3 ${left ? "items-start text-left" : "items-center text-center"}`}>
        {block.title && <h2 className="text-2xl font-bold leading-tight">{block.title}</h2>}
        {block.text && <p className="max-w-2xl text-base opacity-90">{block.text}</p>}
        <BlockButtons
          items={block.buttons}
          onDark={bg.includes("text-white")}
          className={`mt-2 ${left ? "" : "justify-center"}`}
        />
      </div>
    </section>
  );
}
