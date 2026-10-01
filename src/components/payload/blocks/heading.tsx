/* eslint-disable @typescript-eslint/no-explicit-any */

export function HeadingBlock({ block }: { block: any }) {
  const Tag = block.level === "h3" ? "h3" : "h2";
  const size = block.level === "h3" ? "text-base" : "text-lg";
  return <Tag className={`pt-2 ${size} font-bold text-text-primary`}>{block.text}</Tag>;
}
