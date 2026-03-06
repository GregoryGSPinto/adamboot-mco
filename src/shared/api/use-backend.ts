/**
 * use-backend.ts — Feature flag central para transicao gradual mock → Supabase.
 *
 * Importar USE_SUPABASE daqui (ou de supabase-client.ts) em qualquer query file.
 * Quando VITE_USE_SUPABASE=true e as credenciais estao presentes, todas as queries
 * usam Supabase PostgreSQL. Caso contrario, fallback automatico para mocks locais.
 */

export { supabase, USE_SUPABASE } from './supabase-client';

// Re-export todas as APIs para acesso centralizado
export { projetosApi } from './queries/projetos';
export { evidenciasApi } from './queries/evidencias';
export { mensagensApi } from './queries/mensagens';
export { acoesApi } from './queries/acoes';
export { reunioesApi } from './queries/reunioes';
export { auditApi } from './queries/audit';
export { eventosApi } from './queries/eventos';
