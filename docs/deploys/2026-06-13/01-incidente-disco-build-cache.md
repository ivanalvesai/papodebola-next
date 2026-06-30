---
area: infra
data: 2026-06-13
gravidade: alta (VPS inteira fora do ar)
---

# Incidente: VPS inteira travou durante um build (disco cheio / build cache do Docker)

## Sintoma

Durante um `git pushdev` (que roda `next build` via `rebuild.sh` no workspace do dev),
~3 minutos depois do build começar **a VPS inteira ficou inacessível** — caíram juntos
papodebola **prod**, **dev**, **signsimples** e **WordPress**.

Assinatura do travamento (clássica de **I/O lockup**, não de CPU comum):
- `ping` respondia (ICMP, ~4ms) — kernel vivo.
- **SSH travava no "banner exchange"** (sshd não conseguia nem dar fork).
- Todo HTTP dava **000** (timeout) nos 3 domínios.
- `journalctl --list-boots` mostrou um **gap de ~26 min sem nenhum log** (o journald
  não conseguia nem escrever no disco).

## Causa raiz: DISCO (não RAM)

- Box tem **15 vCPUs / 15 GB RAM** — RAM sobrando, **sem OOM** no log.
- O `/` (`/dev/sda1`, 97G) estava **85% cheio (78G usados, 15G livres)**.
- O **build cache do Docker tinha 52 GB** (`docker system df` → Build Cache 52.14GB,
  51.3GB recuperável) + imagens 61 GB.
- O `docker compose build` escrevendo layers + cache de imagem do jogo ao vivo
  (`img_cache` até 3g) + ISR **encheu o disco** → I/O travou tudo → processos em D-state.

**Descartado:**
- **RAM** — o Ivan chegou a aumentar a RAM, mas **não era o gargalo** (red herring).
- **Build duplo** — o watcher do dev disparou junto mas deu "sem diffs git, skip"; rodou
  só o build do `pushdev`.

## Diagnóstico (comandos)

```bash
# de fora: sites mortos mas ping vivo
ping -n 3 138.117.60.14                       # responde
curl -s -o /dev/null -w '%{http_code}' https://www.papodebola.com.br/   # 000

# no servidor (quando voltou):
df -h /                                        # 85% cheio = bingo
docker system df                               # Build Cache 52GB (51GB reclaimable)
journalctl --list-boots                        # gap de log = travamento total
free -h                                        # RAM sobrando, sem OOM -> nao era RAM
```

## Recuperação

1. **Reboot** (feito pelo Ivan via ESXi/console). Containers voltaram sozinhos
   (restart policy do Docker) — prod, dev, signsimples, WordPress, libretranslate.
2. **Liberar disco:**
   ```bash
   docker builder prune -f      # liberou 51.3 GB
   docker image prune -f
   df -h /                      # foi de 85% -> 33% (62G livres)
   ```
3. **Rebuilds de recuperação** rodados **throttled** pra não competir com o site:
   ```bash
   nohup nice -n 10 ionice -c2 -n7 bash rebuild.sh > logs/... 2>&1 &
   ```
   Monitorando `uptime` (load) e `df -h /` durante o build. Completaram sem travar.

## Safeguard permanente (aplicado)

Bloco no **topo** dos dois `rebuild.sh` (`/home/ivan/papodebola-next/` e
`/home/ivan/papodebola-next-dev/`), **antes** do `docker compose build`:

```bash
# Se o / passar de 75%, limpa o build cache do Docker antes do build pesado.
DISK_USE=$(df --output=pcent / | tail -1 | tr -dc '0-9')
if [ "${DISK_USE:-0}" -ge 75 ]; then
  log "disco em ${DISK_USE}% - limpando build cache do Docker antes do build"
  docker builder prune -f 2>&1 | tee -a "$LOG" > /dev/null
fi
```

Só dispara **sob pressão** (disco > 75%), então não atrasa os builds do dia a dia.
Os `rebuild.sh` são **gitignored** (existem só no servidor) — se recriar o workspace,
reaplicar esse bloco.

## Pendência: Opção B — disco dedicado ao Docker (agendado p/ 14h de 13/06)

Decisão com o Ivan: adicionar um **2º disco virtual no ESXi** dedicado ao Docker e mover
`/var/lib/docker` pra ele, **isolando** o crescimento do Docker do disco do SO (assim um
build descontrolado nunca mais enche o `/`). Lembrete agendado (routine cloud
`trig_01XshB8oZCYPKU1mcjmtkf2w`) com o passo a passo: add VMDK no ESXi (só sem snapshots) →
`mkfs.ext4 /dev/sdb` → parar Docker → `rsync -aHAX /var/lib/docker/ /mnt/` → trocar mount
(fstab por UUID) → subir Docker → validar → apagar `/var/lib/docker.old`.

## Lições

- **Aumentar RAM não resolve disco/I-O.** Olhar `df -h` e `docker system df` ANTES.
- **Build cache do Docker regenera e cresce rápido** (voltou a ~52GB em poucos dias de
  builds da Copa). O safeguard acima evita reincidência.
- Rodar build pesado com `nice`/`ionice` reduz a chance de starving o site/sshd.
- Reboot recupera porque os containers têm restart policy; o disco só não enche de novo
  por causa do prune + safeguard.

Relacionado: memória `incidente_disco_build_cache_crash`, `cache_persistente_deploy`.
