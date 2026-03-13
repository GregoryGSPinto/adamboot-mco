# Release Notes — v1.0.0

**Date:** 2026-03-12

## Summary

ADAMBOOT MCO v1.0.0 is the first production-ready release of the Continuous Improvement Operations Engine. It provides a complete A3/MASP/PDCA workflow platform with 12 pages, 28 domain modules, Supabase backend, and enterprise documentation.

## Highlights

- **8-Phase A3/MASP Engine** — 35 requirements across 8 phases with evidence validation and phase progression rules
- **12 Pages** — Dashboard, Project Workspace, Missions, Library, Chat, Notes, Profile, Admin, Audit Trail, Presentation, Archive
- **Supabase Backend** — 15 tables with Row Level Security on all tables, 6 migrations
- **AI Coaching** — ReactionEngine with progressive nudge system (4 levels)
- **Domain Layer** — DDD-lite with models, validation, constants, and helpers
- **Bilingual** — pt-BR and en-US (395 translation keys)
- **Design System** — Vale corporate palette, glassmorphism, dark/light theme
- **PWA** — Offline-capable with service worker
- **LGPD Compliance** — Consent tracking, audit trail, data minimization
- **238 Tests** — Vitest + Testing Library, coverage thresholds enforced

## Quality Metrics

| Metric              | Value                |
| ------------------- | -------------------- |
| TypeScript errors   | 0                    |
| Tests passing       | 238 / 238            |
| Test files          | 22                   |
| Build status        | Clean                |
| Bundle size         | 687 kB (198 kB gzip) |
| Pages               | 12                   |
| Domain modules      | 28                   |
| i18n keys           | 395 per locale       |
| Supabase tables     | 15 (all with RLS)    |
| Documentation files | 9                    |

## Demo Access

- **URL:** https://adamboot-mco.vercel.app
- **Email:** demo@mco.vale.com
- **Password:** mco2026

## Documentation

Full enterprise documentation suite included:

- ARCHITECTURE.md — System architecture and design decisions
- DATABASE_SCHEMA.md — Database ERD, tables, RLS policies
- METHODOLOGY.md — A3/MASP/PDCA methodology reference
- RUNBOOK.md — Operations and deployment guide
- MONITORING.md — Observability and alerting
- LGPD_COMPLIANCE.md — LGPD compliance
- WCAG_CHECKLIST.md — Accessibility audit
- MANUAL_USUARIO.md — User manual (Portuguese)

## Known Limitations

- E2E tests scaffolded but not fully integrated in CI
- Test coverage at 15% lines (target: 30%)
- Pages use hardcoded Portuguese strings instead of i18n keys (infrastructure exists)
- Supabase Edge Functions not yet deployed (client-side validation only)
- StorageAdapter Supabase implementation is a stub (localStorage used)
