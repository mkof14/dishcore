# Backend DishCore — Чек-лист для Base44

## Задача
Настроить backend DishCore в Base44 так, чтобы:
- был единый REST/JSON API `/api/v1/...` для всего приложения
- были роли (user / admin / support / finance)
- была панель Admin + Monitoring + Financial Metrics
- всё можно было перенести на Vercel с минимальными изменениями

---

## Шаг 1. Базовая инфраструктура

### ✅ Роутинг API
- [x] Настроить единый роутер для API: `/api/v1/...`
- [x] Стандартный формат ответов: `{ success: boolean, data?: any, error?: { code, message } }`

### ✅ Auth Module
- [x] Проверка Clerk JWT
- [x] Авто-создание пользователя в таблице users по `clerk_user_id`
- [x] Выдача `userId`, `roles[]` в контекст запроса
- [x] Определить роль `user` по умолчанию
- [ ] Роли `admin`, `support`, `finance` через таблицу `user_roles`

### Middleware
- [x] `authMiddleware` — проверка JWT + создание user context
- [x] `requireRole(roles[])` — проверка прав доступа
- [x] `withLogging` — автологирование запросов

---

## Шаг 2. Основные доменные сервисы

### ✅ Profile & Body
- [x] `GET/PUT /api/v1/profile`
- [x] `GET/POST /api/v1/body/measurements`
- [ ] `GET/POST /api/v1/body/goals`

### ✅ Meals & Nutrition
- [ ] `GET/POST /api/v1/meals`
- [x] `GET/POST /api/v1/meal-logs`
- [ ] `GET/POST /api/v1/water-logs`
- [ ] `GET/POST /api/v1/recipes`
- [ ] `GET/POST /api/v1/menu-plans`
- [ ] `POST /api/v1/menu-plans/:id/items`
- [ ] `PUT /api/v1/menu-items/:itemId`
- [ ] `DELETE /api/v1/menu-items/:itemId`

### ✅ Dashboard & Reports
- [x] `GET /api/v1/dashboard/summary`
- [x] `GET /api/v1/dashboard/trends`
- [ ] `GET /api/v1/reports/weekly`
- [ ] `GET /api/v1/reports/monthly`

---

## Шаг 3. Интеграции (каркас)

### Storage (S3-паттерн)
- [ ] `POST /api/v1/files/upload-url`
  - Returns: `{ uploadUrl, fileKey, publicUrl }`

### Email
- [ ] `POST /api/v1/email/welcome`
- [ ] `POST /api/v1/email/weekly-report`
- [ ] `POST /api/v1/email/test`

### Support & Voice Hooks
- [ ] `POST /api/v1/support/contact`
- [ ] `POST /api/v1/voice/start`
- [ ] `POST /api/v1/voice/stop`
- [ ] `GET /api/v1/voice/status`

---

## Шаг 4. Admin & Monitoring Backend

### Namespace `/api/v1/admin/...`
Доступ только для ролей: `admin` / `support` / `finance`

### ✅ User Management
- [x] `GET /api/v1/admin/users` — список пользователей
- [ ] `GET /api/v1/admin/users/:id` — детали пользователя
- [ ] `PATCH /api/v1/admin/users/:id` — изменить план/статус/роли
- [ ] `POST /api/v1/admin/users/:id/impersonate` — создать токен для входа от лица пользователя

### ✅ Monitoring
- [x] `GET /api/v1/admin/monitoring/health` — статус всех сервисов
- [ ] `GET /api/v1/admin/monitoring/latency` — средние задержки по route
- [ ] `GET /api/v1/admin/logs/requests` — лог запросов
- [ ] `GET /api/v1/admin/logs/errors` — лог ошибок

### ✅ Metrics (Business & Finance)
- [x] `GET /api/v1/admin/metrics/users/summary` — статистика пользователей
- [x] `GET /api/v1/admin/metrics/users/retention` — retention curves
- [x] `GET /api/v1/admin/metrics/product-usage` — использование продукта
- [ ] `GET /api/v1/admin/metrics/revenue/summary` — общая выручка (MRR, ARR, ARPU)
- [ ] `GET /api/v1/admin/metrics/revenue/timeseries` — выручка по дням/месяцам
- [ ] `GET /api/v1/admin/metrics/subscriptions/summary` — подписки по планам

### Plans & Subscriptions
- [ ] `GET /api/v1/admin/plans` — список тарифов
- [ ] `GET /api/v1/admin/subscriptions` — список подписок
- [ ] `GET /api/v1/admin/subscriptions/:id` — детали подписки

---

## Шаг 5. Организация кода

### Общие модули
- [x] `helpers/auth.js` — auth middleware
- [x] `helpers/response.js` — ok(), fail(), unauthorized(), etc.
- [x] `helpers/logger.js` — logRequest(), logError()
- [ ] `helpers/db.js` — database helper

### Структура
```
functions/
├── helpers/
│   ├── auth.js
│   ├── response.js
│   ├── logger.js
│   └── db.js
├── api/
│   ├── v1/
│   │   ├── profile.js
│   │   ├── bodyMeasurements.js
│   │   ├── mealLogs.js
│   │   ├── waterLogs.js
│   │   ├── recipes.js
│   │   ├── menuPlans.js
│   │   ├── dashboard.js
│   │   └── reports.js
│   └── admin/
│       ├── users.js
│       ├── plans.js
│       ├── subscriptions.js
│       ├── monitoring.js
│       └── metrics.js
└── README_API.md
```

### Единый формат ответа
```json
// Success
{
  "success": true,
  "data": { ... }
}

// Error
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message"
  }
}
```

---

## Таблицы базы данных

### Требуемые таблицы
- [x] `users` — id, clerk_user_id, email, plan, status, created_at
- [ ] `user_roles` — user_id, role (user|admin|support|finance)
- [ ] `sessions` — user_id, last_seen_at, device, ip, country
- [ ] `subscriptions` — user_id, plan, start, end, renewal, status, stripe_subscription_id
- [ ] `payments` — user_id, amount, currency, status, stripe_payment_id, created_at
- [ ] `support_tickets` — user_id, topic, message, status, created_at, resolved_at
- [ ] `request_logs` — route, method, status, latency_ms, user_id, timestamp
- [ ] `error_logs` — route, error_code, stack, user_id, timestamp

---

## Документация

- [x] `README_API.md` — базовая документация API
- [ ] OpenAPI/Swagger spec — полная спецификация всех endpoints
- [ ] Postman Collection — для тестирования API

---

## Готовность к миграции на Vercel

### Принципы
✅ API-first design — всё через REST endpoints
✅ Нет Base44-специфичных globals в бизнес-логике
✅ Все секреты через env vars
✅ Стандартная структура (легко портировать на Vercel Serverless Functions)

### План миграции
1. Заменить `createClientFromRequest` на `getAuth(req)` (Clerk)
2. Заменить entity calls на Prisma/Drizzle queries
3. Деплой functions как Vercel serverless functions
4. Обновить frontend URLs

---

## Приоритеты

### P0 (Critical) — Работает сейчас
- ✅ Auth middleware
- ✅ Profile API
- ✅ Meal logs API
- ✅ Dashboard summary
- ✅ Admin users list
- ✅ Basic monitoring

### P1 (High) — Нужно срочно
- [ ] Body goals API
- [ ] Water logs API
- [ ] Menu plans CRUD
- [ ] Reports API
- [ ] Admin user details & management
- [ ] Request/error logging в БД

### P2 (Medium) — Важно
- [ ] File upload (S3)
- [ ] Email service
- [ ] Support tickets
- [ ] Subscriptions & plans API
- [ ] Revenue metrics

### P3 (Low) — Можно позже
- [ ] Voice hooks
- [ ] Retention curves
- [ ] Advanced analytics
- [ ] OpenAPI spec