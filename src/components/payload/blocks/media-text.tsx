/* eslint-disable @typescript-eslint/no-explicit-any, @next/next/no-img-element */
import { RichText } from "@payloadcms/richtext-lexical/react";
import { BlockButtons } from "./buttons";

// Imagem + texto lado a lado (empilha no celular, imagem primeiro).
export function MediaTextBlock({ block }: { block: any }) {
  const img = block.image && typeof block.image === "object" && block.image.url ? block.image : null;
  const right = block.imageSide === "right";
  const button = block.button?.label && block.button?.href ? [{ ...block.button, style: "primary" }] : [];
  return (
    <div className="grid items-center gap-6 md:grid-cols-2">
      {img && (
        <div className={right ? "md:order-2" : ""}>
          <img src={img.url} alt={img.alt || block.title || ""} className="w-full rounded-lg object-cover" />
        </div>
      )}
      <div className={`flex flex-col gap-3 ${right ? "md:order-1" : ""}`}>
        {block.title && <h2 className="text-lg font-bold text-text-primary">{block.title}</h2>}
        {block.text && (
          <div className="space-y-3 text-text-secondary [&_a]:text-green [&_a:hover]:underline [&_p]:m-0">
            <RichText data={block.text} />
          </div>
        )}
        <BlockButtons items={button} />
      </div>
    </div>
  );
}
