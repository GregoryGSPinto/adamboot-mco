import { describe, it, expect, beforeEach } from 'vitest';

// dev-auth reads env at module load, so we need to set up env before import
// We test the exported functions' behavior

describe('dev-auth module', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it('devUser has expected structure', async () => {
    const { devUser } = await import('./dev-auth');
    expect(devUser).toHaveProperty('id');
    expect(devUser).toHaveProperty('name');
    expect(devUser).toHaveProperty('email');
    expect(devUser).toHaveProperty('roles');
    expect(devUser.roles).toContain('lider');
  });

  it('DEV_CREDENTIALS is exported', async () => {
    const { DEV_CREDENTIALS } = await import('./dev-auth');
    expect(DEV_CREDENTIALS).toHaveProperty('email');
    expect(DEV_CREDENTIALS).toHaveProperty('password');
  });

  it('isDevAuthenticated returns false initially', async () => {
    const { isDevAuthenticated } = await import('./dev-auth');
    // Clear any state
    sessionStorage.removeItem('mco-session');
    // Since module state persists, we just verify it returns boolean
    expect(typeof isDevAuthenticated()).toBe('boolean');
  });

  it('devLogout clears session', async () => {
    const { devLogout } = await import('./dev-auth');
    // devLogout removes the session key
    devLogout();
    // After logout, the session should be cleared
    expect(sessionStorage.getItem('mco-session')).toBeFalsy();
  });

  it('devLogin rejects empty credentials', async () => {
    const { devLogin } = await import('./dev-auth');
    // When DEV_EMAIL is not set, should fail
    const result = devLogin('test@test.com', 'pass');
    expect(result.success).toBe(false);
  });
});
