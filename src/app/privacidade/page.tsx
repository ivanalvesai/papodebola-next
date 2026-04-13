import type { Metadata } from "next";
import { Shield } from "lucide-react";

export const metadata: Metadata = {
  title: "Politica de Privacidade",
  description: "Politica de Privacidade do Papo de Bola conforme a LGPD.",
};

export default function PrivacidadePage() {
  return (
    <div className="mx-auto max-w-[680px] px-4 py-12">
      <h1 className="text-2xl font-bold text-text-primary mb-6 flex items-center gap-2">
        <Shield className="h-7 w-7 text-green" />
        Politica de Privacidade
      </h1>

      <div className="bg-card-bg rounded-lg border border-border-custom p-8 space-y-6 text-sm text-text-secondary leading-relaxed">
        <p>
          Esta Politica de Privacidade descreve como o <strong className="text-text-primary">Papo de Bola</strong>{" "}
          coleta, usa e protege as informacoes dos usuarios, em conformidade com a Lei Geral de Protecao de Dados (LGPD - Lei 13.709/2018).
        </p>

        <h2 className="text-base font-bold text-text-primary">1. Informacoes Coletadas</h2>
        <p>
          Coletamos informacoes de navegacao anonimas (cookies, IP, tipo de dispositivo) para melhorar a experiencia do usuario e analisar o trafego do site. Nao coletamos dados pessoais identificaveis sem o seu consentimento.
        </p>

        <h2 className="text-base font-bold text-text-primary">2. Uso de Cookies</h2>
        <p>
          Utilizamos cookies para armazenar preferencias de navegacao e para fins analiticos. Voce pode desabilitar os cookies nas configuracoes do seu navegador.
        </p>

        <h2 className="text-base font-bold text-text-primary">3. Compartilhamento de Dados</h2>
        <p>
          Nao vendemos, trocamos ou transferimos suas informacoes pessoais para terceiros. Podemos compartilhar dados anonimos e agregados com parceiros analiticos.
        </p>

        <h2 className="text-base font-bold text-text-primary">4. Seguranca</h2>
        <p>
          Adotamos medidas de seguranca para proteger suas informacoes contra acesso nao autorizado, alteracao ou destruicao.
        </p>

        <h2 className="text-base font-bold text-text-primary">5. Seus Direitos</h2>
        <p>
          Conforme a LGPD, voce tem direito a acessar, corrigir, excluir e portar seus dados pessoais. Para exercer esses direitos, entre em contato conosco.
        </p>

        <h2 className="text-base font-bold text-text-primary">6. Alteracoes</h2>
        <p>
          Podemos atualizar esta politica periodicamente. Quaisquer alteracoes serao publicadas nesta pagina.
        </p>

        <p className="text-xs text-text-muted pt-4 border-t border-border-light">
          Ultima atualizacao: Abril 2026
        </p>
      </div>
    </div>
  );
}
