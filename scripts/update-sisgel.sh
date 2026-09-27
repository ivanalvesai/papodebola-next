#!/bin/bash
cd /home/ivan/papodebola-next
node scripts/scrape-sisgel.js
# Os DOIS arquivos vão pro volume compartilhado (papodebola-next_pdb-data, /app/data em prod
# e dev). Antes só o sisgel.json era copiado e as fichas de jogo (sisgel-matches.json)
# ficaram paradas desde 06/07. Copia com nome temporário e troca com mv (atômico: o site
# nunca lê um JSON pela metade).
for f in sisgel.json sisgel-matches.json; do
  sudo docker cp "data/$f" "papodebola-next:/app/data/$f.tmp" \
    && sudo docker exec -u root papodebola-next sh -c "chown node:node /app/data/$f.tmp && mv /app/data/$f.tmp /app/data/$f"
done
sudo docker cp public/escudos-municipal papodebola-next:/app/public/
echo "[$(date "+%Y-%m-%d %H:%M")] SisGel updated"
