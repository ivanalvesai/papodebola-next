/* eslint-disable @typescript-eslint/no-explicit-any */
import { FaqSchema } from "@/components/seo/faq-schema";

// Perguntas frequentes: sanfona nativa (<details>) + JSON-LD FAQPage (desligável no bloco).
export function FaqBlock({ block }: { block: any }) {
  const items = (block.items || [])
    .filter((it: any) => it?.question && it?.answer)
    .map((it: any) => ({ question: String(it.question), answer: String(it.answer) }));
  if (!items.length) return null;
  return (
    <div>
      {block.title && <h2 className="mb-3 text-lg font-bold text-text-primary">{block.title}</h2>}
      <div className="space-y-2">
        {items.map((it: { question: string; answer: string }, i: number) => (
          <details key={i} className="group rounded-lg border border-border-custom bg-card-bg">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 font-semibold text-text-primary [&::-webkit-details-marker]:hidden">
              <span>{it.question}</span>
              <span aria-hidden="true" className="text-xl leading-none text-green transition-transform group-open:rotate-45">+</span>
            </summary>
            <div className="whitespace-pre-line px-4 pb-4 text-text-secondary">{it.answer}</div>
          </details>
        ))}
      </div>
      {block.schema !== false && <FaqSchema items={items} />}
    </div>
  );
}
