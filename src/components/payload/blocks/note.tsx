/* eslint-disable @typescript-eslint/no-explicit-any */

export function NoteBlock({ block }: { block: any }) {
  return <p className="text-xs text-text-muted">{block.text}</p>;
}
