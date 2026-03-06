-- ============================================================
-- 001_core_tables.sql
-- Tabelas centrais: profiles, projetos, projeto_membros,
--                   evidencias, acoes
-- ============================================================

-- UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================
-- PROFILES (usuarios)
-- ============================

CREATE TABLE profiles (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  azure_oid   TEXT UNIQUE,                        -- Azure AD Object ID
  email       TEXT NOT NULL UNIQUE,
  nome        TEXT NOT NULL,
  papel_global TEXT NOT NULL DEFAULT 'membro'
    CHECK (papel_global IN ('membro','lider','facilitador','coordenador','admin')),
  avatar_url  TEXT,
  ativo       BOOLEAN NOT NULL DEFAULT TRUE,
  criado_em   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================
-- PROJETOS (ciclos de melhoria A3/MASP)
-- ============================

CREATE TABLE projetos (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  titulo            TEXT NOT NULL,
  descricao         TEXT,
  fase_atual        INT NOT NULL DEFAULT 1 CHECK (fase_atual BETWEEN 1 AND 8),
  status            TEXT NOT NULL DEFAULT 'ativo'
    CHECK (status IN ('ativo','atrasado','concluido','cancelado')),
  data_inicio       DATE NOT NULL DEFAULT CURRENT_DATE,
  data_apresentacao DATE,
  lider_id          UUID NOT NULL REFERENCES profiles(id),
  facilitador_id    UUID REFERENCES profiles(id),
  criado_em         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  atualizado_em     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_projetos_lider ON projetos(lider_id);
CREATE INDEX idx_projetos_status ON projetos(status);

-- ============================
-- PROJETO_MEMBROS (N:N)
-- ============================

CREATE TABLE projeto_membros (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  projeto_id  UUID NOT NULL REFERENCES projetos(id) ON DELETE CASCADE,
  usuario_id  UUID NOT NULL REFERENCES profiles(id),
  papel       TEXT NOT NULL DEFAULT 'membro'
    CHECK (papel IN ('lider','membro','facilitador')),
  adicionado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(projeto_id, usuario_id)
);

CREATE INDEX idx_projeto_membros_projeto ON projeto_membros(projeto_id);

-- ============================
-- EVIDENCIAS
-- ============================

CREATE TABLE evidencias (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  projeto_id      UUID NOT NULL REFERENCES projetos(id) ON DELETE CASCADE,
  requisito_id    TEXT NOT NULL,                    -- ex: F1_DESCRICAO_FACTUAL
  preenchido_por  UUID NOT NULL REFERENCES profiles(id),
  data_registro   DATE NOT NULL DEFAULT CURRENT_DATE,
  aprovado        BOOLEAN,
  aprovado_por    UUID REFERENCES profiles(id),
  aprovado_em     TIMESTAMPTZ,
  observacao      TEXT,
  arquivo_url     TEXT,
  criado_em       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(projeto_id, requisito_id)
);

CREATE INDEX idx_evidencias_projeto ON evidencias(projeto_id);

-- ============================
-- ACOES (plano de acao 5W2H)
-- ============================

CREATE TABLE acoes (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  projeto_id      UUID NOT NULL REFERENCES projetos(id) ON DELETE CASCADE,
  descricao       TEXT NOT NULL,
  responsavel_id  UUID NOT NULL REFERENCES profiles(id),
  data_prevista   DATE NOT NULL,
  data_real       DATE,
  status          TEXT NOT NULL DEFAULT 'pendente'
    CHECK (status IN ('pendente','executando','concluido','atrasado','cancelado')),
  observacao      TEXT,
  criado_em       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  atualizado_em   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_acoes_projeto ON acoes(projeto_id);
CREATE INDEX idx_acoes_responsavel ON acoes(responsavel_id);
CREATE INDEX idx_acoes_status ON acoes(status);
