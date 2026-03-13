# ADAMBOOT MCO -- LGPD Compliance

Version: 1.0 | Last updated: 2026-03-12

---

## 1. Overview

ADAMBOOT MCO complies with the **LGPD** (Lei Geral de Protecao de Dados Pessoais -- Lei 13.709/2018), Brazil's equivalent to the European GDPR. This document describes the technical and procedural controls implemented in the system.

The LGPD module is located at `src/modules/lgpd/`.

---

## 2. Consent Tracking

### 2.1 Consent Modal

On first access, users are presented with a consent modal (`LGPDConsentModal.tsx`) requiring acceptance of the Terms of Responsibility before using the system.

### 2.2 Consent Record

Each consent is recorded in the `lgpd_consentimento` table:

```sql
CREATE TABLE lgpd_consentimento (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id    UUID NOT NULL REFERENCES profiles(id),
  tipo          TEXT NOT NULL
    CHECK (tipo IN ('termos_uso','cookies','dados_pessoais','comunicacao')),
  aceito        BOOLEAN NOT NULL,
  ip_address    INET,
  versao        TEXT NOT NULL DEFAULT '1.0',
  criado_em     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

Consent types tracked:

| Type             | Description                      |
| ---------------- | -------------------------------- |
| `termos_uso`     | Terms of use acceptance          |
| `cookies`        | Cookie consent                   |
| `dados_pessoais` | Personal data processing consent |
| `comunicacao`    | Communication consent            |

The frontend tracks consent version (`VERSAO_TERMO_ATUAL = '1.0.0'`). When the version increments, users must re-consent.

### 2.3 Image Use Notice

When attaching photos, users see the `AVISO_USO_IMAGEM` notice confirming:

- The image contains no sensitive personal information
- People in the image were informed about the recording
- The photo is used exclusively for the CCQ project
- Usage follows the company's Privacy Policy

---

## 3. Audit Trail

### 3.1 Audit Log Table

All significant system actions are recorded in the `audit_log` table:

```sql
CREATE TABLE audit_log (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id    UUID REFERENCES profiles(id),
  acao          TEXT NOT NULL,
  entidade      TEXT NOT NULL,
  entidade_id   UUID,
  dados_antes   JSONB,
  dados_depois  JSONB,
  ip_address    INET,
  user_agent    TEXT,
  criado_em     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### 3.2 Tracked Actions

The audit module (`src/modules/audit/index.ts`) defines 24 auditable actions:

| Category      | Actions                                                                          |
| ------------- | -------------------------------------------------------------------------------- |
| Project       | projeto_criado, projeto_arquivado, projeto_restaurado                            |
| Phase         | fase_avancada                                                                    |
| Requirements  | requisito_cumprido, evidencia_anexada                                            |
| Actions       | acao_criada, acao_concluida, acao_atualizada                                     |
| Communication | mensagem_enviada, decisao_registrada                                             |
| Meetings      | reuniao_iniciada, reuniao_finalizada, presenca_registrada                        |
| Blockers      | impedimento_registrado, impedimento_resolvido                                    |
| Nudges        | cobranca_enviada, cobranca_escalada                                              |
| People        | responsavel_substituido, prazo_alterado, usuario_desativado, usuario_transferido |
| LGPD          | lgpd_consentimento, lgpd_exportacao                                              |
| Auth          | login, logout                                                                    |

Each entry stores: timestamp (ISO 8601), user ID, user name, action, optional project reference, before/after data for diff, and human-readable description.

### 3.3 Automatic Triggers

Database triggers automatically set `atualizado_em` on UPDATE for: profiles, projetos, acoes, eventos, reunioes, impedimentos.

---

## 4. Data Minimization

The system follows data minimization principles:

- **Collection:** Only data required for CCQ project management is collected
- **Anonymization:** The `anonimizar()` function masks names in external reports (e.g., "Carlos" becomes "C**\***")
- **Retention:** Default retention periods are enforced:

| Data Type          | Retention Period     |
| ------------------ | -------------------- |
| Completed projects | 5 years (1825 days)  |
| Audit logs         | 10 years (3650 days) |
| Photos             | 5 years (1825 days)  |
| Chat messages      | 5 years (1825 days)  |

The `verificarRetencao()` function checks for expired items against the configured retention policy.

---

## 5. User Rights (LGPD Articles 17-22)

### 5.1 Right of Access

Users can view all their personal data through their profile page.

### 5.2 Right of Correction

Users can update their profile information at any time.

### 5.3 Right of Deletion

Deletion requests are logged via the audit trail and processed according to retention policy. Note that audit log entries are retained for compliance even after user data deletion.

### 5.4 Right of Data Portability

The `exportarDadosUsuario()` function generates a JSON export of all user data:

```typescript
interface ExportacaoDados {
  userId: string;
  geradoEm: string; // Generation timestamp
  dados: {
    perfil: Record<string, unknown>;
    projetos: string[];
    mensagens: number;
    evidencias: number;
    acoes: number;
  };
  formato: 'json';
  conteudo: string; // Serialized JSON
}
```

Each export request is audited with action `lgpd_exportacao`.

---

## 6. Row Level Security (RLS)

RLS is enabled on **all 13 tables** in the database. Key policies:

| Table                  | Policy                                                                      |
| ---------------------- | --------------------------------------------------------------------------- |
| `profiles`             | Users see own profile + teammates via projeto_membros                       |
| `projetos`             | SELECT: project members only. INSERT: leader. UPDATE: leader or facilitator |
| `evidencias`           | Project members only (SELECT + INSERT)                                      |
| `mensagens`            | Project members only (SELECT + INSERT)                                      |
| `acoes`                | Project members only (full CRUD)                                            |
| `eventos`              | Own events only                                                             |
| `audit_log`            | Coordinators and admins only                                                |
| `lgpd_consentimento`   | Own records only (SELECT + INSERT)                                          |
| `cobranca_progressiva` | Own nudges only                                                             |
| `historico_fases`      | Project members only                                                        |
| `reunioes`             | Project members only                                                        |
| `impedimentos`         | Project members only                                                        |
| `arquivos`             | Via message or event ownership                                              |

This ensures complete data isolation between projects and teams at the database level.

---

## 7. Security Headers

The Vercel deployment enforces security headers via `vercel.json`:

- **CSP**: Strict Content-Security-Policy allowlisting only self, Supabase, and Azure AD origins
- **HSTS**: max-age=31536000 with includeSubDomains and preload
- **X-Frame-Options**: DENY (prevents clickjacking)
- **X-Content-Type-Options**: nosniff
- **Permissions-Policy**: camera, microphone, geolocation, interest-cohort all disabled

---

## 8. Compliance Checklist

| Requirement                       | Status      | Implementation                              |
| --------------------------------- | ----------- | ------------------------------------------- |
| Consent before data processing    | Implemented | LGPDConsentModal + lgpd_consentimento table |
| Audit trail for all actions       | Implemented | audit_log table + auditLog() function       |
| Data anonymization for reports    | Implemented | anonimizar() function                       |
| Data export (portability)         | Implemented | exportarDadosUsuario()                      |
| Retention policy                  | Implemented | RetencaoConfig + verificarRetencao()        |
| Image use notice                  | Implemented | AVISO_USO_IMAGEM constant                   |
| RLS for data isolation            | Implemented | 16 RLS policies across 13 tables            |
| Versioned consent terms           | Implemented | VERSAO_TERMO_ATUAL versioning               |
| DPO contact                       | Pending     | Not yet configured in the UI                |
| Data breach notification workflow | Pending     | Not yet implemented                         |
