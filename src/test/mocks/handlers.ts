import { http, HttpResponse } from 'msw';
import type { ProjetoMelhoria } from '@shared/engine';

// Mock data
const mockProjetos: ProjetoMelhoria[] = [
  {
    id: 'proj-001',
    titulo: 'Projeto Teste',
    faseAtual: 1,
    dataInicio: '2024-01-01',
    dataApresentacao: '2024-12-31',
    liderId: 'user-001',
    facilitadorId: 'user-002',
    membros: [
      { id: 'user-001', nome: 'Líder Teste', papel: 'lider' },
      { id: 'user-002', nome: 'Facilitador Teste', papel: 'facilitador' },
    ],
    evidencias: [],
    acoes: [],
    status: 'ativo',
  },
];

export const handlers = [
  // Projects API
  http.get('/api/projetos', () => {
    return HttpResponse.json(mockProjetos);
  }),

  http.get('/api/projetos/:id', ({ params }) => {
    const projeto = mockProjetos.find(p => p.id === params.id);
    if (!projeto) {
      return new HttpResponse(null, { status: 404 });
    }
    return HttpResponse.json(projeto);
  }),

  http.post('/api/projetos', async ({ request }) => {
    const data = (await request.json()) as Partial<ProjetoMelhoria>;
    const novoProjeto: ProjetoMelhoria = {
      id: `proj-${Date.now()}`,
      titulo: data.titulo || 'Novo Projeto',
      faseAtual: 1,
      dataInicio: new Date().toISOString(),
      dataApresentacao: data.dataApresentacao || new Date().toISOString(),
      liderId: data.liderId || 'user-001',
      facilitadorId: data.facilitadorId || 'user-002',
      membros: data.membros || [],
      evidencias: [],
      acoes: [],
      status: 'ativo',
    };
    mockProjetos.push(novoProjeto);
    return HttpResponse.json(novoProjeto, { status: 201 });
  }),

  // Auth API
  http.post('/api/auth/login', async ({ request }) => {
    const body = (await request.json()) as { email?: string; password?: string };

    if (body.email === 'demo@mco.vale.com' && body.password === 'mco2026') {
      return HttpResponse.json({
        user: {
          id: 'demo-user-001',
          name: 'Usuario Demo',
          email: body.email,
          roles: ['lider', 'membro'],
        },
        token: 'mock-jwt-token',
      });
    }

    return new HttpResponse(JSON.stringify({ error: 'Credenciais inválidas' }), { status: 401 });
  }),
];
