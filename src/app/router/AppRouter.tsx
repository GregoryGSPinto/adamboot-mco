import React, { Suspense } from 'react';
import { Routes, Route, Outlet } from 'react-router-dom';
import { AppLayout, ErrorBoundary } from '@shared/components';
import { ProtectedRoute } from '@shared/components';
import { HomePage } from './pages/HomePage';
import { NotFoundPage } from './pages/NotFoundPage';

// Lazy-loaded pages
const MissaoPage = React.lazy(() =>
  import('../../pages/MissaoPage').then(m => ({ default: m.MissaoPage }))
);
const ProjetoPage = React.lazy(() =>
  import('../../pages/ProjetoPage').then(m => ({ default: m.ProjetoPage }))
);
const ProjetoWorkspacePage = React.lazy(() =>
  import('../../pages/ProjetoWorkspacePage').then(m => ({ default: m.ProjetoWorkspacePage }))
);
const ChatPage = React.lazy(() =>
  import('../../pages/ChatPage').then(m => ({ default: m.ChatPage }))
);
const BibliotecaPage = React.lazy(() =>
  import('../../pages/BibliotecaPage').then(m => ({ default: m.BibliotecaPage }))
);
const PerfilPage = React.lazy(() =>
  import('../../pages/PerfilPage').then(m => ({ default: m.PerfilPage }))
);
const ApresentacaoProjetoPage = React.lazy(() =>
  import('../../pages/ApresentacaoProjetoPage').then(m => ({ default: m.ApresentacaoProjetoPage }))
);
const NotasPage = React.lazy(() =>
  import('../../pages/NotasPage').then(m => ({ default: m.NotasPage }))
);
const AdminPage = React.lazy(() =>
  import('../../pages/AdminPage').then(m => ({ default: m.AdminPage }))
);
const AcervoPage = React.lazy(() =>
  import('../../pages/AcervoPage').then(m => ({ default: m.AcervoPage }))
);
const AuditoriaPage = React.lazy(() =>
  import('../../pages/AuditoriaPage').then(m => ({ default: m.AuditoriaPage }))
);
const MinhasMissoesPage = React.lazy(() =>
  import('../../pages/MinhasMissoesPage').then(m => ({ default: m.MinhasMissoesPage }))
);

function PageLoader() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 48,
        color: 'var(--text-muted)',
        gap: 8,
        fontSize: 14,
      }}
    >
      <div
        style={{
          width: 16,
          height: 16,
          border: '2px solid var(--border)',
          borderTopColor: 'var(--text-muted)',
          borderRadius: '50%',
          animation: 'spin 0.6s linear infinite',
        }}
      />
      Loading...
    </div>
  );
}

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />

      <Route element={<AppShell />}>
        <Route
          path="/missao"
          element={
            <ProtectedRoute>
              <Suspense fallback={<PageLoader />}>
                <MissaoPage />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="/projeto"
          element={
            <ProtectedRoute>
              <Suspense fallback={<PageLoader />}>
                <ProjetoPage />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="/projeto/:id"
          element={
            <ProtectedRoute>
              <Suspense fallback={<PageLoader />}>
                <ProjetoWorkspacePage />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="/notas"
          element={
            <ProtectedRoute>
              <Suspense fallback={<PageLoader />}>
                <NotasPage />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="/apresentacao"
          element={
            <ProtectedRoute>
              <Suspense fallback={<PageLoader />}>
                <ApresentacaoProjetoPage />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="/chat"
          element={
            <ProtectedRoute>
              <Suspense fallback={<PageLoader />}>
                <ChatPage />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="/library"
          element={
            <ProtectedRoute>
              <Suspense fallback={<PageLoader />}>
                <BibliotecaPage />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="/perfil"
          element={
            <ProtectedRoute>
              <Suspense fallback={<PageLoader />}>
                <PerfilPage />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute requiredRoles={['admin', 'coordenador']}>
              <Suspense fallback={<PageLoader />}>
                <AdminPage />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="/acervo"
          element={
            <ProtectedRoute>
              <Suspense fallback={<PageLoader />}>
                <AcervoPage />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="/auditoria"
          element={
            <ProtectedRoute>
              <Suspense fallback={<PageLoader />}>
                <AuditoriaPage />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="/minhas-missoes"
          element={
            <ProtectedRoute>
              <Suspense fallback={<PageLoader />}>
                <MinhasMissoesPage />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

function AppShell() {
  return (
    <AppLayout>
      <ErrorBoundary>
        <Outlet />
      </ErrorBoundary>
    </AppLayout>
  );
}
