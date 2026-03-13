import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getOfflineState,
  subscribeOffline,
  salvarRascunho,
  recuperarRascunho,
  limparRascunho,
  PHOTO_DEFAULTS,
} from './index';

// Mock localStorage
const store: Record<string, string> = {};
vi.stubGlobal('localStorage', {
  getItem: (key: string) => store[key] ?? null,
  setItem: (key: string, val: string) => {
    store[key] = val;
  },
  removeItem: (key: string) => {
    delete store[key];
  },
  clear: () => {
    Object.keys(store).forEach(k => delete store[k]);
  },
});

describe('offline module', () => {
  beforeEach(() => {
    Object.keys(store).forEach(k => delete store[k]);
  });

  describe('getOfflineState', () => {
    it('returns OfflineState structure', () => {
      const state = getOfflineState();
      expect(state).toHaveProperty('isOnline');
      expect(state).toHaveProperty('syncStatus');
      expect(state).toHaveProperty('queueLength');
      expect(state).toHaveProperty('lastSyncAt');
      expect(state).toHaveProperty('storageUsedMB');
      expect(state).toHaveProperty('storageMaxMB');
      expect(state.storageMaxMB).toBe(50);
    });
  });

  describe('subscribeOffline', () => {
    it('returns unsubscribe function', () => {
      const listener = vi.fn();
      const unsub = subscribeOffline(listener);
      expect(typeof unsub).toBe('function');
      unsub();
    });
  });

  describe('salvarRascunho / recuperarRascunho', () => {
    it('saves and recovers draft data', () => {
      const data = { titulo: 'Meu projeto', fase: 3 };
      salvarRascunho('proj-001', data);

      const recovered = recuperarRascunho<typeof data>('proj-001');
      expect(recovered).not.toBeNull();
      expect(recovered!.data).toEqual(data);
      expect(recovered!.savedAt).toBeTruthy();
    });

    it('returns null for nonexistent draft', () => {
      expect(recuperarRascunho('nonexistent')).toBeNull();
    });

    it('handles corrupted data gracefully', () => {
      store['mco-draft-corrupted'] = '{invalid json';
      expect(recuperarRascunho('corrupted')).toBeNull();
    });
  });

  describe('limparRascunho', () => {
    it('removes draft from storage', () => {
      salvarRascunho('to-delete', { x: 1 });
      expect(recuperarRascunho('to-delete')).not.toBeNull();

      limparRascunho('to-delete');
      expect(recuperarRascunho('to-delete')).toBeNull();
    });
  });

  describe('PHOTO_DEFAULTS', () => {
    it('has reasonable default values', () => {
      expect(PHOTO_DEFAULTS.maxWidthPx).toBe(1920);
      expect(PHOTO_DEFAULTS.maxHeightPx).toBe(1080);
      expect(PHOTO_DEFAULTS.quality).toBeGreaterThan(0);
      expect(PHOTO_DEFAULTS.quality).toBeLessThanOrEqual(1);
      expect(PHOTO_DEFAULTS.maxFileSizeKB).toBe(500);
    });
  });
});
