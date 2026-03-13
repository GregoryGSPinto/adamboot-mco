# ADAMBOOT MCO — Melhoria Continua Operacional

> Motor de Conducao Operacional para CCQ (Circulos de Controle de Qualidade) baseado em A3 / MASP / PDCA.

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React_18-61DAFB?logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?logo=supabase&logoColor=white)
![Vitest](https://img.shields.io/badge/Vitest-6E9F18?logo=vitest&logoColor=white)
![CI](https://github.com/GregoryGSPinto/adamboot-mco/actions/workflows/ci.yml/badge.svg)
![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)

---

## What is it

ADAMBOOT transforms the CCQ process from **free-form report filling** into a **mandatory reasoning coach for continuous improvement**.

The system guides users through the 8 A3/MASP steps, blocking progression when reasoning is weak and providing pedagogical coaching in real time.

### The 8 Steps

| #   | Step               | Validation                                                        |
| --- | ------------------ | ----------------------------------------------------------------- |
| 1   | Identify Problem   | Requires numeric indicator. Blocks vague descriptions.            |
| 2   | Break Down Problem | Stratification with Pareto analysis.                              |
| 3   | Define Target      | SMART: value + deadline + indicator.                              |
| 4   | Root Cause         | 5 Whys + Ishikawa. **Blocks "lack of attention", "human error"**. |
| 5   | Countermeasures    | Linked to root cause. Warns on weak actions (retrain, DDS).       |
| 6   | Action Plan        | 5W2H: responsible + deadline for each countermeasure.             |
| 7   | Verify Results     | Before vs. after with data.                                       |
| 8   | Standardize        | Document + replicate across operations.                           |

---

## Stack

| Layer    | Technology                                           |
| -------- | ---------------------------------------------------- |
| Frontend | React 18 + TypeScript 5.4                            |
| Build    | Vite 5 + PWA plugin                                  |
| Backend  | Supabase PostgreSQL (15 tables, RLS)                 |
| Auth     | Azure AD (MSAL) / Dev auth bypass                    |
| State    | Zustand + React Query (TanStack)                     |
| Forms    | React Hook Form                                      |
| i18n     | react-intl (pt-BR + en-US, 395 keys)                 |
| Design   | CSS Variables, Vale corporate palette, glassmorphism |
| Tests    | Vitest + Testing Library (238 tests)                 |
| E2E      | Playwright (scaffolded)                              |
| CI/CD    | GitHub Actions                                       |
| Deploy   | Vercel (CSP, HSTS, SPA rewrites)                     |

---

## Architecture

```
src/
├── app/              # Auth (MSAL + dev), router, providers
├── domain/           # DDD-lite: models, validation, constants, helpers
│   ├── models/       # Project, Step, TeamMember, Evidence, Action
│   ├── validation/   # canAdvanceStep, isProjectOverdue, getDaysRemaining
│   ├── constants/    # STEP_NAMES, PROJECT_STATUSES, MAX_PHASES
│   └── helpers/      # formatDate, calculateKPI, truncateText
├── lib/              # StorageAdapter, storage-manifest
├── modules/          # 28 domain modules
│   ├── a3/           # A3StepIndicator, FeedbackBanner, WorkspaceView
│   ├── ai/           # a3Validator, pedagogicalFeedback, reactionEngine
│   ├── apresentacao/ # Auto-generated presentation slides
│   ├── audit/        # Audit trail (LGPD compliance)
│   ├── caderno/      # CadernoView (MASP form per phase)
│   ├── chat/         # QuickActions, ChatBubble, nudges
│   ├── conversa/     # Structured project conversation
│   ├── impedimento/  # Operational blockers
│   ├── lgpd/         # Consent tracking, anonymization
│   ├── mission/      # Leader radar, team missions
│   ├── offline/      # Sync queue, drafts
│   ├── permissao/    # RBAC (membro/lider/facilitador/coordenador/admin)
│   ├── relatorio/    # Export TXT/CSV reports
│   ├── reuniao/      # Meeting mode, auto-generated minutes
│   └── verificacao/  # Before/after comparison, elimination confirmation
├── pages/            # 12 pages (lazy-loaded via React.lazy)
├── shared/
│   ├── engine/       # PhaseEngine + Requisitos MASP (35 requirements)
│   ├── components/   # AppLayout, ProtectedRoute, ErrorBoundary, UI kit
│   └── hooks/        # useApi, useMutation, useLocale, useAppStore
└── i18n/             # pt-BR.json, en-US.json
```

**176 TypeScript files | ~19,000 LOC | 28 modules | 238 tests**

---

## Quick Start

```bash
# Prerequisites: Node >= 18, npm >= 9

# Install dependencies
npm install

# Start dev server (port 5173)
npm run dev

# Run tests
npm test

# Type check
npm run typecheck

# Build for production
npm run build
```

### Demo Credentials

With `VITE_DEV_AUTH=true` (default in development):

- **Email:** `demo@mco.vale.com`
- **Password:** `mco2026`

### Environment Variables

Copy `.env.example` and configure:

```bash
cp .env.example .env
```

See [docs/RUNBOOK.md](./docs/RUNBOOK.md) for full environment setup.

---

## Features

### Intelligent A3 Validation

- **Block**: problem without number, target without deadline, root cause = "human error"
- **Warn**: weak action (retrain only), behavioral cause, nearly-SMART target
- **OK**: validated, may advance

### AI Coaching (ReactionEngine)

- 4 levels: Reaction, Stagnation, Behavioral Profile, Context Awareness
- Never interrupts active human conversation (2-min silence window)
- Progressive nudge system: reminder > alert > charge > escalation

### 7-Tab Project Workspace

`A3 | Mission | Conversation | Meeting | Results | Present | Docs`

### Supabase Backend

- 15 tables with Row Level Security on all tables
- 6 migrations (core, events, meetings, audit/LGPD, seed data, RLS fixes)
- 3 demo projects at different stages (phases 2, 4, 8)
- LGPD compliance: consent tracking, audit trail, data minimization

### Offline-First

- LocalStorage with StorageAdapter abstraction
- Storage migration manifest for future Supabase migration
- PWA with service worker auto-update

### Security

- CSP, HSTS, X-Frame-Options via Vercel headers
- RLS on all 15 Supabase tables
- RBAC: membro, lider, facilitador, coordenador, admin
- Audit log with database triggers
- No secrets in client bundle

---

## Documentation

| Document                                        | Description                              |
| ----------------------------------------------- | ---------------------------------------- |
| [ARCHITECTURE.md](./docs/ARCHITECTURE.md)       | System architecture and design decisions |
| [DATABASE_SCHEMA.md](./docs/DATABASE_SCHEMA.md) | Database ERD, tables, RLS policies       |
| [METHODOLOGY.md](./docs/METHODOLOGY.md)         | A3/MASP/PDCA methodology reference       |
| [RUNBOOK.md](./docs/RUNBOOK.md)                 | Operations and deployment guide          |
| [MONITORING.md](./docs/MONITORING.md)           | Observability and alerting               |
| [LGPD_COMPLIANCE.md](./docs/LGPD_COMPLIANCE.md) | LGPD (Brazilian GDPR) compliance         |
| [WCAG_CHECKLIST.md](./docs/WCAG_CHECKLIST.md)   | Accessibility audit checklist            |
| [MANUAL_USUARIO.md](./docs/MANUAL_USUARIO.md)   | User manual (Portuguese)                 |
| [CHANGELOG.md](./CHANGELOG.md)                  | Version history                          |

---

## CI/CD Pipeline

```
Push/PR → npm ci → tsc --noEmit → eslint → vitest --coverage → vite build
```

- Coverage thresholds enforced (lines: 14%, branches: 50%)
- Playwright E2E job (scaffolded, depends on CI)
- Vercel auto-deploy on push to main

---

## License

[MIT](./LICENSE)
