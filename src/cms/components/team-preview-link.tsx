"use client";
import React from "react";
import { useFormFields } from "@payloadcms/ui";

export function TeamPreviewLink(props: { field?: { admin?: { custom?: { aba?: string } } } }) {
  const slug = useFormFields(([fields]) => fields?.slug?.value as string | undefined);
  const aba = props.field?.admin?.custom?.aba || "hub";
  if (!slug) return null;
  const href = `/cms-preview/time/${slug}/${aba}`;
  return (
    <p className="pdb-preview-link">
      <a href={href} target="_blank" rel="noreferrer">Ver esta aba no preview ↗</a>
      <span> (abre em nova janela; usa sua sessão do CMS)</span>
    </p>
  );
}
