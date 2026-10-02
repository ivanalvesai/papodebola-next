/* eslint-disable @typescript-eslint/no-explicit-any */
import { RichText } from "@payloadcms/richtext-lexical/react";

export function ColumnsBlock({ block }: { block: any }) {
  const cols = block.columns || [];
  const gridCols =
    cols.length >= 4 ? "sm:grid-cols-4" : cols.length === 3 ? "sm:grid-cols-3" : "sm:grid-cols-2";
  return (
    <div className={`grid gap-4 ${gridCols}`}>
      {cols.map((c: any, i: number) => (
        <div key={i}>{c.content ? <RichText data={c.content} /> : null}</div>
      ))}
    </div>
  );
}
