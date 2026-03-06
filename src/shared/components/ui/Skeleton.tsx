import { radii } from '@shared/design/tokens';

type Variant = 'text' | 'circular' | 'rectangular' | 'card';

interface Props {
  variant?: Variant;
  width?: string | number;
  height?: string | number;
  style?: React.CSSProperties;
}

const baseStyle: React.CSSProperties = {
  background: 'linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 75%)',
  backgroundSize: '200% 100%',
  animation: 'shimmer 1.5s ease infinite',
};

const variantDefaults: Record<Variant, React.CSSProperties> = {
  text: { width: '100%', height: '0.875rem', borderRadius: radii.sm },
  circular: { width: 40, height: 40, borderRadius: '50%' },
  rectangular: { width: '100%', height: 120, borderRadius: radii.md },
  card: { width: '100%', height: 180, borderRadius: radii.lg },
};

export function Skeleton({ variant = 'text', width, height, style }: Props) {
  const defaults = variantDefaults[variant];

  return (
    <div
      aria-hidden="true"
      style={{
        ...baseStyle,
        ...defaults,
        ...(width != null ? { width } : {}),
        ...(height != null ? { height } : {}),
        ...style,
      }}
    />
  );
}
