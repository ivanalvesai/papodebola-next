import type { Metadata } from "next";
import Link from "next/link";
import { Goal } from "lucide-react";
import { Editable, getEditableText } from "@/components/editable";

export async function generateMetadata(): Promise<Metadata> {
  const [title, description] = await Promise.all([
    getEditableText("sobre.meta.title"),
    getEditableText("sobre.meta.description"),
  ]);
  return {
    alternates: { canonical: "/sobre" },
    title,
    description,
    openGraph: {
      title: "Conheça quem está por trás do Papo de Bola",
      description:
        "Saiba quem está por trás do Papo de Bola, portal independente de futebol e esportes com notícias, placares ao vivo, classificações e cobertura desde 2004.",
      url: "/sobre",
      type: "website",
    },
  };
}

export default function SobrePage() {
  return (
    <div className="mx-auto max-w-[720px] px-4 py-12">
      <div className="mb-8 text-center">
        <Goal className="mx-auto mb-3 h-12 w-12 text-green" />
        <Editable id="sobre.h1" as="h1" className="text-2xl font-bold text-text-primary" />
        <Editable id="sobre.subtitle" as="p" className="mt-2 text-sm text-text-muted" />
      </div>

      <div className="space-y-5 rounded-lg border border-border-custom bg-card-bg p-8 text-text-secondary leading-relaxed">
        <Editable id="sobre.intro" as="p" />

        <Editable id="sobre.historia.h2" as="h2" className="pt-2 text-lg font-bold text-text-primary" />
        <Editable id="sobre.historia.p" as="p" />

        <Editable id="sobre.encontra.h2" as="h2" className="pt-2 text-lg font-bold text-text-primary" />
        <p>
          Cobrimos os principais campeonatos do Brasil e do mundo, Brasileirão Série A e B, Copa do
          Brasil, Libertadores, Champions League, Premier League, Copa do Mundo e muito mais, com{" "}
          <Link href="/jogos-de-hoje" className="text-green hover:underline">
            jogos de hoje
          </Link>
          ,{" "}
          <Link href="/ao-vivo" className="text-green hover:underline">
            resultados ao vivo
          </Link>{" "}
          e tabelas atualizadas a cada rodada. Também acompanhamos NBA, tênis, Fórmula 1, vôlei, MMA
          e futebol americano, com calendários, classificações e chaveamentos.
        </p>
        <p>
          Na seção de{" "}
          <Link href="/noticias" className="text-green hover:underline">
            notícias
          </Link>{" "}
          você acompanha a cobertura editorial do dia a dia da bola: análises, repercussão dos
          jogos, mercado da bola e os assuntos que movimentam o torcedor.
        </p>

        <Editable id="sobre.producao.h2" as="h2" className="pt-2 text-lg font-bold text-text-primary" />
        <Editable id="sobre.producao.p1" as="p" />
        <Editable id="sobre.producao.p2" as="p" />

        <Editable id="sobre.independencia.h2" as="h2" className="pt-2 text-lg font-bold text-text-primary" />
        <p>
          O site é mantido de forma independente. Para custear a operação e seguir oferecendo
          conteúdo gratuito, exibimos anúncios e podemos firmar parcerias comerciais. A publicidade
          nunca interfere na cobertura editorial. O tratamento dos seus dados e o
          uso de cookies estão descritos na nossa{" "}
          <Link href="/politica-de-privacidade" className="text-green hover:underline">
            Política de Privacidade
          </Link>
          , e as regras de uso do site, nos{" "}
          <Link href="/termos-de-uso" className="text-green hover:underline">
            Termos de Uso
          </Link>
          .
        </p>

        <Editable id="sobre.contato.h2" as="h2" className="pt-2 text-lg font-bold text-text-primary" />
        <p>
          Sugestões de pauta, correções, dúvidas ou propostas de parceria são sempre bem-vindas.
          Entre em contato pela nossa página de{" "}
          <Link href="/contato" className="text-green hover:underline">
            contato
          </Link>{" "}
          ou pelo e-mail{" "}
          <a href="mailto:contato@papodebola.com.br" className="text-green hover:underline">
            contato@papodebola.com.br
          </a>
          .
        </p>
        <p>
          Nosso compromisso é simples: entregar informação de qualidade para quem vive o esporte.
          Bom papo e bom jogo! ⚽
        </p>
      </div>
    </div>
  );
}
