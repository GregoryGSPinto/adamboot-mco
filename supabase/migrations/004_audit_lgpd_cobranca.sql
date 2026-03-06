-- ============================================================
-- 004_audit_lgpd_cobranca.sql
-- Trilha de auditoria, LGPD, historico de fases,
-- indexes compostos, triggers, RLS
-- ============================================================

-- ============================
-- AUDIT_LOG (trilha de auditoria)
-- ============================

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

CREATE INDEX idx_audit_usuario ON audit_log(usuario_id);
CREATE INDEX idx_audit_entidade ON audit_log(entidade, entidade_id);
CREATE INDEX idx_audit_data ON audit_log(criado_em);

-- ============================
-- LGPD_CONSENTIMENTO
-- ============================

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

CREATE INDEX idx_lgpd_usuario ON lgpd_consentimento(usuario_id);

-- ============================
-- HISTORICO_FASES (transicoes de fase do projeto)
-- ============================

CREATE TABLE historico_fases (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  projeto_id    UUID NOT NULL REFERENCES projetos(id) ON DELETE CASCADE,
  fase_de       INT NOT NULL CHECK (fase_de BETWEEN 1 AND 8),
  fase_para     INT NOT NULL CHECK (fase_para BETWEEN 1 AND 8),
  usuario_id    UUID NOT NULL REFERENCES profiles(id),
  observacao    TEXT,
  criado_em     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_historico_fases_projeto ON historico_fases(projeto_id);

-- ============================
-- COBRANCA_PROGRESSIVA (nudges IA)
-- ============================

CREATE TABLE cobranca_progressiva (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  projeto_id    UUID NOT NULL REFERENCES projetos(id) ON DELETE CASCADE,
  destinatario_id UUID NOT NULL REFERENCES profiles(id),
  nivel         INT NOT NULL DEFAULT 1 CHECK (nivel BETWEEN 1 AND 5),
  mensagem      TEXT NOT NULL,
  canal         TEXT NOT NULL DEFAULT 'app'
    CHECK (canal IN ('app','email','push')),
  lida          BOOLEAN NOT NULL DEFAULT FALSE,
  lida_em       TIMESTAMPTZ,
  criado_em     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_cobranca_projeto ON cobranca_progressiva(projeto_id);
CREATE INDEX idx_cobranca_destinatario ON cobranca_progressiva(destinatario_id);

-- ============================
-- INDEXES COMPOSTOS ADICIONAIS
-- ============================

CREATE INDEX idx_evidencias_projeto_requisito ON evidencias(projeto_id, requisito_id);
CREATE INDEX idx_acoes_projeto_status ON acoes(projeto_id, status);
CREATE INDEX idx_mensagens_projeto_criada ON mensagens(projeto_id, criada_em);

-- ============================
-- TRIGGER: updated_at automatico
-- ============================

CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.atualizado_em = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at_profiles
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_updated_at_projetos
  BEFORE UPDATE ON projetos
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_updated_at_acoes
  BEFORE UPDATE ON acoes
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_updated_at_eventos
  BEFORE UPDATE ON eventos
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_updated_at_reunioes
  BEFORE UPDATE ON reunioes
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_updated_at_impedimentos
  BEFORE UPDATE ON impedimentos
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- ============================
-- ROW LEVEL SECURITY (RLS)
-- ============================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projetos ENABLE ROW LEVEL SECURITY;
ALTER TABLE projeto_membros ENABLE ROW LEVEL SECURITY;
ALTER TABLE evidencias ENABLE ROW LEVEL SECURITY;
ALTER TABLE acoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE eventos ENABLE ROW LEVEL SECURITY;
ALTER TABLE mensagens ENABLE ROW LEVEL SECURITY;
ALTER TABLE arquivos ENABLE ROW LEVEL SECURITY;
ALTER TABLE reunioes ENABLE ROW LEVEL SECURITY;
ALTER TABLE impedimentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE lgpd_consentimento ENABLE ROW LEVEL SECURITY;
ALTER TABLE historico_fases ENABLE ROW LEVEL SECURITY;
ALTER TABLE cobranca_progressiva ENABLE ROW LEVEL SECURITY;

-- Politica base: usuarios autenticados veem dados dos seus projetos
-- (Em producao, refinar por papel e projeto_membros)

CREATE POLICY "profiles_select_own"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "profiles_select_team"
  ON profiles FOR SELECT
  USING (
    id IN (
      SELECT pm2.usuario_id FROM projeto_membros pm1
      JOIN projeto_membros pm2 ON pm1.projeto_id = pm2.projeto_id
      WHERE pm1.usuario_id = auth.uid()
    )
  );

CREATE POLICY "projetos_select_member"
  ON projetos FOR SELECT
  USING (
    id IN (
      SELECT projeto_id FROM projeto_membros WHERE usuario_id = auth.uid()
    )
  );

CREATE POLICY "projetos_insert_authenticated"
  ON projetos FOR INSERT
  WITH CHECK (auth.uid() = lider_id);

CREATE POLICY "projetos_update_leader"
  ON projetos FOR UPDATE
  USING (
    lider_id = auth.uid() OR facilitador_id = auth.uid()
  );

CREATE POLICY "evidencias_select_member"
  ON evidencias FOR SELECT
  USING (
    projeto_id IN (
      SELECT projeto_id FROM projeto_membros WHERE usuario_id = auth.uid()
    )
  );

CREATE POLICY "evidencias_insert_member"
  ON evidencias FOR INSERT
  WITH CHECK (
    projeto_id IN (
      SELECT projeto_id FROM projeto_membros WHERE usuario_id = auth.uid()
    )
  );

CREATE POLICY "mensagens_select_member"
  ON mensagens FOR SELECT
  USING (
    projeto_id IN (
      SELECT projeto_id FROM projeto_membros WHERE usuario_id = auth.uid()
    )
  );

CREATE POLICY "mensagens_insert_member"
  ON mensagens FOR INSERT
  WITH CHECK (
    projeto_id IN (
      SELECT projeto_id FROM projeto_membros WHERE usuario_id = auth.uid()
    )
  );

CREATE POLICY "acoes_select_member"
  ON acoes FOR SELECT
  USING (
    projeto_id IN (
      SELECT projeto_id FROM projeto_membros WHERE usuario_id = auth.uid()
    )
  );

CREATE POLICY "acoes_manage_member"
  ON acoes FOR ALL
  USING (
    projeto_id IN (
      SELECT projeto_id FROM projeto_membros WHERE usuario_id = auth.uid()
    )
  );

CREATE POLICY "eventos_select_own"
  ON eventos FOR SELECT
  USING (usuario_id = auth.uid());

CREATE POLICY "eventos_insert_authenticated"
  ON eventos FOR INSERT
  WITH CHECK (auth.uid() = usuario_id);

CREATE POLICY "reunioes_select_member"
  ON reunioes FOR SELECT
  USING (
    projeto_id IN (
      SELECT projeto_id FROM projeto_membros WHERE usuario_id = auth.uid()
    )
  );

CREATE POLICY "impedimentos_select_member"
  ON impedimentos FOR SELECT
  USING (
    projeto_id IN (
      SELECT projeto_id FROM projeto_membros WHERE usuario_id = auth.uid()
    )
  );

CREATE POLICY "audit_log_select_admin"
  ON audit_log FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND papel_global IN ('coordenador','admin')
    )
  );

CREATE POLICY "lgpd_select_own"
  ON lgpd_consentimento FOR SELECT
  USING (usuario_id = auth.uid());

CREATE POLICY "lgpd_insert_own"
  ON lgpd_consentimento FOR INSERT
  WITH CHECK (usuario_id = auth.uid());

CREATE POLICY "historico_fases_select_member"
  ON historico_fases FOR SELECT
  USING (
    projeto_id IN (
      SELECT projeto_id FROM projeto_membros WHERE usuario_id = auth.uid()
    )
  );

CREATE POLICY "cobranca_select_own"
  ON cobranca_progressiva FOR SELECT
  USING (destinatario_id = auth.uid());

CREATE POLICY "projeto_membros_select"
  ON projeto_membros FOR SELECT
  USING (
    projeto_id IN (
      SELECT projeto_id FROM projeto_membros WHERE usuario_id = auth.uid()
    )
  );

CREATE POLICY "arquivos_select_member"
  ON arquivos FOR SELECT
  USING (
    mensagem_id IN (
      SELECT m.id FROM mensagens m
      JOIN projeto_membros pm ON m.projeto_id = pm.projeto_id
      WHERE pm.usuario_id = auth.uid()
    )
    OR
    evento_id IN (
      SELECT id FROM eventos WHERE usuario_id = auth.uid()
    )
  );
