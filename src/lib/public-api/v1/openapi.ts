// Especificação OpenAPI 3.1 da API pública v1. Fica embutida num módulo (e não num .yaml lido em
// runtime) porque o build standalone do Next não copia arquivos soltos de src/.
// Ao criar/alterar rota /v1: atualizar aqui (ver docs/knowledge/2026-11-16-api-publica.md).
export const OPENAPI_YAML = `openapi: 3.1.0
info:
  title: API Papo de Bola
  version: "1"
  description: |
    Dados esportivos (futebol) coletados pelo Papo de Bola.
    Autenticação: cabeçalho x-api-key, chamado SEMPRE pelo servidor (nunca pelo navegador).
    A chave só funciona a partir dos IPs cadastrados para ela. Cota padrão: 600 pedidos/minuto.
    Toda resposta de sucesso é { data, meta }. Use meta.proximaAtualizacaoSugerida (segundos)
    como intervalo de polling. meta.desatualizado = true quando o dado veio da cópia em disco
    porque o fornecedor não respondeu.
    Escudos e fotos (campos escudo/foto) são caminhos relativos a este servidor e também
    exigem a chave: baixe pelo seu servidor e sirva do seu cache.
servers:
  - url: https://api.papodebola.com.br
security:
  - chave: []
components:
  securitySchemes:
    chave: { type: apiKey, in: header, name: x-api-key }
  schemas:
    Meta:
      type: object
      properties:
        atualizadoEm: { type: string, example: "2026-11-16T15:42:10-03:00" }
        desatualizado: { type: boolean }
        proximaAtualizacaoSugerida: { type: integer, example: 10 }
    Erro:
      type: object
      properties:
        erro:
          type: object
          properties:
            codigo: { type: string, enum: [parametro_invalido, chave_ausente, chave_invalida, ip_nao_autorizado, chave_desativada, nao_encontrado, limite_excedido, indisponivel, erro_interno] }
            mensagem: { type: string }
    Status: { type: string, enum: [agendado, ao_vivo, intervalo, encerrado, adiado, cancelado, interrompido] }
    TimeRef:
      type: object
      properties:
        id: { type: integer, example: 1963 }
        nome: { type: string, example: Palmeiras }
        escudo: { type: string, example: /v1/imagens/time/1963 }
    Placar:
      type: object
      properties:
        mandante: { type: [integer, "null"] }
        visitante: { type: [integer, "null"] }
        penaltisMandante: { type: [integer, "null"], description: só quando houve disputa de pênaltis }
        penaltisVisitante: { type: [integer, "null"] }
    JogoResumo:
      type: object
      properties:
        id: { type: integer }
        campeonato: { type: string }
        rodada: { type: integer }
        inicio: { type: string, example: "2026-11-18T19:00:00-03:00" }
        inicioTs: { type: integer, description: Unix (s) }
        status: { $ref: "#/components/schemas/Status" }
        statusTexto: { type: string }
        mandante: { $ref: "#/components/schemas/TimeRef" }
        visitante: { $ref: "#/components/schemas/TimeRef" }
        placar: { $ref: "#/components/schemas/Placar" }
    LinhaTabela:
      type: object
      properties:
        posicao: { type: integer }
        time: { $ref: "#/components/schemas/TimeRef" }
        pontos: { type: integer }
        jogos: { type: integer }
        vitorias: { type: integer }
        empates: { type: integer }
        derrotas: { type: integer }
        golsPro: { type: integer }
        golsContra: { type: integer }
        saldo: { type: integer }
        zona: { type: string, description: ex. Libertadores, Rebaixamento }
        variacao: { type: integer, description: posições ganhas (+) ou perdidas (-) }
        ultimos: { type: array, items: { type: string, enum: [V, E, D] }, description: do mais recente ao mais antigo }
    Campeonato:
      type: object
      properties:
        slug: { type: string }
        nome: { type: string }
        id: { type: integer }
        temporadaId: { type: [integer, "null"] }
        rodadaAtual: { type: string, description: chave da rodada atual }
        rodadas:
          type: array
          items:
            type: object
            properties:
              chave: { type: string, example: "34", description: "número (pontos corridos/grupos) ou slug do mata-mata" }
              numero: { type: integer }
              nome: { type: string, example: Rodada 34 }
              mataMata: { type: boolean }
        tabela:
          type: array
          description: um item por grupo (campeonato de tabela única tem 1)
          items:
            type: object
            properties:
              nome: { type: string }
              linhas: { type: array, items: { $ref: "#/components/schemas/LinhaTabela" } }
        temJogoAoVivo: { type: boolean }
    Artilheiro:
      type: object
      properties:
        posicao: { type: integer }
        jogador: { type: object, properties: { id: { type: integer }, nome: { type: string }, foto: { type: string } } }
        time: { $ref: "#/components/schemas/TimeRef" }
        gols: { type: integer }
        nota: { type: [number, "null"] }
    Jogo:
      allOf:
        - $ref: "#/components/schemas/JogoResumo"
        - type: object
          properties:
            estadio: { type: [object, "null"], properties: { nome: { type: string }, cidade: { type: string }, pais: { type: string }, capacidade: { type: [integer, "null"], example: 43713 } } }
            arbitro: { type: [string, "null"] }
            vencedor: { type: [string, "null"], enum: [mandante, visitante, null], description: "vencedor DESTE jogo (nos pênaltis, quem ganhou a disputa)" }
            inicioPeriodoTs: { type: integer, description: início do período atual (para cronômetro) }
            fase:
              type: [object, "null"]
              properties:
                nome: { type: string, example: Semifinal, description: "Rodada 34, Oitavas de final, Semifinal, Final..." }
                mataMata: { type: boolean }
                chave: { type: [string, "null"], example: semifinals, description: "mesma chave de /v1/campeonatos/{slug}/rodadas/{chave}" }
            agregado: { type: [object, "null"], description: "placar somado da ida e da volta (só no jogo de volta)", properties: { mandante: { type: integer }, visitante: { type: integer } } }
            avancou: { type: [string, "null"], enum: [mandante, visitante, null], description: "quem avançou no confronto (agregado ou pênaltis); null em jogo de ida, jogo de grupo ou quando a API não diz" }
            jogoIdaId: { type: [integer, "null"], description: "id do jogo de ida (use em /v1/jogos/{id})" }
            tecnicos: { type: [object, "null"], properties: { mandante: { type: [string, "null"] }, visitante: { type: [string, "null"] } } }
            gols:
              type: array
              description: "gols em ordem de minuto (para o topo da página)"
              items:
                type: object
                properties:
                  jogador: { type: [string, "null"] }
                  jogadorId: { type: [integer, "null"], description: "foto em /v1/imagens/jogador/{id}" }
                  assistencia: { type: [string, "null"] }
                  minuto: { type: [integer, "null"] }
                  acrescimo: { type: [integer, "null"] }
                  lado: { type: [string, "null"], enum: [mandante, visitante, null], description: "time que somou o gol no placar" }
                  tipo: { type: string, enum: [normal, penalti, contra] }
            resumo: { type: [string, "null"], description: "frase de resumo do jogo encerrado (placar, fase, pênaltis, agregado e gols)", example: "Fim de jogo: Palmeiras 0 x 1 Fluminense, pela semifinal da Copa Libertadores. Nos pênaltis, Palmeiras venceu por 5 a 3, depois do empate em 2 a 2 no agregado, e avançou. Gols: Hércules (82', Fluminense)." }
            lances:
              type: array
              items:
                type: object
                properties:
                  tipo: { type: string, description: goal, card, substitution, period, injuryTime }
                  detalhe: { type: string, description: regular, yellow, red, penalty, ownGoal... }
                  minuto: { type: [integer, "null"], description: "null nos marcadores de fim de período e nos pênaltis" }
                  acrescimo: { type: [integer, "null"] }
                  rotulo: { type: [string, "null"], example: "Fim da disputa de pênaltis", description: "texto para os marcadores (Intervalo, Fim do tempo normal, Fim da prorrogação, Fim da disputa de pênaltis, Acréscimos)" }
                  jogador: { type: [string, "null"] }
                  jogadorId: { type: [integer, "null"] }
                  assistencia: { type: [string, "null"] }
                  assistenciaId: { type: [integer, "null"] }
                  entrou: { type: [string, "null"] }
                  entrouId: { type: [integer, "null"] }
                  saiu: { type: [string, "null"] }
                  saiuId: { type: [integer, "null"] }
                  motivo: { type: [string, "null"], example: Falta, description: "motivo do cartão (PT-BR), quando a fonte informa" }
                  lado: { type: [string, "null"], enum: [mandante, visitante, null] }
                  placarMandante: { type: [integer, "null"] }
                  placarVisitante: { type: [integer, "null"] }
                  texto: { type: [string, "null"] }
            narracao:
              type: array
              description: lance a lance em texto (PT-BR), mais recente primeiro
              items:
                type: object
                properties:
                  id: { type: integer }
                  tipo: { type: string }
                  texto: { type: string }
                  minuto: { type: [integer, "null"] }
                  rotuloMinuto: { type: [string, "null"], example: Intervalo }
                  lado: { type: [string, "null"] }
                  jogador: { type: [string, "null"] }
                  jogadorId: { type: [integer, "null"] }
                  motivo: { type: [string, "null"], description: "motivo do cartão (PT-BR)" }
                  html: { type: [string, "null"], description: comentário editorial com imagem/link }
            estatisticas:
              type: array
              items: { type: object, properties: { nome: { type: string }, mandante: { type: string }, visitante: { type: string } } }
            penaltis:
              type: array
              items: { type: object, properties: { ordem: { type: integer }, jogador: { type: string }, jogadorId: { type: [integer, "null"] }, lado: { type: string }, converteu: { type: boolean }, motivo: { type: string } } }
    Escalacao:
      type: [object, "null"]
      properties:
        formacao: { type: [string, "null"], example: 4-3-3 }
        titulares: { type: array, items: { $ref: "#/components/schemas/JogadorEscalacao" } }
        reservas: { type: array, items: { $ref: "#/components/schemas/JogadorEscalacao" } }
    JogadorEscalacao:
      type: object
      properties:
        id: { type: integer }
        nome: { type: string }
        numero: { type: [integer, "null"] }
        posicao: { type: string, enum: [G, D, M, F] }
        nota: { type: [string, "null"] }
        capitao: { type: boolean }
        foto: { type: string, example: /v1/imagens/jogador/123 }
        eventos:
          type: array
          description: "o que o jogador fez no jogo (para mostrar ao lado do nome)"
          items:
            type: object
            properties:
              tipo: { type: string, enum: [gol, golPenalti, golContra, assistencia, amarelo, segundoAmarelo, vermelho, entrou, saiu] }
              minuto: { type: [integer, "null"] }
              acrescimo: { type: [integer, "null"] }
              motivo: { type: [string, "null"], description: "só nos cartões" }
    JogoCompleto:
      allOf:
        - $ref: "#/components/schemas/Jogo"
        - type: object
          properties:
            escalacoes:
              type: object
              properties:
                confirmadas: { type: boolean }
                mandante: { $ref: "#/components/schemas/Escalacao" }
                visitante: { $ref: "#/components/schemas/Escalacao" }
    Dia:
      type: array
      items:
        type: object
        properties:
          campeonato: { type: string }
          jogos: { type: array, items: { $ref: "#/components/schemas/JogoResumo" } }
  responses:
    Erro400: { description: Parâmetro inválido, content: { application/json: { schema: { $ref: "#/components/schemas/Erro" } } } }
    Erro401: { description: Sem chave ou chave inválida, content: { application/json: { schema: { $ref: "#/components/schemas/Erro" } } } }
    Erro403: { description: IP não autorizado ou chave desativada, content: { application/json: { schema: { $ref: "#/components/schemas/Erro" } } } }
    Erro404: { description: Não encontrado, content: { application/json: { schema: { $ref: "#/components/schemas/Erro" } } } }
    Erro429: { description: Cota excedida (ver cabeçalho Retry-After), content: { application/json: { schema: { $ref: "#/components/schemas/Erro" } } } }
    Erro503: { description: Dado ainda não coletado e fonte fora do ar, content: { application/json: { schema: { $ref: "#/components/schemas/Erro" } } } }
  parameters:
    slug: { name: slug, in: path, required: true, schema: { type: string }, example: brasileirao-serie-a }
    id: { name: id, in: path, required: true, schema: { type: integer } }
paths:
  /v1/campeonatos:
    get:
      summary: Campeonatos cobertos
      responses:
        "200": { description: OK (cache 1 h), content: { application/json: { schema: { properties: { data: { type: array, items: { type: object, properties: { slug: { type: string }, nome: { type: string }, id: { type: integer }, temporadaId: { type: [integer, "null"] } } } }, meta: { $ref: "#/components/schemas/Meta" } } } } } }
        "401": { $ref: "#/components/responses/Erro401" }
        "403": { $ref: "#/components/responses/Erro403" }
        "429": { $ref: "#/components/responses/Erro429" }
  /v1/campeonatos/{slug}:
    get:
      summary: Tabela, rodada atual e lista de rodadas/fases
      parameters: [{ $ref: "#/components/parameters/slug" }]
      responses:
        "200": { description: OK (cache 60 s com jogo ao vivo, 10 min sem), content: { application/json: { schema: { properties: { data: { $ref: "#/components/schemas/Campeonato" }, meta: { $ref: "#/components/schemas/Meta" } } } } } }
        "401": { $ref: "#/components/responses/Erro401" }
        "404": { $ref: "#/components/responses/Erro404" }
        "429": { $ref: "#/components/responses/Erro429" }
        "503": { $ref: "#/components/responses/Erro503" }
  /v1/campeonatos/{slug}/rodadas/{chave}:
    get:
      summary: Jogos de uma rodada ou fase de mata-mata
      parameters:
        - { $ref: "#/components/parameters/slug" }
        - { name: chave, in: path, required: true, schema: { type: string }, example: "34", description: "rodadas[].chave de /v1/campeonatos/{slug}" }
      responses:
        "200": { description: OK, content: { application/json: { schema: { properties: { data: { type: array, items: { $ref: "#/components/schemas/JogoResumo" } }, meta: { $ref: "#/components/schemas/Meta" } } } } } }
        "404": { $ref: "#/components/responses/Erro404" }
  /v1/campeonatos/{slug}/artilharia:
    get:
      summary: Artilheiros
      parameters: [{ $ref: "#/components/parameters/slug" }]
      responses:
        "200": { description: OK (cache 30 min), content: { application/json: { schema: { properties: { data: { type: array, items: { $ref: "#/components/schemas/Artilheiro" } }, meta: { $ref: "#/components/schemas/Meta" } } } } } }
        "404": { $ref: "#/components/responses/Erro404" }
  /v1/jogos/hoje:
    get:
      summary: Jogos de hoje (horário de Brasília), agrupados por campeonato
      responses:
        "200": { description: OK (cache 30 s), content: { application/json: { schema: { properties: { data: { $ref: "#/components/schemas/Dia" }, meta: { $ref: "#/components/schemas/Meta" } } } } } }
  /v1/jogos/ao-vivo:
    get:
      summary: Só os jogos em andamento agora
      responses:
        "200": { description: OK (cache 10 s), content: { application/json: { schema: { properties: { data: { $ref: "#/components/schemas/Dia" }, meta: { $ref: "#/components/schemas/Meta" } } } } } }
  /v1/jogos:
    get:
      summary: Jogos de um dia
      parameters:
        - { name: data, in: query, required: true, schema: { type: string }, example: "2026-11-18", description: "AAAA-MM-DD, de 60 dias atrás até 30 dias à frente" }
      responses:
        "200": { description: "OK (hoje: cache 30 s, ao vivo; outros dias: 10 min, montado das tabelas salvas)", content: { application/json: { schema: { properties: { data: { $ref: "#/components/schemas/Dia" }, meta: { $ref: "#/components/schemas/Meta" } } } } } }
        "400": { $ref: "#/components/responses/Erro400" }
  /v1/jogos/{id}:
    get:
      summary: Jogo completo (lance a lance, escalações, estatísticas, pênaltis)
      parameters: [{ $ref: "#/components/parameters/id" }]
      responses:
        "200": { description: OK (cache 10 s ao vivo, 24 h encerrado), content: { application/json: { schema: { properties: { data: { $ref: "#/components/schemas/JogoCompleto" }, meta: { $ref: "#/components/schemas/Meta" } } } } } }
        "400": { $ref: "#/components/responses/Erro400" }
        "404": { $ref: "#/components/responses/Erro404" }
  /v1/jogos/{id}/ao-vivo:
    get:
      summary: Versão enxuta para polling (sem escalações)
      parameters: [{ $ref: "#/components/parameters/id" }]
      responses:
        "200": { description: OK (cache 10 s ao vivo), content: { application/json: { schema: { properties: { data: { $ref: "#/components/schemas/Jogo" }, meta: { $ref: "#/components/schemas/Meta" } } } } } }
        "404": { $ref: "#/components/responses/Erro404" }
  /v1/times/{id}:
    get:
      summary: Time com próximos jogos e últimos resultados (posição na tabela em /v1/campeonatos/{slug})
      parameters: [{ $ref: "#/components/parameters/id" }]
      responses:
        "200": { description: OK (cache 5 min), content: { application/json: { schema: { properties: { data: { allOf: [{ $ref: "#/components/schemas/TimeRef" }, { type: object, properties: { proximos: { type: array, items: { $ref: "#/components/schemas/JogoResumo" } }, ultimos: { type: array, items: { $ref: "#/components/schemas/JogoResumo" } } } }] }, meta: { $ref: "#/components/schemas/Meta" } } } } } }
        "404": { $ref: "#/components/responses/Erro404" }
  /v1/imagens/time/{id}:
    get:
      summary: Escudo (png ou webp)
      parameters: [{ $ref: "#/components/parameters/id" }]
      responses:
        "200": { description: Imagem, content: { image/png: {}, image/webp: {} } }
        "404": { $ref: "#/components/responses/Erro404" }
  /v1/imagens/jogador/{id}:
    get:
      summary: Foto do jogador
      parameters: [{ $ref: "#/components/parameters/id" }]
      responses:
        "200": { description: Imagem, content: { image/webp: {}, image/png: {} } }
        "404": { $ref: "#/components/responses/Erro404" }
`;
