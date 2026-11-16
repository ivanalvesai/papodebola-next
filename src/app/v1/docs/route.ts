import { OPENAPI_YAML } from "@/lib/public-api/v1/openapi";

// Documentação pública da API v1 (sem dados). noindex: é referência para o site parceiro.
export const dynamic = "force-static";

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");

export function GET() {
  const html = `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>API Papo de Bola v1</title>
<style>body{font:16px/1.55 system-ui,sans-serif;max-width:960px;margin:24px auto;padding:0 16px;background:#F2F3F5;color:#111}h1{color:#00965E}code{background:#fff;padding:1px 5px;border-radius:4px}pre{background:#fff;padding:16px;overflow:auto;border-radius:8px;font-size:14px}</style></head>
<body><h1>API Papo de Bola — v1</h1>
<p>Autenticação: cabeçalho <code>x-api-key</code>, sempre chamado pelo <b>servidor</b> do seu site (nunca pelo navegador). A chave só vale a partir dos IPs cadastrados.</p>
<p>Respostas: <code>{ data, meta }</code>. Use <code>meta.proximaAtualizacaoSugerida</code> (segundos) como intervalo de atualização. Erros: <code>{ erro: { codigo, mensagem } }</code>.</p>
<p>Exemplo: <code>curl -H "x-api-key: SUA_CHAVE" https://api.papodebola.com.br/v1/jogos/ao-vivo</code></p>
<h2>Especificação OpenAPI 3.1</h2>
<pre>${esc(OPENAPI_YAML)}</pre></body></html>`;
  return new Response(html, { headers: { "content-type": "text/html; charset=utf-8", "x-robots-tag": "noindex" } });
}
