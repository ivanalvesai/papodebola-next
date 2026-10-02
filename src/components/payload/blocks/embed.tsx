/* eslint-disable @typescript-eslint/no-explicit-any */

// HTML incorporado (código livre; o campo é restrito a editor/admin no CMS).
export function EmbedBlock({ block }: { block: any }) {
  const html = String(block.html || "").trim();
  if (!html) return null;
  const h = Number(block.height);
  return (
    <div>
      <div dangerouslySetInnerHTML={{ __html: html }} style={h > 0 ? { minHeight: h } : undefined} />
      {block.note && <p className="mt-1 text-center text-xs text-text-muted">{block.note}</p>}
    </div>
  );
}
