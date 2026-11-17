# Дүкен — frontend (Angular)

Касса, қойма, түгендеу, құжаттар және есептер — Angular SPA. Backend — бөлек репо
[`DevUMRA/kassa-template-backend-django`](https://github.com/DevUMRA/kassa-template-backend-django)
(`/api/...`, OpenAPI схемасы: backend-те `/api/docs/`).

Бұл — Qoldanba шаблоны: стандарты [`TEMPLATE.md`](TEMPLATE.md), команданың ережелері — [`CONTRIBUTING.md`](CONTRIBUTING.md).

## Бөлімдер

| Бөлім | Жол | Кім көреді (`/api/me/` → `sections`) |
|---|---|---|
| Касса: сату, сатудан қайтару | `/pos`, `/pos/return` | Сатушы, Басқарушы |
| Қойма: қабылдау, жеткізушіге қайтару, есептен шығару | `/warehouse/...` | Қоймашы, Басқарушы |
| Түгендеу: бастау, санау, бекіту, күшін жою | `/inventory`, `/inventory/:id` | Қоймашы, Басқарушы |
| Құжаттар журналы, құжатты көру, күшін жою | `/documents`, `/documents/:id` | Басқарушы |
| Есептер: қалдықтар, айналым, сату, түгендеу нәтижелері, қозғалыс, CSV | `/reports`, `/reports/:report` | Қоймашы, Басқарушы |

## Жергілікті іске қосу

Керек: Node.js 22.22+ немесе 24.15+ (Angular 22), Docker (backend үшін).

1. Backend-ті іске қосыңыз (`localhost:8000`):

   ```bash
   git clone https://github.com/DevUMRA/kassa-template-backend-django
   cd kassa-template-backend-django && docker compose up --build --wait
   # әкімші: admin / admin-local
   ```

2. Frontend:

   ```bash
   npm ci
   npm start            # http://localhost:4200
   ```

   `ng serve` `/api` сұраныстарын `proxy.conf.json` бойынша `http://localhost:8000`-ге жібереді, ал
   `public/config.js`-те `apiUrl` бос — сондықтан CORS керек емес. Басқа backend-ке қосылу үшін
   `public/config.js`-те `apiUrl`-ді (мысалы, `https://team-1-backend.example.kz`) көрсетіңіз — онда backend-тің
   `CORS_ALLOWED_ORIGINS` тізімінде `http://localhost:4200` болуы тиіс.

### Кіру

Логин формасы `POST /api/auth/token/` (`{username, password}` → `{token}`) жібереді, токен `localStorage`-та
сақталады және әр сұранысқа `Authorization: Token <token>` қосылады (`core/auth/auth.interceptor.ts`).
Ағымдағы пайдаланушы мен рөлі — `GET /api/me/`. Шығу — `POST /api/auth/logout/` (қатесі елеусіз) және токен өшіріледі.
Кез келген 401 — кіру беті (`?next=` — қайтатын бет).

### Backend адресі

Бейнеге жазылмайды: `index.html` қолданбадан бұрын `/config.js` жүктейді
(`window.__APP_CONFIG__ = { apiUrl: "..." }`), қолданба адресті `APP_CONFIG` арқылы оқиды
(`core/config/app-config.ts`). Docker бейнесінде бұл файлды `docker-entrypoint.sh` `API_URL` айнымалысынан жасайды.

## Тесттер, линтер, жинау

```bash
npm test              # unit-тесттер (Vitest + jsdom, браузер керек емес); бақылау режимі: npm run test:watch
npm run lint          # ESLint (angular-eslint + typescript-eslint)
npm run typecheck     # tsc --noEmit
npm run format:check  # Prettier
npm run build         # production жинау → dist/kassa-template-frontend-angular/browser
```

## Docker

Екі сатылы бейне: `node:24.22-alpine` (`npm ci` + build) → `nginxinc/nginx-unprivileged:1.30-alpine`
(тек статика, `USER 101`). `$PORT`-та тыңдайды (әдепкі `8080`), `GET /health` → `200 ok`,
белгісіз жолдар → `index.html`.

```bash
docker compose up --build --wait     # http://localhost:8080, API_URL=http://localhost:8000
curl http://localhost:8080/health    # ok
curl http://localhost:8080/config.js # window.__APP_CONFIG__ = { apiUrl: "http://localhost:8000" };

# немесе тікелей:
docker build -t kassa-frontend .
docker run --rm -p 8080:8080 -e API_URL=https://backend.example.kz kassa-frontend
```

Бейне `localhost:8080`-та ашылады, сондықтан backend-тің `CORS_ALLOWED_ORIGINS` тізімінде
`http://localhost:8080` болуы тиіс (браузер `API_URL`-ге басқа доменнен сұраныс жібереді).
nginx IPv4-те, ал контейнерде IPv6 болса `[::]`-та да тыңдайды — `localhost` `::1`-ге шешілсе де
healthcheck (`wget -qO- http://localhost:$PORT/health`) жұмыс істейді.

Айнымалылар — [`.env.example`](.env.example). Песочницада оларды платформа береді (`qoldanba.yaml`):
`API_URL=https://${BACKEND_HOST}`.

## Құрылымы

```
src/
  index.html, main.ts, styles.css   # styles.css — жалпы стильдер және CSS токендері
  app/
    app.ts, app.config.ts, app.routes.ts
    core/       # config (APP_CONFIG), api (ApiService, ApiError), auth (токен, guard, interceptor), navigation, ui (toast, confirm)
    shared/     # ui (alert, status-badge, receipt-view, product-scan, product-search), returns, format, models
    features/   # login, shell, pos, warehouse, inventory, documents, reports
  testing/      # тест деректері (fixtures)
public/config.js                    # dev: apiUrl бос (proxy)
docker/default.conf.template        # nginx конфигі
```
