import type { Metadata } from "next";
import { Mail, MessageCircle } from "lucide-react";
import { getPayloadPage } from "@/lib/data/payload-pages";
import { PageBlocks } from "@/components/payload/page-blocks";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPayloadPage("contato");
  return {
    alternates: { canonical: "/contato" },
    title: page?.seo?.metaTitle || "Contato",
    description:
      page?.seo?.metaDescription ||
      "Entre em contato com o Papo de Bola. Envie sugestoes, duvidas ou parcerias.",
  };
}

function ContatoFallback() {
  return (
    <div className="mx-auto max-w-[680px] px-4 py-12">
      <h1 className="text-2xl font-bold text-text-primary mb-6 flex items-center gap-2">
        <MessageCircle className="h-7 w-7 text-green" />
        Contato
      </h1>

      <div className="bg-card-bg rounded-lg border border-border-custom p-8 space-y-6">
        <p className="text-text-secondary leading-relaxed">
          Tem alguma sugestao, duvida ou gostaria de propor uma parceria?
          Entre em contato conosco pelos canais abaixo.
        </p>

        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 bg-body rounded-lg">
            <Mail className="h-5 w-5 text-green shrink-0" />
            <div>
              <div className="text-sm font-semibold text-text-primary">E-mail</div>
              <div className="text-sm text-text-muted">contato@papodebola.com.br</div>
            </div>
          </div>
        </div>

        <p className="text-xs text-text-muted">
          Respondemos todas as mensagens em ate 48 horas uteis.
        </p>
      </div>
    </div>
  );
}

export default async function ContatoPage() {
  const page = await getPayloadPage("contato");
  if (page) return <PageBlocks page={page} />;
  return <ContatoFallback />;
}
