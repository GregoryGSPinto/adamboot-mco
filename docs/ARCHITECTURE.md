# ADAMBOOT MCO -- System Architecture

Version: 1.0 | Last updated: 2026-03-12

---

## 1. High-Level Architecture

ADAMBOOT MCO is a Single Page Application (SPA) built with React 18 and TypeScript 5.4, bundled by Vite 5, and deployed on Vercel. The backend is Supabase (PostgreSQL) used as a Backend-as-a-Service (BaaS).

```
+---------------------+         +----------------------+
|   Browser (SPA)     |  HTTPS  |   Supabase (BaaS)    |
|   React 18 + Vite   | ------> |   PostgreSQL + Auth  |
|   Zustand + RQ      |         |   Storage + RLS      |
+---------------------+         +----------------------+
         |
         v
  Azure AD (MSAL) -- Production auth
```

**Current state:** The frontend operates in offline-first mode using `localStorage` via a `StorageAdapter` abstraction. Supabase integration is gated behind the `VITE_USE_SUPABASE` feature flag.

---

## 2. Technology Stack

| Layer          | Technology                            | Version         |
| -------------- | ------------------------------------- | --------------- |
| UI Framework   | React                                 | 18.3            |
| Language       | TypeScript                            | 5.4             |
| Bundler        | Vite                                  | 5.4             |
| State (client) | Zustand                               | 4.5             |
| State (server) | TanStack React Query                  | 5.28            |
| Forms          | React Hook Form                       | 7.51            |
| Routing        | React Router DOM                      | 6.22            |
| i18n           | react-intl                            | 7.1             |
| Auth (prod)    | Azure AD via @azure/msal-browser      | 3.10            |
| Database       | Supabase (PostgreSQL)                 | 2.98            |
| HTTP           | Axios                                 | 1.6             |
| PWA            | vite-plugin-pwa                       | 0.19            |
| Testing        | Vitest + Testing Library + Playwright | 3.0 / 16 / 1.51 |
| Linting        | ESLint + Prettier + Husky             | 9.x / 3.x / 9.x |

---

## 3. Directory Structure

```
src/
  app/
    auth/           -- Authentication (MSAL + dev bypass)
    providers/      -- React context providers
    router/         -- AppRouter with lazy-loaded pages
  domain/
    models/         -- Domain entity types
    constants/      -- Business constants
    validation/     -- Step-level validation rules
    helpers/        -- Pure utility functions
  modules/          -- 26 feature modules (see below)
  pages/            -- 12 page components
  shared/
    api/            -- Mock DB, mock projetos, StorageAdapter
    components/     -- Shared UI (AppLayout, ProtectedRoute, ErrorBoundary)
    design/         -- Design tokens, Vale palette
    dto/            -- Data transfer objects
    engine/         -- PhaseEngine + MASP requisitos
    errors/         -- Error types
    hooks/          -- Shared hooks (useAppStore, etc.)
```

### 3.1 Feature Modules (`src/modules/`)

| Module        | Purpose                                      |
| ------------- | -------------------------------------------- |
| a3            | A3 report structure                          |
| admin         | Administration panel                         |
| ai            | AI engine (validator, nudges, feedback)      |
| apresentacao  | Project presentation mode                    |
| audit         | Audit trail (AuditEntry, auditLog)           |
| caderno       | Field notebook                               |
| chat          | Project chat / messaging                     |
| ciclo         | PDCA cycle tracking                          |
| conhecimento  | Knowledge base                               |
| continuidade  | Continuity / sustainability                  |
| conversa      | Conversations                                |
| core          | Core shared logic                            |
| evento        | Timeline events                              |
| evidencia     | Evidence attachments                         |
| impedimento   | Blockers / impediments                       |
| lgpd          | LGPD compliance (consent, export, anonymize) |
| library       | Document library                             |
| mission       | Missions                                     |
| monitoramento | Monitoring / dashboards                      |
| offline       | Offline-first support                        |
| permissao     | Permissions / RBAC                           |
| projeto       | Project CRUD and lifecycle                   |
| relatorio     | Reports                                      |
| reuniao       | Meetings / attendance                        |
| seguranca     | Security utilities                           |
| verificacao   | Result verification                          |

### 3.2 Pages (12, all lazy-loaded)

| Route             | Page Component          | Access Control     |
| ----------------- | ----------------------- | ------------------ |
| `/`               | HomePage                | Public             |
| `/missao`         | MissaoPage              | Authenticated      |
| `/projeto`        | ProjetoPage             | Authenticated      |
| `/projeto/:id`    | ProjetoWorkspacePage    | Authenticated      |
| `/notas`          | NotasPage               | Authenticated      |
| `/apresentacao`   | ApresentacaoProjetoPage | Authenticated      |
| `/chat`           | ChatPage                | Authenticated      |
| `/library`        | BibliotecaPage          | Authenticated      |
| `/perfil`         | PerfilPage              | Authenticated      |
| `/admin`          | AdminPage               | admin, coordenador |
| `/acervo`         | AcervoPage              | Authenticated      |
| `/auditoria`      | AuditoriaPage           | Authenticated      |
| `/minhas-missoes` | MinhasMissoesPage       | Authenticated      |

All pages are wrapped in `<ProtectedRoute>` and loaded with `React.lazy()` + `<Suspense>`.

---

## 4. State Management

### 4.1 Zustand (Client State)

The global app store (`src/shared/hooks/use-app-store.ts`) manages:

- Current user session
- UI state (sidebar, theme, locale)
- Project selection

Zustand is chosen for its minimal boilerplate and compatibility with React 18 concurrent features.

### 4.2 React Query (Server State)

TanStack React Query handles:

- Data fetching and caching from Supabase / mock API
- Optimistic updates
- Background refetching
- Offline query persistence (planned)

---

## 5. Authentication

Two authentication modes coexist, selected via the `VITE_DEV_AUTH` environment variable:

| Mode | Provider          | Use Case               |
| ---- | ----------------- | ---------------------- |
| Dev  | Local credentials | Development, demos, CI |
| Prod | Azure AD (MSAL)   | Production deployment  |

The `useAuth()` hook (`src/app/auth/use-auth.ts`) delegates to the appropriate provider at runtime. In dev mode, credentials are configured via `VITE_DEV_AUTH_EMAIL` and `VITE_DEV_AUTH_PASSWORD`.

MSAL configuration includes popup-based login, silent token acquisition with popup fallback, and configurable scopes.

---

## 6. Data Flow and Storage

```
UI Component
    |
    v
useAppStore (Zustand)  <-->  localStorage (offline-first)
    |
    v
StorageAdapter (abstraction layer)
    |
    v
Supabase Client (when VITE_USE_SUPABASE=true)
    |
    v
PostgreSQL + RLS
```

**StorageAdapter pattern:** All data access goes through a storage abstraction that currently reads/writes to `localStorage` with mock data. When `VITE_USE_SUPABASE=true`, it delegates to the Supabase JS client. This enables a zero-downtime migration path.

---

## 7. Domain Layer (`src/domain/`)

The domain layer contains pure business logic with no framework dependencies:

- **models/** -- TypeScript interfaces for domain entities (Projeto, Membro, Acao, Evidencia)
- **constants/** -- Business constants (phase labels, status enums)
- **validation/step-rules.ts** -- Per-step validation rules for the 8-phase wizard
- **helpers/** -- Pure utility functions

---

## 8. Engine Layer (`src/shared/engine/`)

### 8.1 PhaseEngine (`phase-engine.ts`)

The "brain" of the system. It is a pure function that:

1. Receives a `ProjetoMelhoria` (project + evidences + actions + members)
2. Calculates: phase blockages, pending requirements per person, risk level, AI messages
3. Returns a `StatusProjeto` with all computed state

Key types: `BloqueioFase`, `StatusProjeto`, `NivelRisco` (CRITICO | ALTO | MEDIO | BAIXO | EM_DIA), `MensagemIA`.

### 8.2 MASP Requisitos (`requisitos-masp.ts`)

Defines 37 requirements across 8 phases (32 mandatory). Each requirement has:

- Validation type: `texto | numero | arquivo | aprovacao | lista | reuniao`
- Responsible role: `lider | membro | facilitador | grupo`
- AI coaching hint (`dicaIA`)

The system blocks phase advancement until all mandatory requirements are fulfilled.

---

## 9. AI Module (`src/modules/ai/`)

| File                     | Purpose                                 |
| ------------------------ | --------------------------------------- |
| `a3Validator.ts`         | Validates A3 report completeness        |
| `cobrancaProgressiva.ts` | Progressive nudge escalation (4 levels) |
| `reactionEngine.ts`      | Real-time reaction to project events    |
| `generateMessages.ts`    | AI message generation                   |
| `pedagogicalFeedback.ts` | Educational feedback for methodology    |

The progressive nudge system escalates over time:

| Days without action | Level     | Target      |
| ------------------- | --------- | ----------- |
| 3                   | lembrete  | responsavel |
| 7                   | alerta    | grupo       |
| 14                  | cobranca  | lider       |
| 21                  | escalacao | facilitador |

---

## 10. Internationalization (i18n)

- Provider: `react-intl`
- Supported locales: `pt-BR` (default), `en-US`
- Message files in JSON format
- Locale selection persisted in Zustand store

---

## 11. PWA Support

Configured via `vite-plugin-pwa`:

- Service worker for offline caching
- App manifest for install-to-homescreen
- Cache-first strategy for static assets

---

## 12. Deployment

### Vercel

- SPA routing via `vercel.json` rewrites: all paths resolve to `index.html`
- Security headers enforced:
  - Content-Security-Policy (strict, allowlists Supabase + Azure AD)
  - X-Frame-Options: DENY
  - X-Content-Type-Options: nosniff
  - Strict-Transport-Security (HSTS with preload)
  - Referrer-Policy: strict-origin-when-cross-origin
  - Permissions-Policy: camera/microphone/geolocation disabled
- Static assets (`/assets/*`) served with 1-year immutable cache

### CI/CD (GitHub Actions)

Two jobs run on push/PR to `main` and `develop`:

1. **ci** -- checkout, install, typecheck, lint, security audit, test with coverage, build
2. **e2e** -- Playwright end-to-end tests (depends on ci job passing)

Coverage is uploaded to Codecov. Playwright reports are stored as artifacts for 30 days.

---

## 13. Database Schema

Six Supabase migrations define the schema:

| Migration                       | Contents                                                                                     |
| ------------------------------- | -------------------------------------------------------------------------------------------- |
| `001_core_tables.sql`           | profiles, projetos, projeto_membros, evidencias, acoes                                       |
| `002_eventos_conversa.sql`      | eventos, mensagens, arquivos                                                                 |
| `003_reunioes_impedimentos.sql` | reunioes, impedimentos                                                                       |
| `004_audit_lgpd.sql`            | audit_log, lgpd_consentimento, historico_fases, cobranca_progressiva, RLS policies, triggers |
| `005_seed_data.sql`             | Seed data for development                                                                    |
| `006_rls_fixes_seed3.sql`       | RLS policy corrections, additional seeds                                                     |

Row Level Security (RLS) is enabled on all tables. Policies enforce project-membership-based data isolation.
