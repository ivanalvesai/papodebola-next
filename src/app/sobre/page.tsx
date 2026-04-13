import type { Metadata } from "next";
import { Goal } from "lucide-react";

export const metadata: Metadata = {
  title: "Sobre",
  description: "Sobre o Papo de Bola - Portal de futebol brasileiro e mundial com noticias, placares e classificacoes.",
};

export default function SobrePage() {
  return (
    <div className="mx-auto max-w-[680px] px-4 py-12">
      <div className="text-center mb-8">
        <Goal className="h-12 w-12 text-green mx-auto mb-3" />
        <h1 className="text-2xl font-bold text-text-primary">Sobre o Papo de Bola</h1>
      </div>

      <div className="bg-card-bg rounded-lg border border-border-custom p-8 space-y-6 text-text-secondary leading-relaxed">
        <p>
          O <strong className="text-text-primary">Papo de Bola</strong> e um portal de futebol brasileiro e mundial
          que reune noticias, placares ao vivo, classificacoes, transferencias e muito mais em um so lugar.
        </p>
        <p>
          Nosso objetivo e oferecer informacao de qualidade sobre futebol de forma rapida, acessivel e gratuita.
          Cobrimos os principais campeonatos do Brasil e do mundo, incluindo Brasileirao, Copa do Brasil,
          Libertadores, Champions League, Premier League e outros.
        </p>
        <p>
          Alem do futebol, tambem acompanhamos outros esportes como NBA, Tenis, Formula 1, MMA e mais,
          trazendo resultados, calendarios e classificacoes atualizados.
        </p>
        <p>
          O Papo de Bola utiliza tecnologia de ponta para entregar conteudo atualizado em tempo real,
          com artigos gerados e revisados pela nossa equipe de redacao.
        </p>
      </div>
    </div>
  );
}
