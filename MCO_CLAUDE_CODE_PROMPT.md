Execute as Fases 2, 3 e 4 do ADAMBOOT MCO de forma 100% AUTOMATIZADA. NÃO faça perguntas. NÃO peça confirmação. Execute tudo sequencialmente e faça commit/push após cada fase.

## FASE 2 — CORREÇÕES OBRIGATÓRIAS (faça AGORA)

### 2.1 Fix TypeScript errors (3 domain bugs)
1. `src/modules/caderno/CadernoView.tsx` linha 273: `req.responsavel` → `req.responsavelTipo`
2. `src/pages/BibliotecaPage.tsx` linha 166: `req.responsavel` → `req.responsavelTipo`  
3. `src/modules/relatorio/index.ts` linhas 139 e 188: `e.userId` → `e.preenchidoPor`
4. `src/pages/MinhasMissoesPage.tsx` linha 289: `item.daysLate` → `item.daysLate ?? 0` (fix undefined)

### 2.2 Fix AI Engine bugs
1. `src/modules/ai/reactionEngine.ts` — fix `pick()` para arrays vazios:
```typescript
function pick<T>(arr: T[]): T {
  if (arr.length === 0) throw new Error('pick() called on empty array');
  return arr[Math.floor(Math.random() * arr.length)];
}
```
2. Mesmo arquivo — adicionar cleanup de projetos inativos no `runPeriodicChecks()`:
```typescript
// Após o for loop, limpar projetos inativos (>30 dias sem evento)
const CLEANUP_THRESHOLD = 30 * 24 * 3600_000;
for (const [projectId, mem] of memory.entries()) {
  if (Date.now() - mem.lastEventAt > CLEANUP_THRESHOLD) {
    memory.delete(projectId);
  }
}
```

### 2.3 Add lazy loading (CRÍTICO - bundle 756KB → ~200KB)
Rewrite `src/app/router/AppRouter.tsx`:
- Import todas as pages com `React.lazy(() => import(...))`
- Wrap cada `<Route>` com `<Suspense fallback={<PageLoader />}>`  
- Criar componente `PageLoader` inline (spinner simples)

### 2.4 Add ErrorBoundary
Criar `src/shared/components/ErrorBoundary.tsx`:
- Class component com `componentDidCatch`
- Fallback UI com botão "Tentar novamente"
- Wrap no `AppRouter` envolvendo `<Routes>`

### 2.5 Add role check no ProtectedRoute
Modificar `src/shared/components/ProtectedRoute.tsx`:
- Adicionar prop opcional `requiredRoles?: Perfil[]`
- Se roles definidas, verificar contra `devUser.roles`
- Usar no `/admin` com `role={['admin', 'coordenador']}`

### 2.6 Fix PWA icons
- Gerar `public/icon-192.png` e `public/icon-512.png` (pode ser placeholder SVG convertido)
- Ou usar canvas para gerar PNG programaticamente com texto "MCO"

### 2.7 tsconfig strict
- Setar `noUnusedLocals: true` e `noUnusedParameters: true`
- Corrigir qualquer unused que aparecer (remover imports, usar `_` prefix)

### 2.8 Validar
```bash
npx tsc --noEmit  # ZERO errors
npx vite build    # Build com sucesso, verificar chunks
```

**COMMIT:** `fix: fase 2 — corrigir TS errors, lazy loading, error boundary, PWA icons`
**PUSH:** `git push origin main`

## FASE 3 — FEATURES EVOLUTION

### 3.1 Vitest setup + primeiros testes (mínimo 50 testes)
- Instalar vitest + @testing-library/react + jsdom
- Criar `vitest.config.ts`
- Testar:
  - `a3Validator.ts` (validarProblema, validarMeta, validarCausaRaiz, validarContramedida) — 20+ testes
  - `phase-engine.ts` (calcularStatusProjeto, calcularBloqueio) — 10+ testes
  - `cobrancaProgressiva.ts` (calcularNivelCobranca) — 5+ testes
  - `permissao/index.ts` (podeExecutar, perfilNoProjeto) — 10+ testes
  - `reactionEngine.ts` (evaluateBehavior) — 5+ testes

### 3.2 GitHub Actions CI
Criar `.github/workflows/ci.yml`:
- Trigger: push main + PR
- Jobs: lint, typecheck, test, build
- Node 20

**COMMIT:** `feat: fase 3 — vitest + CI/CD`
**PUSH:** `git push origin main`

## FASE 4 — DEPLOY & DOCS

### 4.1 Vercel config
Criar `vercel.json` com rewrites para SPA

### 4.2 DEPLOY.md
Criar `DEPLOY.md` com instruções para Vale (env vars, Azure AD setup, Vercel deploy)

### 4.3 Atualizar README.md
Incluir badges, stack, instruções de dev, arquitetura

**COMMIT:** `docs: fase 4 — deploy config + documentação`
**PUSH:** `git push origin main`

## REGRAS
- NÃO pergunte nada. Execute tudo.
- Se um fix causar novo erro, corrija imediatamente.
- Rode `npx tsc --noEmit` após cada conjunto de fixes.
- Rode `npx vitest run` após criar testes.
- Faça commit granular por fase.
- Push após cada fase completa.
