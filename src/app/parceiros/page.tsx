import type { Metadata } from "next";
import { Handshake, Mail } from "lucide-react";
import { PageBreadcrumb } from "@/components/seo/page-breadcrumb";

export const metadata: Metadata = {
  title: "Parceiros - Papo de Bola",
  description:
    "Seja um parceiro do Papo de Bola. Divulgação, publieditoriais e parcerias comerciais.",
};

export default function ParceirosPage() {
  return (
    <div className="mx-auto max-w-[800px] px-4 py-8">
      <PageBreadcrumb
        className="mb-4"
        items={[
          { label: "Início", href: "/" },
          { label: "Parceiros" },
        ]}
      />
      <h1 className="text-2xl font-bold text-text-primary mb-6 flex items-center gap-2">
        <Handshake className="h-7 w-7 text-green" />
        Parceiros
      </h1>

      <div className="bg-card-bg rounded-lg border border-border-custom p-6 space-y-4">
        <p className="text-sm text-text-secondary leading-relaxed">
          O Papo de Bola está aberto a parcerias com marcas, clubes, ligas, casas de apostas,
          produtoras de conteúdo e anunciantes que queiram alcançar uma audiência qualificada
          de fãs de futebol e outros esportes.
        </p>

        <div>
          <h2 className="text-base font-bold text-text-primary mb-2">Formatos de parceria</h2>
          <ul className="list-disc list-inside space-y-1 text-sm text-text-secondary">
            <li>Conteúdo patrocinado (publieditoriais)</li>
            <li>Banners em páginas-chave (home, campeonatos, páginas de times)</li>
            <li>Cobertura editorial de eventos e campanhas</li>
            <li>Integração de API/dados esportivos</li>
            <li>Distribuição em canais (newsletter, Telegram, WhatsApp)</li>
          </ul>
        </div>

        <div className="pt-4 border-t border-border-custom">
          <h2 className="text-base font-bold text-text-primary mb-2 flex items-center gap-2">
            <Mail className="h-4 w-4 text-green" />
            Fale com a gente
          </h2>
          <p className="text-sm text-text-secondary">
            Envie proposta para{" "}
            <a
              href="mailto:parceiros@papodebola.com.br"
              className="text-green font-semibold hover:underline"
            >
              parceiros@papodebola.com.br
            </a>
            {" "}com uma breve apresentação da empresa, objetivos da campanha e formatos de interesse.
            Retornamos em até 2 dias úteis.
          </p>
        </div>
      </div>
    </div>
  );
}
