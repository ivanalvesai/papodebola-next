/* eslint-disable @typescript-eslint/no-explicit-any */

const LINE: Record<string, string> = { sm: "my-1", md: "my-3", lg: "my-6" };
const SPACE: Record<string, string> = { sm: "h-4", md: "h-8", lg: "h-12" };

export function DividerBlock({ block }: { block: any }) {
  const size = block.size || "md";
  if (block.style === "space") return <div aria-hidden="true" className={SPACE[size] || SPACE.md} />;
  return <hr className={`border-border-custom ${LINE[size] || LINE.md}`} />;
}
