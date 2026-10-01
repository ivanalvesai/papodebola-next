/* eslint-disable @typescript-eslint/no-explicit-any */
import { RichText } from "@payloadcms/richtext-lexical/react";

export function ListBlock({ block }: { block: any }) {
  const items = block.items || [];
  return (
    <ul className="list-disc space-y-2 pl-5 [&_a]:text-green [&_a:hover]:underline [&_p]:m-0">
      {items.map((it: any, i: number) => (
        <li key={i}>{it.content ? <RichText data={it.content} /> : null}</li>
      ))}
    </ul>
  );
}
