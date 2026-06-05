# Dockerfile del cliente (SPA React + Vite).
# Construye el frontend estático y lo sirve con Nginx, que además actúa como
# proxy inverso hacia el backend (/api, /auth, /uploads).
# IMPORTANTE: construir con el contexto en la RAÍZ del monorepo:
#   docker build -f apps/client/Dockerfile -t edutech-client .
# (en docker-compose: build.context = "." y build.dockerfile = "apps/client/Dockerfile")

# ---------------------------------------------------------------------------
# Etapa 1 — builder: compila el SPA con Vite (genera apps/client/dist).
# ---------------------------------------------------------------------------
FROM node:22-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json ./
COPY apps/client/package.json ./apps/client/
COPY apps/backend/package.json ./apps/backend/

RUN npm ci -w edutech-client

COPY apps/client ./apps/client
RUN npm run -w edutech-client build

# ---------------------------------------------------------------------------
# Etapa 2 — runner: Nginx sirve el build estático y hace de proxy inverso.
# ---------------------------------------------------------------------------
FROM nginx:alpine AS runner

# Configuración propia (SPA + proxy a backend). Reemplaza la default.
RUN rm -f /etc/nginx/conf.d/default.conf
COPY apps/client/nginx.conf /etc/nginx/conf.d/default.conf

# Artefactos estáticos del SPA.
COPY --from=builder /app/apps/client/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
