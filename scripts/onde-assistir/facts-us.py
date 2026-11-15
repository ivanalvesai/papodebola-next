#!/usr/bin/env python3
# Dados dos guias NBA/NFL (roda NO SERVIDOR, via sports-proxy do dev, ~1 req/s).
# uso: python3 facts-us.py <dia AAAA-MM-DD> <saida.json>
# Pega os jogos do dia (horário de Brasília) da NBA (132) e da NFL (9464) pela temporada atual,
# a classificação, os últimos e próximos jogos de cada time e a ficha (arena) de cada jogo.
import json, sys, time, urllib.request, datetime

DAY, OUT = sys.argv[1], sys.argv[2]
ENV = "/home/ivan/papodebola-next/.env.local"
T = open(ENV).read().split("SPORTS_PROXY_TOKEN=")[1].split("\n")[0].strip()
BR = datetime.timezone(datetime.timedelta(hours=-3))


def get(p):
    d = {}
    for _ in range(4):
        r = urllib.request.Request("http://127.0.0.1:3001/api/sports-proxy/" + p, headers={"x-proxy-auth": T})
        try:
            d = json.loads(urllib.request.urlopen(r, timeout=30).read())
        except Exception as e:
            d = {"err": str(e)}
        time.sleep(1.2)
        if "rate limit" not in json.dumps(d)[:200]:
            return d
        time.sleep(3)
    return d


def day(ts):
    return datetime.datetime.fromtimestamp(ts, BR).strftime("%Y-%m-%d")


def ev(e):
    return {
        "id": e["id"], "ts": e.get("startTimestamp"), "status": (e.get("status") or {}).get("type"),
        "home": e["homeTeam"]["name"], "homeId": e["homeTeam"]["id"],
        "away": e["awayTeam"]["name"], "awayId": e["awayTeam"]["id"],
        "hs": (e.get("homeScore") or {}).get("display"), "as": (e.get("awayScore") or {}).get("display"),
        "ut": ((e.get("tournament") or {}).get("uniqueTournament") or {}).get("id"),
        "round": (e.get("roundInfo") or {}).get("round"),
    }


out = {"day": DAY, "games": [], "standings": {}, "last": {}, "next": {}}
teams = set()
for tid, liga in ((132, "nba"), (9464, "nfl")):
    seasons = get(f"tournament/{tid}/seasons").get("seasons", [])
    sid = next((s["id"] for s in seasons if not any(w in s.get("name", "").lower() for w in ("cup", "play-in", "preseason"))), None)
    if not sid:
        continue
    st = get(f"tournament/{tid}/season/{sid}/standings/total")
    out["standings"][liga] = [
        {"name": g.get("name"), "rows": [{"pos": r.get("position"), "team": r["team"]["name"], "id": r["team"]["id"],
                                          "w": r.get("wins"), "l": r.get("losses"), "pct": r.get("percentage"),
                                          "pf": r.get("scoresFor"), "pa": r.get("scoresAgainst"), "streak": r.get("streak")} for r in g.get("rows", [])]}
        for g in st.get("standings", [])
    ]
    for page in ("next/0", "next/1"):
        for e in get(f"tournament/{tid}/season/{sid}/matches/{page}").get("events", []):
            if e.get("startTimestamp") and day(e["startTimestamp"]) == DAY and not any(g["id"] == e["id"] for g in out["games"]):
                g = ev(e)
                g["liga"] = liga
                out["games"].append(g)
                teams.update([g["homeId"], g["awayId"]])
        if liga == "nfl":
            break

for g in out["games"]:
    m = get(f"match/{g['id']}").get("event") or {}
    v = m.get("venue") or {}
    g["venue"] = (v.get("name") or (v.get("stadium") or {}).get("name") or "").strip() or None
    g["city"] = ((v.get("city") or {}).get("name") or "").strip() or None
    g["cap"] = (v.get("stadium") or {}).get("capacity") or v.get("capacity")
    if m.get("startTimestamp"):
        g["ts"] = m["startTimestamp"]

for t in sorted(teams):
    prev = get(f"team/{t}/matches/previous/0").get("events", [])
    out["last"][t] = [ev(e) for e in prev if (e.get("status") or {}).get("type") == "finished"][-25:]
    nxt = get(f"team/{t}/matches/next/0").get("events", [])
    out["next"][t] = [ev(e) for e in nxt][:3]

out["games"].sort(key=lambda g: g["ts"] or 0)
json.dump(out, open(OUT, "w"), ensure_ascii=False)
print("ok", DAY, len(out["games"]), "jogos", len(teams), "times")
