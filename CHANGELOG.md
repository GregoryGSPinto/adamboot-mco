# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-03-12

### Added

- 12 lazy-loaded pages: Dashboard, Project Workspace, Missions, My Missions, Library, Chat, Notes, Profile, Admin, Audit Trail, Presentation, Archive
- 8-phase A3/MASP/PDCA project engine with 35 requirements across phases
- Phase progression validation with evidence tracking
- Domain layer (DDD-lite): models, validation rules, constants, helpers
- Supabase PostgreSQL backend with 15 tables and Row Level Security
- 6 SQL migrations (core tables, events/conversation, meetings/impediments, audit/LGPD, seed data, RLS fixes)
- Azure AD MSAL authentication with dev auth bypass for demos
- Demo mode with credentials (demo@mco.vale.com / mco2026)
- Bilingual i18n support (pt-BR and en-US) with 395 translation keys
- Vale corporate design system with dark/light theme toggle
- Glassmorphism UI with premium design tokens
- PWA support via vite-plugin-pwa (offline-capable)
- localStorage offline-first storage with StorageAdapter abstraction
- Storage migration manifest for future Supabase migration
- Progressive nudge system (AI coaching for project teams)
- 28 domain modules (ai, permissao, relatorio, offline, seguranca, etc.)
- 238 unit tests with Vitest + Testing Library
- Playwright E2E test scaffold (3 specs)
- GitHub Actions CI pipeline (typecheck, lint, test, build)
- Vercel deployment with CSP security headers and SPA rewrites
- Enterprise documentation suite (7 docs)
- LGPD compliance: consent tracking, audit trail, data minimization
- React Query + Zustand state management
- React Hook Form for structured input
- Axios HTTP client with interceptors

### Security

- Row Level Security on all 15 Supabase tables
- CSP, HSTS, X-Frame-Options headers via Vercel
- No secrets in client bundle (env vars validated)
- Audit log with database triggers
- LGPD consent versioning

## [0.1.0] - 2025-09-01

### Added

- Initial project scaffold with Vite + React 18 + TypeScript 5.4
- Core pages and navigation
- Supabase integration (migrations 001-005)
- Basic A3/MASP phase engine
- Mock database for development
