# PROMPT SENIOR — ADAMBOOT MCO (Cole tudo na conversa do Claude Code)

---

Preciso que você faça uma auditoria completa e evolução enterprise do meu projeto ADAMBOOT MCO.

## Sobre o projeto

**ADAMBOOT MCO** é uma plataforma de Melhoria Contínua Operacional para CCQ (Círculos de Controle de Qualidade) da Vale S.A. O sistema guia equipes pelos 8 passos do A3/MASP/PDCA com validação inteligente, bloqueando avanço com raciocínio fraco e coaching pedagógico em tempo real.

**Repositório:** https://github.com/GregoryGSPinto/adamboot-mco
**114 arquivos · ~19.400 linhas · 27 módulos**

## Stack atual

| Camada | Tecnologia |
|--------|-----------|
| Frontend | React 18 + TypeScript 5.4 + Vite 5 |
| State | Zustand + React Query + react-hook-form |
| Auth | Azure AD SSO (MSAL PKCE) |
| Persistence | localStorage (offline-first) |
| PWA | vite-plugin-pwa (standalone) |
| UI | 100% custom components (zero deps externas) |
| Theme | CSS Variables (dark/light, Vale/SAP corporate) |
| HTTP | Axios + proxy dev |

## Os 8 Passos A3 (core do sistema)

| # | Passo | Validação |
|---|-------|-----------|
| 1 | Clarificar Problema | Exige indicador numérico. Bloqueia descrição vaga. |
| 2 | Desdobrar Problema | Estratificação com Pareto. |
| 3 | Definir Meta | SMART: valor + prazo + indicador. |
| 4 | Causa Raiz | 5 Porquês + Ishikawa. Bloqueia "falta de atenção", "erro humano". |
| 5 | Contramedidas | Vinculada à causa raiz. Avisa se ação fraca (retreinar, DDS). |
| 6 | Plano de Ação | Responsável + prazo para cada contramedida. |
| 7 | Verificar Resultado | Antes vs. depois com dados. |
| 8 | Padronizar e Replicar | Documentar + replicar. |

## Estrutura do projeto

```
src/
├── app/              # Auth, router, providers
├── features/         # Features isoladas (avancar-fase, registrar-evento)
├── modules/
│   ├── a3/           # A3StepIndicator, FeedbackBanner, A3WorkspaceView
│   ├── ai/           # a3Validator, pedagogicalFeedback, reactionEngine
│   ├── apresentacao/ # Gerador automático de slides (12 slides template Vale 2026)
│   ├── audit/        # Trilha de auditoria
│   ├── caderno/      # CadernoView (formulário MASP)
│   ├── chat/         # QuickActions, ChatBubble, nudges
│   ├── conhecimento/ # Acervo, lições aprendidas
│   ├── continuidade/ # Backup, modo degradado
│   ├── conversa/     # Chat estruturado do projeto
│   ├── impedimento/  # Bloqueios operacionais
│   ├── lgpd/         # Consentimento, anonimização
│   ├── mission/      # Radar do líder, missões
│   ├── monitoramento/# Health check do app
│   ├── offline/      # Sync queue, rascunhos
│   ├── permissao/    # RBAC (membro/lider/facilitador/coordenador/admin)
│   ├── relatorio/    # Export TXT/CSV/JSON
│   ├── reuniao/      # Modo reunião, ata automática
│   ├── seguranca/    # Zonas de segurança, check EPI
│   └── verificacao/  # Antes/depois, confirmação eliminação
├── pages/            # 12 páginas (rotas)
└── shared/           # Engine MASP, components, hooks
```

## Workspace 7 Abas
`◈ A3 · ◎ Missão · 💬 Conversa · 👥 Reunião · 📊 Resultado · 📽 Apresentar · 📚 Docs`

## Features existentes
1. **Validação Inteligente A3** — Bloqueio de raciocínio fraco, coaching pedagógico
2. **8 Passos MASP/PDCA** — Formulário guiado com lock/unlock por qualidade
3. **Workspace 7 Abas** — A3, Missão, Conversa, Reunião, Resultado, Apresentar, Docs
4. **Geração de Apresentação** — 12 slides automáticos (template Vale 2026 CCQ)
5. **RBAC** — 5 níveis (membro, líder, facilitador, coordenador, admin)
6. **Offline-first** — localStorage + sync queue + rascunhos
7. **Modo Reunião** — Ata automática
8. **Trilha de Auditoria** — Log completo
9. **LGPD** — Consentimento + anonimização
10. **Export** — TXT/CSV/JSON
11. **Checklist ADAMBOOT** — 26 seções de auditoria
12. **PWA** — Instalável com service worker

## O que eu quero

Quero o MESMO processo enterprise que fizemos no EFVM360:

### FASE 1 — CTO Audit Completo
Auditoria de 11 blocos executável via Claude Code:
1. Segurança (secrets, env, auth MSAL)
2. Build & TypeScript (zero errors, dead code, unused imports)
3. Módulos Integrity (27 módulos, imports cruzados, circular deps)
4. AI Engine (a3Validator, pedagogicalFeedback, reactionEngine — edge cases)
5. State Management (Zustand stores, React Query, react-hook-form)
6. Frontend & Rotas (12 páginas, lazy loading, error boundaries)
7. Componentes & Design System (CSS variables, dark/light, responsividade)
8. Offline & PWA (localStorage, sync queue, service worker)
9. Performance & Bundle (Vite chunks, code splitting, memoization)
10. RBAC & Permissões (5 roles, guards, propagação)
11. Documentation & Audit Report

### FASE 2 — Correções e Melhorias
- Corrigir TODOS os erros TypeScript
- Remover dead code e imports não usados
- Corrigir qualquer bug encontrado na auditoria
- Melhorar error handling em todos os módulos
- Adicionar loading/error states em todas as páginas
- Polir design system (consistência de tokens, transições)

### FASE 3 — Features Evolution
- i18n (PT-BR + EN)
- Testes (Vitest — mínimo 200 testes)
- CI/CD (GitHub Actions)
- Backend preparation (Express + MySQL structure)
- Real-time (WebSocket para modo reunião)
- Notificações push
- Dashboard do coordenador (KPIs de todos os CCQs)

### FASE 4 — Deploy & Documentation
- Vercel deploy configuration
- DEPLOY.md para Vale
- API documentation
- Manual do usuário

## Formato de entrega

1. **Script master** (run-master.sh) com `--from` para recomeçar de qualquer fase
2. Auto-commit após cada bloco
3. Auto-push após cada fase
4. Auto-recovery de erros

## Contexto

- Tenho Claude Code CLI instalado (v2.1.69)
- Node.js 25.8.0, pnpm ou npm
- O projeto está no meu Mac (vou clonar ou copiar)
- Quero o MESMO nível de profundidade e qualidade que fizemos no EFVM360
- O audit do EFVM360 encontrou 7 issues, corrigiu 4, e subiu o score para 96%
- Os testes subiram de 579 para 588

## Como começar

1. Analise a estrutura completa, README, e código
2. Execute o CTO Audit (Fase 1) primeiro
3. Corrija tudo que encontrar (Fase 2)
4. Evolua features (Fase 3)
5. Deploy e documentação (Fase 4)

Pode começar a análise e executar a Fase 1?
