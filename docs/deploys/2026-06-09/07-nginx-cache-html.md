---
area: infra
data: 2026-06-09
servidor: 138.117.60.14
arquivos:
  - /www/server/panel/vhost/nginx/papodebola.com.br.conf
  - /www/server/panel/vhost/nginx/development.papodebola.com.br.conf
  - /www/server/nginx/conf/proxy.conf
---

# Fix permanente: nginx (aaPanel) não cacheia HTML — fim do "não vejo a mudança"

## Sintoma
Mudanças no site não apareciam ao recarregar (mesmo dando Purge no Cloudflare). A `/` "pura"
servia HTML antigo; `/?cb=123` (query string) mostrava o novo.

## Causa raiz (NÃO era o Cloudflare)
O nginx do aaPanel tem um `proxy_cache cache_one` **global** (`/www/server/nginx/conf/proxy.conf`,
contexto http) que o `location /` herdava. O Next manda `s-maxage` no upstream → o nginx
**armazena** o HTML em `/www/server/nginx/proxy_cache_dir/` (chave `$host$request_uri$is_args$args`)
ANTES de o header virar `no-store` para o cliente. Resultado: HTML preso ~30min; `?cb=`
furava (chave diferente); Purge do Cloudflare não alcançava (cache do nginx, não da CDN).

## Correção
Adicionado **`proxy_cache off;`** no `location /` dos DOIS vhosts (prod e dev), logo após o
`proxy_pass 127.0.0.1:300X;`. Para de armazenar HTML/RSC. As imagens do Sofascore (`/img/*`)
seguem cacheadas (locations próprias com `proxy_cache img_cache_*`). Backups `*.conf.bak.*`,
validado com `nginx -t` antes do reload.

**Resultado:** a `/` "pura" reflete a origem na hora. Acabou a dependência de `?cb=` e Purge
para mudanças de HTML.

## Ressalva
Se alguém editar o site pela UI do aaPanel, ele pode **regenerar o vhost** e apagar essa
linha (mesmo risco do map `$pdb_cc`/no-store que já existia). Conferir após mexer no painel.
