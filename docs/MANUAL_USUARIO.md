# ADAMBOOT MCO -- Manual do Usuario

Versao: 1.0 | Ultima atualizacao: 12/03/2026

---

## 1. Visao Geral

O ADAMBOOT MCO (Melhoria Continua Operacional) e uma plataforma para gestao de projetos de melhoria continua no formato CCQ (Circulos de Controle de Qualidade), utilizando a metodologia MASP/A3/PDCA.

O sistema guia equipes atraves de 8 fases obrigatorias, cobrando evidencias, aprovacoes e reunioes em cada etapa. Uma inteligencia artificial acompanha o progresso e envia lembretes automaticos.

---

## 2. Login

### 2.1 Modo Demonstracao

Para acessar o sistema em modo demonstracao:

1. Acesse a pagina inicial
2. Insira o e-mail e senha de demonstracao fornecidos pelo administrador
3. Clique em "Entrar"

### 2.2 Login Corporativo (Azure AD)

Em ambiente de producao:

1. Clique em "Entrar com conta corporativa"
2. Uma janela do Microsoft Azure AD sera aberta
3. Insira suas credenciais corporativas
4. Apos autenticacao, voce sera redirecionado ao sistema

---

## 3. Dashboard (Pagina de Projetos)

Apos o login, voce vera a lista de projetos em que participa.

**Rota:** `/projeto`

### Informacoes exibidas por projeto

| Campo             | Descricao                                 |
| ----------------- | ----------------------------------------- |
| Titulo            | Nome do projeto de melhoria               |
| Fase atual        | Em qual das 8 fases o projeto se encontra |
| Status            | Ativo, Atrasado ou Concluido              |
| Lider             | Nome do lider do grupo CCQ                |
| Data apresentacao | Prazo final para apresentacao do projeto  |
| Nivel de risco    | CRITICO, ALTO, MEDIO, BAIXO ou EM_DIA     |

### Acoes disponiveis

- **Criar novo projeto:** Botao para iniciar um novo projeto (apenas lideres)
- **Abrir projeto:** Clique no projeto para acessar o workspace

---

## 4. Workspace do Projeto (8 Fases)

**Rota:** `/projeto/:id`

O workspace e organizado em abas correspondentes as 8 fases da metodologia MASP:

| Fase | Aba           | Objetivo                                 |
| ---- | ------------- | ---------------------------------------- |
| 1    | Problema      | Descrever o problema com fatos e numeros |
| 2    | Desdobrar     | Estratificar e coletar dados de campo    |
| 3    | Meta          | Definir meta numerica com prazo          |
| 4    | Causa Raiz    | Analisar e comprovar a causa raiz        |
| 5    | Contramedidas | Montar plano de acao 5W2H                |
| 6    | Plano Acao    | Executar acoes e anexar evidencias       |
| 7    | Resultado     | Medir e comparar antes/depois            |
| 8    | Padronizar    | Criar padrao, treinar e registrar licoes |

### Como preencher uma fase

1. Selecione a aba da fase atual
2. Preencha cada requisito obrigatorio (marcados com indicador visual)
3. Anexe evidencias quando solicitado (fotos, documentos, planilhas)
4. Solicite aprovacoes quando necessario (facilitador)
5. Quando todos os requisitos obrigatorios estiverem cumpridos, o botao "Avancar Fase" sera habilitado

### Tipos de requisito

| Tipo      | O que fazer                                   |
| --------- | --------------------------------------------- |
| Texto     | Preencher um campo de texto                   |
| Numero    | Registrar um valor numerico                   |
| Arquivo   | Fazer upload de foto, documento ou planilha   |
| Aprovacao | Aguardar aprovacao de um responsavel          |
| Lista     | Preencher uma lista de itens (ex: acoes 5W2H) |
| Reuniao   | Registrar uma reuniao com participantes       |

### Indicadores de risco

O sistema calcula automaticamente o risco do projeto:

| Indicador | Significado                                       |
| --------- | ------------------------------------------------- |
| EM_DIA    | Todos os requisitos da fase atual estao cumpridos |
| BAIXO     | Ha pendencias, mas o prazo esta confortavel       |
| MEDIO     | Menos de 10 dias com requisitos pendentes         |
| ALTO      | Menos de 3 dias ou ritmo insuficiente             |
| CRITICO   | O prazo de apresentacao ja passou                 |

---

## 5. Missoes

**Rota:** `/missao` e `/minhas-missoes`

As missoes sao tarefas atribuidas a membros individuais do grupo CCQ.

- **Minhas Missoes** (`/minhas-missoes`): Lista todas as missoes atribuidas a voce
- **Missao** (`/missao`): Visao geral de missoes do projeto

Cada missao mostra:

- Descricao da tarefa
- Prazo de conclusao
- Status (pendente, executando, concluida, atrasada)
- Projeto vinculado

---

## 6. Chat / Conversas

**Rota:** `/chat`

O chat permite comunicacao entre membros do grupo CCQ dentro do contexto de um projeto.

- Envie mensagens de texto
- Compartilhe atualizacoes sobre o andamento
- Registre decisoes tomadas em grupo
- Historico de mensagens vinculado ao projeto

---

## 7. Biblioteca (Base de Conhecimento)

**Rota:** `/library`

A biblioteca contem materiais de apoio para a metodologia:

- Modelos de documentos
- Exemplos de projetos anteriores
- Guias de preenchimento por fase
- Material de treinamento sobre MASP/A3/PDCA

---

## 8. Acervo

**Rota:** `/acervo`

O acervo armazena documentos e registros historicos dos projetos:

- Projetos concluidos
- Licoes aprendidas
- Padroes operacionais criados

---

## 9. Relatorios

O modulo de relatorios gera visualizacoes consolidadas:

- Status geral dos projetos
- Indicadores por fase
- Acoes pendentes e atrasadas
- Historico de evolucao

---

## 10. Apresentacao do Projeto

**Rota:** `/apresentacao`

Modo de apresentacao para bancas avaliadoras:

- Exibe o projeto em formato visual
- Resume todas as fases com evidencias
- Mostra indicadores antes/depois
- Ideal para projecao em reunioes de avaliacao

---

## 11. Notas

**Rota:** `/notas`

Caderno de campo digital para anotacoes rapidas durante visitas ao campo ou reunioes.

---

## 12. Auditoria

**Rota:** `/auditoria`

Visualizacao do historico de acoes no sistema:

- Quem fez o que e quando
- Alteracoes em projetos
- Aprovacoes e rejeicoes
- Eventos de login/logout

---

## 13. Painel Administrativo

**Rota:** `/admin` (acesso restrito: admin e coordenador)

Funcoes administrativas:

- Visao geral de todos os projetos
- Gestao de usuarios
- Saude do sistema
- Configuracoes gerais

---

## 14. Perfil

**Rota:** `/perfil`

Configuracoes pessoais:

- Visualizar e editar dados do perfil
- Alterar idioma (Portugues / Ingles)
- Exportar seus dados pessoais (direito LGPD)
- Visualizar termo de consentimento aceito

---

## 15. Lembretes Automaticos (IA)

O sistema envia lembretes automaticos baseados no progresso do projeto:

| Dias sem acao | Tipo      | Para quem               |
| ------------- | --------- | ----------------------- |
| 3 dias        | Lembrete  | Responsavel pela tarefa |
| 7 dias        | Alerta    | Todo o grupo            |
| 14 dias       | Cobranca  | Lider do grupo          |
| 21 dias       | Escalacao | Facilitador/Coordenador |

Os lembretes aparecem dentro do sistema. Em versoes futuras, poderao ser enviados por e-mail ou notificacao push.

---

## 16. Uso Offline

O sistema possui suporte basico para uso offline (PWA):

- Paginas ja visitadas ficam em cache
- Dados preenchidos sao salvos localmente
- Quando a conexao retornar, os dados sao sincronizados

Para instalar como aplicativo:

1. Acesse o sistema pelo navegador Chrome
2. Clique no icone de instalacao na barra de endereco
3. Confirme a instalacao

---

## 17. Suporte

Em caso de problemas:

1. Verifique se esta usando um navegador atualizado (Chrome, Edge ou Firefox)
2. Tente limpar o cache do navegador
3. Verifique sua conexao com a internet
4. Contate o administrador do sistema
