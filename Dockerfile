# syntax=docker/dockerfile:1

FROM node:24.19.0-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
# Keep npm's download cache between builds, so a changed lock file only fetches what changed.
RUN --mount=type=cache,target=/root/.npm npm ci --prefer-offline --no-audit --no-fund
COPY . .
# Vite inlines VITE_* values at build time; docker-compose passes them from .env.
ARG VITE_APP_NAME
ARG VITE_API_URL
ARG VITE_PUBLIC_SITE_DOMAIN
ENV VITE_APP_NAME=$VITE_APP_NAME \
    VITE_API_URL=$VITE_API_URL \
    VITE_PUBLIC_SITE_DOMAIN=$VITE_PUBLIC_SITE_DOMAIN
# No type-check (tsc -b) here: run `npx tsc -b` before committing; it slows server builds down.
RUN npm run build:app && npm run build:renderer

# Live-site renderer used by the API to serve published websites (target: renderer).
FROM node:24.19.0-alpine AS renderer
WORKDIR /app
ENV NODE_ENV=production HOST=0.0.0.0 PORT=3100
RUN addgroup -S app && adduser -S app -G app
COPY --from=build --chown=app:app /app/dist-renderer ./
USER app
EXPOSE 3100
CMD ["node", "server.mjs"]

FROM nginx:1.27-alpine AS production
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
