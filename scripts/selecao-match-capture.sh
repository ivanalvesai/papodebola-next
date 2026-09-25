#!/bin/bash
# Captura agendada de um jogo da Seleção (roda no HOST, via crontab do user ivan).
#
#   selecao-match-capture.sh pre  <matchId> <pathDaPagina>   # véspera/pré-jogo: escalação + fotos
#   selecao-match-capture.sh live <matchId> <pathDaPagina>   # do pré-jogo até o fim: captura 1x/min
#
# O que salva (tudo no volume compartilhado dev/prod, sobrevive à API cair):
#  - data/snapshots/matches/{id}.json  -> lance a lance processado (gravado pelo getMatchDetail
#    quando a página do DEV renderiza; por isso o script "visita" a página no :3001)
#  - data/snapshots/selecao/jogos.json -> placar/status no índice do hub
#  - data/player-images/*.webp         -> fotos de todos os relacionados + quem entrou
#  - ~/pdb-capture/{id}/*.json         -> cópia BRUTA das respostas da API (backup extra)
# Ao fim do jogo (15 min após "finished"): baixa as fotos de novo, grava o estado final,
# revalida as páginas da prod e REMOVE as próprias linhas do crontab (tag "# pdb-cap-{id}").
# Depois de 6h do apito a página para de consultar a API (getSelecaoMatchDetail).
set -u
MODE=$1; ID=$2; PAGE=$3
DIR=/home/ivan/pdb-capture/$ID
LOG=$DIR/capture.log
DEV=/home/ivan/papodebola-next-dev
mkdir -p "$DIR"
TOK=$(grep ^SPORTS_PROXY_TOKEN $DEV/.env.local | cut -d= -f2-)
RS=$(grep ^REVALIDATION_SECRET /home/ivan/papodebola-next/.env.local | cut -d= -f2-)
log() { echo "$(date '+%F %T') [$MODE] $*" >> "$LOG"; }

[ -f "$DIR/DONE" ] && exit 0

raw() { # salva as respostas brutas da API (via proxy do dev: só o dev consulta a API)
  for ep in "" /incidents /lineups /statistics /commentary; do
    name=${ep#/}; name=${name:-event}
    curl -s -m 30 -H "x-proxy-auth: $TOK" "http://127.0.0.1:3001/api/sports-proxy/match/$ID$ep?_pdbttl=10" -o "$DIR/$name.tmp"
    if [ -s "$DIR/$name.tmp" ] && python3 -c "import json;json.load(open('$DIR/$name.tmp'))" 2>/dev/null; then
      mv "$DIR/$name.tmp" "$DIR/$name.json"; else rm -f "$DIR/$name.tmp"; fi
    sleep 1
  done
}
visit() { # render da página no dev -> getMatchDetail grava o snapshot processado
  curl -s -o /dev/null -m 60 "http://127.0.0.1:3001$PAGE?cap=$(date +%s)"
  sleep 3
  curl -s -o /dev/null -m 60 "http://127.0.0.1:3001$PAGE"
}
photos() {
  docker cp $DEV/scripts/download-match-player-images.mjs papodebola-next-dev:/tmp/dlm.mjs 2>/dev/null \
    && docker exec papodebola-next-dev node /tmp/dlm.mjs "$ID" >> "$LOG" 2>&1
}
status() { python3 -c "import json;print(json.load(open('$DIR/event.json'))['event']['status']['type'])" 2>/dev/null; }
nplayers() { python3 -c "import json;d=json.load(open('$DIR/lineups.json'));print(len(d.get('home',{}).get('players',[]))+len(d.get('away',{}).get('players',[])))" 2>/dev/null || echo 0; }

if [ "$MODE" = "pre" ]; then
  raw; visit
  n=$(nplayers)
  log "status=$(status) jogadores_na_escalacao=$n"
  # escalação saiu (e ainda não baixamos as fotos dela) -> baixa as fotos
  if [ "${n:-0}" -gt 0 ] && [ ! -f "$DIR/photos-pre" ]; then photos && touch "$DIR/photos-pre"; fi
  exit 0
fi

# live: um só processo por jogo
exec 9>"$DIR/live.lock"
flock -n 9 || exit 0
log "inicio da captura ao vivo"
done_since=0
for i in $(seq 1 300); do
  raw; visit
  st=$(status)
  log "status=$st"
  if [ "$st" = "finished" ]; then done_since=$((done_since+1)); [ $done_since -ge 15 ] && break; fi
  sleep 50
done
photos; visit
curl -s -X POST -H "Content-Type: application/json" \
  -d "{\"secret\":\"$RS\",\"paths\":[\"$PAGE\",\"/futebol/selecao-brasileira\",\"/sitemap.xml\"]}" \
  http://127.0.0.1:3000/api/revalidate >> "$LOG" 2>&1
curl -s -o /dev/null -m 60 "http://127.0.0.1:3000$PAGE"
touch "$DIR/DONE"
crontab -l | grep -v "# pdb-cap-$ID" | crontab -
log "fim: estado final salvo, crontab limpo"
