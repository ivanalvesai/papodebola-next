"use client";
import React from "react";
import { useRowLabel } from "@payloadcms/ui";
import { blockSummary } from "@/cms/blocks/summary";

// Rótulo do bloco colapsado: "NN Nome do bloco — resumo". O Payload só repassa
// blockType/rowLabel/rowNumber a Server Components; como este é client, derivamos tudo
// de useRowLabel() + props.field.blocks.
/* eslint-disable @typescript-eslint/no-explicit-any */
type Props = { field?: { blocks?: { slug: string; labels?: any }[] } };

function singular(labels: any): string | undefined {
  const s = labels?.singular;
  if (!s) return undefined;
  if (typeof s === "string") return s;
  if (typeof s === "object") return s.pt || (Object.values(s)[0] as string | undefined);
  return undefined;
}

export function BlockSummaryLabel(props: Props) {
  const row = useRowLabel<any>();
  const data = row?.data || {};
  const type: string = data.blockType || "";
  const label = singular(props.field?.blocks?.find((b) => b.slug === type)?.labels) || type;
  const num = typeof row?.rowNumber === "number" ? String(row.rowNumber + 1).padStart(2, "0") : "";
  const summary = blockSummary(type, data);
  return (
    <span className="pdb-block-label">
      {num ? <span className="pdb-block-label__num">{num}</span> : null} <strong>{label}</strong>
      {summary ? <span className="pdb-block-label__summary"> — {summary}</span> : null}
    </span>
  );
}
