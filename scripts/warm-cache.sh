#!/bin/bash
# Warm ISR cache - runs every 30min via cron
# Forces Next.js to revalidate pages by visiting them

BASE="https://papodebola.com.br"

# Main pages
curl -s -o /dev/null "$BASE/"
curl -s -o /dev/null "$BASE/noticias"
curl -s -o /dev/null "$BASE/agenda"
curl -s -o /dev/null "$BASE/ao-vivo"
curl -s -o /dev/null "$BASE/campeonato/brasileirao-serie-a"
curl -s -o /dev/null "$BASE/campeonato/libertadores"
curl -s -o /dev/null "$BASE/campeonato/champions-league"

echo "[$(date '+%Y-%m-%d %H:%M')] Cache warmed"
