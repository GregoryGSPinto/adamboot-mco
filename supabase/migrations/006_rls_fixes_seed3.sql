-- ============================================================
-- 006_rls_fixes_seed3.sql
-- Fix RLS policy gaps + add 3rd seed project (phase 8 completed)
-- ============================================================

-- ============================
-- FIX: reuniao_presencas missing RLS policies
-- ============================

ALTER TABLE reuniao_presencas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "reuniao_presencas_select_member"
  ON reuniao_presencas FOR SELECT
  USING (
    reuniao_id IN (
      SELECT r.id FROM reunioes r
      JOIN projeto_membros pm ON r.projeto_id = pm.projeto_id
      WHERE pm.usuario_id = auth.uid()
    )
  );

CREATE POLICY "reuniao_presencas_insert_member"
  ON reuniao_presencas FOR INSERT
  WITH CHECK (
    reuniao_id IN (
      SELECT r.id FROM reunioes r
      JOIN projeto_membros pm ON r.projeto_id = pm.projeto_id
      WHERE pm.usuario_id = auth.uid()
    )
  );

CREATE POLICY "reuniao_presencas_update_member"
  ON reuniao_presencas FOR UPDATE
  USING (
    reuniao_id IN (
      SELECT r.id FROM reunioes r
      JOIN projeto_membros pm ON r.projeto_id = pm.projeto_id
      WHERE pm.usuario_id = auth.uid()
    )
  );

-- ============================
-- FIX: Missing INSERT policies for tables with SELECT-only
-- ============================

-- reunioes: allow leaders to create
CREATE POLICY "reunioes_insert_leader"
  ON reunioes FOR INSERT
  WITH CHECK (
    projeto_id IN (
      SELECT projeto_id FROM projeto_membros
      WHERE usuario_id = auth.uid()
        AND papel IN ('lider', 'facilitador')
    )
  );

-- reunioes: allow leaders to update
CREATE POLICY "reunioes_update_leader"
  ON reunioes FOR UPDATE
  USING (
    projeto_id IN (
      SELECT projeto_id FROM projeto_membros
      WHERE usuario_id = auth.uid()
        AND papel IN ('lider', 'facilitador')
    )
  );

-- impedimentos: allow members to create
CREATE POLICY "impedimentos_insert_member"
  ON impedimentos FOR INSERT
  WITH CHECK (
    projeto_id IN (
      SELECT projeto_id FROM projeto_membros WHERE usuario_id = auth.uid()
    )
  );

-- impedimentos: allow leaders to update
CREATE POLICY "impedimentos_update_leader"
  ON impedimentos FOR UPDATE
  USING (
    projeto_id IN (
      SELECT projeto_id FROM projeto_membros
      WHERE usuario_id = auth.uid()
        AND papel IN ('lider', 'facilitador')
    )
  );

-- historico_fases: allow leaders to insert
CREATE POLICY "historico_fases_insert_leader"
  ON historico_fases FOR INSERT
  WITH CHECK (
    projeto_id IN (
      SELECT projeto_id FROM projeto_membros
      WHERE usuario_id = auth.uid()
        AND papel IN ('lider', 'facilitador')
    )
  );

-- cobranca_progressiva: allow system/leaders to insert
CREATE POLICY "cobranca_insert_leader"
  ON cobranca_progressiva FOR INSERT
  WITH CHECK (
    projeto_id IN (
      SELECT projeto_id FROM projeto_membros
      WHERE usuario_id = auth.uid()
        AND papel IN ('lider', 'facilitador')
    )
  );

-- cobranca_progressiva: allow recipient to update (mark as read)
CREATE POLICY "cobranca_update_own"
  ON cobranca_progressiva FOR UPDATE
  USING (destinatario_id = auth.uid());

-- projeto_membros: allow leaders to insert/delete members
CREATE POLICY "projeto_membros_insert_leader"
  ON projeto_membros FOR INSERT
  WITH CHECK (
    projeto_id IN (
      SELECT pm.projeto_id FROM projeto_membros pm
      WHERE pm.usuario_id = auth.uid()
        AND pm.papel IN ('lider', 'facilitador')
    )
    OR auth.uid() = usuario_id  -- allow self-join
  );

CREATE POLICY "projeto_membros_delete_leader"
  ON projeto_membros FOR DELETE
  USING (
    projeto_id IN (
      SELECT pm.projeto_id FROM projeto_membros pm
      WHERE pm.usuario_id = auth.uid()
        AND pm.papel IN ('lider', 'facilitador')
    )
  );

-- profiles: allow own update
CREATE POLICY "profiles_update_own"
  ON profiles FOR UPDATE
  USING (id = auth.uid());

-- audit_log: allow authenticated insert (system logs)
CREATE POLICY "audit_log_insert_authenticated"
  ON audit_log FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- ============================
-- SEED: Project 3 — Completed (phase 8)
-- Team: GVS Ferrovia (seed data only)
-- ============================

INSERT INTO projetos (id, titulo, descricao, fase_atual, status, data_inicio, data_apresentacao, lider_id, facilitador_id) VALUES
  ('10000000-0000-0000-0000-000000000003',
   'Reducao de desgaste prematuro em trilhos curvos',
   'Projeto concluido com sucesso. Reducao de 60% no desgaste de trilhos em curvas criticas apos implantacao de lubrificacao automatica. Equipe GVS Ferrovia.',
   8, 'concluido', '2025-09-01', '2025-12-15',
   '00000000-0000-0000-0000-000000000001',
   '00000000-0000-0000-0000-000000000004');

INSERT INTO projeto_membros (projeto_id, usuario_id, papel) VALUES
  ('10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'lider'),
  ('10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000002', 'membro'),
  ('10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000003', 'membro'),
  ('10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000004', 'facilitador');

-- All 8 phases completed — evidence for key requirements
INSERT INTO evidencias (projeto_id, requisito_id, preenchido_por, data_registro, aprovado, aprovado_por) VALUES
  ('10000000-0000-0000-0000-000000000003', 'F1_DESCRICAO_FACTUAL',   '00000000-0000-0000-0000-000000000001', '2025-09-05', TRUE, '00000000-0000-0000-0000-000000000004'),
  ('10000000-0000-0000-0000-000000000003', 'F1_INDICADOR_NUMERICO',  '00000000-0000-0000-0000-000000000002', '2025-09-06', TRUE, '00000000-0000-0000-0000-000000000004'),
  ('10000000-0000-0000-0000-000000000003', 'F2_ESTRATIFICACAO',      '00000000-0000-0000-0000-000000000002', '2025-09-15', TRUE, '00000000-0000-0000-0000-000000000004'),
  ('10000000-0000-0000-0000-000000000003', 'F3_META_NUMERICA',       '00000000-0000-0000-0000-000000000001', '2025-09-25', TRUE, '00000000-0000-0000-0000-000000000004'),
  ('10000000-0000-0000-0000-000000000003', 'F4_ISHIKAWA',            '00000000-0000-0000-0000-000000000001', '2025-10-10', TRUE, '00000000-0000-0000-0000-000000000004'),
  ('10000000-0000-0000-0000-000000000003', 'F4_5PORQUES',            '00000000-0000-0000-0000-000000000003', '2025-10-12', TRUE, '00000000-0000-0000-0000-000000000004'),
  ('10000000-0000-0000-0000-000000000003', 'F5_BRAINSTORM',          '00000000-0000-0000-0000-000000000001', '2025-10-20', TRUE, '00000000-0000-0000-0000-000000000004'),
  ('10000000-0000-0000-0000-000000000003', 'F6_5W2H',               '00000000-0000-0000-0000-000000000001', '2025-10-30', TRUE, '00000000-0000-0000-0000-000000000004'),
  ('10000000-0000-0000-0000-000000000003', 'F7_MEDICAO_POS',         '00000000-0000-0000-0000-000000000002', '2025-11-20', TRUE, '00000000-0000-0000-0000-000000000004'),
  ('10000000-0000-0000-0000-000000000003', 'F7_COMPARACAO_ANTES_DEPOIS', '00000000-0000-0000-0000-000000000002', '2025-11-22', TRUE, '00000000-0000-0000-0000-000000000004'),
  ('10000000-0000-0000-0000-000000000003', 'F7_ATINGIMENTO_META',    '00000000-0000-0000-0000-000000000001', '2025-11-25', TRUE, '00000000-0000-0000-0000-000000000004'),
  ('10000000-0000-0000-0000-000000000003', 'F8_PADRAO_OPERACIONAL',  '00000000-0000-0000-0000-000000000001', '2025-12-01', TRUE, '00000000-0000-0000-0000-000000000004'),
  ('10000000-0000-0000-0000-000000000003', 'F8_TREINAMENTO',         '00000000-0000-0000-0000-000000000001', '2025-12-05', TRUE, '00000000-0000-0000-0000-000000000004'),
  ('10000000-0000-0000-0000-000000000003', 'F8_ACOMPANHAMENTO',      '00000000-0000-0000-0000-000000000001', '2025-12-08', TRUE, '00000000-0000-0000-0000-000000000004'),
  ('10000000-0000-0000-0000-000000000003', 'F8_LICAO_APRENDIDA',     '00000000-0000-0000-0000-000000000001', '2025-12-10', TRUE, '00000000-0000-0000-0000-000000000004'),
  ('10000000-0000-0000-0000-000000000003', 'F8_APROVACAO_FINAL',     '00000000-0000-0000-0000-000000000004', '2025-12-12', TRUE, '00000000-0000-0000-0000-000000000004');

-- Phase transitions for completed project
INSERT INTO historico_fases (projeto_id, fase_de, fase_para, usuario_id, observacao, criado_em) VALUES
  ('10000000-0000-0000-0000-000000000003', 1, 1, '00000000-0000-0000-0000-000000000001', 'Projeto criado', '2025-09-01 09:00:00+00'),
  ('10000000-0000-0000-0000-000000000003', 1, 2, '00000000-0000-0000-0000-000000000001', 'Problema clarificado', '2025-09-10 10:00:00+00'),
  ('10000000-0000-0000-0000-000000000003', 2, 3, '00000000-0000-0000-0000-000000000001', 'Dados estratificados', '2025-09-20 10:00:00+00'),
  ('10000000-0000-0000-0000-000000000003', 3, 4, '00000000-0000-0000-0000-000000000001', 'Meta definida: reducao 50%', '2025-09-28 10:00:00+00'),
  ('10000000-0000-0000-0000-000000000003', 4, 5, '00000000-0000-0000-0000-000000000001', 'Causa raiz confirmada', '2025-10-15 10:00:00+00'),
  ('10000000-0000-0000-0000-000000000003', 5, 6, '00000000-0000-0000-0000-000000000001', 'Contramedidas selecionadas', '2025-10-25 10:00:00+00'),
  ('10000000-0000-0000-0000-000000000003', 6, 7, '00000000-0000-0000-0000-000000000001', 'Plano de acao executado', '2025-11-15 10:00:00+00'),
  ('10000000-0000-0000-0000-000000000003', 7, 8, '00000000-0000-0000-0000-000000000001', 'Meta atingida: 60% reducao', '2025-11-28 10:00:00+00');

-- Acoes for completed project
INSERT INTO acoes (projeto_id, descricao, responsavel_id, data_prevista, data_real, status) VALUES
  ('10000000-0000-0000-0000-000000000003', 'Instalar sistema de lubrificacao automatica nos trilhos curvos km 5-12', '00000000-0000-0000-0000-000000000002', '2025-11-01', '2025-10-28', 'concluido'),
  ('10000000-0000-0000-0000-000000000003', 'Treinar equipe de via permanente no novo procedimento', '00000000-0000-0000-0000-000000000003', '2025-12-05', '2025-12-03', 'concluido'),
  ('10000000-0000-0000-0000-000000000003', 'Atualizar procedimento operacional PO-VP-042', '00000000-0000-0000-0000-000000000001', '2025-12-10', '2025-12-08', 'concluido');

-- Audit trail entries
INSERT INTO audit_log (usuario_id, acao, entidade, entidade_id) VALUES
  ('00000000-0000-0000-0000-000000000001', 'CREATE', 'projeto', '10000000-0000-0000-0000-000000000003'),
  ('00000000-0000-0000-0000-000000000001', 'ADVANCE_PHASE', 'projeto', '10000000-0000-0000-0000-000000000003'),
  ('00000000-0000-0000-0000-000000000004', 'APPROVE', 'evidencia', '10000000-0000-0000-0000-000000000003');
