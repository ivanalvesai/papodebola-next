"use client";
import React from "react";
import { useRowLabel } from "@payloadcms/ui";

/* eslint-disable @typescript-eslint/no-explicit-any */
// Rótulo da linha em "Textos da tela": mostra a descrição ou, sem ela, a chave.
export function TextRowLabel() {
  const row = useRowLabel<any>();
  const data = row?.data || {};
  const text: string = data.label || data.key || "";
  const num = typeof row?.rowNumber === "number" ? `${String(row.rowNumber + 1).padStart(2, "0")} ` : "";
  return <span>{num}{text || "Texto"}</span>;
}
