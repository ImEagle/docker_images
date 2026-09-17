# linux/amd64 base manifests resolved from Docker Hub on 2026-09-17.
FROM node:22.15.1-alpine3.21@sha256:d1068d8b737ffed2b8e9d0e9313177a2e2786c36780c5467ac818232e603ccd0 AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts
COPY index.html vite.config.js ./
COPY public ./public
COPY src ./src
RUN npm run build

FROM nginxinc/nginx-unprivileged:1.27.5-alpine@sha256:28d91bdce70ad09025ea901458fdd149259d8e05982ade79d4ef2c0d9470eb48
LABEL org.opencontainers.image.title="echo-ui" \
      org.opencontainers.image.description="Same-origin React client for an echo API" \
      org.opencontainers.image.source="https://github.com/imeagle/vps"
ENV API_UPSTREAM=http://echo-api:8080
COPY nginx/default.conf.template /etc/nginx/templates/default.conf.template
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 8080
