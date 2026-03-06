-- ============================================================
-- 002_eventos_conversa.sql
-- Eventos operacionais, mensagens de conversa, arquivos
-- ============================================================

-- ============================
-- EVENTOS (ocorrencias operacionais)
-- ============================

CREATE TABLE eventos (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  data              TIMESTAMPTZ NOT NULL,
  local             TEXT NOT NULL,
  descricao         TEXT NOT NULL,
  tipo              TEXT NOT NULL
    CHECK (tipo IN ('INCIDENTE','QUASE_ACIDENTE','DESVIO','OBSERVACAO','AUDITORIA')),
  severidade        TEXT NOT NULL
    CHECK (severidade IN ('CRITICA','ALTA','MEDIA','BAIXA')),
  usuario_id        UUID NOT NULL REFERENCES profiles(id),
  projeto_id        UUID REFERENCES projetos(id),
  criado_em         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  atualizado_em     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_eventos_usuario ON eventos(usuario_id);
CREATE INDEX idx_eventos_tipo ON eventos(tipo);
CREATE INDEX idx_eventos_severidade ON eventos(severidade);
CREATE INDEX idx_eventos_projeto ON eventos(projeto_id);

-- ============================
-- MENSAGENS (conversa estruturada do projeto)
-- ============================

CREATE TABLE mensagens (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  projeto_id          UUID NOT NULL REFERENCES projetos(id) ON DELETE CASCADE,
  fase                INT NOT NULL CHECK (fase BETWEEN 1 AND 8),
  autor_id            UUID NOT NULL REFERENCES profiles(id),
  autor_nome          TEXT NOT NULL,
  texto               TEXT,
  tipo                TEXT NOT NULL DEFAULT 'texto'
    CHECK (tipo IN ('texto','imagem','arquivo','sistema')),
  eh_decisao          BOOLEAN NOT NULL DEFAULT FALSE,
  requisito_vinculado TEXT,
  resposta_a          UUID REFERENCES mensagens(id),
  criada_em           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_mensagens_projeto ON mensagens(projeto_id);
CREATE INDEX idx_mensagens_fase ON mensagens(projeto_id, fase);
CREATE INDEX idx_mensagens_decisao ON mensagens(projeto_id) WHERE eh_decisao = TRUE;

-- ============================
-- ARQUIVOS (anexos de mensagens e evidencias)
-- ============================

CREATE TABLE arquivos (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mensagem_id   UUID REFERENCES mensagens(id) ON DELETE CASCADE,
  evento_id     UUID REFERENCES eventos(id) ON DELETE CASCADE,
  nome_original TEXT NOT NULL,
  mime_type     TEXT NOT NULL,
  tamanho_bytes BIGINT NOT NULL,
  storage_path  TEXT NOT NULL,
  thumb_path    TEXT,
  criado_em     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_arquivos_mensagem ON arquivos(mensagem_id);
CREATE INDEX idx_arquivos_evento ON arquivos(evento_id);
