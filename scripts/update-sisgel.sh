#!/bin/bash
cd /home/ivan/papodebola-next
node scripts/scrape-sisgel.js || { echo "[$(date "+%Y-%m-%d %H:%M")] scrape failed, nada copiado"; exit 1; }
# Os DOIS arquivos vão pro volume compartilhado (papodebola-next_pdb-data, /app/data em prod
# e dev). Antes só o sisgel.json era copiado e as fichas de jogo (sisgel-matches.json)
# ficaram paradas desde 06/07. Só copia JSON válido; copia com nome temporário e troca com
# mv (atômico: o site nunca lê um JSON pela metade). Dono 1000:1000 = o mesmo que o
# docker cp sempre deixou nesses arquivos (o app roda como nextjs e só precisa ler: 644).
for f in sisgel.json sisgel-matches.json; do
  node -e 'JSON.parse(require("fs").readFileSync(process.argv[1], "utf8"))' "data/$f" \
    || { echo "[$(date "+%Y-%m-%d %H:%M")] invalid $f, skipping"; continue; }
  sudo docker cp "data/$f" "papodebola-next:/app/data/$f.tmp" \
    && sudo docker exec -u root papodebola-next sh -c "chown 1000:1000 /app/data/$f.tmp && chmod 644 /app/data/$f.tmp && mv /app/data/$f.tmp /app/data/$f"
done
sudo docker cp public/escudos-municipal papodebola-next:/app/public/
echo "[$(date "+%Y-%m-%d %H:%M")] SisGel updated"
