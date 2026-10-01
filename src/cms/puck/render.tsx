// Render do Construtor (Puck) no servidor: cada componente vira o bloco da biblioteca e
// passa pelo mesmo PageBlock do site (ver config.server.tsx). A zona raiz do Puck é um
// Fragment, então o espaçamento entre os itens fica no wrapper.
import { Render } from "@puckeditor/core/rsc";
import { serverConfig } from "./config.server";
/* eslint-disable @typescript-eslint/no-explicit-any */
export function PuckRender({ data }: { data: any }) {
  if (!data?.content?.length) return null;
  return (
    <div className="space-y-5">
      <Render config={serverConfig} data={data} />
    </div>
  );
}
