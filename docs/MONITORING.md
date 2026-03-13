# ADAMBOOT MCO -- Monitoring and Observability

Version: 1.0 | Last updated: 2026-03-12

---

## 1. Current Monitoring Stack

ADAMBOOT MCO currently uses a lightweight monitoring approach suitable for its SPA architecture. As the system matures toward production, the integration points described in Section 6 should be activated.

---

## 2. Error Boundaries

React ErrorBoundary components are used to catch rendering errors without crashing the entire application.

**Location:** `src/shared/components/`

**Architecture:**

```
<AppRouter>
  <AppShell>
    <ErrorBoundary>       <-- Catches errors in any child page
      <Outlet />          <-- Lazy-loaded page content
    </ErrorBoundary>
  </AppShell>
</AppRouter>
```

When an error is caught:

1. The error is logged to the console
2. A fallback UI is displayed to the user
3. The rest of the application remains functional

**Recommendation:** Connect ErrorBoundary's `componentDidCatch` to an external error tracking service (see Section 6).

---

## 3. Console Logging Strategy

The codebase uses structured console logging with module prefixes:

| Prefix   | Module         | Example                                    |
| -------- | -------------- | ------------------------------------------ |
| `[Auth]` | Authentication | `[Auth] Login failed: <error>`             |
| `[Auth]` | Authentication | `[Auth] Logout failed: <error>`            |
| `[Auth]` | Authentication | `[Auth] Token acquisition failed: <error>` |

**Log levels used:**

- `console.error` -- Authentication failures, unrecoverable errors
- `console.warn` -- Deprecation warnings, fallback behavior
- `console.log` -- Development-only debug information

**Production considerations:**

- Strip `console.log` calls in production builds (via Vite config or Terser)
- Keep `console.error` and `console.warn` for production debugging

---

## 4. Application Health (Admin Panel)

The Admin page (`/admin`, restricted to `admin` and `coordenador` roles) provides:

- System status overview
- User management
- Project overview across all teams
- Audit log viewer

Health indicators available through the admin panel:

| Metric                | Source                           |
| --------------------- | -------------------------------- |
| Total audit entries   | `auditCount()` from audit module |
| Active projects count | Project store                    |
| Pending requirements  | PhaseEngine calculations         |
| Overdue actions       | Action status analysis           |

---

## 5. Audit Trail as Observability

The audit module (`src/modules/audit/`) serves double duty as an observability layer:

- **24 tracked action types** cover all significant system events
- **Before/after diffs** enable change tracking
- **Timestamp precision** (ISO 8601) supports time-range queries
- **User attribution** on every entry

Query capabilities via `queryAuditLog()`:

```typescript
queryAuditLog({
  projectId: 'proj-123', // Filter by project
  userId: 'user-456', // Filter by user
  action: 'fase_avancada', // Filter by action type
  from: '2026-01-01', // Date range start
  to: '2026-03-12', // Date range end
});
```

In-memory store retains the last 10,000 entries. In production with Supabase, the `audit_log` table provides persistent storage with indexes on `usuario_id`, `entidade + entidade_id`, and `criado_em`.

---

## 6. Future Integration Points

### 6.1 Sentry (Error Tracking)

**Recommended integration:**

```typescript
// Install: npm install @sentry/react
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: process.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
  integrations: [Sentry.browserTracingIntegration(), Sentry.replayIntegration()],
  tracesSampleRate: 0.1, // 10% of transactions
  replaysSessionSampleRate: 0.01,
});
```

Connect to ErrorBoundary:

```typescript
// In ErrorBoundary componentDidCatch:
Sentry.captureException(error, { extra: errorInfo });
```

### 6.2 Vercel Analytics

**Recommended integration:**

```typescript
// Install: npm install @vercel/analytics
import { Analytics } from '@vercel/analytics/react';

// Add to App component:
<Analytics />
```

Provides: page views, web vitals (LCP, FID, CLS), top pages, geographic distribution.

### 6.3 Vercel Speed Insights

```typescript
// Install: npm install @vercel/speed-insights
import { SpeedInsights } from '@vercel/speed-insights/react';

// Add to App component:
<SpeedInsights />
```

### 6.4 DataDog RUM (Real User Monitoring)

For enterprise deployments requiring full observability:

```typescript
// Install: npm install @datadog/browser-rum
import { datadogRum } from '@datadog/browser-rum';

datadogRum.init({
  applicationId: '<APP_ID>',
  clientToken: '<CLIENT_TOKEN>',
  site: 'datadoghq.com',
  service: 'adamboot-mco',
  env: import.meta.env.MODE,
  sessionSampleRate: 100,
  trackUserInteractions: true,
  trackResources: true,
});
```

### 6.5 Supabase Monitoring

When `VITE_USE_SUPABASE=true`:

- **Dashboard metrics:** Query performance, connection count, storage usage
- **Log Explorer:** Real-time API and database logs
- **Alerts:** Configure in Supabase dashboard for error rate thresholds
- **pg_stat_statements:** Enable for slow query identification

---

## 7. Alerting Recommendations

| Alert                      | Threshold          | Channel             |
| -------------------------- | ------------------ | ------------------- |
| Error rate spike           | > 5% of requests   | Slack / PagerDuty   |
| LCP degradation            | > 2.5s (p75)       | Email               |
| Build failure              | Any CI failure     | GitHub notification |
| Supabase connection errors | > 0 in 5 minutes   | Slack               |
| Audit log volume anomaly   | > 2x daily average | Email               |

---

## 8. Performance Budgets

Recommended performance targets for the SPA:

| Metric                   | Target   | Measurement                   |
| ------------------------ | -------- | ----------------------------- |
| First Contentful Paint   | < 1.5s   | Vercel Analytics / Lighthouse |
| Largest Contentful Paint | < 2.5s   | Vercel Analytics / Lighthouse |
| Time to Interactive      | < 3.5s   | Lighthouse                    |
| Total Bundle Size (gzip) | < 500 KB | Vite build output             |
| Cumulative Layout Shift  | < 0.1    | Vercel Analytics              |

All pages are lazy-loaded to minimize initial bundle size.
