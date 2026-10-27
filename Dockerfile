# syntax=docker/dockerfile:1

FROM node:24.19.0-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
# Vite inlines VITE_* values at build time; docker-compose passes them from .env.
ARG VITE_APP_NAME
ARG VITE_API_URL
ARG VITE_PUBLIC_SITE_DOMAIN
ENV VITE_APP_NAME=$VITE_APP_NAME \
    VITE_API_URL=$VITE_API_URL \
    VITE_PUBLIC_SITE_DOMAIN=$VITE_PUBLIC_SITE_DOMAIN
RUN npm run build && npm run build:renderer

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
