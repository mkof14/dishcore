# Admin UI + Monitoring + Finance Dashboard — ТЗ для Base44

## Общая концепция

Создать полноценную Admin & Monitoring панель DishCore для ролей `admin`, `support`, `finance`.

**Визуальный стиль:**
- Тот же premium тёмно-синий дизайн DishCore Studio
- Строгая, читабельная верстка
- Акцент на цифры, графики, таблицы

**Три главных блока:**
1. Users & Product
2. Finance & Plans  
3. Tech & Monitoring

---

## 1. Навигация Admin

### Левая панель (Sidebar)
```
🏠 Admin Dashboard
👥 Users
💳 Subscriptions & Plans
📊 Product Usage
💰 Finance
🎧 Support
⚙️ Monitoring
```

### Верхняя панель (Header)
- Логотип "DishCore Admin"
- Бадж: `Stage` / `Prod` (env indicator)
- User menu (admin@dishcore.life)
  - Profile
  - Log out

---

## 2. Admin Dashboard (Главная страница)

### Top Row — KPI Cards

**Карточка 1: Total Users**
- Число: всего пользователей
- Мини-статистика: +X today, +Y this week

**Карточка 2: New Users**
- Число: новые за 24ч / 7д / 30д
- График sparkline

**Карточка 3: Active Users**
- DAU / WAU / MAU
- Цветные индикаторы

**Карточка 4: Active Subscriptions**
- Всего активных подписок
- Разбивка по планам (Lite/Core/Studio)

**Карточка 5: MRR / ARR**
- Monthly Recurring Revenue
- Annual Recurring Revenue

### Charts

**1. User Registrations Over Time**
- Line chart: регистрации по дням (последние 30 дней)
- API: `GET /api/v1/admin/metrics/users/summary`

**2. Active Users Trend**
- Line chart: DAU / WAU за последний месяц
- API: `GET /api/v1/admin/metrics/engagement`

**3. Revenue Over Time**
- Line chart: выручка по дням/месяцам
- API: `GET /api/v1/admin/metrics/revenue/timeseries`

### Alerts & Warnings Section

```
⚠️ High Error Rate (last 1h): 15 errors/min
⚠️ Database Latency: 450ms (above threshold)
✅ All systems operational
```

API: `GET /api/v1/admin/monitoring/health`

---

## 3. Users Management

### Главная страница Users

**Таблица пользователей:**

| Email | Plan | Status | Created At | Last Seen | Actions |
|-------|------|--------|------------|-----------|---------|
| user@example.com | Core | Active | 2025-01-10 | 2 hours ago | View |
| test@example.com | Studio | Active | 2025-01-08 | 5 mins ago | View |

**Фильтры:**
- Plan: All / Free / Lite / Core / Studio
- Status: All / Active / Blocked / Test
- Date Range: Last 7d / 30d / All time

**Поиск:**
- Search by email (live search)

**API:**
- `GET /api/v1/admin/users?query=&plan=&status=&page=`

### User Detail View

При клике на пользователя — открывается детальная страница:

**Секция 1: Profile**
- Email, Full Name, Avatar
- Plan, Status
- Created At, Last Seen
- Total meals logged, water logs, menu plans

**Секция 2: Subscription**
- Current Plan
- Started At / Renews At
- Payment Method (если Stripe)
- Subscription ID

**Секция 3: Recent Activity**
- Последние 10 meal logs
- Последние 5 menu plans
- Последние reports

**Секция 4: Support History**
- Список тикетов от этого пользователя

**Actions (кнопки):**
```
[Change Plan ▼]  [Block User]  [Mark as Test]  [Impersonate]
```

**API:**
- `GET /api/v1/admin/users/:id`
- `PATCH /api/v1/admin/users/:id` — изменить план/статус
- `POST /api/v1/admin/users/:id/impersonate` — создать токен

---

## 4. Subscriptions & Finance

### Главная страница Subscriptions

**KPI Cards:**
- Active Subscriptions (всего)
- Subscriptions by Plan (Lite / Core / Studio)
- Upgrades This Month
- Downgrades This Month
- Churn Rate (%)

**Таблица Subscriptions:**

| User Email | Plan | Status | Started At | Renews At | Source |
|------------|------|--------|------------|-----------|--------|
| user@example.com | Core | Active | 2025-01-01 | 2025-02-01 | Stripe |
| test@example.com | Studio | Trial | 2025-01-15 | 2025-01-22 | Manual |

**Фильтры:**
- Plan: All / Lite / Core / Studio
- Status: All / Active / Canceled / Trial
- Source: All / Stripe / Manual

**API:**
- `GET /api/v1/admin/subscriptions?plan=&status=&period=`

### Finance Charts

**1. Revenue per Day**
- Line chart: ежедневная выручка за последний месяц

**2. New Paid Users**
- Bar chart: новые платные пользователи по дням

**3. ARPU (Average Revenue Per User)**
- Число: средний доход с пользователя

**API:**
- `GET /api/v1/admin/metrics/revenue/summary`
- `GET /api/v1/admin/metrics/revenue/timeseries?granularity=day&from=&to=`

---

## 5. Product Usage

### Главная страница Product Usage

**Метрики:**
- Avg Meals Logged per Active User
- Avg Water Logs per User
- Menu Plans Created (total / this week)
- Recipes Viewed / Created
- Food Scans (если есть)

**Charts:**

**1. Feature Usage Over Time**
- Line chart: meal logs, water logs, menu plans по дням
- Последние 30 дней

**2. Top Features**
- Bar chart: какие функции используются чаще всего

**3. User Engagement Funnel**
- Registered → Onboarded → First Meal Log → First Menu Plan

**API:**
- `GET /api/v1/admin/metrics/product-usage`

---

## 6. Support / Tickets

### Главная страница Support

**Таблица Tickets:**

| ID | User Email | Topic | Status | Created At | Assigned To |
|----|------------|-------|--------|------------|-------------|
| #001 | user@example.com | Payment issue | Open | 2 hours ago | John |
| #002 | test@example.com | Feature request | In Progress | 1 day ago | Sarah |

**Фильтры:**
- Status: All / Open / In Progress / Resolved
- Assignee: All / Me / Unassigned
- Date Range

**API:**
- `GET /api/v1/admin/support/tickets?status=&assignee=&from=&to=`

### Ticket Detail View

При клике на тикет:

**Info:**
- User Email (link to user profile)
- Topic
- Status
- Created At
- Assigned To

**Message History:**
- Исходное сообщение пользователя
- Internal Notes (только для admin/support)

**Actions:**
```
[Change Status ▼]  [Assign To ▼]  [Add Note]  [Close Ticket]
```

**API:**
- `GET /api/v1/admin/support/tickets/:id`
- `PATCH /api/v1/admin/support/tickets/:id` — изменить статус/assignee
- `POST /api/v1/admin/support/tickets/:id/notes` — добавить internal note

---

## 7. Monitoring & Tech Dashboard

### Главная страница Monitoring

### Секция 1: System Health

**Service Status Cards:**

```
✅ Database        Latency: 25ms   Status: OK
✅ S3 Storage      Status: OK
✅ Email Service   Status: OK
⚠️ Payments        Status: Degraded
```

**API:**
- `GET /api/v1/admin/monitoring/health`

### Секция 2: API Latency

**Таблица:**

| Route | Avg Latency | P95 | P99 | Requests (1h) |
|-------|-------------|-----|-----|---------------|
| /api/v1/profile | 45ms | 120ms | 250ms | 1,234 |
| /api/v1/dashboard/summary | 85ms | 180ms | 320ms | 5,678 |
| /api/v1/menu-plans | 120ms | 280ms | 450ms | 890 |

**Chart:**
- Line chart: средняя latency по route за последний час

**API:**
- `GET /api/v1/admin/monitoring/latency`

### Секция 3: Requests & Errors

**Metrics:**
- Requests per Minute (graph)
- Error Rate (%)
- 4xx vs 5xx errors

**Error Log Table:**

| Time | Route | Status | Error Code | Message | User |
|------|-------|--------|------------|---------|------|
| 12:34 | /api/v1/profile | 500 | INTERNAL_ERROR | DB timeout | user@example.com |
| 12:32 | /api/v1/meal-logs | 401 | UNAUTHORIZED | Invalid token | anonymous |

**API:**
- `GET /api/v1/admin/logs/requests?from=&to=&route=&status=`
- `GET /api/v1/admin/logs/errors?from=&to=&severity=`

---

## 8. Технические требования

### UI Framework
- React + Tailwind CSS
- shadcn/ui components
- Recharts для графиков
- Lucide icons

### Дизайн
- Тот же DishCore Studio premium style (тёмно-синий фон)
- Хорошая читаемость цифр
- Адаптивность для ноутбуков и больших мониторов (min-width: 1280px)
- Возможность добавить light theme позже

### API Integration
- Все данные через backend API (`/api/v1/admin/...`)
- Использовать React Query для кеширования
- Auto-refresh для monitoring dashboards (каждые 30 сек)

### Роли и доступ
- `admin` — полный доступ ко всему
- `support` — доступ к Users, Support, Monitoring (без Finance)
- `finance` — доступ к Finance, Subscriptions, Users (без Tech)

### Миграция на Vercel
- Layout строить так, чтобы легко портировать в Next.js
- API вызовы через единый `apiClient`
- Нет Base44-специфичных зависимостей в UI логике

---

## 9. Приоритеты реализации

### Phase 1 (MVP) — Must Have
- ✅ Admin Dashboard (KPIs + basic charts)
- ✅ Users Management (list + search)
- ✅ Monitoring Health
- ✅ Basic metrics (users, engagement, product usage)

### Phase 2 — High Priority
- [ ] User Detail View + Actions
- [ ] Subscriptions & Plans management
- [ ] Finance metrics (revenue charts)
- [ ] Support Tickets UI

### Phase 3 — Nice to Have
- [ ] Advanced monitoring (latency, errors)
- [ ] Request/Error logs UI
- [ ] Real-time alerts
- [ ] Export to CSV/PDF

---

## 10. Wireframes (референсы)

**Dashboard Style:**
- Вдохновение: Vercel Dashboard, Railway Dashboard, Stripe Dashboard
- Premium dark theme с яркими акцентами
- Большие цифры (KPIs) в карточках
- Минималистичные графики (линии + бары)

**Таблицы:**
- Hover effects
- Sortable columns
- Pagination (если много данных)
- Quick actions on row hover

**Charts:**
- Recharts library
- Line charts для трендов
- Bar charts для сравнений
- Pie charts для распределений
- Tooltips с детальной информацией

---

## 11. API Endpoints Summary

### Admin — Users
- `GET /api/v1/admin/users`
- `GET /api/v1/admin/users/:id`
- `PATCH /api/v1/admin/users/:id`
- `POST /api/v1/admin/users/:id/impersonate`

### Admin — Subscriptions
- `GET /api/v1/admin/subscriptions`
- `GET /api/v1/admin/subscriptions/:id`

### Admin — Metrics
- `GET /api/v1/admin/metrics/users/summary`
- `GET /api/v1/admin/metrics/engagement`
- `GET /api/v1/admin/metrics/product-usage`
- `GET /api/v1/admin/metrics/revenue/summary`
- `GET /api/v1/admin/metrics/revenue/timeseries`

### Admin — Monitoring
- `GET /api/v1/admin/monitoring/health`
- `GET /api/v1/admin/monitoring/latency`
- `GET /api/v1/admin/logs/requests`
- `GET /api/v1/admin/logs/errors`

### Admin — Support
- `GET /api/v1/admin/support/tickets`
- `GET /api/v1/admin/support/tickets/:id`
- `PATCH /api/v1/admin/support/tickets/:id`

---

## Итого

Это полноценная Admin панель enterprise-уровня, которая даст полный контроль над DishCore:
- Управление пользователями
- Финансовая аналитика
- Product analytics
- Техническое мониторинг
- Support система

Всё с premium UI в стиле DishCore Studio и готовое к миграции на Vercel.