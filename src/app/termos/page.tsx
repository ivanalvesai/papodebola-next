import type { Metadata } from "next";
import { FileText } from "lucide-react";

export const metadata: Metadata = {
  alternates: { canonical: "/termos" },
  title: "Termos de Uso",
  description:
    "Termos de Uso do Papo de Bola: condições de acesso e utilização do site, licença de uso, isenção de responsabilidade e lei aplicável.",
};

export default function TermosPage() {
  return (
    <div className="mx-auto max-w-[680px] px-4 py-12">
      <h1 className="mb-6 flex items-center gap-2 text-2xl font-bold text-text-primary">
        <FileText className="h-7 w-7 text-green" />
        Termos de Uso
      </h1>

      <div className="space-y-4 rounded-lg border border-border-custom bg-card-bg p-8 text-sm leading-relaxed text-text-secondary">
        <h2 className="text-base font-bold text-text-primary">1. Termos</h2>
        <p>
          Ao acessar ao site <strong className="text-text-primary">Papo de Bola</strong>, concorda
          em cumprir estes termos de serviço, todas as leis e regulamentos aplicáveis e concorda
          que é responsável pelo cumprimento de todas as leis locais aplicáveis. Se você não
          concordar com algum desses termos, está proibido de usar ou acessar este site. Os
          materiais contidos neste site são protegidos pelas leis de direitos autorais e marcas
          comerciais aplicáveis.
        </p>

        <h2 className="text-base font-bold text-text-primary">2. Uso de Licença</h2>
        <p>
          É concedida permissão para baixar temporariamente uma cópia dos materiais (informações
          ou software) no site Papo de Bola, apenas para visualização transitória pessoal e não
          comercial. Esta é a concessão de uma licença, não uma transferência de título e, sob
          esta licença, você não pode:
        </p>
        <ul className="list-disc space-y-2 pl-5">
          <li>modificar ou copiar os materiais;</li>
          <li>
            usar os materiais para qualquer finalidade comercial ou para exibição pública
            (comercial ou não comercial);
          </li>
          <li>
            tentar descompilar ou fazer engenharia reversa de qualquer software contido no site
            Papo de Bola;
          </li>
          <li>remover quaisquer direitos autorais ou outras notações de propriedade dos materiais; ou</li>
          <li>
            transferir os materiais para outra pessoa ou &lsquo;espelhe&rsquo; os materiais em
            qualquer outro servidor.
          </li>
        </ul>
        <p>
          Esta licença será automaticamente rescindida se você violar alguma dessas restrições e
          poderá ser rescindida por Papo de Bola a qualquer momento. Ao encerrar a visualização
          desses materiais ou após o término desta licença, você deve apagar todos os materiais
          baixados em sua posse, seja em formato eletrónico ou impresso.
        </p>

        <h2 className="text-base font-bold text-text-primary">3. Isenção de responsabilidade</h2>
        <p>
          Os materiais no site da Papo de Bola são fornecidos &lsquo;como estão&rsquo;. Papo de
          Bola não oferece garantias, expressas ou implícitas, e, por este meio, isenta e nega
          todas as outras garantias, incluindo, sem limitação, garantias implícitas ou condições de
          comercialização, adequação a um fim específico ou não violação de propriedade
          intelectual ou outra violação de direitos.
        </p>
        <p>
          Além disso, o Papo de Bola não garante ou faz qualquer representação relativa à precisão,
          aos resultados prováveis ou à confiabilidade do uso dos materiais em seu site ou de outra
          forma relacionado a esses materiais ou em sites vinculados a este site.
        </p>

        <h2 className="text-base font-bold text-text-primary">4. Limitações</h2>
        <p>
          Em nenhum caso o Papo de Bola ou seus fornecedores serão responsáveis por quaisquer danos
          (incluindo, sem limitação, danos por perda de dados ou lucro ou devido a interrupção dos
          negócios) decorrentes do uso ou da incapacidade de usar os materiais em Papo de Bola,
          mesmo que Papo de Bola ou um representante autorizado da Papo de Bola tenha sido
          notificado oralmente ou por escrito da possibilidade de tais danos. Como algumas
          jurisdições não permitem limitações em garantias implícitas, ou limitações de
          responsabilidade por danos conseqüentes ou incidentais, essas limitações podem não se
          aplicar a você.
        </p>

        <h2 className="text-base font-bold text-text-primary">5. Precisão dos materiais</h2>
        <p>
          Os materiais exibidos no site da Papo de Bola podem incluir erros técnicos, tipográficos
          ou fotográficos. Papo de Bola não garante que qualquer material em seu site seja preciso,
          completo ou atual. Papo de Bola pode fazer alterações nos materiais contidos em seu site
          a qualquer momento, sem aviso prévio. No entanto, Papo de Bola não se compromete a
          atualizar os materiais.
        </p>

        <h2 className="text-base font-bold text-text-primary">6. Links</h2>
        <p>
          O Papo de Bola não analisou todos os sites vinculados ao seu site e não é responsável
          pelo conteúdo de nenhum site vinculado. A inclusão de qualquer link não implica endosso
          por Papo de Bola do site. O uso de qualquer site vinculado é por conta e risco do
          usuário.
        </p>

        <h2 className="text-base font-bold text-text-primary">Modificações</h2>
        <p>
          O Papo de Bola pode revisar estes termos de serviço do site a qualquer momento, sem aviso
          prévio. Ao usar este site, você concorda em ficar vinculado à versão atual desses termos
          de serviço.
        </p>

        <h2 className="text-base font-bold text-text-primary">Lei aplicável</h2>
        <p>
          Estes termos e condições são regidos e interpretados de acordo com as leis do Papo de
          Bola e você se submete irrevogavelmente à jurisdição exclusiva dos tribunais naquele
          estado ou localidade.
        </p>

        <p className="border-t border-border-light pt-4 text-xs text-text-muted">
          Última atualização: 18 de junho de 2026.
        </p>
      </div>
    </div>
  );
}
