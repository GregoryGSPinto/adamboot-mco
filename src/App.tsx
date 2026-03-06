import { useEffect } from 'react';
import { AppProviders } from './app/providers/AppProviders';
import { AppRouter } from './app/router/AppRouter';
import { MCOIntlProvider } from './i18n';
import { startReactionEngine, stopReactionEngine } from '@modules/ai';
import { initOfflineListeners } from '@modules/offline';
import { initErrorCapture } from '@modules/monitoramento';
import { initAutoBackup } from '@modules/continuidade';

/**
 * Componente raiz — monta providers + router + todos os subsistemas.
 *
 * Hierarquia:
 *   AppProviders (BrowserRouter → MSAL → TanStack Query)
 *     └── AppRouter (AppLayout → Routes)
 *           └── Pages → Features → Modules
 *
 * Subsistemas inicializados aqui:
 *   - ReactionEngine (IA determinística)
 *   - Offline listeners (sync queue)
 *   - Error capture (monitoramento)
 *   - Auto backup (continuidade)
 */
export function App() {
  useEffect(() => {
    // IA cobradora
    startReactionEngine();

    // Offline-first
    const cleanupOffline = initOfflineListeners();

    // Captura global de erros
    const cleanupErrors = initErrorCapture();

    // Backup automático diário
    const cleanupBackup = initAutoBackup();

    return () => {
      stopReactionEngine();
      cleanupOffline();
      cleanupErrors();
      cleanupBackup();
    };
  }, []);

  return (
    <MCOIntlProvider>
      <AppProviders>
        <AppRouter />
      </AppProviders>
    </MCOIntlProvider>
  );
}
