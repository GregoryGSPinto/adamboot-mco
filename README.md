# ADAMBOOT — Sistema de Melhoria Contínua Operacional

> Motor de Condução Operacional para CCQ (Círculos de Controle de Qualidade) baseado em A3 / MASP / PDCA.

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white)

---

## O que é

O ADAMBOOT transforma o processo CCQ de **preenchimento livre de relatórios** em um **orientador obrigatório de raciocínio de melhoria contínua**.

O sistema guia o usuário pelos 8 passos do A3, bloqueando avanço com raciocínio fraco e coaching pedagógico em tempo real.

### Os 8 Passos

| # | Passo | Validação |
|---|-------|-----------|
| 1 | Clarificar Problema | Exige indicador numérico. Bloqueia descrição vaga. |
| 2 | Desdobrar Problema | Estratificação com Pareto. |
| 3 | Definir Meta | SMART: valor + prazo + indicador. |
| 4 | Causa Raiz | 5 Porquês + Ishikawa. **Bloqueia "falta de atenção", "erro humano"**. |
| 5 | Contramedidas | Vinculada à causa raiz. Avisa se ação fraca (retreinar, DDS). |
| 6 | Plano de Ação | Responsável + prazo para cada contramedida. |
| 7 | Verificar Resultado | Antes vs. depois com dados. |
| 8 | Padronizar e Replicar | Documentar + replicar. |

---

## Stack

- **React 18** + **TypeScript**
- **Vite** (build + dev server)
- **CSS Variables** (dark/light theme, Vale/SAP corporate)
- **localStorage** (persistence — offline-first)
- **Zero dependências externas de UI** (100% custom components)

---

## Estrutura

```
src/
├── app/              # Auth, router, providers
├── features/         # Features isoladas (avancar-fase, registrar-evento)
├── modules/
│   ├── a3/           # A3StepIndicator, FeedbackBanner, A3WorkspaceView
│   ├── ai/           # a3Validator, pedagogicalFeedback, reactionEngine
│   ├── apresentacao/ # Gerador automático de slides
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

**114 arquivos · ~19.400 linhas · 27 módulos**

---

## Rodar localmente

```bash
# Instalar dependências
npm install

# Dev server
npm run dev

# Build para produção
npm run build
```

---

## Features

### Validação Inteligente A3
- 🔴 **Bloqueio**: problema sem número, meta sem prazo, causa = "erro humano"
- 🟡 **Aviso**: ação fraca (retreinar), causa comportamental, meta quase SMART
- 🟢 **OK**: validado, pode avançar

### Visual Corporativo Industrial
- Dark header com tag `A3 / PDCA`
- Step indicator com lock/unlock
- CSS variables `--a3-*` para temas
- Estilo Vale/SAP Fiori

### Workspace 7 Abas
`◈ A3 · ◎ Missão · 💬 Conversa · 👥 Reunião · 📊 Resultado · 📽 Apresentar · 📚 Docs`

### Geração Automática de Apresentação
12 slides seguindo template Vale 2026 CCQ — sem edição manual.

### Checklist ADAMBOOT (26 seções)
Auditoria, offline-first, LGPD, permissões RBAC, cobrança progressiva, modo reunião, monitoramento, backup, API export.

---

## Licença

Projeto interno — Vale S.A. / Supervisão CSI — Ferrovia.
