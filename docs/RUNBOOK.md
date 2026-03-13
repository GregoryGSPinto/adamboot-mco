# ADAMBOOT MCO -- Operations Runbook

Version: 1.0 | Last updated: 2026-03-12

---

## 1. Local Development Setup

### Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- Git

### Steps

```bash
# Clone the repository
git clone <repo-url>
cd adamboot-mco

# Install dependencies
npm ci

# Copy environment file
cp .env.example .env

# Start development server
npm run dev
```

The app runs at `http://localhost:5173` by default.

### Dev Auth Mode

For local development without Azure AD, set in `.env`:

```
VITE_DEV_AUTH=true
VITE_DEV_AUTH_EMAIL=demo@mco.vale.com
VITE_DEV_AUTH_PASSWORD=mco2026
```

---

## 2. Environment Variables

Reference: `.env.example`

| Variable                 | Required | Default | Description                         |
| ------------------------ | -------- | ------- | ----------------------------------- |
| `VITE_DEV_AUTH`          | No       | `false` | Enable dev auth bypass              |
| `VITE_DEV_AUTH_EMAIL`    | No       | --      | Dev mode login email                |
| `VITE_DEV_AUTH_PASSWORD` | No       | --      | Dev mode login password             |
| `VITE_API_BASE_URL`      | No       | --      | Backend API base URL                |
| `VITE_SUPABASE_URL`      | Yes\*    | --      | Supabase project URL                |
| `VITE_SUPABASE_ANON_KEY` | Yes\*    | --      | Supabase anonymous key              |
| `VITE_USE_SUPABASE`      | No       | `false` | Feature flag: use real Supabase     |
| `VITE_MSAL_CLIENT_ID`    | Yes\*\*  | --      | Azure AD app registration client ID |
| `VITE_MSAL_AUTHORITY`    | Yes\*\*  | --      | Azure AD authority URL              |
| `VITE_MSAL_REDIRECT_URI` | Yes\*\*  | --      | MSAL redirect URI                   |
| `VITE_MSAL_SCOPES`       | Yes\*\*  | --      | MSAL API scopes                     |

\* Required when `VITE_USE_SUPABASE=true`
\*\* Required in production (when `VITE_DEV_AUTH=false`)

**Security:** Never commit `.env` files with real values. The `.gitignore` excludes `.env` files.

---

## 3. Supabase Setup

### 3.1 Project Creation

1. Create a new project at [supabase.com](https://supabase.com)
2. Copy the project URL and anon key to `.env`
3. Set `VITE_USE_SUPABASE=true`

### 3.2 Running Migrations

Apply migrations in order from the `supabase/migrations/` directory:

| Order | File                            | Contents                                                                            |
| ----- | ------------------------------- | ----------------------------------------------------------------------------------- |
| 1     | `001_core_tables.sql`           | profiles, projetos, projeto_membros, evidencias, acoes                              |
| 2     | `002_eventos_conversa.sql`      | eventos, mensagens, arquivos                                                        |
| 3     | `003_reunioes_impedimentos.sql` | reunioes, impedimentos                                                              |
| 4     | `004_audit_lgpd.sql`            | audit_log, lgpd_consentimento, historico_fases, cobranca_progressiva, RLS, triggers |
| 5     | `005_seed_data.sql`             | Development seed data                                                               |
| 6     | `006_rls_fixes_seed3.sql`       | RLS corrections, additional seeds                                                   |

Using Supabase CLI:

```bash
# Install Supabase CLI
npm install -g supabase

# Link to your project
supabase link --project-ref <your-project-ref>

# Apply migrations
supabase db push
```

Or apply manually via the Supabase SQL Editor in the dashboard, running each file in order.

### 3.3 Auth Configuration

If using Supabase Auth (rather than Azure AD):

1. Enable Email provider in Supabase dashboard > Authentication > Providers
2. Configure redirect URLs

---

## 4. Available Scripts

| Script          | Command                 | Description                              |
| --------------- | ----------------------- | ---------------------------------------- |
| `dev`           | `npm run dev`           | Start Vite dev server                    |
| `build`         | `npm run build`         | TypeScript check + Vite production build |
| `preview`       | `npm run preview`       | Preview production build locally         |
| `typecheck`     | `npm run typecheck`     | Run TypeScript compiler (no emit)        |
| `lint`          | `npm run lint`          | ESLint check                             |
| `lint:fix`      | `npm run lint:fix`      | ESLint auto-fix                          |
| `format`        | `npm run format`        | Prettier format all source files         |
| `format:check`  | `npm run format:check`  | Prettier check (no write)                |
| `test`          | `npm run test`          | Run Vitest once                          |
| `test:watch`    | `npm run test:watch`    | Run Vitest in watch mode                 |
| `test:coverage` | `npm run test:coverage` | Run tests with coverage report           |
| `test:e2e`      | `npm run test:e2e`      | Run Playwright E2E tests                 |
| `test:e2e:ui`   | `npm run test:e2e:ui`   | Playwright with interactive UI           |
| `audit`         | `npm run audit`         | npm security audit (moderate+)           |

---

## 5. Vercel Deployment

### 5.1 Initial Setup

1. Connect the repository to Vercel
2. Set framework preset to **Vite**
3. Configure environment variables in Vercel dashboard:
   - All `VITE_*` variables from `.env.example`
   - Set `VITE_DEV_AUTH=false` for production
4. Deploy

### 5.2 Deployment Configuration

The `vercel.json` file configures:

- **Rewrites:** All routes redirect to `index.html` (SPA routing)
- **Security headers:** CSP, HSTS, X-Frame-Options, etc.
- **Asset caching:** `/assets/*` cached for 1 year with immutable flag

### 5.3 Production Checklist

- [ ] `VITE_DEV_AUTH` is set to `false`
- [ ] Azure AD credentials are configured (`VITE_MSAL_*`)
- [ ] Supabase credentials are set (if `VITE_USE_SUPABASE=true`)
- [ ] CSP header allowlists correct Supabase and Azure AD domains
- [ ] CORS configured on Supabase for the production domain

---

## 6. CI/CD Pipeline

### GitHub Actions (`.github/workflows/ci.yml`)

Triggers on push/PR to `main` and `develop` branches.

**Job 1: ci**

```
checkout -> Node 20 setup -> npm ci -> typecheck -> lint -> security audit -> test + coverage -> build
```

- Security audit uses `--audit-level=moderate` with `continue-on-error: true`
- Coverage uploaded to Codecov
- Build runs with `VITE_DEV_AUTH=false`

**Job 2: e2e** (depends on ci)

```
checkout -> Node 20 setup -> npm ci -> install Playwright -> run E2E tests
```

- E2E tests run with `VITE_DEV_AUTH=true` for test isolation
- Playwright report uploaded as artifact (30-day retention)

---

## 7. Troubleshooting

### Build fails with TypeScript errors

```bash
# Run typecheck to see exact errors
npm run typecheck
```

### ESLint configuration issues

The project uses legacy ESLint config (`.eslintrc.cjs`). The `ESLINT_USE_FLAT_CONFIG=false` flag is required:

```bash
ESLINT_USE_FLAT_CONFIG=false npm run lint
```

### Dev auth not working

1. Verify `VITE_DEV_AUTH=true` in `.env`
2. Restart the dev server (Vite caches env vars)
3. Check browser console for auth errors

### Supabase connection errors

1. Verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `.env`
2. Check that `VITE_USE_SUPABASE=true`
3. Verify RLS policies allow the operation
4. Check Supabase dashboard logs

### PWA not updating

1. Clear service worker: DevTools > Application > Service Workers > Unregister
2. Hard refresh (Cmd+Shift+R / Ctrl+Shift+R)

### Blank page after deployment

1. Check Vercel function logs
2. Verify `vercel.json` rewrite rule is present
3. Check browser console for CSP violations
4. Ensure all required env vars are set in Vercel dashboard

### E2E tests failing locally

```bash
# Install Playwright browsers
npx playwright install --with-deps

# Run with UI for debugging
npm run test:e2e:ui
```
