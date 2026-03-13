import { describe, it, expect, beforeEach, vi } from 'vitest';
import { act } from '@testing-library/react';
import { useAppStore } from '../use-app-store';

describe('useAppStore', () => {
  beforeEach(() => {
    // Clear all notifications before each test
    const store = useAppStore.getState();
    act(() => {
      const notifications = store.notifications;
      notifications.forEach(n => {
        if (n.timeoutId) clearTimeout(n.timeoutId);
      });
      useAppStore.setState({ notifications: [] });
    });
    vi.clearAllMocks();
  });

  it('deve ter tema inicial dark', () => {
    const store = useAppStore.getState();
    expect(store.theme).toBe('dark');
  });

  it('deve alternar tema', () => {
    act(() => {
      useAppStore.getState().toggleTheme();
    });

    expect(useAppStore.getState().theme).toBe('light');
  });

  it('deve definir tema específico', () => {
    act(() => {
      useAppStore.getState().setTheme('light');
    });

    expect(useAppStore.getState().theme).toBe('light');
  });

  it('deve alternar sidebar', () => {
    const initialState = useAppStore.getState().sidebarOpen;

    act(() => {
      useAppStore.getState().toggleSidebar();
    });

    expect(useAppStore.getState().sidebarOpen).toBe(!initialState);
  });

  it('deve adicionar notificação', () => {
    act(() => {
      useAppStore.getState().notify('success', 'Test message');
    });

    const notifications = useAppStore.getState().notifications;
    expect(notifications.length).toBeGreaterThan(0);
    expect(notifications[0].type).toBe('success');
    expect(notifications[0].message).toBe('Test message');
  });

  it('deve remover notificação', () => {
    act(() => {
      useAppStore.getState().notify('info', 'Message 1');
    });

    let notifications = useAppStore.getState().notifications;
    const firstId = notifications[0].id;

    act(() => {
      useAppStore.getState().dismissNotification(firstId);
    });

    notifications = useAppStore.getState().notifications;
    expect(notifications).toHaveLength(0);
  });

  it('deve definir tenantId', () => {
    act(() => {
      useAppStore.getState().setTenantId('new-tenant');
    });

    expect(useAppStore.getState().tenantId).toBe('new-tenant');
  });
});
