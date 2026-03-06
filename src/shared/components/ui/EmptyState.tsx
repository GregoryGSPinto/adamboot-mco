import type { ReactNode } from 'react';
import { fontSizes, fontWeights, spacing } from '@shared/design/tokens';
import { Button } from './Button';

interface Props {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ icon, title, description, action, actionLabel, onAction }: Props) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', textAlign: 'center',
      padding: spacing['3xl'], gap: spacing.lg,
      minHeight: '30vh',
    }}>
      {icon && <div style={{ fontSize: '2.5rem', opacity: 0.5 }}>{icon}</div>}
      <h3 style={{
        margin: 0, fontSize: fontSizes.lg,
        fontWeight: fontWeights.bold, color: 'var(--text-primary)',
      }}>
        {title}
      </h3>
      {description && (
        <p style={{
          margin: 0, fontSize: fontSizes.sm,
          color: 'var(--text-secondary)', maxWidth: 400,
        }}>
          {description}
        </p>
      )}
      {action && <div>{action}</div>}
      {!action && actionLabel && onAction && (
        <Button variant="primary" onClick={onAction}>{actionLabel}</Button>
      )}
    </div>
  );
}
