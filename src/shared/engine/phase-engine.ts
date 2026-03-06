/**
 * PhaseEngine — Cérebro do sistema MCO.
 *
 * Não toma decisão. Calcula estado.
 * Recebe: projeto + evidências cumpridas
 * Retorna: bloqueios + responsáveis + risco + mensagens da IA
 */

import {
  requisitosObrigatorios,
  FASE_LABELS,
  type RequisitoFase,
} from './requisitos-masp';

// ============================
// TIPOS
// ============================

export interface Membro {
  id: string;
  nome: string;
  papel: 'lider' | 'membro' | 'facilitador';
}

export interface EvidenciaCumprida {
  requisitoId: string;
  preenchidoPor: string;
  dataRegistro: string;
  aprovado?: boolean;
}

export interface AcaoProjeto {
  id: string;
  descricao: string;
  responsavelId: string;
  dataPrevista: string;
  dataReal?: string;
  status: 'pendente' | 'executando' | 'concluido' | 'atrasado';
}

export interface ProjetoMelhoria {
  id: string;
  titulo: string;
  faseAtual: number;
  dataInicio: string;
  dataApresentacao: string;
  liderId: string;
  facilitadorId: string;
  membros: Membro[];
  evidencias: EvidenciaCumprida[];
  acoes: AcaoProjeto[];
  status: 'ativo' | 'atrasado' | 'concluido';
}

// ============================
// RESULTADOS DA ENGINE
// ============================

export interface RequisitoPendente {
  requisito: RequisitoFase;
  responsavelTipo: string;
  responsavelNome: string; // nome real baseado no papel
}

export interface BloqueioFase {
  fase: number;
  faseLabel: string;
  totalRequisitos: number;
  cumpridos: number;
  pendentes: RequisitoPendente[];
  podeSeguir: boolean;
  percentual: number;
}

export type NivelRisco = 'CRITICO' | 'ALTO' | 'MEDIO' | 'BAIXO' | 'EM_DIA';

export interface StatusProjeto {
  projeto: ProjetoMelhoria;
  faseLabel: string;
  bloqueio: BloqueioFase;
  diasRestantes: number;
  diasPorFase: number;
  risco: NivelRisco;
  mensagensIA: MensagemIA[];
  pendenciasPorPessoa: Map<string, RequisitoPendente[]>;
}

export interface MensagemIA {
  destinatario: 'lider' | 'membro' | 'facilitador';
  destinatarioNome: string;
  mensagem: string;
  urgencia: 'info' | 'atencao' | 'urgente' | 'critico';
}

// ============================
// ENGINE
// ============================

export function calcularStatusProjeto(projeto: ProjetoMelhoria): StatusProjeto {
  const bloqueio = calcularBloqueio(projeto);
  const diasRestantes = calcularDiasRestantes(projeto.dataApresentacao);
  const fasesRestantes = 8 - projeto.faseAtual + 1;
  const diasPorFase = fasesRestantes > 0 ? Math.floor(diasRestantes / fasesRestantes) : 0;
  const risco = calcularRisco(diasRestantes, diasPorFase, bloqueio);
  const pendenciasPorPessoa = agruparPorPessoa(bloqueio.pendentes, projeto);
  const mensagensIA = gerarMensagens(projeto, bloqueio, diasRestantes, diasPorFase, pendenciasPorPessoa);

  return {
    projeto,
    faseLabel: FASE_LABELS[projeto.faseAtual] ?? `Fase ${projeto.faseAtual}`,
    bloqueio,
    diasRestantes,
    diasPorFase,
    risco,
    mensagensIA,
    pendenciasPorPessoa,
  };
}

function calcularBloqueio(projeto: ProjetoMelhoria): BloqueioFase {
  const fase = projeto.faseAtual;
  const obrigatorios = requisitosObrigatorios(fase);

  const evidenciaIds = new Set(projeto.evidencias.map((e) => e.requisitoId));

  const cumpridos = obrigatorios.filter((r) => {
    if (r.tipoValidacao === 'aprovacao') {
      const ev = projeto.evidencias.find((e) => e.requisitoId === r.id);
      return ev?.aprovado === true;
    }
    return evidenciaIds.has(r.id);
  });

  const pendentes: RequisitoPendente[] = obrigatorios
    .filter((r) => !cumpridos.includes(r))
    .map((r) => ({
      requisito: r,
      responsavelTipo: r.responsavelTipo,
      responsavelNome: resolverNomeResponsavel(r.responsavelTipo, projeto),
    }));

  return {
    fase,
    faseLabel: FASE_LABELS[fase] ?? `Fase ${fase}`,
    totalRequisitos: obrigatorios.length,
    cumpridos: cumpridos.length,
    pendentes,
    podeSeguir: pendentes.length === 0,
    percentual: obrigatorios.length > 0
      ? Math.round((cumpridos.length / obrigatorios.length) * 100)
      : 100,
  };
}

function resolverNomeResponsavel(tipo: string, projeto: ProjetoMelhoria): string {
  switch (tipo) {
    case 'lider': {
      const lider = projeto.membros.find((m) => m.id === projeto.liderId);
      return lider?.nome ?? 'Líder';
    }
    case 'facilitador': {
      const fac = projeto.membros.find((m) => m.id === projeto.facilitadorId);
      return fac?.nome ?? 'Facilitador';
    }
    case 'grupo':
      return 'Grupo';
    case 'membro':
      return 'Membro designado';
    default:
      return tipo;
  }
}

function calcularDiasRestantes(dataApresentacao: string): number {
  const hoje = new Date();
  const apresentacao = new Date(dataApresentacao);
  const diff = apresentacao.getTime() - hoje.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function calcularRisco(dias: number, diasPorFase: number, bloqueio: BloqueioFase): NivelRisco {
  if (dias <= 0) return 'CRITICO';
  if (dias <= 3) return 'ALTO';
  if (diasPorFase < 3 && bloqueio.pendentes.length > 2) return 'ALTO';
  if (dias <= 10 && bloqueio.pendentes.length > 0) return 'MEDIO';
  if (bloqueio.pendentes.length === 0) return 'EM_DIA';
  return 'BAIXO';
}

function agruparPorPessoa(
  pendentes: RequisitoPendente[],
  projeto: ProjetoMelhoria,
): Map<string, RequisitoPendente[]> {
  const mapa = new Map<string, RequisitoPendente[]>();

  for (const p of pendentes) {
    let chave = p.responsavelNome;

    // Para "membro", tentar atribuir a alguém específico
    if (p.responsavelTipo === 'membro') {
      const membrosAtivos = projeto.membros.filter((m) => m.papel === 'membro');
      if (membrosAtivos.length > 0) {
        // Round-robin simples — em produção seria atribuição explícita
        chave = membrosAtivos[0].nome;
      }
    }

    if (!mapa.has(chave)) {
      mapa.set(chave, []);
    }
    mapa.get(chave)!.push(p);
  }

  return mapa;
}

// ============================
// GERADOR DE MENSAGENS DA IA
// ============================

function gerarMensagens(
  projeto: ProjetoMelhoria,
  bloqueio: BloqueioFase,
  diasRestantes: number,
  diasPorFase: number,
  pendenciasPorPessoa: Map<string, RequisitoPendente[]>,
): MensagemIA[] {
  const msgs: MensagemIA[] = [];
  const lider = projeto.membros.find((m) => m.id === projeto.liderId);
  const liderNome = lider?.nome ?? 'Líder';

  // Mensagens por pessoa pendente
  for (const [nome, pendencias] of pendenciasPorPessoa) {
    const itens = pendencias.map((p) => p.requisito.descricaoCurta).join(', ');
    const urgencia = diasRestantes <= 3 ? 'urgente' : diasRestantes <= 7 ? 'atencao' : 'info';

    if (nome === 'Grupo') {
      msgs.push({
        destinatario: 'lider',
        destinatarioNome: liderNome,
        mensagem: `O grupo precisa se reunir para: ${itens}. Agende uma reunião.`,
        urgencia,
      });
    } else if (nome === liderNome) {
      msgs.push({
        destinatario: 'lider',
        destinatarioNome: liderNome,
        mensagem: `Você tem pendências pessoais: ${itens}.`,
        urgencia,
      });
    } else {
      // Mensagem para o membro
      msgs.push({
        destinatario: 'membro',
        destinatarioNome: nome,
        mensagem: `${liderNome} está aguardando: ${itens}. Prazo da fase: ${diasRestantes} dias.`,
        urgencia,
      });
      // Mensagem para o líder sobre o membro
      msgs.push({
        destinatario: 'lider',
        destinatarioNome: liderNome,
        mensagem: `${nome} ainda não entregou: ${itens}. Cobre.`,
        urgencia,
      });
    }
  }

  // Mensagens de risco temporal
  if (diasRestantes <= 0) {
    msgs.push({
      destinatario: 'lider',
      destinatarioNome: liderNome,
      mensagem: `ATENÇÃO: O prazo de apresentação já passou. O projeto está oficialmente atrasado.`,
      urgencia: 'critico',
    });
  } else if (diasPorFase < 3 && bloqueio.pendentes.length > 0) {
    msgs.push({
      destinatario: 'lider',
      destinatarioNome: liderNome,
      mensagem: `Ritmo insuficiente: faltam ${diasRestantes} dias e vocês têm ${8 - projeto.faseAtual} fases pela frente. Cada fase precisaria ser feita em ${diasPorFase} dias.`,
      urgencia: 'urgente',
    });
  } else if (diasRestantes <= 10) {
    msgs.push({
      destinatario: 'lider',
      destinatarioNome: liderNome,
      mensagem: `Faltam ${diasRestantes} dias para apresentação. Mantenha o ritmo.`,
      urgencia: 'atencao',
    });
  }

  // Se tudo OK na fase
  if (bloqueio.podeSeguir) {
    msgs.push({
      destinatario: 'lider',
      destinatarioNome: liderNome,
      mensagem: `Todos os requisitos da fase "${bloqueio.faseLabel}" estão cumpridos. Você pode avançar para a próxima fase.`,
      urgencia: 'info',
    });
  }

  return msgs;
}
