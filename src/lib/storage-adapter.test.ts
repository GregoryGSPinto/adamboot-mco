import { describe, it, expect, beforeEach, vi } from 'vitest';
import { LocalStorageAdapter, getStorageAdapter } from './storage-adapter';

// Mock localStorage at module level so it's available before any imports use it
const store: Record<string, string> = {};
const mockStorage = {
  getItem: vi.fn((key: string) => store[key] ?? null),
  setItem: vi.fn((key: string, val: string) => {
    store[key] = val;
  }),
  removeItem: vi.fn((key: string) => {
    delete store[key];
  }),
  clear: vi.fn(() => {
    Object.keys(store).forEach(k => delete store[k]);
  }),
  get length() {
    return Object.keys(store).length;
  },
  key: vi.fn((_i: number) => null),
};
vi.stubGlobal('localStorage', mockStorage);

describe('LocalStorageAdapter', () => {
  let adapter: LocalStorageAdapter;

  beforeEach(() => {
    Object.keys(store).forEach(k => delete store[k]);
    vi.clearAllMocks();
    adapter = new LocalStorageAdapter();
  });

  it('set and get JSON object', async () => {
    await adapter.set('test-key', { name: 'John', age: 30 });
    const result = await adapter.get<{ name: string; age: number }>('test-key');
    expect(result).toEqual({ name: 'John', age: 30 });
  });

  it('set and get string value', async () => {
    await adapter.set('theme', 'dark');
    const result = await adapter.get<string>('theme');
    expect(result).toBe('dark');
  });

  it('get returns null for missing key', async () => {
    const result = await adapter.get('nonexistent');
    expect(result).toBeNull();
  });

  it('remove deletes the key', async () => {
    await adapter.set('to-delete', 'value');
    await adapter.remove('to-delete');
    const result = await adapter.get('to-delete');
    expect(result).toBeNull();
  });

  it('set and get array', async () => {
    await adapter.set('arr', [1, 2, 3]);
    const result = await adapter.get<number[]>('arr');
    expect(result).toEqual([1, 2, 3]);
  });

  it('handles non-JSON raw strings', async () => {
    store['raw'] = 'not-json';
    const result = await adapter.get<string>('raw');
    expect(result).toBe('not-json');
  });
});

describe('getStorageAdapter', () => {
  it('returns LocalStorageAdapter by default', () => {
    const adapter = getStorageAdapter();
    expect(adapter).toBeInstanceOf(LocalStorageAdapter);
  });
});
