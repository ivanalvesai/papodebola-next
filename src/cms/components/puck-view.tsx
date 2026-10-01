// Aba "Construtor (beta)" da collection `pages` (server component). Só repassa o id do
// documento pro editor Puck (client), que carrega e grava o rascunho pela REST do Payload.
import React from "react";
import type { DocumentViewServerProps } from "payload";
import { PuckEditor } from "@/cms/puck/editor";

export function PuckView(props: DocumentViewServerProps) {
  const id = props.doc?.id as number | string | undefined;
  return <PuckEditor id={id} />;
}
