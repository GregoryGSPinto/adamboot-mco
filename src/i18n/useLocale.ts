/**
 * Hook para controle de locale.
 * Persiste em localStorage.
 */

import { useState, useCallback } from 'react';
import type { Locale } from './IntlProvider';

const STORAGE_KEY = 'mco-locale';

function getInitialLocale(): Locale {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'en-US' || stored === 'pt-BR') return stored;
  } catch {}
  return 'pt-BR';
}

export function useLocale() {
  const [locale, setLocaleState] = useState<Locale>(getInitialLocale);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    try {
      localStorage.setItem(STORAGE_KEY, newLocale);
    } catch {}
  }, []);

  const toggleLocale = useCallback(() => {
    setLocale(locale === 'pt-BR' ? 'en-US' : 'pt-BR');
  }, [locale, setLocale]);

  return { locale, setLocale, toggleLocale };
}
