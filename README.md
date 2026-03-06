# ADAMBOOT MCO — Melhoria Continua Operacional

> Motor de Conducao Operacional para CCQ (Circulos de Controle de Qualidade) baseado em A3 / MASP / PDCA.

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React_18-61DAFB?logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white)
![Vitest](https://img.shields.io/badge/Vitest-6E9F18?logo=vitest&logoColor=white)
![CI](https://github.com/GregoryGSPinto/adamboot-mco/actions/workflows/ci.yml/badge.svg)

---

## O que e

O ADAMBOOT transforma o processo CCQ de **preenchimento livre de relatorios** em um **orientador obrigatorio de raciocinio de melhoria continua**.

O sistema guia o usuario pelos 8 passos do A3, bloqueando avanco com raciocinio fraco e coaching pedagogico em tempo real.

### Os 8 Passos

| # | Passo | Validacao |
|---|-------|-----------|
| 1 | Clarificar Problema | Exige indicador numerico. Bloqueia descricao vaga. |
| 2 | Desdobrar Problema | Estratificacao com Pareto. |
| 3 | Definir Meta | SMART: valor + prazo + indicador. |
| 4 | Causa Raiz | 5 Porques + Ishikawa. **Bloqueia "falta de atencao", "erro humano"**. |
| 5 | Contramedidas | Vinculada a causa raiz. Avisa se acao fraca (retreinar, DDS). |
| 6 | Plano de Acao | Responsavel + prazo para cada contramedida. |
| 7 | Verificar Resultado | Antes vs. depois com dados. |
| 8 | Padronizar e Replicar | Documentar + replicar. |

---

## Stack

| Camada | Tecnologia |
|--------|------------|
| UI | React 18 + TypeScript |
| Build | Vite 5 + PWA plugin |
| Testes | Vitest + Testing Library |
| Auth | Azure AD (MSAL) / Dev mode |
| State | React Query + Zustand |
| Estilo | CSS Variables (dark/light, Vale/SAP) |
| CI/CD | GitHub Actions |
| Deploy | Vercel |

---

## Arquitetura

```
src/
├── app/              # Auth, router, providers
├── modules/
│   ├── a3/           # A3StepIndicator, FeedbackBanner, A3WorkspaceView
│   ├── ai/           # a3Validator, pedagogicalFeedback, reactionEngine, cobranca
│   ├── apresentacao/ # Gerador automatico de slides
│   ├── audit/        # Trilha de auditoria
│   ├── caderno/      # CadernoView (formulario MASP)
│   ├── chat/         # QuickActions, ChatBubble, nudges
│   ├── conversa/     # Chat estruturado do projeto
│   ├── impedimento/  # Bloqueios operacionais
│   ├── lgpd/         # Consentimento, anonimizacao
│   ├── mission/      # Radar do lider, missoes
│   ├── offline/      # Sync queue, rascunhos
│   ├── permissao/    # RBAC (membro/lider/facilitador/coordenador/admin)
│   ├── relatorio/    # Export TXT/CSV
│   ├── reuniao/      # Modo reuniao, ata automatica
│   └── verificacao/  # Antes/depois, confirmacao eliminacao
├── pages/            # 12 paginas (lazy-loaded)
└── shared/
    ├── engine/       # PhaseEngine + Requisitos MASP (cerebro do sistema)
    ├── components/   # AppLayout, ProtectedRoute, ErrorBoundary
    └── hooks/        # useApi, useMutation
```

**114+ arquivos | ~19.400 linhas | 27 modulos | 82 testes**

---

## Desenvolvimento

```bash
# Instalar dependencias
npm install

# Dev server (porta 5173)
npm run dev

# Testes
npm run test

# Type check
npm run typecheck

# Build producao
npm run build

# Preview do build
npm run preview
```

### Credenciais de Demo

Com `VITE_DEV_AUTH=true` (padrao):
- Email: `demo@mco.vale.com`
- Senha: `mco2026`

---

## Features

### Validacao Inteligente A3
- **Bloqueio**: problema sem numero, meta sem prazo, causa = "erro humano"
- **Aviso**: acao fraca (retreinar), causa comportamental, meta quase SMART
- **OK**: validado, pode avancar

### IA Facilitadora (ReactionEngine)
- 4 niveis: Reacao, Estagnacao, Perfil Comportamental, Consciencia de Contexto
- Nunca interrompe conversa humana ativa (janela de silencio de 2min)
- Cobranca progressiva automatica (lembrete > alerta > cobranca > escalacao)

### Workspace 7 Abas
`A3 | Missao | Conversa | Reuniao | Resultado | Apresentar | Docs`

### Lazy Loading + Code Splitting
Todas as paginas carregadas sob demanda via `React.lazy` + `Suspense`.

### Error Boundary
Recuperacao graceful de erros com botao "Tentar novamente".

### RBAC (Role-Based Access Control)
Permissoes granulares por perfil: membro, lider, facilitador, coordenador, admin.

### PWA
Manifesto configurado, icones, service worker com auto-update.

---

## Deploy

Veja [DEPLOY.md](./DEPLOY.md) para instrucoes completas de deploy na Vercel e configuracao Azure AD.

---

## Licenca

Projeto interno — Vale S.A. / Supervisao CSI — Ferrovia.
