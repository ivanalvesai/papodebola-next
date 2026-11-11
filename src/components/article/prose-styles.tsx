// CSS compartilhado do conteudo "prose-article" (posts E paginas do CMS). Extraido do
// ArticleView pra que as paginas (PageBlock) rendam os mesmos cards e estilos do corpo.
export function ProseStyles() {
  return (
    <style>{`
        .prose-article p {
          font-size: 18px;
          font-weight: 400;
          line-height: 2;
          color: #333;
          margin-bottom: 32px;
          text-align: left;
        }
        .prose-article strong { font-weight: 700; color: #1A1D23; }
        .prose-article h2 {
          font-size: 26px;
          font-weight: 700;
          color: #1A1D23;
          line-height: 1.3;
          margin: 48px 0 16px;
          scroll-margin-top: 90px;
        }
        .prose-article h3 {
          font-size: 21px;
          font-weight: 700;
          color: #1A1D23;
          line-height: 1.35;
          margin: 36px 0 12px;
          scroll-margin-top: 90px;
        }
        .prose-article h2:first-child,
        .prose-article h3:first-child { margin-top: 0; }
        .prose-article a {
          color: #00965E;
          font-weight: 600;
          text-decoration: underline;
          text-underline-offset: 2px;
        }
        .prose-article a:hover { color: #007a4d; }
        .prose-article ul,
        .prose-article ol { margin: 0 0 32px; padding-left: 24px; }
        .prose-article li {
          font-size: 18px;
          line-height: 1.9;
          color: #333;
          margin-bottom: 10px;
        }
        .prose-article ul { list-style: disc; }
        .prose-article ol { list-style: decimal; }
        .prose-article blockquote {
          border-left: 4px solid #00965E;
          padding: 4px 0 4px 18px;
          margin: 0 0 32px;
          color: #555;
          font-style: italic;
        }
        /* Card do Instagram (blockquote.instagram-media): sem a decoração de citação
           do site. Antes do embed.js trocar pelo card, fica um bloco limpo com o link. */
        .prose-article blockquote.instagram-media {
          border-left: 0;
          padding: 0;
          margin: 1px auto 32px;
          color: inherit;
          font-style: normal;
        }
        /* Card do X (blockquote.twitter-tweet): sem a decoração de citação do site.
           Antes do widgets.js trocar pelo card, fica um bloco limpo com o link. */
        .prose-article blockquote.twitter-tweet {
          border-left: 0;
          padding: 0;
          margin: 1px auto 32px;
          color: inherit;
          font-style: normal;
        }
        .prose-article img {
          max-width: 100%;
          height: auto;
          border-radius: 8px;
          margin: 8px 0 32px;
          display: block;
        }
        .prose-article figure { margin: 0 0 32px; }
        /* Escalação no campo (bloco "lineup") — campinho com os titulares por formação. */
        .prose-article figure.pdb-lineup { max-width: 460px; margin: 0 auto 32px; }
        .prose-article .pdb-lineup-head {
          display: flex; align-items: baseline; justify-content: space-between;
          gap: 8px; margin-bottom: 8px; flex-wrap: wrap;
        }
        .prose-article .pdb-lineup-team { font-weight: 700; color: #1A1D23; font-size: 16px; }
        .prose-article .pdb-lineup-meta { font-size: 13px; color: #00965E; font-weight: 700; }
        .prose-article .pdb-pitch {
          display: flex; flex-direction: column-reverse; justify-content: space-between;
          gap: 6px; min-height: 460px; padding: 18px 6px; border-radius: 12px;
          background:
            linear-gradient(90deg, rgba(255,255,255,.18) 0 2px, transparent 2px) center/100% 100%,
            repeating-linear-gradient(0deg, #2f9e52 0 46px, #2b9149 46px 92px);
          box-shadow: inset 0 0 0 2px rgba(255,255,255,.25);
        }
        .prose-article .pdb-pitch-line { display: flex; justify-content: space-around; align-items: center; }
        .prose-article .pdb-player {
          display: flex; flex-direction: column; align-items: center;
          width: 70px; text-align: center; gap: 4px;
        }
        .prose-article .pdb-player-num {
          width: 34px; height: 34px; border-radius: 50%; background: #fff; color: #00965E;
          font-weight: 700; font-size: 14px; display: flex; align-items: center; justify-content: center;
          box-shadow: 0 1px 3px rgba(0,0,0,.4);
        }
        /* Marcador com FOTO do jogador (quando há playerId). Círculo branco + número num selo. */
        .prose-article .pdb-player-photo { position: relative; width: 46px; height: 46px; margin: 0 0 2px; }
        .prose-article .pdb-player-photo img {
          width: 46px; height: 46px; border-radius: 50%; object-fit: cover; object-position: top center;
          background: #fff; box-shadow: 0 1px 3px rgba(0,0,0,.45); display: block; margin: 0;
        }
        .prose-article .pdb-player-badge {
          position: absolute; bottom: -2px; right: -4px; min-width: 18px; height: 18px; padding: 0 4px;
          border-radius: 9px; background: #00965E; color: #fff; font-size: 10px; font-weight: 700;
          display: flex; align-items: center; justify-content: center; box-shadow: 0 1px 2px rgba(0,0,0,.4);
        }
        .prose-article .pdb-player-name {
          font-size: 11px; line-height: 1.2; color: #fff; font-weight: 700;
          text-shadow: 0 1px 2px rgba(0,0,0,.6);
        }
        /* Alinhamento de imagens (classes do editor do WP). Sem isto, imagem menor
           que a coluna fica encostada na esquerda (img e display:block com margem
           lateral 0). Honra aligncenter/alignleft/alignright e o bloco Gutenberg. */
        .prose-article img.aligncenter,
        .prose-article figure.aligncenter,
        .prose-article .wp-block-image.aligncenter,
        .prose-article .aligncenter {
          margin-left: auto;
          margin-right: auto;
        }
        .prose-article .wp-block-image.aligncenter { text-align: center; }
        .prose-article img.alignleft,
        .prose-article figure.alignleft { float: left; margin: 8px 24px 16px 0; }
        .prose-article img.alignright,
        .prose-article figure.alignright { float: right; margin: 8px 0 16px 24px; }
        .prose-article figure.alignleft,
        .prose-article figure.alignright { max-width: 50%; }
        .prose-article::after { content: ""; display: table; clear: both; }
        .prose-article figcaption {
          font-size: 13px;
          color: #777;
          margin-top: 8px;
          text-align: center;
        }
        .prose-article table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
          margin: 0 0 32px;
          font-size: 16px;
          border: 1px solid #e2e5e9;
          border-radius: 12px;
          overflow: hidden;
        }
        .prose-article th,
        .prose-article td {
          padding: 12px 14px;
          text-align: left;
          vertical-align: top;
          border-bottom: 1px solid #eaedf0;
        }
        .prose-article th {
          background: #00965E;
          font-weight: 700;
          color: #fff;
          border-bottom: 0;
        }
        /* O texto da célula do cabeçalho vem dentro de <p>/<strong> (Lexical) e herdava
           a cor escura do parágrafo — força branco pra ler no fundo verde. */
        .prose-article th p,
        .prose-article th strong,
        .prose-article th a { color: #fff; margin: 0; }
        .prose-article tr:nth-child(even) td { background: #f6f9f8; }
        .prose-article tr:last-child td { border-bottom: 0; }
        /* Primeira coluna = cabeçalho verde, MESMO em linhas adicionadas à mão no editor
           (que vêm como célula normal td, sem o estado "header"). Assim o redator só
           adiciona a linha e a coluna "Informação" já sai verde — sem marcar header por
           célula. O seletor tr td:first-child iguala a especificidade da regra de zebra
           acima e vence por ordem de fonte (senão as linhas pares ficariam cinza). */
        .prose-article tr td:first-child {
          background: #00965E;
          color: #fff;
          font-weight: 700;
        }
        .prose-article tr td:first-child p,
        .prose-article tr td:first-child strong,
        .prose-article tr td:first-child a { color: #fff; margin: 0; }
        .prose-article hr { border: 0; border-top: 1px solid #e2e5e9; margin: 40px 0; }
        @media (max-width: 768px) {
          .prose-article p,
          .prose-article li { font-size: 17px; line-height: 1.9; }
          .prose-article p { margin-bottom: 28px; }
          .prose-article h2 { font-size: 23px; margin: 40px 0 14px; }
          .prose-article h3 { font-size: 19px; margin: 32px 0 10px; }
          .prose-article table { font-size: 14px; }
          .prose-article th,
          .prose-article td { padding: 8px 9px; }
        }
        /* Blocos do editor visual */
        .prose-article .pdb-video { margin: 0 0 32px; }
        .prose-article .pdb-video-frame {
          position: relative;
          padding-bottom: 56.25%;
          height: 0;
          border-radius: 8px;
          overflow: hidden;
        }
        .prose-article .pdb-video-frame iframe {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          border: 0;
        }
        .prose-article .pdb-columns { display: grid; gap: 24px; margin: 0 0 32px; }
        .prose-article .pdb-cols-2 { grid-template-columns: 1fr 1fr; }
        .prose-article .pdb-cols-3 { grid-template-columns: 1fr 1fr 1fr; }
        .prose-article .pdb-col > :last-child { margin-bottom: 0; }
        .prose-article .pdb-callout {
          padding: 16px 20px;
          border-radius: 8px;
          margin: 0 0 32px;
          border-left: 4px solid;
        }
        .prose-article .pdb-callout > :last-child { margin-bottom: 0; }
        .prose-article .pdb-callout-info { background: #eff6ff; border-color: #3b82f6; }
        .prose-article .pdb-callout-warning { background: #fffbeb; border-color: #f59e0b; }
        .prose-article .pdb-callout-success { background: #f0fdf4; border-color: #22c55e; }
        .prose-article .pdb-callout-highlight { background: #ecfdf5; border-color: #00965E; }
        /* Comentário / Info em verde — mesmas cores do "Comentário da Redação" do lance a lance. */
        .prose-article .pdb-callout-comment,
        .prose-article .pdb-callout-comment-plain {
          background: rgba(0, 150, 94, 0.05);
          border: 1px solid rgba(0, 150, 94, 0.4);
        }
        .prose-article .pdb-callout-comment::before {
          content: "💬 Comentário da Redação";
          display: block;
          margin-bottom: 8px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.03em;
          text-transform: uppercase;
          color: #00965E;
        }
        .prose-article .pdb-img { margin: 8px 0 32px; }
        .prose-article .pdb-img img { max-width: 100%; height: auto; border-radius: 8px; display: block; }
        .prose-article .pdb-img-center { text-align: center; }
        .prose-article .pdb-img-center img { margin-left: auto; margin-right: auto; }
        .prose-article .pdb-img-right img { margin-left: auto; margin-right: 0; }
        .prose-article .pdb-img-left img { margin-left: 0; margin-right: auto; }
        /* Cards de apostas: previsão/palpite, destaque com dados, botão CTA, prós/contras */
        .prose-article .pdb-prediction {
          border: 1px solid rgba(0,150,94,0.35);
          background: rgba(0,150,94,0.05);
          border-radius: 12px;
          padding: 16px 18px;
          margin: 0 0 32px;
        }
        .prose-article .pdb-pred-head {
          display: flex; align-items: center; justify-content: space-between;
          gap: 12px; flex-wrap: wrap; margin-bottom: 6px;
        }
        .prose-article .pdb-pred-label {
          font-size: 12px; font-weight: 700; text-transform: uppercase;
          letter-spacing: 0.03em; color: #00965E;
        }
        .prose-article .pdb-pred-odd {
          font-size: 13px; font-weight: 700; color: #1A1D23; background: #fff;
          border: 1px solid rgba(0,150,94,0.4); border-radius: 999px; padding: 3px 12px;
        }
        .prose-article .pdb-pred-text { font-size: 20px; font-weight: 700; color: #1A1D23; line-height: 1.3; margin: 0; }
        .prose-article .pdb-pred-note { font-size: 17px; color: #3a3f47; margin: 12px 0 0; line-height: 1.7; }
        .prose-article a.pdb-cta {
          display: inline-block; margin-top: 14px; padding: 11px 22px; border-radius: 8px;
          font-weight: 700; font-size: 16px; text-decoration: none; text-align: center;
        }
        .prose-article a.pdb-cta-primary { background: #00965E; color: #fff !important; }
        .prose-article a.pdb-cta-primary:hover { background: #007a4d; }
        .prose-article a.pdb-cta-outline { border: 2px solid #00965E; color: #00965E !important; }
        .prose-article .pdb-statcard {
          display: flex; gap: 16px; align-items: flex-start;
          border: 1px solid #e2e5e9; border-radius: 12px; padding: 16px 18px; margin: 0 0 32px; background: #fff;
        }
        .prose-article .pdb-statcard-img {
          width: 72px; height: 72px; border-radius: 10px; object-fit: cover; flex-shrink: 0; margin: 0;
        }
        .prose-article .pdb-statcard-title {
          font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.03em; color: #00965E;
        }
        .prose-article .pdb-statcard-sub { font-size: 19px; font-weight: 700; color: #1A1D23; margin-top: 2px; }
        .prose-article .pdb-statcard-list { list-style: none; margin: 12px 0 0; padding: 0; }
        .prose-article .pdb-statcard-list li {
          display: flex; justify-content: space-between; gap: 12px;
          font-size: 17px; padding: 8px 0; border-bottom: 1px solid #f0f2f4; margin: 0; color: #3a3f47;
        }
        .prose-article .pdb-statcard-list li:last-child { border-bottom: 0; }
        .prose-article .pdb-statcard-list strong { color: #1A1D23; }
        .prose-article .pdb-proscons { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin: 0 0 32px; }
        .prose-article .pdb-pros, .prose-article .pdb-cons {
          border: 1px solid #e2e5e9; border-radius: 12px; padding: 14px 16px; background: #fff;
        }
        .prose-article .pdb-pc-title { font-weight: 700; color: #1A1D23; margin-bottom: 10px; font-size: 17px; }
        .prose-article .pdb-pros ul, .prose-article .pdb-cons ul { list-style: none; margin: 0; padding: 0; }
        .prose-article .pdb-pros li, .prose-article .pdb-cons li {
          position: relative; padding-left: 28px; margin: 0 0 10px; font-size: 17px; line-height: 1.6; color: #333;
        }
        .prose-article .pdb-pros li::before { content: "✅"; position: absolute; left: 0; }
        .prose-article .pdb-cons li::before { content: "❌"; position: absolute; left: 0; }
        /* --- Temas de cor dos cards (o select "Cor" define a classe pdb-theme-*) --- */
        .prose-article .pdb-theme-verde    { --pdb-accent:#00965E; --pdb-soft:rgba(0,150,94,0.06);   --pdb-ring:rgba(0,150,94,0.35); }
        .prose-article .pdb-theme-azul     { --pdb-accent:#2563eb; --pdb-soft:rgba(37,99,235,0.06);  --pdb-ring:rgba(37,99,235,0.35); }
        .prose-article .pdb-theme-vermelho { --pdb-accent:#dc2626; --pdb-soft:rgba(220,38,38,0.06);  --pdb-ring:rgba(220,38,38,0.35); }
        .prose-article .pdb-theme-dourado  { --pdb-accent:#b8860b; --pdb-soft:rgba(184,134,11,0.09); --pdb-ring:rgba(184,134,11,0.4); }
        .prose-article .pdb-theme-roxo     { --pdb-accent:#7c3aed; --pdb-soft:rgba(124,58,237,0.06); --pdb-ring:rgba(124,58,237,0.35); }
        .prose-article .pdb-theme-escuro   { --pdb-accent:#1A1D23; --pdb-soft:rgba(26,29,35,0.05);   --pdb-ring:rgba(26,29,35,0.3); }
        /* Aplica a cor do tema (var --pdb-accent) nos elementos dos cards. */
        .prose-article .pdb-prediction { border-color: var(--pdb-ring, rgba(0,150,94,0.35)); background: var(--pdb-soft, rgba(0,150,94,0.06)); }
        .prose-article .pdb-pred-label { color: var(--pdb-accent, #00965E); }
        .prose-article .pdb-pred-odd { border-color: var(--pdb-ring, rgba(0,150,94,0.4)); }
        .prose-article a.pdb-cta-primary { background: var(--pdb-accent, #00965E); }
        .prose-article a.pdb-cta-primary:hover { background: var(--pdb-accent, #00965E); filter: brightness(0.92); }
        .prose-article a.pdb-cta-outline { border-color: var(--pdb-accent, #00965E); color: var(--pdb-accent, #00965E) !important; }
        .prose-article .pdb-statcard { border-left: 4px solid var(--pdb-accent, #00965E); }
        .prose-article .pdb-statcard-title { color: var(--pdb-accent, #00965E); }
        .prose-article .pdb-proscons .pdb-pros { border-top: 3px solid var(--pdb-accent, #00965E); }
        /* --- Tabela de seleções/times (bloco teamsTable) --- */
        /* Mesmo visual das tabelas da Copa: card com barra verde no topo, escudo por
           linha e zebra discreta. Rola sozinha no mobile. */
        .prose-article .pdb-tt {
          border: 1px solid #e2e5e9; border-radius: 10px; overflow: hidden;
          background: #fff; margin: 0 0 32px;
        }
        .prose-article .pdb-tt-head {
          background: var(--pdb-accent, #00965E); color: #fff; font-weight: 700;
          font-size: 16px; padding: 0 16px; height: 48px; display: flex; align-items: center;
        }
        .prose-article .pdb-tt-wrap { overflow-x: auto; -webkit-overflow-scrolling: touch; }
        .prose-article table.pdb-tt-table {
          width: 100%; min-width: 520px; border-collapse: collapse; font-size: 15px; margin: 0;
        }
        /* O corpo do post tem regras genéricas de tabela (th verde e 1ª coluna verde,
           pro editor não precisar marcar header). Esta tabela é o outro padrão — o das
           tabelas da Copa: verde SÓ na barra do título. Daí os overrides explícitos. */
        .prose-article table.pdb-tt-table thead th {
          text-align: left; font-size: 13px; font-weight: 600; color: #5b6470;
          background: #fafbfc; padding: 10px 12px; border-bottom: 1px solid #e9ecef;
          white-space: nowrap;
        }
        .prose-article table.pdb-tt-table td {
          padding: 10px 12px; border-bottom: 1px solid #eef0f2; color: #333;
          background: #fff; vertical-align: middle;
        }
        .prose-article table.pdb-tt-table tbody tr:nth-child(even) td { background: #fafbfc; }
        .prose-article table.pdb-tt-table tbody tr:last-child td { border-bottom: 0; }
        .prose-article table.pdb-tt-table tbody tr.is-hl td:first-child { box-shadow: inset 4px 0 0 var(--pdb-accent, #00965E); }
        .prose-article table.pdb-tt-table tbody tr td.pdb-tt-num {
          width: 34px; text-align: center; color: #6b7280; font-weight: 700; font-size: 13px;
        }
        .prose-article td.pdb-tt-team { white-space: nowrap; }
        .prose-article td.pdb-tt-team span { font-weight: 600; color: #1A1D23; }
        .prose-article img.pdb-tt-crest {
          width: 26px; height: 26px; object-fit: contain; border-radius: 3px;
          display: inline-block; vertical-align: -8px; margin: 0 10px 0 0;
        }
        .prose-article .pdb-tt-crest-empty { display: inline-block; width: 26px; height: 26px; margin: 0 10px 0 0; }
        .prose-article .pdb-tt-note {
          padding: 10px 14px; font-size: 14px; color: #5b6470; background: #fafbfc;
          border-top: 1px solid #eef0f2;
        }
        /* --- Vertical de apostas: tabela comparativa, card de casa, FAQ, índice, autor --- */
        /* A tabela rola sozinha no mobile (o corpo do post NUNCA rola na horizontal). */
        .prose-article .pdb-bt-wrap { overflow-x: auto; margin: 0 0 32px; -webkit-overflow-scrolling: touch; }
        .prose-article table.pdb-bt {
          width: 100%; min-width: 680px; border-collapse: collapse; font-size: 17px; background: #fff;
          border: 1px solid #e2e5e9; border-radius: 10px; overflow: hidden; margin: 0;
        }
        .prose-article table.pdb-bt caption {
          caption-side: top; text-align: left; font-weight: 700; color: #1A1D23; padding: 0 0 12px; font-size: 20px;
        }
        .prose-article table.pdb-bt thead th {
          background: #1A1D23; color: #fff; font-size: 14px; text-transform: uppercase;
          letter-spacing: 0.03em; text-align: left; padding: 12px 14px; white-space: nowrap;
        }
        .prose-article table.pdb-bt td { padding: 12px 14px; border-top: 1px solid #eef0f2; color: #333; vertical-align: middle; }
        .prose-article table.pdb-bt tbody tr:nth-child(even) { background: #fafbfc; }
        .prose-article .pdb-bt-rank { font-weight: 700; color: #6b7280; width: 40px; }
        .prose-article .pdb-bt-name { font-weight: 600; color: #1A1D23; white-space: nowrap; }
        .prose-article .pdb-bt-name img.pdb-bt-logo {
          width: 18px; height: 18px; border-radius: 4px; object-fit: contain;
          display: inline-block; vertical-align: -3px; margin: 0 8px 0 0;
        }
        .prose-article .pdb-bt-score {
          display: inline-block; font-weight: 700; color: #00965E;
          background: rgba(0,150,94,0.09); border-radius: 999px; padding: 2px 10px;
        }
        .prose-article .pdb-bt-pending { color: #5b6470; font-size: 16px; }
        .prose-article .pdb-br {
          border: 1px solid #e2e5e9; border-left: 4px solid var(--pdb-accent, #00965E);
          border-radius: 12px; padding: 18px 20px; margin: 0 0 32px; background: #fff; scroll-margin-top: 80px;
        }
        .prose-article .pdb-br-head { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
        .prose-article .pdb-br-rank {
          font-size: 13px; font-weight: 700; color: #fff; background: var(--pdb-accent, #00965E);
          border-radius: 999px; min-width: 24px; height: 24px; display: inline-flex;
          align-items: center; justify-content: center; padding: 0 7px;
        }
        .prose-article .pdb-br-logo { width: 32px; height: 32px; border-radius: 6px; object-fit: contain; margin: 0; }
        .prose-article .pdb-br-name { font-size: 24px; font-weight: 700; color: #1A1D23; }
        .prose-article .pdb-br-score {
          margin-left: auto; font-size: 20px; font-weight: 700; color: #fff;
          background: var(--pdb-accent, #00965E); border-radius: 8px; padding: 3px 12px;
        }
        .prose-article .pdb-br-pending {
          margin-left: auto; font-size: 15px; font-weight: 600; color: #5b6470;
          background: #f2f3f5; border-radius: 999px; padding: 4px 12px;
        }
        .prose-article .pdb-br-meta { list-style: none; margin: 14px 0 0; padding: 0; }
        .prose-article .pdb-br-meta li {
          display: flex; justify-content: space-between; gap: 12px; font-size: 17px;
          padding: 8px 0; border-bottom: 1px solid #f0f2f4; margin: 0; color: #3a3f47;
        }
        .prose-article .pdb-br-meta li:last-child { border-bottom: 0; }
        .prose-article .pdb-br-meta strong { color: #1A1D23; }
        .prose-article .pdb-br-shots {
          display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px; margin: 16px 0 0;
        }
        .prose-article .pdb-br-shots figure { margin: 0; }
        .prose-article .pdb-br-shots img { width: 100%; height: auto; border-radius: 8px; border: 1px solid #e2e5e9; margin: 0; }
        .prose-article .pdb-br-shots figcaption { font-size: 15px; color: #5b6470; margin-top: 6px; }
        .prose-article .pdb-br .pdb-proscons { margin: 16px 0 0; }
        .prose-article .pdb-br-ctas { display: flex; gap: 10px; flex-wrap: wrap; margin-top: 4px; }
        .prose-article .pdb-faq { margin: 0 0 32px; border: 1px solid #e2e5e9; border-radius: 12px; background: #fff; overflow: hidden; }
        .prose-article .pdb-faq-item { border-bottom: 1px solid #eef0f2; }
        .prose-article .pdb-faq-item:last-child { border-bottom: 0; }
        .prose-article .pdb-faq-item > summary {
          cursor: pointer; list-style: none; padding: 16px 20px; font-weight: 700;
          font-size: 19px; color: #1A1D23; display: flex; justify-content: space-between; gap: 12px; align-items: center;
        }
        .prose-article .pdb-faq-item > summary::-webkit-details-marker { display: none; }
        .prose-article .pdb-faq-item > summary::after { content: "+"; color: #00965E; font-size: 20px; font-weight: 700; line-height: 1; }
        .prose-article .pdb-faq-item[open] > summary::after { content: "−"; }
        .prose-article .pdb-faq-answer { padding: 0 20px 18px; color: #333; font-size: 18px; line-height: 1.8; }
        .prose-article .pdb-faq-answer p:last-child { margin-bottom: 0; }
        .prose-article .pdb-toc {
          border: 1px solid #e2e5e9; border-radius: 12px; background: #fafbfc; padding: 14px 18px; margin: 0 0 32px;
        }
        .prose-article .pdb-toc-title {
          font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.03em;
          color: #5b6470; margin-bottom: 10px;
        }
        .prose-article .pdb-toc ul { list-style: none; margin: 0; padding: 0; }
        .prose-article .pdb-toc li { margin: 0 0 8px; padding-left: 18px; position: relative; font-size: 17px; }
        .prose-article .pdb-toc li::before { content: "›"; position: absolute; left: 0; color: #00965E; font-weight: 700; }
        .prose-article .pdb-toc a { color: #1A1D23; text-decoration: none; }
        .prose-article .pdb-toc a:hover { color: #00965E; text-decoration: underline; }
        .prose-article .pdb-author {
          border: 1px solid #e2e5e9; border-radius: 12px; background: #fff; padding: 18px 20px; margin: 32px 0;
        }
        .prose-article .pdb-author-intro { font-size: 15px; color: #5b6470; margin-bottom: 10px; }
        .prose-article .pdb-author-head { display: flex; gap: 14px; align-items: center; }
        .prose-article .pdb-author-photo { width: 72px; height: 72px; border-radius: 50%; object-fit: cover; flex-shrink: 0; margin: 0; }
        .prose-article .pdb-author-label {
          font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.03em; color: #00965E;
        }
        .prose-article .pdb-author-name { font-size: 21px; font-weight: 700; color: #1A1D23; }
        .prose-article .pdb-author-name a { color: inherit; text-decoration: none; }
        .prose-article .pdb-author-name a:hover { color: #00965E; }
        .prose-article .pdb-author-role { font-size: 16px; color: #5b6470; }
        .prose-article .pdb-author-bio { margin-top: 14px; font-size: 18px; line-height: 1.8; color: #333; }
        .prose-article .pdb-author-bio p:last-child { margin-bottom: 0; }
        @media (max-width: 768px) {
          .prose-article .pdb-columns { grid-template-columns: 1fr; }
          .prose-article .pdb-proscons { grid-template-columns: 1fr; }
          .prose-article .pdb-br-score, .prose-article .pdb-br-pending { margin-left: 0; }
          .prose-article .pdb-br-ctas a.pdb-cta { flex: 1 1 100%; }
        }
      
        /* Vitrine de produtos (afiliado) */
        .prose-article .pdb-pg { margin: 28px 0; border-radius: 16px; overflow: hidden; border: 1px solid #e3e6ea; background: #fff; box-shadow: 0 4px 18px rgba(0,0,0,.06); }
        .prose-article .pdb-pg-head { display: flex; align-items: center; gap: 10px; background: #14110a; color: #fff; font-weight: 800; font-size: 16px; padding: 12px 18px; border-bottom: 4px solid #00965E; }
        .prose-article .pdb-pg-check { display: inline-flex; align-items: center; justify-content: center; width: 22px; height: 22px; border-radius: 50%; background: #ffd23f; color: #14110a; font-size: 13px; }
        .prose-article .pdb-pg-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); }
        .prose-article .pdb-pg-cols-2 .pdb-pg-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        .prose-article .pdb-pg-cell { position: relative; display: flex; flex-direction: column; gap: 6px; padding: 16px; border-right: 1px solid #eef0f2; border-bottom: 1px solid #eef0f2; min-width: 0; }
        .prose-article .pdb-pg-badge { align-self: flex-start; font-size: 12px; font-weight: 800; letter-spacing: .04em; text-transform: uppercase; color: #00965E; }
        .prose-article a.pdb-pg-imgwrap { position: relative; display: flex; align-items: center; justify-content: center; height: 170px; background: #fff; border-radius: 12px; border: 1px solid #f0f1f3; text-decoration: none !important; }
        .prose-article img.pdb-pg-img { max-width: 88%; max-height: 150px; width: auto; height: auto; object-fit: contain; margin: 0 !important; border-radius: 0 !important; box-shadow: none !important; }
        .prose-article .pdb-pg-tag { position: absolute; top: 8px; left: 8px; background: #ffd23f; color: #14110a; font-size: 12px; font-weight: 800; padding: 3px 8px; border-radius: 999px; }
        .prose-article .pdb-pg-name { font-size: 15px; font-weight: 700; line-height: 1.35; color: #1A1D23; overflow-wrap: anywhere; }
        .prose-article .pdb-pg-rating { font-size: 13px; font-weight: 700; color: #1A1D23; }
        .prose-article .pdb-pg-stars { color: #f5a623; }
        .prose-article .pdb-pg-reviews { font-weight: 400; color: #6b7280; }
        .prose-article .pdb-pg-price { display: flex; flex-wrap: wrap; align-items: baseline; gap: 6px; }
        .prose-article .pdb-pg-now { font-size: 20px; font-weight: 800; color: #00965E; }
        .prose-article .pdb-pg-old { font-size: 13px; color: #9ca3af; }
        .prose-article p.pdb-pg-pricedate { margin: 0 !important; padding: 10px 16px; font-size: 12px; line-height: 1.5; color: #6b7280; background: #fafafa; }
        .prose-article p.pdb-pg-note { font-size: 14px; line-height: 1.5; color: #555; margin: 0 !important; }
        .prose-article a.pdb-pg-btn { margin-top: auto; display: inline-flex; align-items: center; justify-content: center; gap: 6px; padding: 9px 14px; border-radius: 999px;
          font-size: 14px; font-weight: 700; text-decoration: none !important; background: #14110a; color: #fff !important; border: 2px solid #14110a; }
        .prose-article a.pdb-pg-btn:hover { background: #00965E; border-color: #00965E; }
        .prose-article .pdb-pg-store { position: relative; font-weight: 900; letter-spacing: -.01em; }
        .prose-article .pdb-pg-amazon .pdb-pg-store { color: #fff; padding-bottom: 3px; }
        .prose-article .pdb-pg-amazon .pdb-pg-store::after { content: ""; position: absolute; left: 8%; right: 4%; bottom: -2px; height: 6px; border-bottom: 2px solid #FF9900; border-radius: 0 0 60% 60%; }
        @media (max-width: 640px) {
          .prose-article .pdb-pg-grid, .prose-article .pdb-pg-cols-2 .pdb-pg-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
          .prose-article .pdb-pg-cell { padding: 12px; }
          .prose-article a.pdb-pg-imgwrap { height: 130px; }
          .prose-article img.pdb-pg-img { max-height: 115px; }
          .prose-article .pdb-pg-name { font-size: 14px; }
          .prose-article p.pdb-pg-note { display: none; }
          .prose-article a.pdb-pg-btn { font-size: 13px; padding: 8px 10px; }
        }
        /* ── Cupom de desconto (/cupons/*): ticket com canhoto da loja ── */
        .prose-article .pdb-coupon { --c-acc: #00965E; --c-tint: #EAF7F1; margin: 24px 0; filter: drop-shadow(0 6px 16px rgba(20,17,10,.13)); }
        .prose-article .pdb-coupon-amazon { --c-acc: #C45500; --c-tint: #FFF6E8; }
        .prose-article .pdb-coupon-mercadolivre { --c-acc: #2D3277; --c-tint: #FFFBD6; }
        .prose-article .pdb-coupon-shopee { --c-acc: #D73211; --c-tint: #FFF1EC; }
        .prose-article .pdb-coupon-ticket { display: grid; grid-template-columns: 200px 1fr; border-radius: 18px; overflow: hidden; }
        .prose-article .pdb-coupon-stub, .prose-article .pdb-coupon-body { --n: 13px; }
        .prose-article .pdb-coupon-stub { position: relative; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; text-align: center; padding: 22px 16px;
          background: linear-gradient(150deg, #00a868, #00965E 55%, #007a4d); color: #fff;
          -webkit-mask: radial-gradient(circle var(--n) at 100% 0, #0000 98%, #000), radial-gradient(circle var(--n) at 100% 100%, #0000 98%, #000); -webkit-mask-composite: source-in;
          mask: radial-gradient(circle var(--n) at 100% 0, #0000 98%, #000), radial-gradient(circle var(--n) at 100% 100%, #0000 98%, #000); mask-composite: intersect; }
        .prose-article .pdb-coupon-body { position: relative; min-width: 0; padding: 18px 22px 18px 26px; background: #fff; overflow-wrap: anywhere;
          -webkit-mask: radial-gradient(circle var(--n) at 0 0, #0000 98%, #000), radial-gradient(circle var(--n) at 0 100%, #0000 98%, #000); -webkit-mask-composite: source-in;
          mask: radial-gradient(circle var(--n) at 0 0, #0000 98%, #000), radial-gradient(circle var(--n) at 0 100%, #0000 98%, #000); mask-composite: intersect; }
        .prose-article .pdb-coupon-body::before { content: ""; position: absolute; left: 0; top: 18px; bottom: 18px; border-left: 2px dashed #d5d9de; }
        .prose-article .pdb-coupon-brand { position: relative; font-size: 24px; font-weight: 900; letter-spacing: -.02em; line-height: 1; }
        .prose-article .pdb-coupon-value { font-size: 34px; font-weight: 900; line-height: 1; letter-spacing: -.02em; color: #ffd23f; }
        .prose-article .pdb-coupon-headline { display: inline-block; margin-top: 2px; padding: 5px 12px; border-radius: 999px; background: #ffd23f; color: #14110a; font-size: 12px; font-weight: 900; letter-spacing: .08em; text-transform: uppercase; }
        .prose-article .pdb-coupon-amazon .pdb-coupon-stub { background: linear-gradient(150deg, #37475A, #232F3E 50%, #131921); }
        .prose-article .pdb-coupon-amazon .pdb-coupon-brand { padding-bottom: 6px; }
        .prose-article .pdb-coupon-amazon .pdb-coupon-brand::after { content: ""; position: absolute; left: 12%; right: 2%; bottom: 0; height: 8px; border-bottom: 3px solid #FF9900; border-radius: 0 0 60% 60%; }
        .prose-article .pdb-coupon-amazon .pdb-coupon-value { color: #FF9900; }
        .prose-article .pdb-coupon-amazon .pdb-coupon-headline { background: #FF9900; color: #131921; }
        .prose-article .pdb-coupon-mercadolivre .pdb-coupon-stub { background: linear-gradient(150deg, #FFF159, #FFE600 60%, #f5d800); color: #2D3277; }
        .prose-article .pdb-coupon-mercadolivre .pdb-coupon-value { color: #2D3277; }
        .prose-article .pdb-coupon-mercadolivre .pdb-coupon-headline { background: #2D3277; color: #FFE600; }
        .prose-article .pdb-coupon-shopee .pdb-coupon-stub { background: linear-gradient(150deg, #FF6633, #EE4D2D 55%, #d73211); }
        .prose-article .pdb-coupon-shopee .pdb-coupon-value { color: #fff; }
        .prose-article .pdb-coupon-shopee .pdb-coupon-headline { background: #fff; color: #EE4D2D; }
        .prose-article .pdb-coupon-title { font-size: 19px; font-weight: 800; color: #1A1D23; line-height: 1.3; }
        .prose-article p.pdb-coupon-details { font-size: 14px; line-height: 1.5; color: #555; margin: 6px 0 0 !important; }
        .prose-article .pdb-coupon-offers { display: grid; grid-template-columns: repeat(auto-fill, minmax(116px, 1fr)); gap: 8px; margin-top: 14px; }
        .prose-article .pdb-coupon-offer { display: flex; flex-direction: column; gap: 2px; padding: 8px 10px; border: 1.5px dashed var(--c-acc); border-radius: 10px; background: var(--c-tint);
          text-decoration: none !important; text-align: left; font: inherit; cursor: pointer; transition: transform .12s; }
        .prose-article .pdb-coupon-offer:hover { transform: translateY(-1px); border-style: solid; }
        .prose-article .pdb-coupon-offer-val { font-size: 18px; font-weight: 900; line-height: 1.1; color: var(--c-acc); }
        .prose-article .pdb-coupon-offer-val::after { content: " OFF"; font-size: 11px; font-weight: 800; letter-spacing: .04em; }
        .prose-article .pdb-coupon-offer-lbl { font-size: 13px; font-weight: 700; line-height: 1.25; color: #1A1D23; }
        .prose-article .pdb-coupon-offer-note { font-size: 11px; font-weight: 700; color: #6b7280; text-transform: uppercase; letter-spacing: .03em; }
        .prose-article .pdb-coupon-offer-code { font-family: ui-monospace, Menlo, monospace; font-size: 12px; font-weight: 800; color: #555; }
        .prose-article .pdb-coupon-offer[data-copied]::after { content: "Código copiado"; font-size: 11px; font-weight: 800; color: #00965E; }
        .prose-article .pdb-coupon-actions { display: flex; flex-wrap: wrap; align-items: center; gap: 10px; margin-top: 14px; }
        .prose-article .pdb-coupon-code { display: flex; align-items: center; flex: 1 1 220px; max-width: 340px; border: 2px dashed var(--c-acc); border-radius: 12px; overflow: hidden; background: var(--c-tint); }
        .prose-article .pdb-coupon-code-txt { flex: 1; min-width: 0; overflow-wrap: anywhere; padding: 9px 12px; font-family: ui-monospace, Menlo, monospace; font-weight: 900; font-size: 17px; letter-spacing: .08em; color: #1A1D23; text-align: center; }
        .prose-article .pdb-coupon-copy { align-self: stretch; border: 0; background: #1A1D23; color: #fff; font-weight: 800; font-size: 14px; padding: 0 14px; cursor: pointer; }
        .prose-article .pdb-coupon-copy:hover { background: #00965E; }
        .prose-article a.pdb-coupon-btn { display: inline-flex; align-items: center; justify-content: center; gap: 6px; padding: 11px 20px; border-radius: 999px; background: #14110a; color: #fff !important;
          text-decoration: none !important; font-weight: 800; font-size: 15px; border: 2px solid #14110a; }
        .prose-article a.pdb-coupon-btn:hover { background: #00965E; border-color: #00965E; }
        .prose-article a.pdb-coupon-btn[data-copied]::after { content: "· código copiado"; font-size: 12px; font-weight: 700; color: #ffd23f; }
        .prose-article .pdb-coupon-meta { display: flex; flex-wrap: wrap; gap: 6px 16px; margin-top: 10px; font-size: 13px; font-weight: 700; }
        .prose-article .pdb-coupon-auto { color: #00965E; }
        .prose-article .pdb-coupon-valid { color: #b45309; }
        @media (max-width: 640px) {
          .prose-article .pdb-coupon-ticket { grid-template-columns: 1fr; }
          .prose-article .pdb-coupon-stub { flex-direction: row; flex-wrap: wrap; justify-content: space-between; text-align: left; padding: 16px 18px; gap: 6px 12px;
            -webkit-mask: radial-gradient(circle var(--n) at 0 100%, #0000 98%, #000), radial-gradient(circle var(--n) at 100% 100%, #0000 98%, #000); -webkit-mask-composite: source-in;
            mask: radial-gradient(circle var(--n) at 0 100%, #0000 98%, #000), radial-gradient(circle var(--n) at 100% 100%, #0000 98%, #000); mask-composite: intersect; }
          .prose-article .pdb-coupon-brand { font-size: 20px; }
          .prose-article .pdb-coupon-value { font-size: 26px; }
          .prose-article .pdb-coupon-headline { order: 3; }
          .prose-article .pdb-coupon-body { padding: 18px 16px 16px;
            -webkit-mask: radial-gradient(circle var(--n) at 0 0, #0000 98%, #000), radial-gradient(circle var(--n) at 100% 0, #0000 98%, #000); -webkit-mask-composite: source-in;
            mask: radial-gradient(circle var(--n) at 0 0, #0000 98%, #000), radial-gradient(circle var(--n) at 100% 0, #0000 98%, #000); mask-composite: intersect; }
          .prose-article .pdb-coupon-body::before { left: 18px; right: 18px; top: 0; bottom: auto; border-left: 0; border-top: 2px dashed #d5d9de; }
          .prose-article .pdb-coupon-offers { grid-template-columns: repeat(2, minmax(0, 1fr)); }
          .prose-article .pdb-coupon-code { max-width: none; }
          .prose-article a.pdb-coupon-btn { width: 100%; }
        }
`}</style>
  );
}
