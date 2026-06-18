import type { Metadata } from "next";
import Link from "next/link";
import { FileText } from "lucide-react";

export const metadata: Metadata = {
  alternates: { canonical: "/termos-de-uso" },
  title: "Termos de Uso",
  description:
    "Conheça os Termos de Uso do Papo de Bola: regras de navegação, propriedade intelectual, condutas proibidas, privacidade e direitos dos usuários do portal.",
  openGraph: {
    title: "Termos de Uso do Papo de Bola",
    description:
      "Saiba quais são as regras de uso do portal Papo de Bola, incluindo uso permitido, condutas proibidas, propriedade intelectual, publicidade e proteção de dados.",
    url: "/termos-de-uso",
    type: "article",
  },
};

export default function TermosPage() {
  return (
    <div className="mx-auto max-w-[720px] px-4 py-12">
      <h1 className="mb-6 flex items-center gap-2 text-2xl font-bold text-text-primary">
        <FileText className="h-7 w-7 text-green" />
        Termos de Uso
      </h1>

      <div className="space-y-4 rounded-lg border border-border-custom bg-card-bg p-8 text-sm leading-relaxed text-text-secondary">
        <p>
          Ao acessar e utilizar o portal{" "}
          <Link href="/" className="font-semibold text-green hover:underline">
            www.papodebola.com.br
          </Link>
          , você concorda com os presentes Termos de Uso. Leia-os atentamente antes de navegar em
          nosso conteúdo. Caso não concorde com qualquer disposição, recomendamos que não utilize o
          portal.
        </p>

        <h2 className="pt-2 text-base font-bold text-text-primary">1. Identificação</h2>
        <p>
          O portal Papo de Bola é operado por pessoa jurídica inscrita no CNPJ sob o nº
          63.357.728/0001-95, com sede no Estado de São Paulo, Brasil, responsável por todo o
          conteúdo publicado em www.papodebola.com.br.
        </p>

        <h2 className="pt-2 text-base font-bold text-text-primary">2. Sobre o Portal</h2>
        <p>
          O Papo de Bola é um portal de conteúdo esportivo dedicado ao futebol, oferecendo notícias,
          análises, opiniões, estatísticas e demais informações relacionadas ao esporte. O acesso ao
          portal é gratuito e não exige cadastro prévio para a leitura do conteúdo.
        </p>

        <h2 className="pt-2 text-base font-bold text-text-primary">3. Uso Permitido</h2>
        <p>
          Ao acessar o Papo de Bola, você se compromete a utilizar o portal exclusivamente para fins
          lícitos e em conformidade com estes Termos de Uso. É permitido:
        </p>
        <ul className="list-disc space-y-2 pl-5">
          <li>Acessar e ler o conteúdo publicado no portal para uso pessoal e não comercial.</li>
          <li>
            Compartilhar links para as páginas do portal em redes sociais e outros meios, desde que
            sem alteração do conteúdo original.
          </li>
          <li>Entrar em contato com a equipe por meio dos canais oficiais disponibilizados.</li>
        </ul>

        <h2 className="pt-2 text-base font-bold text-text-primary">4. Condutas Proibidas</h2>
        <p>É expressamente proibido ao usuário:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            Reproduzir, copiar, distribuir ou comercializar, total ou parcialmente, qualquer
            conteúdo do portal sem autorização prévia e por escrito do Papo de Bola.
          </li>
          <li>
            Utilizar técnicas de scraping, crawling ou qualquer método automatizado para extração de
            dados do portal.
          </li>
          <li>
            Publicar ou transmitir conteúdo ilegal, ofensivo, discriminatório, difamatório ou que
            viole direitos de terceiros.
          </li>
          <li>Tentar acessar áreas restritas do portal ou comprometer a segurança dos sistemas.</li>
          <li>Utilizar o portal para fins comerciais sem autorização expressa.</li>
          <li>
            Praticar qualquer ato que interfira no funcionamento normal do portal ou prejudique
            outros usuários.
          </li>
        </ul>

        <h2 className="pt-2 text-base font-bold text-text-primary">5. Propriedade Intelectual</h2>
        <p>
          Todo o conteúdo publicado no Papo de Bola, como textos, imagens, logotipos, vídeos e
          ilustrações, pertence ao portal ou aos seus respectivos autores e é protegido pela Lei de
          Direitos Autorais (Lei nº 9.610/1998).
        </p>
        <p>
          A reprodução parcial é permitida desde que citada a fonte com link para o conteúdo
          original. O uso comercial sem autorização prévia é proibido.
        </p>

        <h2 className="pt-2 text-base font-bold text-text-primary">6. Isenção de Responsabilidade</h2>
        <p>
          O Papo de Bola se empenha em publicar informações precisas e atualizadas, porém não
          garante a completude, exatidão ou atualidade de todo o conteúdo disponível no portal.
          Assim, o Papo de Bola não se responsabiliza por:
        </p>
        <ul className="list-disc space-y-2 pl-5">
          <li>Eventuais imprecisões ou desatualizações nas informações publicadas.</li>
          <li>Decisões tomadas pelo usuário com base no conteúdo do portal.</li>
          <li>
            Indisponibilidade temporária do portal por manutenção, falhas técnicas ou motivos de
            força maior.
          </li>
          <li>Conteúdo de sites de terceiros acessados por meio de links disponíveis no portal.</li>
        </ul>

        <h2 className="pt-2 text-base font-bold text-text-primary">7. Links para Sites de Terceiros</h2>
        <p>
          O portal pode conter links para sites externos, como portais de notícias, federações
          esportivas, redes sociais e plataformas de vídeo. Esses links são disponibilizados apenas
          para conveniência do usuário. O Papo de Bola não controla o conteúdo desses sites e não se
          responsabiliza por suas práticas, políticas ou conteúdos.
        </p>

        <h2 className="pt-2 text-base font-bold text-text-primary">8. Publicidade</h2>
        <p>
          O portal Papo de Bola pode exibir anúncios publicitários de terceiros, incluindo por meio
          do Google Ads. O Papo de Bola não se responsabiliza pelo conteúdo dos anúncios exibidos
          nem pelos produtos ou serviços anunciados. A relação entre o usuário e os anunciantes é de
          exclusiva responsabilidade das partes envolvidas.
        </p>

        <h2 className="pt-2 text-base font-bold text-text-primary">9. Privacidade e Proteção de Dados</h2>
        <p>
          O tratamento de dados pessoais dos usuários é regido pela{" "}
          <Link href="/politica-de-privacidade" className="font-semibold text-green hover:underline">
            Política de Privacidade do Papo de Bola
          </Link>
          , em conformidade com a Lei Geral de Proteção de Dados (LGPD – Lei nº 13.709/2018). Ao
          utilizar o portal, você concorda também com os termos da referida política.
        </p>

        <h2 className="pt-2 text-base font-bold text-text-primary">10. Modificações nos Termos de Uso</h2>
        <p>
          O Papo de Bola reserva-se o direito de alterar estes Termos de Uso a qualquer momento, sem
          aviso prévio. As alterações entrarão em vigor a partir de sua publicação no portal. O uso
          continuado do portal após as alterações implica na aceitação dos novos termos.
          Recomendamos a leitura periódica deste documento.
        </p>

        <h2 className="pt-2 text-base font-bold text-text-primary">11. Lei Aplicável e Foro</h2>
        <p>
          Estes Termos de Uso são regidos pelas leis da República Federativa do Brasil. Para a
          resolução de quaisquer controvérsias decorrentes do uso do portal, fica eleito o foro da
          Comarca do Estado de São Paulo, com exclusão de qualquer outro, por mais privilegiado que
          seja.
        </p>

        <h2 className="pt-2 text-base font-bold text-text-primary">12. Contato</h2>
        <p>
          Para dúvidas, sugestões ou solicitações relacionadas a estes Termos de Uso,{" "}
          <Link href="/contato" className="font-semibold text-green hover:underline">
            entre em contato com o Papo de Bola
          </Link>{" "}
          ou envie um e-mail para{" "}
          <a href="mailto:contato@papodebola.com.br" className="font-semibold text-green hover:underline">
            contato@papodebola.com.br
          </a>
          . Responderemos no prazo de até 15 (quinze) dias úteis.
        </p>

        <p className="border-t border-border-light pt-4 text-xs text-text-muted">
          Última atualização: 18 de junho de 2026.
        </p>
      </div>
    </div>
  );
}
