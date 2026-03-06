-- ============================================================
-- 003_reunioes_impedimentos.sql
-- Reunioes do projeto e impedimentos operacionais
-- ============================================================

-- ============================
-- REUNIOES
-- ============================

CREATE TABLE reunioes (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  projeto_id    UUID NOT NULL REFERENCES projetos(id) ON DELETE CASCADE,
  titulo        TEXT NOT NULL,
  tipo          TEXT NOT NULL DEFAULT 'ordinaria'
    CHECK (tipo IN ('ordinaria','extraordinaria','apresentacao','facilitador')),
  data_hora     TIMESTAMPTZ NOT NULL,
  duracao_min   INT NOT NULL DEFAULT 60,
  local         TEXT,
  pauta         TEXT,
  ata           TEXT,
  status        TEXT NOT NULL DEFAULT 'agendada'
    CHECK (status IN ('agendada','em_andamento','concluida','cancelada')),
  criado_por    UUID NOT NULL REFERENCES profiles(id),
  criado_em     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_reunioes_projeto ON reunioes(projeto_id);
CREATE INDEX idx_reunioes_data ON reunioes(data_hora);

-- ============================
-- REUNIAO_PARTICIPANTES
-- ============================

CREATE TABLE reuniao_participantes (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reuniao_id  UUID NOT NULL REFERENCES reunioes(id) ON DELETE CASCADE,
  usuario_id  UUID NOT NULL REFERENCES profiles(id),
  presente    BOOLEAN DEFAULT FALSE,
  UNIQUE(reuniao_id, usuario_id)
);

-- ============================
-- IMPEDIMENTOS
-- ============================

CREATE TABLE impedimentos (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  projeto_id    UUID NOT NULL REFERENCES projetos(id) ON DELETE CASCADE,
  descricao     TEXT NOT NULL,
  tipo          TEXT NOT NULL DEFAULT 'tecnico'
    CHECK (tipo IN ('tecnico','recurso','aprovacao','seguranca','outro')),
  impacto       TEXT NOT NULL DEFAULT 'medio'
    CHECK (impacto IN ('baixo','medio','alto','critico')),
  status        TEXT NOT NULL DEFAULT 'aberto'
    CHECK (status IN ('aberto','em_tratamento','resolvido','escalado')),
  responsavel_id UUID REFERENCES profiles(id),
  reportado_por UUID NOT NULL REFERENCES profiles(id),
  resolucao     TEXT,
  resolvido_em  TIMESTAMPTZ,
  criado_em     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_impedimentos_projeto ON impedimentos(projeto_id);
CREATE INDEX idx_impedimentos_status ON impedimentos(status);
