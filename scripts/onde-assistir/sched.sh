#!/bin/bash
# Agenda um lote de guias "onde assistir" no CMS (rascunho + job schedulePublish; o cron do prod publica).
# uso: OA_DIR=<pasta com out/{slug}.json e out/capa-{slug}.png> bash scripts/onde-assistir/sched.sh "slug@2026-11-13T08:00:00-03:00" ...
# O JSON de cada post sai do build-v2.mjs; a capa, do scripts/capa-onde-assistir.py.
set -e
D=${OA_DIR:?defina OA_DIR}
REPO=$(cd "$(dirname "$0")/../.." && pwd)
K="-i $HOME/.ssh/debian_ed25519"
L="["; FILES=""
for it in "$@"; do s=${it%@*}; at=${it#*@}; FILES="$FILES $D/out/$s.json $D/out/capa-$s.png"; L="$L{\"file\":\"$s.json\",\"at\":\"$at\"},"; done
L="${L%,}]"; echo "$L" > "$D/out/oa-lote.json"
scp -q $K -P 1822 $FILES "$D/out/oa-lote.json" ivan@138.117.60.14:'~/cupons-banners/'
scp -q $K -P 1822 "$REPO/scripts/create-posts-onde-assistir-lote.mjs" ivan@138.117.60.14:'~/'
ssh $K -p 1822 ivan@138.117.60.14 'bash ~/run-seed-cupons.sh create-posts-onde-assistir-lote.mjs 2>&1 | sed -n "/out.txt/,\$p"'
