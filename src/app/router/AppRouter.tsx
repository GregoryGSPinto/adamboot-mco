import { Routes, Route, Outlet } from 'react-router-dom';
import { AppLayout } from '@shared/components';
import { ProtectedRoute } from '@shared/components';
import { HomePage } from './pages/HomePage';
import { MissaoPage } from '../../pages/MissaoPage';
import { ProjetoPage } from '../../pages/ProjetoPage';
import { ProjetoWorkspacePage } from '../../pages/ProjetoWorkspacePage';
import { ChatPage } from '../../pages/ChatPage';
import { BibliotecaPage } from '../../pages/BibliotecaPage';
import { PerfilPage } from '../../pages/PerfilPage';
import { ApresentacaoProjetoPage } from '../../pages/ApresentacaoProjetoPage';
import { NotasPage } from '../../pages/NotasPage';
import { AdminPage } from '../../pages/AdminPage';
import { AcervoPage } from '../../pages/AcervoPage';
import { AuditoriaPage } from '../../pages/AuditoriaPage';
import { MinhasMissoesPage } from '../../pages/MinhasMissoesPage';
import { NotFoundPage } from './pages/NotFoundPage';

/**
 * Roteamento MCO.
 *
 * /                → Login (fullscreen, SEM AppLayout)
 * /missao          → Dashboard (radar do líder)
 * /projeto         → Processos (seletor de caderno)
 * /projeto/:id     → Workspace do projeto
 * /notas           → Notas operacionais
 * /apresentacao    → Indicadores (apresentação editável)
 * /chat            → Conversa
 * /library         → Documentos
 * /perfil          → Configurações
 * /admin           → Administração do sistema
 * /acervo          → Gestão de conhecimento
 * /auditoria       → Log de auditoria
 * /minhas-missoes  → Visão do membro
 */
export function AppRouter() {
  return (
    <Routes>
      {/* Login — fullscreen, sem shell */}
      <Route path="/" element={<HomePage />} />

      {/* App — com shell (header, nav, footer) */}
      <Route element={<AppShell />}>
        <Route path="/missao" element={<ProtectedRoute><MissaoPage /></ProtectedRoute>} />
        <Route path="/projeto" element={<ProtectedRoute><ProjetoPage /></ProtectedRoute>} />
        <Route path="/projeto/:id" element={<ProtectedRoute><ProjetoWorkspacePage /></ProtectedRoute>} />
        <Route path="/notas" element={<ProtectedRoute><NotasPage /></ProtectedRoute>} />
        <Route path="/apresentacao" element={<ProtectedRoute><ApresentacaoProjetoPage /></ProtectedRoute>} />
        <Route path="/chat" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
        <Route path="/library" element={<ProtectedRoute><BibliotecaPage /></ProtectedRoute>} />
        <Route path="/perfil" element={<ProtectedRoute><PerfilPage /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute><AdminPage /></ProtectedRoute>} />
        <Route path="/acervo" element={<ProtectedRoute><AcervoPage /></ProtectedRoute>} />
        <Route path="/auditoria" element={<ProtectedRoute><AuditoriaPage /></ProtectedRoute>} />
        <Route path="/minhas-missoes" element={<ProtectedRoute><MinhasMissoesPage /></ProtectedRoute>} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

/** Layout wrapper — AppLayout + Outlet para nested routes */
function AppShell() {
  return (
    <AppLayout>
      <Outlet />
    </AppLayout>
  );
}
