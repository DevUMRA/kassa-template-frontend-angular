# Qoldanba frontend бейнесі (TEMPLATE.md, 2-бөлім «Frontend (SPA)»):
# node сатысында жинау → nginx-unprivileged тек дайын статиканы береді (root емес, бір процесс).

# --- 1. Жинау ---
FROM node:24.22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY . .
RUN npm run build

# --- 2. Статика ---
FROM nginxinc/nginx-unprivileged:1.30-alpine
# Платформа PORT береді; envsubst оны nginx конфигіне қояды
ENV PORT=8080 \
    API_URL=""
COPY docker/default.conf.template /etc/nginx/templates/default.conf.template
COPY --chmod=755 docker-entrypoint.sh /usr/local/bin/app-entrypoint.sh
COPY --from=build /app/dist/kassa-template-frontend-angular/browser /usr/share/nginx/html
# config.js іске қосылғанда API_URL-ден жасалады — nginx пайдаланушысы (101) жаза алуы керек
USER root
RUN chown 101:0 /usr/share/nginx/html/config.js && chmod 664 /usr/share/nginx/html/config.js
USER 101
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -q -O /dev/null "http://localhost:${PORT}/health" || exit 1
ENTRYPOINT ["/usr/local/bin/app-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
