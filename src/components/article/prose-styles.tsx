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
        .prose-article .pdb-pred-note { font-size: 15px; color: #444; margin: 10px 0 0; line-height: 1.6; }
        .prose-article a.pdb-cta {
          display: inline-block; margin-top: 14px; padding: 11px 22px; border-radius: 8px;
          font-weight: 700; font-size: 15px; text-decoration: none; text-align: center;
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
          font-size: 15px; padding: 6px 0; border-bottom: 1px solid #f0f2f4; margin: 0; color: #444;
        }
        .prose-article .pdb-statcard-list li:last-child { border-bottom: 0; }
        .prose-article .pdb-statcard-list strong { color: #1A1D23; }
        .prose-article .pdb-proscons { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin: 0 0 32px; }
        .prose-article .pdb-pros, .prose-article .pdb-cons {
          border: 1px solid #e2e5e9; border-radius: 12px; padding: 14px 16px; background: #fff;
        }
        .prose-article .pdb-pc-title { font-weight: 700; color: #1A1D23; margin-bottom: 8px; font-size: 15px; }
        .prose-article .pdb-pros ul, .prose-article .pdb-cons ul { list-style: none; margin: 0; padding: 0; }
        .prose-article .pdb-pros li, .prose-article .pdb-cons li {
          position: relative; padding-left: 26px; margin: 0 0 8px; font-size: 15px; line-height: 1.5; color: #333;
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
        @media (max-width: 768px) {
          .prose-article .pdb-columns { grid-template-columns: 1fr; }
          .prose-article .pdb-proscons { grid-template-columns: 1fr; }
        }
      `}</style>
  );
}
