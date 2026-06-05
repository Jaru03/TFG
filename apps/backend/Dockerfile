# Dockerfile del backend (API REST Node.js/Express + Prisma).
# IMPORTANTE: construir con el contexto en la RAÍZ del monorepo, porque el
# package-lock.json y los workspaces npm viven ahí:
#   docker build -f apps/backend/Dockerfile -t edutech-backend .
# (en docker-compose: build.context = "." y build.dockerfile = "apps/backend/Dockerfile")

# ---------------------------------------------------------------------------
# Etapa 1 — builder: instala dependencias y genera el cliente de Prisma.
# Se usa Debian slim (no Alpine) para evitar problemas de Prisma con musl.
# NODE_ENV no se fija aquí para que npm instale también las devDependencies
# (prisma CLI), necesarias para `prisma generate` y `migrate deploy`.
# ---------------------------------------------------------------------------
FROM node:22-slim AS builder
WORKDIR /app

# Manifiestos primero (mejor caché de capas). Se copian los package.json de
# ambos workspaces para que npm valide el lockfile, pero solo se instala el
# del backend con `-w edutech`.
COPY package.json package-lock.json ./
COPY apps/backend/package.json ./apps/backend/
COPY apps/client/package.json ./apps/client/

RUN npm ci -w edutech

# Código del backend y generación del cliente de Prisma.
COPY apps/backend ./apps/backend
RUN npm run -w edutech prisma:generate

# ---------------------------------------------------------------------------
# Etapa 2 — runner: imagen final de ejecución.
# ---------------------------------------------------------------------------
FROM node:22-slim AS runner
ENV NODE_ENV=production
WORKDIR /app

# node_modules (con prisma CLI y el cliente generado) y código ya preparados.
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/apps/backend ./apps/backend

WORKDIR /app/apps/backend

# Directorio de subidas (se monta como volumen en producción para persistir).
RUN mkdir -p uploads/courses uploads/lessons

EXPOSE 3000

# Las migraciones se aplican una vez con:
#   docker compose exec backend npx prisma migrate deploy
CMD ["node", "app.js"]
