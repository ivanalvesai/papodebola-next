# WordPress mu-plugins

Plugins must-use que precisam viver dentro do container WordPress (`wordpress-papodebola-wordpress-1`) em `/var/www/html/wp-content/mu-plugins/`. Carregam automaticamente, sem precisar ativar no admin.

## `papodebola-revalidate.php`

Dispara `POST https://www.papodebola.com.br/api/revalidate` em todo `save_post`, `wp_trash_post`, `untrash_post`, `before_delete_post` e `transition_post_status`. Sem ele, edições/deletes no WP só refletem no site após 30 min (TTL do ISR em `fetchWP`).

### Por que a URL tem `www.`
O apex `papodebola.com.br` redireciona 301 no Cloudflare para `www.papodebola.com.br`, e POST não sobrevive a redirect. Se um dia mudar essa regra DNS/CF, atualizar o `PDB_REVALIDATE_URL` no PHP.

### Configurar o secret
O plugin lê o token de duas formas (a primeira que existir):

1. `define('PDB_REVALIDATE_SECRET', '...')` no `wp-config.php` do container.
2. Variável de ambiente `PDB_REVALIDATE_SECRET` no processo PHP-FPM/Apache (passar via `docker-compose.yml` do WordPress).

O secret precisa bater com `REVALIDATION_SECRET` do `.env.local` do Next.js prod (`/home/ivan/papodebola-next/.env.local`).

### Instalar / atualizar no servidor

```bash
# do diretório do repo no Windows
scp -i ~/.ssh/debian_ed25519 -P 1822 \
  wp-mu-plugins/papodebola-revalidate.php \
  ivan@138.117.60.14:/tmp/papodebola-revalidate.php

ssh -i ~/.ssh/debian_ed25519 -p 1822 ivan@138.117.60.14 '
  docker exec wordpress-papodebola-wordpress-1 mkdir -p /var/www/html/wp-content/mu-plugins
  docker cp /tmp/papodebola-revalidate.php wordpress-papodebola-wordpress-1:/var/www/html/wp-content/mu-plugins/papodebola-revalidate.php
  docker exec wordpress-papodebola-wordpress-1 chown www-data:www-data /var/www/html/wp-content/mu-plugins/papodebola-revalidate.php
  docker exec wordpress-papodebola-wordpress-1 php -l /var/www/html/wp-content/mu-plugins/papodebola-revalidate.php
  docker exec wordpress-papodebola-wordpress-1 wp plugin list --status=must-use --allow-root
  rm /tmp/papodebola-revalidate.php
'
```

### Testar

Editar qualquer post no `/wp-admin` e salvar. Em segundos, a homepage e `/noticias` devem refletir. Para validar manualmente:

```bash
curl -s -X POST -H 'Content-Type: application/json' \
  -d "{\"secret\":\"$REVALIDATION_SECRET\",\"paths\":[\"/\",\"/noticias\"]}" \
  https://www.papodebola.com.br/api/revalidate
# esperado: {"revalidated":true,"paths":[...],"timestamp":"..."}
```
