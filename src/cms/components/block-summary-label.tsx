"use client";
import React from "react";
import { useRowLabel } from "@payloadcms/ui";
import { blockSummary } from "@/cms/blocks/summary";

// Rótulo do bloco colapsado: "Nome do bloco — resumo". Recebe blockType/rowLabel do
// Payload (BlockRowLabelClientComponent) e os dados da linha via useRowLabel.
/* eslint-disable @typescript-eslint/no-explicit-any */
export function BlockSummaryLabel(props: { blockType?: string; rowLabel?: string; rowNumber?: number }) {
  const row = useRowLabel<any>();
  const data = row?.data || {};
  const type = props.blockType || data.blockType || "";
  const summary = blockSummary(type, data);
  return (
    <span className="pdb-block-label">
      <strong>{props.rowLabel || type}</strong>
      {summary ? <span className="pdb-block-label__summary"> — {summary}</span> : null}
    </span>
  );
}
