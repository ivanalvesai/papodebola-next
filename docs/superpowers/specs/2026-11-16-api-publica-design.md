# API pública de dados esportivos (`/v1`) — design

**Data:** 16/11/2026
**Status:** aprovado em conversa (4 partes); aguardando revisão da spec escrita

## 1. Objetivo

Expor os dados esportivos que o Papo de Bola já coleta para um **site novo de futebol do Ivan**,
com layout próprio, rodando em **outro servidor (outro IP)**, feito em Next.js (ou similar, com
servidor). O site novo **nunca** consulta a AllSportsApi: lê tudo da nossa API.

### Critérios de sucesso

1. O site novo mostra placar ao vivo, tabela, rodadas, resultados, lance a lance, escalações,
   estatísticas, artilharia e escudos/fotos usando só a API `/v1`.
2. Nenhuma requisição ao fornecedor é gerada pela API: só o development consulta a AllSportsApi
   (regra vigente). A banda/rate-limit do plano não sobe de forma perceptível.
3. O Papo de Bola (prod e dev) não fica mais lento nem cai por causa da API.
4. Quem não tem chave válida, vinda do IP autorizado, não obtém nenhum dado.
5. Toda rota nova de dados esportivos implementada no Papo de Bola pode ganhar sua rota `/v1`
   sem mudar a arquitetura.

### Fora do escopo (v1)

Webhooks/push de gol, canal de transmissão (aba Transmissões), notícias/posts do CMS, outros
esportes (NBA, NFL, tênis, eSports), acesso para terceiros/venda de acesso.

> **Cuidado contratual:** os dados vêm da AllSportsApi/Sofascore via RapidAPI. Uso num site
> próprio do Ivan é a hipótese aceita. Abrir para terceiros exige ler os termos antes.

## 2. Arquitetura

```
 site novo (outro servidor, Next.js)  — chave no .env do servidor dele
        │  HTTPS + x-api-key
        ▼
 Cloudflare — api.papodebola.com.br (WAF: exige x-api-key; rate limit por IP)
        ▼
 nginx (aaPanel) — só IPs da Cloudflare; limit_req ~20 r/s/IP; proxy 127.0.0.1:3002
        ▼
 container papodebola-api (:3002)
   - MESMA imagem da produção (branch master), env PDB_API_MODE=1
   - só responde /v1/* (resto 404)
   - lê o volume pdb-data (snapshots, store de jogos de hoje, escudos/fotos)
   - ao vivo / dado novo → SPORTS_PROXY_URL → development (único que fala com o fornecedor)
```

### 2.1 Container `papodebola-api`

- Usa a imagem `papodebola-next-nextjs:latest` que o `rebuild.sh` da **produção** gera. Sem
  build extra. O `rebuild.sh` da prod passa a recriar também este container (e o rollback via
  tag `:previous` vale para os dois).
- Definido num compose próprio no servidor (`/home/ivan/papodebola-api/docker-compose.yml`,
  fora do git, como o override do dev), porta `127.0.0.1:3002:3000`, `restart: unless-stopped`.
- Env: as do `.env.local` da prod **mais** `PDB_API_MODE=1`, `PDB_API_NO_DIRECT=1`.
  `SPORTS_PROXY_URL`/`SPORTS_PROXY_TOKEN` apontam para o development como na prod.
- Volumes:
  - `pdb-data` em `/app/data` **somente leitura** (`:ro`).
  - `pdb-api-state` em `/app/data-api` (leitura e escrita): uso por chave e cache de respostas.
    O container **dev** monta o mesmo volume em `/app/data-api:ro` para o painel exibir o uso.
- Sem Postgres/Payload no caminho da API (nenhuma rota `/v1` depende do CMS).

### 2.2 Modo API (`PDB_API_MODE=1`)

- O `middleware.ts`, nesse modo, devolve 404 para qualquer caminho fora de `/v1/`.
- Crons, push, archive e warm não rodam nesse container (já são disparados por URL do dev;
  nada a fazer além de não apontar nenhum cron para ele).
- `PDB_API_NO_DIRECT=1`: em `fetchAllSports`, quando o proxy do dev estiver **inacessível**,
  **não** cai para a consulta direta à RapidAPI (diferente da prod). Retorna `null` e a camada
  de snapshot serve o disco.

### 2.3 Validação antes de promover

As rotas `/v1/*` também respondem no **development** (`development.papodebola.com.br/v1/...`),
com a mesma exigência de chave. Lá se valida antes do promote; o endereço público
`api.papodebola.com.br` só existe com a versão de prod.

## 3. Contrato `/v1`

### 3.1 Princípios

- **Contrato próprio e estável.** Cada rota passa por um conversor em
  `src/lib/public-api/v1/` que monta DTOs documentados; tipos internos (`MatchDetail`,
  `ChampionshipData`, ...) nunca vazam crus. Mudança interna ou do fornecedor ajusta só o
  conversor. Quebra de formato = `/v2`, com `/v1` mantido.
- Campos em **português** (`mandante`, `visitante`, `placar`, `status`, `minuto`).
- **Ids do Sofascore** preservados (time, jogador, jogo, torneio).
- Datas em ISO 8601 com fuso `-03:00`; timestamp Unix também quando útil (`inicioTs`).

### 3.2 Rotas

| Rota | Conteúdo | Fonte existente |
|---|---|---|
| `GET /v1/campeonatos` | campeonatos cobertos: slug, nome, id, seasonId | `TOURNAMENTS` (`config.ts`) |
| `GET /v1/campeonatos/{slug}` | tabela (grupos quando houver), rodada atual, lista de rodadas/fases | `getChampionshipData` |
| `GET /v1/campeonatos/{slug}/rodadas/{chave}` | jogos de uma rodada ou fase de mata-mata | `getChampionshipData().matchesByRound` |
| `GET /v1/campeonatos/{slug}/artilharia` | artilheiros | `topScorers` / `getScorersFor` |
| `GET /v1/jogos/hoje` | jogos do dia agrupados por campeonato | `getStoredFootballAgenda` |
| `GET /v1/jogos?data=AAAA-MM-DD` | jogos de um dia agrupados por campeonato | `getFootballAgendaForDay` |
| `GET /v1/jogos/ao-vivo` | só jogos em andamento: placar, minuto, status | `getLiveMatches` |
| `GET /v1/jogos/{id}` | jogo completo: evento, lance a lance, escalações, estatísticas, pênaltis | `getMatchDetail` |
| `GET /v1/jogos/{id}/ao-vivo` | versão enxuta para polling: placar, minuto, status, lances | `getMatchLive` |
| `GET /v1/times/{id}` | dados do time, próximos jogos, últimos resultados (+ posição na tabela se o time estiver configurado) | `team.ts` (`getTeamNextEvents`, `getTeamPreviousEvents`, `getTeamStandingPosition`) |
| `GET /v1/imagens/time/{id}` | escudo (webp/png) | disco `data/team-images` |
| `GET /v1/imagens/jogador/{id}` | foto | disco `data/player-images` |
| `GET /v1/docs` | página com as rotas e exemplos (pública, sem dados) | `openapi.yaml` |

Amistosos, Copa, Liga das Nações e qualquer torneio novo de `TOURNAMENTS` entram pelas mesmas
rotas. Imagens ausentes no disco: a API pede ao `/api/team-img|player-img` do development
(que grava no volume, write-through) e repassa; ela mesma nunca grava em `pdb-data`.

### 3.3 Envelope

```json
{
  "data": { },
  "meta": {
    "atualizadoEm": "2026-11-16T15:42:10-03:00",
    "desatualizado": false,
    "proximaAtualizacaoSugerida": 10
  }
}
```

- `desatualizado: true` quando veio da cópia em disco porque o fornecedor/dev não respondeu.
- `proximaAtualizacaoSugerida` (segundos): 10 com bola rolando, 60 no intervalo/tabela com jogo,
  600 tabela parada, 86400 jogo encerrado.
- Erros: `{ "erro": { "codigo": "...", "mensagem": "..." } }`

| HTTP | `codigo` |
|---|---|
| 400 | `parametro_invalido` |
| 401 | `chave_ausente` / `chave_invalida` |
| 403 | `ip_nao_autorizado` / `chave_desativada` |
| 404 | `nao_encontrado` |
| 429 | `limite_excedido` (com `Retry-After`) |
| 503 | `indisponivel` (dado nunca coletado e fonte fora) |

### 3.4 Documentação

`src/lib/public-api/v1/openapi.yaml` é a fonte; `/v1/docs` renderiza a lista de rotas com
exemplos. O site novo é desenvolvido só por ela.

## 4. Segurança

O site novo chama a API **pelo servidor dele** (chave no `.env`, nunca no navegador). O placar
do navegador do visitante pergunta ao servidor do site novo, que pergunta à API.

| Camada | Proteção |
|---|---|
| Cloudflare | WAF: bloqueia requisição a `api.papodebola.com.br` sem `x-api-key`; regra de rate limit por IP |
| nginx | aceita só IPs da Cloudflare (`allow` lista CF, `deny all`); `real_ip` por `CF-Connecting-IP`; `limit_req` ~20 r/s por IP com burst |
| Container | chave obrigatória em `x-api-key` (nunca query string); IP de origem tem de estar na lista da chave; cota por chave (padrão 600 req/min, token bucket em memória); sem CORS |

### 4.1 Chaves

- Formato `pdb_` + 40 caracteres aleatórios. Exibida **uma vez** na criação.
- Armazenadas em `data/api-keys.json` (volume `pdb-data`) com: `id`, `nome`, `hash` (SHA-256),
  `prefixo` (8 primeiros caracteres, para identificar), `ipsPermitidos[]`, `cotaPorMinuto`,
  `ativa`, `criadaEm`. Comparação de hash em tempo constante.
- O container da API relê o arquivo a cada 30 s (cache em memória).
- A verificação fica num wrapper `withPublicApi(handler, opts)` usado por toda rota `/v1`
  (runtime Node, porque lê arquivo), não no middleware.

### 4.2 Painel

Aba **API** em `/painel-pdb-9x/api` (JWT, como as demais; `/api/painel-api-keys` protegido no
middleware). Criar chave (nome, IPs, cota), desativar, rotacionar, ver uso por dia e último
acesso. O painel do development grava `api-keys.json`; o uso é lido de
`/app/data-api/usage/{AAAA-MM-DD}.json`, gravado pelo container da API (contagem por chave e
por rota, gravação agregada a cada 60 s).

## 5. Cache e ao vivo

Cache em memória no container da API, por rota + parâmetros, com **coalescência**: pedidos
simultâneos para a mesma chave de cache esperam uma única busca.

| Dado | TTL |
|---|---|
| `/jogos/{id}/ao-vivo`, `/jogos/ao-vivo` | 10 s |
| `/jogos/hoje` | 30 s |
| campeonato / rodada com jogo em andamento | 60 s |
| campeonato / rodada sem jogo em andamento | 10 min |
| jogo encerrado | 24 h |
| imagens | `Cache-Control: public, max-age=2592000` (30 dias) |

Ao vivo é polling: o site novo pergunta a cada `proximaAtualizacaoSugerida` segundos, só nos
jogos em andamento. A fonte é a mesma das páginas do Papo de Bola, então o placar chega ao
mesmo tempo. Jogos encerrados saem do snapshot (`getMatchDetail` já embrulhado em
`withSnapshot`).

## 6. Falhas

| Situação | Comportamento |
|---|---|
| Fornecedor com erro / 429 | serve cópia do disco, `desatualizado: true`, HTTP 200 |
| Development fora | idem; **sem** consulta direta à RapidAPI (`PDB_API_NO_DIRECT=1`) |
| Dado nunca coletado e fonte fora | 503 `indisponivel` |
| Container reiniciando (deploy) | segundos fora; o site novo segura o próprio cache |

Nenhuma chamada pendura o handler: valem os limites do `fetchAllSports` (retry 429 ~2 s,
`AbortSignal.timeout(8s)`). Regra do incidente de 20/06 mantida.

## 7. Testes

- **Conversores:** testes unitários com JSONs reais de snapshots como fixtures (Série A com
  tabela única, Série D com grupos + mata-mata, jogo da Copa com pênaltis, jogo ao vivo). Testes
  de contrato garantem o formato `/v1`.
- **Proteção:** 401 sem chave, 401 chave inválida, 403 IP fora da lista, 403 chave desativada,
  429 cota estourada, 200 chave correta.
- **Modo API:** com `PDB_API_MODE=1`, página/painel/cms dão 404 e `/v1/*` responde.
- **Cache:** coalescência (N pedidos simultâneos = 1 busca) e TTL por tipo.
- **Servidor (pós-deploy):** chave de teste do IP autorizado em cada rota; sem chave barrado na
  Cloudflare; IP direto no servidor recusado pelo nginx; logs do `papodebola-api` sem nenhuma
  chamada à RapidAPI.

## 8. Implantação (ordem)

1. Código no `development` (rotas `/v1`, conversores, wrapper, painel API, modo API,
   `PDB_API_NO_DIRECT`) + `npm run gen:paths` (pasta nova em `src/app`) + testes.
2. Validar `/v1` no development com uma chave de teste.
3. Promote para master (rebuild da prod gera a imagem).
4. Servidor: volume `pdb-api-state`, compose do `papodebola-api`, montar `pdb-api-state:ro` no
   override do dev, ajustar `rebuild.sh` da prod para recriar a API.
5. DNS `api` na Cloudflare (proxied) + regras WAF/rate limit (dashboard, feito pelo Ivan; não há
   token de API da Cloudflare no servidor) + vhost nginx no aaPanel.
6. Criar a chave do site novo com o IP do servidor dele; entregar a chave e o link do `/v1/docs`.
7. Registrar no `CLAUDE.md` e em `docs/knowledge/` (arquitetura, onde ficam as chaves, como
   incluir rota nova na API).

## 9. Regra para o futuro

Toda seção nova de dados esportivos do Papo de Bola que deva ir para o site novo ganha: um
conversor em `src/lib/public-api/v1/`, uma rota `/v1` com `withPublicApi`, TTL definido, teste
de contrato e entrada no `openapi.yaml`. A fonte continua sendo a função de dados com
`withSnapshot` (regra de ouro).
