/* eslint-disable @typescript-eslint/no-explicit-any */

export function QuoteBlock({ block }: { block: any }) {
  return (
    <blockquote className="border-l-4 border-green pl-4 italic text-text-primary">
      <p>{block.text}</p>
      {block.author && <footer className="mt-1 text-sm not-italic text-text-muted">— {block.author}</footer>}
    </blockquote>
  );
}
