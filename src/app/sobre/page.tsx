import type { Metadata } from "next";
import Link from "next/link";
import { Goal } from "lucide-react";

export const metadata: Metadata = {
  alternates: { canonical: "/sobre" },
  title: "Sobre o Papo de Bola",
  description:
    "Conheça o Papo de Bola: portal de futebol brasileiro e mundial com notícias, placares ao vivo, classificações e cobertura de outros esportes. Nossa história, linha editorial e compromisso com a informação.",
};

export default function SobrePage() {
  return (
    <div className="mx-auto max-w-[720px] px-4 py-12">
      <div className="mb-8 text-center">
        <Goal className="mx-auto mb-3 h-12 w-12 text-green" />
        <h1 className="text-2xl font-bold text-text-primary">Sobre o Papo de Bola</h1>
        <p className="mt-2 text-sm text-text-muted">
          Futebol e esporte, com a paixão de quem vive a bola desde 2004.
        </p>
      </div>

      <div className="space-y-5 rounded-lg border border-border-custom bg-card-bg p-8 text-text-secondary leading-relaxed">
        <p>
          O <strong className="text-text-primary">Papo de Bola</strong> é um portal independente
          dedicado ao futebol brasileiro e mundial. Reunimos em um só lugar notícias, placares ao
          vivo, classificações, calendários, escalações, estatísticas e os bastidores das principais
          competições — tudo de forma rápida, gratuita e fácil de acompanhar, no computador ou no
          celular.
        </p>

        <h2 className="pt-2 text-lg font-bold text-text-primary">Nossa história</h2>
        <p>
          O Papo de Bola nasceu em 2004 como um espaço para torcedores que queriam ir além do
          placar — entender o jogo, debater escalações e acompanhar de perto os times do coração.
          De lá para cá, o portal evoluiu junto com a internet: passou por diferentes formatos até
          a versão atual, totalmente reconstruída com tecnologia moderna para entregar páginas
          rápidas, dados em tempo real e uma experiência de leitura limpa, sem poluição.
        </p>

        <h2 className="pt-2 text-lg font-bold text-text-primary">O que você encontra aqui</h2>
        <p>
          Cobrimos os principais campeonatos do Brasil e do mundo — Brasileirão Série A e B, Copa do
          Brasil, Libertadores, Champions League, Premier League, Copa do Mundo e muito mais — com{" "}
          <Link href="/jogos-de-hoje" className="text-green hover:underline">
            jogos de hoje
          </Link>
          ,{" "}
          <Link href="/ao-vivo" className="text-green hover:underline">
            resultados ao vivo
          </Link>{" "}
          e tabelas atualizadas a cada rodada. Também acompanhamos outros esportes, como NBA, tênis,
          Fórmula 1, vôlei, MMA e futebol americano, com calendários, classificações e chaveamentos.
        </p>
        <p>
          Na seção de{" "}
          <Link href="/noticias" className="text-green hover:underline">
            notícias
          </Link>{" "}
          você acompanha a cobertura editorial do dia a dia da bola: análises, repercussão dos
          jogos, mercado da bola e os assuntos que movimentam o torcedor.
        </p>

        <h2 className="pt-2 text-lg font-bold text-text-primary">Como produzimos o conteúdo</h2>
        <p>
          Acreditamos em informação correta e bem apurada. Nossas matérias são escritas e revisadas
          pela equipe de redação, com foco em clareza, contexto e linguagem acessível ao torcedor.
          Os dados esportivos — placares, escalações, classificações e estatísticas — vêm de
          provedores especializados e fontes oficiais das competições, e são atualizados
          automaticamente para refletir o que acontece em campo.
        </p>
        <p>
          Quando um conteúdo é corrigido ou atualizado, buscamos fazê-lo de forma transparente. Se
          você encontrar alguma informação imprecisa, fale com a gente — levamos as correções a
          sério.
        </p>

        <h2 className="pt-2 text-lg font-bold text-text-primary">Independência e publicidade</h2>
        <p>
          O Papo de Bola é mantido de forma independente. Para custear a operação e seguir
          oferecendo conteúdo gratuito, exibimos anúncios e podemos firmar parcerias comerciais. A
          publicidade nunca interfere na nossa cobertura editorial. O tratamento dos seus dados e o
          uso de cookies estão descritos na nossa{" "}
          <Link href="/privacidade" className="text-green hover:underline">
            Política de Privacidade
          </Link>
          , e as regras de uso do site, nos{" "}
          <Link href="/termos" className="text-green hover:underline">
            Termos de Uso
          </Link>
          .
        </p>

        <h2 className="pt-2 text-lg font-bold text-text-primary">Fale com a gente</h2>
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
          . Bom papo e bom jogo! ⚽
        </p>
      </div>
    </div>
  );
}
