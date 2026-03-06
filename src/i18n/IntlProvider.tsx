/**
 * IntlProvider wrapper — i18n com react-intl.
 * Locale persistido em localStorage. Default: pt-BR.
 */

import { IntlProvider as ReactIntlProvider } from 'react-intl';
import { ReactNode } from 'react';
import { useLocale } from './useLocale';
import ptBR from './pt-BR.json';
import enUS from './en-US.json';

export type Locale = 'pt-BR' | 'en-US';

const MESSAGES: Record<Locale, Record<string, string>> = {
  'pt-BR': ptBR,
  'en-US': enUS,
};

interface Props {
  children: ReactNode;
}

export function MCOIntlProvider({ children }: Props) {
  const { locale } = useLocale();
  const messages = MESSAGES[locale] ?? MESSAGES['pt-BR'];

  return (
    <ReactIntlProvider locale={locale} messages={messages} defaultLocale="pt-BR">
      {children}
    </ReactIntlProvider>
  );
}
