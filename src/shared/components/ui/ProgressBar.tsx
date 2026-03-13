import { fontSizes, radii } from '@shared/design/tokens';

interface Props {
  value: number;
  max?: number;
  label?: string;
  color?: 'green' | 'yellow' | 'red' | 'blue';
}

const colorMap: Record<string, string> = {
  green: 'var(--accent-green)',
  yellow: 'var(--accent-yellow)',
  red: 'var(--accent-red)',
  blue: 'var(--accent-blue)',
};

export function ProgressBar({ value, max = 100, label, color = 'green' }: Props) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div>
      {label && (
        <div
          style={{
            fontSize: fontSizes.xs,
            color: 'var(--text-secondary)',
            marginBottom: 4,
          }}
        >
          {label}
        </div>
      )}
      <div
        style={{
          height: 8,
          background: 'var(--bg-secondary)',
          borderRadius: radii.sm,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${pct}%`,
            background: colorMap[color],
            borderRadius: radii.sm,
            transition: 'width 0.2s ease',
          }}
        />
      </div>
    </div>
  );
}
