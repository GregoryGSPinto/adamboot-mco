/**
 * Storage Adapter — abstraction layer for localStorage → Supabase migration.
 *
 * Current implementation: LocalStorageAdapter (wraps existing behavior)
 * Future: SupabaseAdapter (reads/writes to Supabase tables)
 *
 * Usage (future, when modules are refactored):
 *   const storage = getStorageAdapter();
 *   const theme = await storage.get<string>('mco-theme');
 *   await storage.set('mco-theme', 'dark');
 */

export interface StorageAdapter {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T): Promise<void>;
  remove(key: string): Promise<void>;
}

/**
 * LocalStorageAdapter — wraps current localStorage behavior.
 * JSON serialization for objects, raw strings for primitives.
 */
export class LocalStorageAdapter implements StorageAdapter {
  async get<T>(key: string): Promise<T | null> {
    const raw = localStorage.getItem(key);
    if (raw === null) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      // Not JSON — return raw string as T
      return raw as unknown as T;
    }
  }

  async set<T>(key: string, value: T): Promise<void> {
    const serialized = typeof value === 'string' ? value : JSON.stringify(value);
    localStorage.setItem(key, serialized);
  }

  async remove(key: string): Promise<void> {
    localStorage.removeItem(key);
  }
}

/**
 * SupabaseAdapter — TODO: implement when Supabase migration begins.
 *
 * Will read/write to a `user_settings` table in Supabase.
 * Needs:
 *   - Table: user_settings (user_id, key, value_json, updated_at)
 *   - RLS policies for per-user access
 *   - Offline fallback to localStorage
 */
// export class SupabaseAdapter implements StorageAdapter {
//   constructor(private supabase: SupabaseClient) {}
//
//   async get<T>(key: string): Promise<T | null> {
//     // TODO: SELECT value_json FROM user_settings WHERE key = $key AND user_id = auth.uid()
//     throw new Error('Not implemented');
//   }
//
//   async set<T>(key: string, value: T): Promise<void> {
//     // TODO: UPSERT into user_settings
//     throw new Error('Not implemented');
//   }
//
//   async remove(key: string): Promise<void> {
//     // TODO: DELETE FROM user_settings WHERE key = $key AND user_id = auth.uid()
//     throw new Error('Not implemented');
//   }
// }

/** Factory — returns the active adapter based on feature flags */
export function getStorageAdapter(): StorageAdapter {
  // TODO: when VITE_USE_SUPABASE=true, return SupabaseAdapter
  return new LocalStorageAdapter();
}
