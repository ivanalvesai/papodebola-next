#!/usr/bin/env python3
# Corrige o facts-us.json quando o feed team/{id}/matches/previous da API está atrasado (17/11/2026: jogos de
# 2-3 dias antes ainda vinham em "next" como notstarted). Roda NO SERVIDOR, depois do facts-us.py.
# Para cada jogo em next[time] com horário no passado, consulta match/{id}: se encerrou, move pra last[time]
# com o placar. Jogo em andamento fica em next (e aparece no log).
# uso: python3 fix-us.py <entrada.json> <saida.json>
import json, sys, time, urllib.request

IN, OUT = sys.argv[1], sys.argv[2]
T = open("/home/ivan/papodebola-next/.env.local").read().split("SPORTS_PROXY_TOKEN=")[1].split("\n")[0].strip()


def get(p):
    r = urllib.request.Request("http://127.0.0.1:3001/api/sports-proxy/" + p, headers={"x-proxy-auth": T})
    try:
        d = json.loads(urllib.request.urlopen(r, timeout=30).read())
    except Exception as e:
        d = {"err": str(e)}
    time.sleep(1.2)
    return d


f = json.load(open(IN))
now, cache = time.time(), {}
for tid, lst in f["next"].items():
    keep = []
    for e in lst:
        if e["ts"] and e["ts"] < now:
            if e["id"] not in cache:
                cache[e["id"]] = get(f"match/{e['id']}").get("event") or {}
            m = cache[e["id"]]
            st = (m.get("status") or {}).get("type")
            if st == "finished":
                done = dict(e, status="finished", hs=(m.get("homeScore") or {}).get("display"), **{"as": (m.get("awayScore") or {}).get("display")})
                if not any(x["id"] == e["id"] for x in f["last"].setdefault(tid, [])):
                    f["last"][tid].append(done)
                print("corrigido", e["id"], e["home"], done["hs"], "x", done["as"], e["away"])
                continue
            print("ainda", st, e["id"], e["home"], "x", e["away"])
        keep.append(e)
    f["next"][tid] = keep
    f["last"][tid] = sorted(f["last"].get(tid, []), key=lambda x: x["ts"] or 0)
json.dump(f, open(OUT, "w"), ensure_ascii=False)
print("ok", OUT)
