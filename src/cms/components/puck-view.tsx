// Aba "Construtor (beta)" da collection `pages` (server component). Só repassa o id do
// documento pro editor Puck (client), que carrega e grava o rascunho pela REST do Payload.
// Só editores e administradores usam o Construtor (o campo puckData já é travado pros
// outros papéis; aqui a aba explica em vez de abrir um editor que não salva).
import React from "react";
import type { DocumentViewServerProps } from "payload";
import { PuckEditor } from "@/cms/puck/editor";
import { hasRole } from "@/cms/lib/access";
/* eslint-disable @typescript-eslint/no-explicit-any */

export function PuckView(props: DocumentViewServerProps) {
  const user = (props.initPageResult?.req?.user ?? (props as any).user) as any;
  if (!hasRole(user, "editor", "admin")) {
    return (
      <div style={{ padding: 32 }}>
        <p>O Construtor está disponível só pra editores e administradores.</p>
      </div>
    );
  }
  const id = props.doc?.id as number | string | undefined;
  return <PuckEditor id={id} />;
}
