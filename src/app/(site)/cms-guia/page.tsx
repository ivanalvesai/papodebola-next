import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { assertPreviewAccess } from "@/lib/cms-preview-auth";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { robots: "noindex, nofollow", title: "Guia do CMS" };

const H2 = "text-xl font-bold text-text-primary mt-8 mb-3";
const P = "text-text-secondary leading-relaxed mb-3";
const OL = "list-decimal pl-6 space-y-2 text-text-secondary leading-relaxed mb-3";
const UL = "list-disc pl-6 space-y-1 text-text-secondary leading-relaxed mb-3";

export default async function CmsGuiaPage() {
  if (!(await assertPreviewAccess())) notFound();
  return (
    <main className="max-w-[720px] mx-auto px-4 py-8">
      <article className="bg-card-bg rounded-lg border border-border-custom p-8">
        <h1 className="text-3xl font-bold text-text-primary mb-4">Guia do CMS</h1>
        <p className={P}>Como montar e publicar páginas no painel (/cms), sem precisar de ajuda técnica.</p>

        <h2 className={H2}>1. Criar uma página</h2>
        <ol className={OL}>
          <li>Em Páginas, clique em Criar novo (ou use Nova página no início do painel).</li>
          <li>Preencha o nome da página e o caminho (o endereço, por exemplo: parceiros/ofertas).</li>
          <li>Clique em Salvar rascunho. A página só aparece no site depois de publicada.</li>
        </ol>

        <h2 className={H2}>2. Aparência</h2>
        <p className={P}>Na aba de aparência da página você ajusta o topo (hero) e o estilo do layout: largura, fundo e espaçamentos.</p>

        <h2 className={H2}>3. Blocos</h2>
        <p className={P}>A página é feita de blocos empilhados. Clique em Adicionar bloco e escolha por grupo:</p>
        <ul className={UL}>
          <li>Texto e mídia: textos, imagens, vídeos.</li>
          <li>Layout: colunas, divisores, imagem com texto.</li>
          <li>Destaques: hero, cards, números, chamadas para ação.</li>
          <li>Interação: botões, formulários, perguntas frequentes.</li>
          <li>Incorporar: X (Twitter), Instagram, YouTube e HTML.</li>
          <li>Dados ao vivo: placares, tabelas e jogos do dia.</li>
          <li>Trechos: grupos de blocos salvos para reutilizar.</li>
        </ul>
        <p className={P}>Arraste o bloco pela alça para reordenar. Em cada bloco você pode escolher onde ele aparece: celular, tablet, computador ou todos.</p>

        <h2 className={H2}>4. Live Preview</h2>
        <p className={P}>Abra o Live Preview para ver a página ao lado do editor enquanto você escreve. Use os botões de tamanho para testar celular e computador.</p>

        <h2 className={H2}>5. Modelos e Importar JSON</h2>
        <ol className={OL}>
          <li>Na lateral da página, escolha um modelo e clique em Aplicar modelo (isso substitui os blocos atuais).</li>
          <li>Para guardar a página atual como modelo, use Salvar como modelo.</li>
          <li>Em Importar layout (JSON), cole um texto no formato <code>{"{ hero, layoutStyle, layout:[{blockType, ...}] }"}</code> e confirme.</li>
        </ol>

        <h2 className={H2}>6. Trechos</h2>
        <ol className={OL}>
          <li>Para salvar: na lateral, em Trechos, informe do bloco nº e ao nº, dê um nome e clique em Salvar como trecho.</li>
          <li>Para usar: escolha o trecho na lista e clique em Inserir trecho. Ele entra no fim da página.</li>
          <li>Se você editar o trecho em Trechos, todas as páginas que o usam são atualizadas.</li>
        </ol>

        <h2 className={H2}>7. Formulários</h2>
        <ol className={OL}>
          <li>Em Formulários, crie o formulário e defina os campos.</li>
          <li>Na página, adicione o bloco de formulário e escolha o que você criou.</li>
          <li>As mensagens enviadas ficam em Respostas.</li>
        </ol>

        <h2 className={H2}>8. Construtor (beta)</h2>
        <p className={P}>O Construtor visual ainda está em teste. Use com cuidado e confira o resultado no Live Preview antes de publicar.</p>

        <h2 className={H2}>9. Publicar</h2>
        <p className={P}>Publique somente quando quiser que a página vá ao ar. Enquanto for rascunho, só quem está logado no painel consegue ver.</p>

        <h2 className={H2}>10. Textos e SEO das páginas</h2>
        <p className={P}>Em Textos e SEO você edita títulos, descrições e textos fixos das páginas do site, sem mexer nos blocos.</p>

        <h2 className={H2}>11. Papéis</h2>
        <ul className={UL}>
          <li>Administrador: acesso a tudo, inclusive usuários.</li>
          <li>Editor: cria e edita conteúdo, páginas, modelos, trechos e formulários.</li>
          <li>SEO: edita textos, títulos e descrições; não mexe nos blocos.</li>
        </ul>
      </article>
    </main>
  );
}
