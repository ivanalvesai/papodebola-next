/* eslint-disable @typescript-eslint/no-explicit-any */

export function ButtonBlock({ block }: { block: any }) {
  return (
    <a
      href={block.url}
      className={`inline-block rounded-lg px-4 py-2 text-sm font-semibold ${
        block.style === "outline" ? "border border-green text-green" : "bg-green text-white"
      }`}
    >
      {block.label}
    </a>
  );
}
