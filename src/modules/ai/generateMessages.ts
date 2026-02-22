import type { MissionGroup, MissionItem, MissionPriority } from '@modules/mission/types';

export interface AIMessage {
  targetName: string;
  targetRole: string;
  projectName: string;
  text: string;
  priority: MissionPriority;
}

/**
 * Gera mensagens automáticas de cobrança a partir das missões.
 *
 * Tom: humano, curto, estilo WhatsApp.
 * Não é e-mail formal. É cutucada de líder.
 *
 * Exemplos reais:
 *   "Carlos, a medição do freio tá pendente há 3 dias. Preciso disso pra fechar a fase 4."
 *   "Marcos, falta sua aprovação na fase 3. O grupo tá travado esperando."
 */
export function generateMessages(groups: MissionGroup[]): AIMessage[] {
  const messages: AIMessage[] = [];

  for (const group of groups) {
    // Agrupa itens por responsável dentro do projeto
    const byPerson = new Map<string, MissionItem[]>();
    for (const item of group.items) {
      const key = item.responsibleName;
      const list = byPerson.get(key) ?? [];
      list.push(item);
      byPerson.set(key, list);
    }

    for (const [name, items] of byPerson) {
      const highest = items.reduce((max, i) =>
        priorityRank(i.priority) > priorityRank(max.priority) ? i : max,
      );

      const text = buildMessage(name, items, group.projectName, highest);

      messages.push({
        targetName: name,
        targetRole: highest.responsibleRole,
        projectName: group.projectName,
        text,
        priority: highest.priority,
      });
    }
  }

  // Sort by priority
  return messages.sort((a, b) => priorityRank(b.priority) - priorityRank(a.priority));
}

function buildMessage(
  name: string,
  items: MissionItem[],
  projectName: string,
  highest: MissionItem,
): string {
  const count = items.length;
  const firstName = name.split(' ')[0];

  // Critical — overdue
  if (highest.priority === 'CRITICAL' && highest.daysLate) {
    if (count === 1) {
      return `${firstName}, ${highest.requirementDescription} tá pendente há ${highest.daysLate} dias. Preciso disso pra fechar a fase ${highest.phaseNumber}.`;
    }
    return `${firstName}, você tem ${count} pendências atrasadas no projeto ${projectName}. A mais urgente: ${highest.requirementDescription}. Já passou ${highest.daysLate} dias.`;
  }

  // High — starting to be late
  if (highest.priority === 'HIGH' && highest.daysLate) {
    return `${firstName}, ${highest.requirementDescription} tá ${highest.daysLate} dia${highest.daysLate > 1 ? 's' : ''} atrasado. O grupo tá esperando.`;
  }

  // Facilitator approval
  if (highest.responsibleRole === 'FACILITATOR') {
    if (count === 1) {
      return `${firstName}, falta sua aprovação na fase ${highest.phaseNumber}. O grupo tá travado esperando.`;
    }
    return `${firstName}, o projeto ${projectName} precisa de ${count} aprovações suas. O grupo tá parado.`;
  }

  // Medium — deadline approaching
  if (highest.priority === 'MEDIUM') {
    return `${firstName}, ${count === 1 ? 'tem 1 entrega' : `tem ${count} entregas`} chegando no prazo no projeto ${projectName}. Dá pra resolver essa semana?`;
  }

  // Low — gentle nudge
  if (count === 1) {
    return `${firstName}, quando conseguir, preciso de: ${highest.requirementDescription}. Projeto ${projectName}.`;
  }
  return `${firstName}, tem ${count} itens pendentes no projeto ${projectName}. Dá uma olhada quando puder.`;
}

function priorityRank(p: MissionPriority): number {
  switch (p) {
    case 'CRITICAL': return 4;
    case 'HIGH':     return 3;
    case 'MEDIUM':   return 2;
    case 'LOW':      return 1;
  }
}
