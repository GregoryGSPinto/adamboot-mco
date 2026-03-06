-- ============================================================
-- 005_seed_data.sql
-- Dados seed com cenarios ferroviarios reais (CCQ Vale)
-- ============================================================

-- ============================
-- PROFILES
-- ============================

INSERT INTO profiles (id, email, nome, papel_global) VALUES
  ('00000000-0000-0000-0000-000000000001', 'gregory@vale.com',  'Gregory Pinto', 'lider'),
  ('00000000-0000-0000-0000-000000000002', 'carlos@vale.com',   'Carlos Silva',  'membro'),
  ('00000000-0000-0000-0000-000000000003', 'joao@vale.com',     'Joao Oliveira', 'membro'),
  ('00000000-0000-0000-0000-000000000004', 'ana@vale.com',      'Ana Santos',    'membro'),
  ('00000000-0000-0000-0000-000000000005', 'marcos@vale.com',   'Marcos Souza',  'facilitador'),
  ('00000000-0000-0000-0000-000000000006', 'pedro@vale.com',    'Pedro Lima',    'membro'),
  ('00000000-0000-0000-0000-000000000007', 'coord@vale.com',    'Maria Costa',   'coordenador');

-- ============================
-- PROJETO 1: Falha em freio manual
-- ============================

INSERT INTO projetos (id, titulo, descricao, fase_atual, status, data_inicio, data_apresentacao, lider_id, facilitador_id) VALUES
  ('10000000-0000-0000-0000-000000000001',
   'Falha recorrente em freio manual - vagoes serie GDE',
   'Investigar causa raiz de falhas nos freios manuais dos vagoes GDE que vem causando atrasos no Patio Norte. 3 ocorrencias nos ultimos 30 dias.',
   4, 'ativo', '2026-01-20', '2026-03-15',
   '00000000-0000-0000-0000-000000000001',
   '00000000-0000-0000-0000-000000000005');

INSERT INTO projeto_membros (projeto_id, usuario_id, papel) VALUES
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'lider'),
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', 'membro'),
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000003', 'membro'),
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000004', 'membro'),
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000005', 'facilitador');

INSERT INTO evidencias (projeto_id, requisito_id, preenchido_por, data_registro) VALUES
  ('10000000-0000-0000-0000-000000000001', 'F1_DESCRICAO_FACTUAL',   '00000000-0000-0000-0000-000000000001', '2026-01-21'),
  ('10000000-0000-0000-0000-000000000001', 'F1_INDICADOR_NUMERICO',  '00000000-0000-0000-0000-000000000002', '2026-01-22'),
  ('10000000-0000-0000-0000-000000000001', 'F1_ESCOPO',              '00000000-0000-0000-0000-000000000001', '2026-01-22'),
  ('10000000-0000-0000-0000-000000000001', 'F1_COMPOSICAO_GRUPO',    '00000000-0000-0000-0000-000000000001', '2026-01-20'),
  ('10000000-0000-0000-0000-000000000001', 'F2_ESTRATIFICACAO',      '00000000-0000-0000-0000-000000000002', '2026-01-28'),
  ('10000000-0000-0000-0000-000000000001', 'F2_DADOS_CAMPO',         '00000000-0000-0000-0000-000000000003', '2026-01-30'),
  ('10000000-0000-0000-0000-000000000001', 'F2_GRAFICO_CONCENTRACAO','00000000-0000-0000-0000-000000000004', '2026-02-01'),
  ('10000000-0000-0000-0000-000000000001', 'F2_FOCO_PRIORIZADO',     '00000000-0000-0000-0000-000000000001', '2026-02-02'),
  ('10000000-0000-0000-0000-000000000001', 'F2_REUNIAO_DESDOBRAMENTO','00000000-0000-0000-0000-000000000001', '2026-02-02'),
  ('10000000-0000-0000-0000-000000000001', 'F3_META_NUMERICA',       '00000000-0000-0000-0000-000000000001', '2026-02-05'),
  ('10000000-0000-0000-0000-000000000001', 'F3_PRAZO_META',          '00000000-0000-0000-0000-000000000001', '2026-02-05'),
  ('10000000-0000-0000-0000-000000000001', 'F3_JUSTIFICATIVA_META',  '00000000-0000-0000-0000-000000000001', '2026-02-05'),
  ('10000000-0000-0000-0000-000000000001', 'F4_ISHIKAWA',            '00000000-0000-0000-0000-000000000001', '2026-02-12');

INSERT INTO evidencias (projeto_id, requisito_id, preenchido_por, data_registro, aprovado, aprovado_por) VALUES
  ('10000000-0000-0000-0000-000000000001', 'F3_APROVACAO_FACILITADOR', '00000000-0000-0000-0000-000000000005', '2026-02-06', TRUE, '00000000-0000-0000-0000-000000000005');

-- ============================
-- PROJETO 2: Sinalizacao sonora
-- ============================

INSERT INTO projetos (id, titulo, descricao, fase_atual, status, data_inicio, data_apresentacao, lider_id, facilitador_id) VALUES
  ('10000000-0000-0000-0000-000000000002',
   'Falha na sinalizacao sonora de locomotiva em manobra',
   'Quase-acidente grave no Patio Sul. Buzina da locomotiva SD-70 nao soou durante manobra.',
   2, 'ativo', '2026-02-10', '2026-04-20',
   '00000000-0000-0000-0000-000000000001',
   '00000000-0000-0000-0000-000000000005');

INSERT INTO projeto_membros (projeto_id, usuario_id, papel) VALUES
  ('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'lider'),
  ('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002', 'membro'),
  ('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000006', 'membro'),
  ('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000005', 'facilitador');

INSERT INTO evidencias (projeto_id, requisito_id, preenchido_por, data_registro) VALUES
  ('10000000-0000-0000-0000-000000000002', 'F1_DESCRICAO_FACTUAL',  '00000000-0000-0000-0000-000000000001', '2026-02-11'),
  ('10000000-0000-0000-0000-000000000002', 'F1_INDICADOR_NUMERICO', '00000000-0000-0000-0000-000000000006', '2026-02-12'),
  ('10000000-0000-0000-0000-000000000002', 'F1_ESCOPO',             '00000000-0000-0000-0000-000000000001', '2026-02-12'),
  ('10000000-0000-0000-0000-000000000002', 'F1_COMPOSICAO_GRUPO',   '00000000-0000-0000-0000-000000000001', '2026-02-10'),
  ('10000000-0000-0000-0000-000000000002', 'F2_ESTRATIFICACAO',     '00000000-0000-0000-0000-000000000002', '2026-02-16');

-- ============================
-- PROJETO 3: Troca de turno (avancado)
-- ============================

INSERT INTO projetos (id, titulo, descricao, fase_atual, status, data_inicio, data_apresentacao, lider_id, facilitador_id) VALUES
  ('10000000-0000-0000-0000-000000000003',
   'Reducao de tempo de troca de turno no patio',
   'Tempo de troca de turno excede 45min, gerando atrasos em cascata na formacao de trens.',
   6, 'atrasado', '2025-11-01', '2026-02-28',
   '00000000-0000-0000-0000-000000000001',
   '00000000-0000-0000-0000-000000000005');

INSERT INTO projeto_membros (projeto_id, usuario_id, papel) VALUES
  ('10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'lider'),
  ('10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000003', 'membro'),
  ('10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000004', 'membro'),
  ('10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000005', 'facilitador');

INSERT INTO acoes (projeto_id, descricao, responsavel_id, data_prevista, data_real, status) VALUES
  ('10000000-0000-0000-0000-000000000003', 'Instalar relogio digital na cabine de troca de turno',
   '00000000-0000-0000-0000-000000000003', '2026-02-10', '2026-02-09', 'concluido'),
  ('10000000-0000-0000-0000-000000000003', 'Criar checklist de passagem de turno padronizado',
   '00000000-0000-0000-0000-000000000004', '2026-02-15', NULL, 'atrasado'),
  ('10000000-0000-0000-0000-000000000003', 'Treinar equipe do turno A no novo procedimento',
   '00000000-0000-0000-0000-000000000001', '2026-02-20', NULL, 'pendente');

-- ============================
-- EVENTOS OPERACIONAIS
-- ============================

INSERT INTO eventos (id, data, local, descricao, tipo, severidade, usuario_id, projeto_id) VALUES
  ('20000000-0000-0000-0000-000000000001',
   '2026-02-15 08:30:00+00', 'Patio Norte - Linha 3, Desvio T-12',
   'Freio manual do vagao GDE-45012 nao destravou completamente durante inspecao pre-partida. Trem aguardou 22min para troca do vagao.',
   'INCIDENTE', 'ALTA',
   '00000000-0000-0000-0000-000000000001',
   '10000000-0000-0000-0000-000000000001'),

  ('20000000-0000-0000-0000-000000000002',
   '2026-02-16 14:10:00+00', 'Oficina Central - Box 7',
   'Mecanico detectou desgaste anormal na sapata de freio do truque dianteiro. Componente com 40% da vida util restante mas apresentando trincas laterais.',
   'DESVIO', 'MEDIA',
   '00000000-0000-0000-0000-000000000001', NULL),

  ('20000000-0000-0000-0000-000000000003',
   '2026-02-17 06:45:00+00', 'Patio Sul - Via Principal, km 12.3',
   'Manobrador quase foi atingido por vagao em movimento. Sinalizacao sonora da locomotiva falhou. Operador viu o vagao a 15m e saiu a tempo.',
   'QUASE_ACIDENTE', 'CRITICA',
   '00000000-0000-0000-0000-000000000002',
   '10000000-0000-0000-0000-000000000002'),

  ('20000000-0000-0000-0000-000000000004',
   '2026-02-18 10:00:00+00', 'Terminal de Carga - Balanca Rodoferroviaria',
   'Procedimento de pesagem foi realizado sem travamento dos calcos. Vagao deslocou 30cm durante pesagem. Sem danos.',
   'DESVIO', 'MEDIA',
   '00000000-0000-0000-0000-000000000003', NULL),

  ('20000000-0000-0000-0000-000000000005',
   '2026-02-19 07:15:00+00', 'Via Permanente - Trecho Curva km 8.7',
   'Auditoria identificou 3 dormentes consecutivos com fixacao comprometida no trecho curvo. Regiao de alta velocidade (60km/h). Necessita troca urgente.',
   'AUDITORIA', 'ALTA',
   '00000000-0000-0000-0000-000000000004', NULL);

-- ============================
-- MENSAGENS (conversa projeto 1)
-- ============================

INSERT INTO mensagens (projeto_id, fase, autor_id, autor_nome, texto, tipo, eh_decisao, criada_em) VALUES
  ('10000000-0000-0000-0000-000000000001', 1,
   '00000000-0000-0000-0000-000000000001', 'Gregory',
   'Pessoal, vamos abrir o projeto sobre o freio manual dos GDE. Ja e a terceira falha em 30 dias.',
   'texto', FALSE, '2026-01-21 08:00:00+00'),

  ('10000000-0000-0000-0000-000000000001', 1,
   '00000000-0000-0000-0000-000000000002', 'Carlos',
   'Eu peguei os registros da manutencao. Foram 7 paradas nos ultimos 30 dias, todas na serie GDE.',
   'texto', FALSE, '2026-01-21 08:15:00+00'),

  ('10000000-0000-0000-0000-000000000001', 1,
   '00000000-0000-0000-0000-000000000001', 'Gregory',
   'Perfeito. Entao o problema e: freio manual nao destrava completamente nos vagoes serie GDE, causando 7 paradas nao programadas nos ultimos 30 dias.',
   'texto', TRUE, '2026-01-21 08:30:00+00'),

  ('10000000-0000-0000-0000-000000000001', 2,
   '00000000-0000-0000-0000-000000000001', 'Gregory',
   'Fase 2 comecou. Carlos, preciso que voce meca o tempo de destravamento por turno.',
   'texto', FALSE, '2026-01-28 07:30:00+00'),

  ('10000000-0000-0000-0000-000000000001', 2,
   '00000000-0000-0000-0000-000000000004', 'Ana',
   'Fiz a estratificacao. 80% das falhas concentram no turno B, vagoes que passaram por manutencao na oficina externa.',
   'texto', TRUE, '2026-02-01 10:00:00+00'),

  ('10000000-0000-0000-0000-000000000001', 3,
   '00000000-0000-0000-0000-000000000001', 'Gregory',
   'Meta proposta: reduzir de 7 para 2 falhas/mes ate 15 de marco.',
   'texto', TRUE, '2026-02-05 08:00:00+00'),

  ('10000000-0000-0000-0000-000000000001', 4,
   '00000000-0000-0000-0000-000000000001', 'Gregory',
   'Montei o Ishikawa. Causas principais: material da sapata (fornecedor externo), procedimento de ajuste (turno B nao segue padrao), e desgaste acelerado.',
   'texto', FALSE, '2026-02-12 08:00:00+00');

-- ============================
-- REUNIOES
-- ============================

INSERT INTO reunioes (projeto_id, titulo, tipo, data_hora, duracao_min, local, status, criado_por) VALUES
  ('10000000-0000-0000-0000-000000000001', 'Kickoff - Projeto Freio GDE',
   'ordinaria', '2026-01-21 09:00:00+00', 60, 'Sala CCQ - Patio Norte',
   'concluida', '00000000-0000-0000-0000-000000000001'),

  ('10000000-0000-0000-0000-000000000001', 'Analise de Causa Raiz',
   'ordinaria', '2026-02-12 14:00:00+00', 90, 'Sala CCQ - Patio Norte',
   'concluida', '00000000-0000-0000-0000-000000000001'),

  ('10000000-0000-0000-0000-000000000001', 'Validacao 5 Porques com Facilitador',
   'facilitador', '2026-02-20 10:00:00+00', 60, 'Online - Teams',
   'agendada', '00000000-0000-0000-0000-000000000001');

-- ============================
-- IMPEDIMENTOS
-- ============================

INSERT INTO impedimentos (projeto_id, descricao, tipo, impacto, status, responsavel_id, reportado_por) VALUES
  ('10000000-0000-0000-0000-000000000001',
   'Fornecedor externo de sapatas nao responde solicitacao de dados tecnicos ha 10 dias.',
   'recurso', 'alto', 'aberto',
   '00000000-0000-0000-0000-000000000005',
   '00000000-0000-0000-0000-000000000001'),

  ('10000000-0000-0000-0000-000000000003',
   'Supervisor do turno B nao liberou equipe para treinamento no horario combinado.',
   'aprovacao', 'medio', 'em_tratamento',
   '00000000-0000-0000-0000-000000000001',
   '00000000-0000-0000-0000-000000000003');

-- ============================
-- HISTORICO DE FASES (projeto 1)
-- ============================

INSERT INTO historico_fases (projeto_id, fase_de, fase_para, usuario_id, observacao, criado_em) VALUES
  ('10000000-0000-0000-0000-000000000001', 1, 1, '00000000-0000-0000-0000-000000000001', 'Projeto criado', '2026-01-20 09:00:00+00'),
  ('10000000-0000-0000-0000-000000000001', 1, 2, '00000000-0000-0000-0000-000000000001', 'Problema clarificado com indicador numerico', '2026-01-25 10:00:00+00'),
  ('10000000-0000-0000-0000-000000000001', 2, 3, '00000000-0000-0000-0000-000000000001', 'Desdobramento concluido, foco priorizado', '2026-02-03 14:00:00+00'),
  ('10000000-0000-0000-0000-000000000001', 3, 4, '00000000-0000-0000-0000-000000000001', 'Meta aprovada pelo facilitador', '2026-02-06 11:00:00+00');
