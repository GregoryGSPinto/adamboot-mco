# ADAMBOOT MCO -- A3/MASP/PDCA Methodology Reference

Version: 1.0 | Last updated: 2026-03-12

---

## 1. Overview

ADAMBOOT MCO implements the **MASP** (Method of Analysis and Solution of Problems) methodology, also known as the **A3** problem-solving approach, structured around the **PDCA** (Plan-Do-Check-Act) cycle.

This methodology is standard in industrial continuous improvement programs, particularly in CCQ (Circulos de Controle de Qualidade / Quality Control Circles) within railway and mining operations.

The system enforces methodology rigor by requiring **37 verifiable requirements** across **8 phases**, of which **32 are mandatory**. Phase advancement is blocked until all mandatory requirements are fulfilled.

---

## 2. PDCA Mapping

| PDCA Stage | Phases      |
| ---------- | ----------- |
| **Plan**   | 1 through 5 |
| **Do**     | 6           |
| **Check**  | 7           |
| **Act**    | 8           |

---

## 3. The 8 Phases

### Phase 1 -- Clarificar Problema (Clarify the Problem)

**Goal:** Prove the problem exists with facts. No opinions, no causes.

Common rejection reasons: stating a cause instead of a problem, no numeric evidence, vague scope.

| #   | Code               | Requirement                                                 | Validation | Responsible | Mandatory |
| --- | ------------------ | ----------------------------------------------------------- | ---------- | ----------- | --------- |
| 1   | DESCRICAO_FACTUAL  | Factual problem description (no opinions, no causes)        | texto      | lider       | Yes       |
| 2   | INDICADOR_NUMERICO | Numeric indicator proving the problem (frequency/cost/time) | numero     | membro      | Yes       |
| 3   | ESCOPO             | Scope delimitation (equipment, line, period)                | texto      | lider       | Yes       |
| 4   | COMPOSICAO_GRUPO   | Team composition registration (members + leader)            | lista      | lider       | Yes       |

---

### Phase 2 -- Desdobrar Problema (Break Down the Problem)

**Goal:** Stratify the generic into specific. Go to the field to measure.

This is where teams most commonly stall -- it requires actual field data collection.

| #   | Code                  | Requirement                                     | Validation | Responsible | Mandatory |
| --- | --------------------- | ----------------------------------------------- | ---------- | ----------- | --------- |
| 5   | ESTRATIFICACAO        | Stratification by type/location/shift/equipment | arquivo    | membro      | Yes       |
| 6   | DADOS_CAMPO           | Field-collected data (not estimates)            | arquivo    | membro      | Yes       |
| 7   | GRAFICO_CONCENTRACAO  | Chart/table showing problem concentration       | arquivo    | membro      | Yes       |
| 8   | FOCO_PRIORIZADO       | Prioritized focus for attack                    | texto      | grupo       | Yes       |
| 9   | REUNIAO_DESDOBRAMENTO | Team meeting to discuss stratification          | reuniao    | grupo       | Yes       |

---

### Phase 3 -- Definir Meta (Set the Target)

**Goal:** Define a numeric target with a deadline.

Common rejection reasons: target without a number, without a deadline, or physically impossible.

| #   | Code                       | Requirement                                                       | Validation | Responsible | Mandatory |
| --- | -------------------------- | ----------------------------------------------------------------- | ---------- | ----------- | --------- |
| 10  | META_NUMERICA              | Specific numeric target (e.g., reduce from 7 to 2 failures/month) | numero     | grupo       | Yes       |
| 11  | PRAZO_META                 | Deadline to achieve the target                                    | texto      | lider       | Yes       |
| 12  | JUSTIFICATIVA_META         | Justification for the chosen target value                         | texto      | lider       | Yes       |
| 13  | APROVACAO_FACILITADOR_META | Facilitator approval of the target                                | aprovacao  | facilitador | Yes       |

---

### Phase 4 -- Causa Raiz (Root Cause Analysis)

**Goal:** Identify and prove the root cause. The most technical and time-consuming phase. Where most projects die.

The key question evaluators ask: "If this is the cause, how do you prove it?"

| #   | Code                        | Requirement                               | Validation | Responsible | Mandatory |
| --- | --------------------------- | ----------------------------------------- | ---------- | ----------- | --------- |
| 14  | ISHIKAWA                    | Completed Ishikawa (fishbone) diagram     | arquivo    | grupo       | Yes       |
| 15  | CINCO_PORQUES               | 5-Whys applied to the most probable cause | texto      | grupo       | Yes       |
| 16  | EVIDENCIA_CAMPO_CAUSA       | Field evidence proving the root cause     | arquivo    | membro      | Yes       |
| 17  | REUNIAO_VALIDACAO_CAUSA     | Team meeting to validate root cause       | reuniao    | grupo       | Yes       |
| 18  | APROVACAO_FACILITADOR_CAUSA | Facilitator approval of root cause        | aprovacao  | facilitador | Yes       |

---

### Phase 5 -- Contramedidas / Plano de Acao (Countermeasures / Action Plan)

**Goal:** Define executable actions in 5W2H format. Each action: 1 person, 1 deadline.

Common rejection: "improve the process" as an action (too vague).

| #   | Code                        | Requirement                                         | Validation | Responsible | Mandatory |
| --- | --------------------------- | --------------------------------------------------- | ---------- | ----------- | --------- |
| 19  | LISTA_ACOES_5W2H            | Action list in 5W2H format                          | lista      | lider       | Yes       |
| 20  | RESPONSAVEL_INDIVIDUAL      | Each action with individual owner (not "the group") | lista      | lider       | Yes       |
| 21  | DATA_CONCLUSAO_ACOES        | Each action with planned completion date            | lista      | lider       | Yes       |
| 22  | APROVACAO_FACILITADOR_PLANO | Facilitator approval of the action plan             | aprovacao  | facilitador | Yes       |

---

### Phase 6 -- Plano de Acao / Executar (Execute Actions)

**Goal:** Execute the plan and collect evidence for each action. Minimum 80% completion to advance.

This is where the leader traditionally suffers chasing people on WhatsApp. The AI replaces that.

| #   | Code                     | Requirement                                     | Validation | Responsible | Mandatory |
| --- | ------------------------ | ----------------------------------------------- | ---------- | ----------- | --------- |
| 23  | ACOES_CONCLUIDAS         | All actions marked complete with actual date    | lista      | membro      | Yes       |
| 24  | EVIDENCIA_EXECUCAO       | Execution evidence per action (photo, document) | arquivo    | membro      | Yes       |
| 25  | JUSTIFICATIVA_NAO_FEITAS | Justification for incomplete/late actions       | texto      | lider       | No        |
| 26  | PERCENTUAL_EXECUCAO      | Overall execution percentage (minimum 80%)      | numero     | lider       | Yes       |

---

### Phase 7 -- Verificar Resultado (Verify Results)

**Goal:** Prove it worked with numbers. If it did not work, loop back to Phase 4.

| #   | Code                    | Requirement                                         | Validation | Responsible | Mandatory |
| --- | ----------------------- | --------------------------------------------------- | ---------- | ----------- | --------- |
| 27  | MEDICAO_POS             | Post-action measurement (same indicator as Phase 1) | numero     | membro      | Yes       |
| 28  | COMPARACAO_ANTES_DEPOIS | Before vs. after comparison chart                   | arquivo    | membro      | Yes       |
| 29  | ATINGIMENTO_META        | Target achievement calculation (% reached)          | numero     | lider       | Yes       |
| 30  | EFEITOS_COLATERAIS      | Side effects analysis                               | texto      | lider       | No        |

---

### Phase 8 -- Padronizar e Replicar (Standardize and Replicate)

**Goal:** Turn gains into standards. The most neglected phase -- teams celebrate at Phase 7 and abandon Phase 8.

| #   | Code               | Requirement                                           | Validation | Responsible | Mandatory |
| --- | ------------------ | ----------------------------------------------------- | ---------- | ----------- | --------- |
| 31  | PADRAO_OPERACIONAL | Updated or new operational standard (formal document) | arquivo    | lider       | Yes       |
| 32  | TREINAMENTO        | Training record (who, when)                           | reuniao    | lider       | Yes       |
| 33  | ACOMPANHAMENTO     | Follow-up plan (who monitors, frequency)              | texto      | lider       | Yes       |
| 34  | LICAO_APRENDIDA    | Lesson learned (knowledge for other teams)            | texto      | grupo       | Yes       |
| 35  | APROVACAO_FINAL    | Facilitator final approval (project closure)          | aprovacao  | facilitador | Yes       |

---

## 4. Validation Types

| Type        | Description                                         |
| ----------- | --------------------------------------------------- |
| `texto`     | Text field must be filled                           |
| `numero`    | Numeric value must be recorded                      |
| `arquivo`   | File upload required (photo, document, spreadsheet) |
| `aprovacao` | Explicit approval by a role (leader/facilitator)    |
| `lista`     | List of items (e.g., 5W2H actions)                  |
| `reuniao`   | Meeting record with participants                    |

---

## 5. Evidence Validation Model

Each requirement fulfillment creates an `EvidenciaCumprida` record:

```typescript
interface EvidenciaCumprida {
  requisitoId: string; // Links to the RequisitoFase
  preenchidoPor: string; // User who filled it
  dataRegistro: string; // ISO 8601 timestamp
  aprovado?: boolean; // For 'aprovacao' type requirements
}
```

For `aprovacao`-type requirements, the evidence must have `aprovado === true` to count as fulfilled.

---

## 6. Progressive Nudge System (Cobranca Progressiva)

The AI automatically escalates reminders based on days of inaction on a pending requirement:

| Days | Level     | Target      | Tone                                  |
| ---- | --------- | ----------- | ------------------------------------- |
| 3+   | lembrete  | responsavel | Private reminder to the person        |
| 7+   | alerta    | grupo       | Group alert naming the person         |
| 14+  | cobranca  | lider       | Formal charge to the leader           |
| 21+  | escalacao | facilitador | Escalation to facilitator/coordinator |

The escalation thresholds are configurable via `EscalacaoConfig`.

---

## 7. Risk Assessment

The PhaseEngine calculates a risk level for each project:

| Risk Level | Criteria                                               |
| ---------- | ------------------------------------------------------ |
| CRITICO    | Presentation deadline has passed                       |
| ALTO       | 3 or fewer days remaining, or insufficient pace        |
| MEDIO      | 10 or fewer days with pending requirements             |
| BAIXO      | Pending requirements exist but timeline is comfortable |
| EM_DIA     | All current phase requirements fulfilled               |

---

## 8. CCQ Team Structure

| Role        | Code          | Responsibilities                                  |
| ----------- | ------------- | ------------------------------------------------- |
| Leader      | `lider`       | Owns the project, assigns tasks, drives execution |
| Member      | `membro`      | Executes assigned actions, collects field data    |
| Facilitator | `facilitador` | External mentor/sponsor, approves gates           |
| Group       | `grupo`       | Collective decisions requiring team meetings      |

The facilitator serves as the quality gate -- they must approve the target (Phase 3), root cause (Phase 4), action plan (Phase 5), and project closure (Phase 8).
