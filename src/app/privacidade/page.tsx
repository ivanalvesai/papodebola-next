import type { Metadata } from "next";
import Link from "next/link";
import { Shield } from "lucide-react";

export const metadata: Metadata = {
  alternates: { canonical: "/privacidade" },
  title: "Política de Privacidade",
  description:
    "Política de Privacidade do Papo de Bola: como coletamos, utilizamos e protegemos seus dados, uso de cookies, Google Analytics e Google Ads, conforme a LGPD (Lei nº 13.709/2018).",
};

export default function PrivacidadePage() {
  return (
    <div className="mx-auto max-w-[720px] px-4 py-12">
      <h1 className="mb-2 flex items-center gap-2 text-2xl font-bold text-text-primary">
        <Shield className="h-7 w-7 text-green" />
        Política de Privacidade
      </h1>
      <p className="mb-6 text-xs text-text-muted">Vigente desde 18 de junho de 2026.</p>

      <div className="space-y-4 rounded-lg border border-border-custom bg-card-bg p-8 text-sm leading-relaxed text-text-secondary">
        <p>
          Esta Política de Privacidade descreve como o{" "}
          <strong className="text-text-primary">Papo de Bola</strong>, portal de conteúdo esportivo
          disponível em www.papodebola.com.br, coleta, utiliza e protege as informações dos seus
          usuários, em conformidade com a Lei Geral de Proteção de Dados (LGPD – Lei nº
          13.709/2018).
        </p>
        <p>
          Ao navegar em nosso portal, você concorda com as práticas descritas neste documento. Caso
          tenha dúvidas, entre em contato conosco pelos canais indicados ao final desta política.
        </p>

        <h2 className="pt-2 text-base font-bold text-text-primary">1. Informações Coletadas</h2>
        <p>
          O Papo de Bola coleta as seguintes categorias de dados durante a navegação em
          www.papodebola.com.br:
        </p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong className="text-text-primary">Dados de navegação anônimos:</strong> endereço
            IP, tipo de dispositivo, navegador utilizado, páginas visitadas e tempo de permanência
            no site.
          </li>
          <li>
            <strong className="text-text-primary">Cookies e tecnologias semelhantes:</strong>{" "}
            utilizados para armazenar preferências e melhorar a experiência de uso (veja a Seção 2).
          </li>
          <li>
            <strong className="text-text-primary">Dados fornecidos voluntariamente:</strong> caso
            você preencha formulários de contato, cadastro de newsletter ou comentários, poderemos
            coletar nome, e-mail e outras informações por você informadas.
          </li>
        </ul>
        <p>Não coletamos dados pessoais identificáveis sem o seu consentimento expresso.</p>

        <h2 className="pt-2 text-base font-bold text-text-primary">2. Uso de Cookies</h2>
        <p>
          O portal www.papodebola.com.br utiliza cookies para melhorar a navegação e entender como
          os usuários interagem com nossas páginas. Você pode gerenciar ou desativar os cookies nas
          configurações do seu navegador.
        </p>
        <p>Tipos de cookies utilizados:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong className="text-text-primary">Cookies funcionais:</strong> garantem o
            funcionamento correto do site e o armazenamento de preferências de navegação.
          </li>
          <li>
            <strong className="text-text-primary">Cookies de análise:</strong> coletam dados
            anônimos sobre o comportamento dos visitantes por meio do Google Analytics.
          </li>
          <li>
            <strong className="text-text-primary">Cookies de publicidade:</strong> utilizados para
            exibição de anúncios relevantes, em conformidade com as políticas do Google Ads. Para
            veicular publicidade, utilizamos o <strong className="text-text-primary">Google AdSense</strong>{" "}
            e fornecedores terceiros, que empregam cookies (como o cookie DoubleClick) para exibir
            anúncios mais relevantes em toda a Web, com base em visitas anteriores a este e a outros
            sites, e para limitar o número de vezes que um anúncio é exibido a você. Você pode
            desativar a publicidade personalizada nas{" "}
            <a
              href="https://www.google.com/settings/ads"
              target="_blank"
              rel="noopener noreferrer"
              className="text-green hover:underline"
            >
              Configurações de anúncios do Google
            </a>
            .
          </li>
        </ul>
        <p>A desativação de cookies pode impactar o funcionamento de algumas funcionalidades do portal.</p>

        <h2 className="pt-2 text-base font-bold text-text-primary">3. Finalidade do Uso dos Dados</h2>
        <p>As informações coletadas pelo Papo de Bola são utilizadas exclusivamente para:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>Melhorar a experiência de navegação e o conteúdo do portal.</li>
          <li>Analisar o desempenho e o tráfego do site por meio do Google Analytics.</li>
          <li>
            Exibir anúncios relevantes ao perfil de navegação por meio do Google AdSense e de
            fornecedores terceiros, em conformidade com as políticas do Google.
          </li>
          <li>
            Enviar comunicações, como newsletters ou atualizações de conteúdo, caso você tenha se
            cadastrado.
          </li>
          <li>Cumprir obrigações legais e regulatórias.</li>
        </ul>

        <h2 className="pt-2 text-base font-bold text-text-primary">4. Compartilhamento de Dados</h2>
        <p>
          O Papo de Bola não vende, troca nem transfere seus dados pessoais a terceiros sem o seu
          consentimento. Podemos, entretanto:
        </p>
        <ul className="list-disc space-y-2 pl-5">
          <li>Compartilhar dados anônimos e agregados com parceiros analíticos para fins estatísticos.</li>
          <li>Divulgar informações quando exigido por lei, ordem judicial ou autoridade competente.</li>
          <li>
            Compartilhar dados com prestadores de serviço que auxiliam na operação do portal (ex.:
            hospedagem, plataformas de e-mail marketing), sempre sob acordos de confidencialidade
            alinhados à LGPD.
          </li>
        </ul>

        <h2 className="pt-2 text-base font-bold text-text-primary">5. Segurança das Informações</h2>
        <p>
          O Papo de Bola adota medidas técnicas e organizacionais adequadas para proteger suas
          informações contra acesso não autorizado, alteração, divulgação ou destruição, incluindo:
        </p>
        <ul className="list-disc space-y-2 pl-5">
          <li>Uso de conexões seguras (HTTPS) em todo o portal.</li>
          <li>Controle de acesso restrito aos sistemas internos.</li>
          <li>Monitoramento periódico de vulnerabilidades.</li>
        </ul>
        <p>
          Embora nos esforcemos para garantir a segurança dos dados, nenhum sistema é completamente
          inviolável. Em caso de incidente de segurança que possa lhe afetar, notificaremos você
          conforme determinado pela LGPD.
        </p>

        <h2 className="pt-2 text-base font-bold text-text-primary">6. Seus Direitos (LGPD)</h2>
        <p>
          Conforme a Lei Geral de Proteção de Dados (Lei nº 13.709/2018), você tem os seguintes
          direitos em relação aos seus dados pessoais:
        </p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong className="text-text-primary">Acesso:</strong> solicitar a confirmação da
            existência de tratamento e o acesso aos seus dados.
          </li>
          <li>
            <strong className="text-text-primary">Correção:</strong> requerer a correção de dados
            incompletos, inexatos ou desatualizados.
          </li>
          <li>
            <strong className="text-text-primary">Exclusão:</strong> solicitar a eliminação dos
            dados tratados com base no seu consentimento.
          </li>
          <li>
            <strong className="text-text-primary">Portabilidade:</strong> obter seus dados em
            formato estruturado para transferência a outro fornecedor.
          </li>
          <li>
            <strong className="text-text-primary">Revogação do consentimento:</strong> retirar o
            consentimento a qualquer momento, sem prejuízo ao tratamento realizado anteriormente.
          </li>
          <li>
            <strong className="text-text-primary">Oposição:</strong> opor-se ao tratamento de dados
            em caso de descumprimento da LGPD.
          </li>
        </ul>
        <p>
          Para exercer qualquer um desses direitos, entre em contato conosco pelo e-mail indicado ao
          final desta política.
        </p>

        <h2 className="pt-2 text-base font-bold text-text-primary">7. Retenção de Dados</h2>
        <p>
          Os dados pessoais coletados pelo Papo de Bola são armazenados pelo tempo necessário para
          cumprir as finalidades descritas nesta política, observados os prazos legais aplicáveis.
          Após o término do tratamento, os dados serão eliminados de forma segura ou anonimizados.
        </p>

        <h2 className="pt-2 text-base font-bold text-text-primary">8. Links para Sites de Terceiros</h2>
        <p>
          O portal www.papodebola.com.br pode conter links para sites externos, como portais de
          notícias, federações esportivas, redes sociais e plataformas de vídeo. O Papo de Bola não
          se responsabiliza pelas práticas de privacidade desses sites e recomenda que você consulte
          as respectivas políticas de privacidade antes de fornecer quaisquer informações pessoais.
        </p>

        <h2 className="pt-2 text-base font-bold text-text-primary">9. Alterações nesta Política</h2>
        <p>
          Esta Política de Privacidade pode ser atualizada periodicamente para refletir mudanças nas
          nossas práticas ou na legislação aplicável. Quaisquer alterações serão publicadas nesta
          página, com atualização da data de vigência indicada no topo do documento. Recomendamos
          que você revise esta política regularmente.
        </p>

        <h2 className="pt-2 text-base font-bold text-text-primary">
          10. Contato e Encarregado de Dados (DPO)
        </h2>
        <p>
          Para dúvidas, solicitações ou exercício dos seus direitos previstos na LGPD, entre em
          contato com o Papo de Bola:
        </p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            Portal:{" "}
            <Link href="/" className="text-green hover:underline">
              www.papodebola.com.br
            </Link>
          </li>
          <li>
            E-mail:{" "}
            <a href="mailto:contato@papodebola.com.br" className="text-green hover:underline">
              contato@papodebola.com.br
            </a>
          </li>
        </ul>
        <p>
          Responderemos às solicitações no prazo de até 15 (quinze) dias úteis, conforme previsto na
          LGPD.
        </p>
      </div>
    </div>
  );
}
