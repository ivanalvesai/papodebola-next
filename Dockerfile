FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
# Next standalone faz bind em HOSTNAME; em Docker o default vira o ID do container,
# que com múltiplas redes (pdb-net) deixa de bater com o mapeamento de porta e
# trava TODOS os requests. Forçar 0.0.0.0 (escuta em todas as interfaces).
ENV HOSTNAME=0.0.0.0

RUN apk add --no-cache openssh-client

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

RUN mkdir -p /app/data && chown nextjs:nodejs /app/data
RUN mkdir -p /app/.ssh && chown nextjs:nodejs /app/.ssh && chmod 700 /app/.ssh
# Cache ISR/dados do Next persistido em volume (sobrevive ao deploy). Criar o dir
# com dono nextjs garante que o volume nasca com permissao de escrita correta.
RUN mkdir -p /app/.next/cache && chown -R nextjs:nodejs /app/.next/cache

USER nextjs
EXPOSE 3000

CMD ["node", "server.js"]
