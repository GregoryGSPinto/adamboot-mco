/**
 * Storage Migration Manifest
 * Tracks which data modules use localStorage vs Supabase.
 * Migration order: low-risk → high-risk
 *
 * Phase A — migrate first (user preferences, read-only settings)
 * Phase B — migrate second (user-generated content, low frequency writes)
 * Phase C — migrate last (high frequency, needs offline support, session data)
 */
export const STORAGE_MANIFEST = {
  // ═══════════════════════════════════════════
  // Phase A — User Preferences (migrate first)
  // Low risk, simple key-value, no offline needs
  // ═══════════════════════════════════════════
  'mco-theme': {
    phase: 'A' as const,
    module: 'src/shared/hooks/use-app-store.ts',
    description: 'Dark/light theme preference',
    frequency: 'rare',
    dataType: 'string',
  },
  'mco-locale': {
    phase: 'A' as const,
    module: 'src/i18n/useLocale.ts',
    description: 'User language preference (pt-BR or en-US)',
    frequency: 'rare',
    dataType: 'string',
  },
  'mco-user-settings': {
    phase: 'A' as const,
    module: 'src/pages/PerfilPage.tsx',
    description: 'User profile settings (notifications, display prefs)',
    frequency: 'rare',
    dataType: 'json',
  },

  // ═══════════════════════════════════════════
  // Phase B — User Content (migrate second)
  // User-generated, low frequency, important data
  // ═══════════════════════════════════════════
  'mco-notas-db': {
    phase: 'B' as const,
    module: 'src/pages/NotasPage.tsx',
    description: 'User notes/annotations database',
    frequency: 'medium',
    dataType: 'json-array',
  },
  'mco-projetos-db': {
    phase: 'B' as const,
    module: 'src/shared/api/mock-projetos.ts',
    description: 'Mock projects database (will be replaced by Supabase tables)',
    frequency: 'medium',
    dataType: 'json-array',
  },
  'mco-conversa-db': {
    phase: 'B' as const,
    module: 'src/shared/api/mock-conversa.ts',
    description: 'Mock conversation/messages database',
    frequency: 'medium',
    dataType: 'json-array',
  },
  'mco-apresentacao-db': {
    phase: 'B' as const,
    module: 'src/shared/api/mock-apresentacao.ts',
    description: 'Mock presentation data',
    frequency: 'low',
    dataType: 'json-array',
  },

  // ═══════════════════════════════════════════
  // Phase C — High Frequency / Offline (migrate last)
  // Needs offline-first strategy, conflict resolution
  // ═══════════════════════════════════════════
  'mco-sync-queue': {
    phase: 'C' as const,
    module: 'src/modules/offline/index.ts',
    description: 'Offline sync queue — pending operations to sync when online',
    frequency: 'high',
    dataType: 'json-array',
    offlineRequired: true,
  },
  'mco-draft-*': {
    phase: 'C' as const,
    module: 'src/modules/offline/index.ts',
    description: 'Draft data saved offline (dynamic key per entity)',
    frequency: 'high',
    dataType: 'json',
    offlineRequired: true,
    dynamicKey: true,
  },
  'mco-last-auto-backup': {
    phase: 'C' as const,
    module: 'src/modules/continuidade/index.ts',
    description: 'Timestamp of last auto-backup for continuity',
    frequency: 'high',
    dataType: 'number',
  },
  'mco-session-expiry': {
    phase: 'C' as const,
    module: 'src/modules/seguranca/index.ts',
    description: 'Session keepalive expiry timestamp',
    frequency: 'high',
    dataType: 'number',
    securitySensitive: true,
  },
} as const;

export type StorageKey = keyof typeof STORAGE_MANIFEST;
export type MigrationPhase = 'A' | 'B' | 'C';
