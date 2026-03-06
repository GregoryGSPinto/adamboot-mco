# Deploy — MCO Melhoria Continua Operacional

## Stack
- React 18 + TypeScript + Vite
- Azure AD (MSAL) para autenticacao
- Vercel para hosting

## Variaveis de Ambiente

```env
# Autenticacao
VITE_DEV_AUTH=true                          # true para dev, false para producao
VITE_AZURE_CLIENT_ID=<client-id>           # Azure AD App Registration
VITE_AZURE_TENANT_ID=<tenant-id>           # Azure AD Tenant
VITE_AZURE_REDIRECT_URI=https://mco.vercel.app

# API (futuro)
VITE_API_BASE_URL=https://api.mco.vale.com
```

## Azure AD Setup (Producao)

1. Acesse portal.azure.com > App Registrations
2. Crie um novo app registration "MCO - Melhoria Continua"
3. Em Authentication:
   - Redirect URI: `https://mco.vercel.app`
   - SPA platform
   - ID tokens: sim
4. Em API Permissions:
   - Microsoft Graph > User.Read
5. Copie Client ID e Tenant ID para as env vars

## Deploy na Vercel

### Via CLI
```bash
npm install -g vercel
vercel login
vercel --prod
```

### Via Dashboard
1. Acesse vercel.com e importe o repositorio GitHub
2. Framework: Vite
3. Build Command: `npm run build`
4. Output Directory: `dist`
5. Configure as env vars no painel

### SPA Routing
O `vercel.json` ja esta configurado com rewrite para SPA (todas as rotas apontam para `/index.html`).

## Build Local

```bash
npm install
npm run dev          # dev server na porta 5173
npm run build        # build de producao
npm run preview      # preview do build
npm run test         # testes com vitest
npm run typecheck    # verificacao de tipos
```

## Credenciais de Demonstracao

Com `VITE_DEV_AUTH=true`:
- Email: `ccq@arttrens.com`
- Senha: `art123`
