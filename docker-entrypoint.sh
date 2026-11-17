#!/bin/sh
# Іске қосылғанда: API_URL-ден /config.js жасау → nginx (бейненің өз entrypoint-і PORT-ты конфигке қояды).
# Бір бейне кез келген командада жұмыс істейді: backend адресі бейнеге жазылмайды.
set -eu

CONFIG_FILE=/usr/share/nginx/html/config.js
API_URL="${API_URL:-}"

case "$API_URL" in
  "" | http://* | https://*) ;;
  *)
    echo "app-entrypoint: API_URL http:// немесе https:// деп басталуы тиіс: '$API_URL'" >&2
    exit 1
    ;;
esac
if [ -z "$API_URL" ]; then
  echo "app-entrypoint: API_URL бос — сұраныстар сол доменнің /api жолына жіберіледі" >&2
fi

# JSON жолы үшін \ және " экрандалады; соңғы / алынады
escaped=$(printf '%s' "${API_URL%/}" | sed -e 's/\\/\\\\/g' -e 's/"/\\"/g')
printf 'window.__APP_CONFIG__ = { apiUrl: "%s" };\n' "$escaped" > "$CONFIG_FILE"

# IPv6: `localhost` контейнер ішінде ::1-ге шешілуі мүмкін (Coolify healthcheck-і) — IPv6 бар болса, соны да тыңдаймыз.
# IPv6 өшірулі контейнерде `listen [::]` nginx-ті тоқтатады, сондықтан тек бар болғанда қосылады.
if grep -q . /proc/net/if_inet6 2>/dev/null; then
  export NGINX_LISTEN_IPV6="listen [::]:${PORT:-8080};"
else
  export NGINX_LISTEN_IPV6=""
fi

exec /docker-entrypoint.sh "$@"
