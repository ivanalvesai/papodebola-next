#!/bin/bash
cd /home/ivan/papodebola-next
node scripts/scrape-sisgel.js
sudo docker cp data/sisgel.json papodebola-next:/app/data/sisgel.json
sudo docker cp public/escudos-municipal papodebola-next:/app/public/
echo "[$(date "+%Y-%m-%d %H:%M")] SisGel updated"
