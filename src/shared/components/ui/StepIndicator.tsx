import { fontSizes, fontWeights } from '@shared/design/tokens';

interface Step {
  label: string;
  status: 'done' | 'current' | 'pending';
}

interface Props {
  steps: Step[];
  onStepClick?: (index: number) => void;
}

const circleSize = 24;

export function StepIndicator({ steps, onStepClick }: Props) {
  return (
    <>
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'flex-start',
          gap: 0,
          width: '100%',
        }}
      >
        {steps.map((step, i) => {
          const isLast = i === steps.length - 1;
          return (
            <div
              key={i}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                flex: 1,
                position: 'relative',
              }}
            >
              {/* Line + Circle row */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  width: '100%',
                }}
              >
                {/* Left line */}
                {i > 0 && (
                  <div
                    style={{
                      flex: 1,
                      height: 2,
                      background:
                        step.status === 'pending' ? 'var(--border)' : 'var(--accent-green)',
                    }}
                  />
                )}
                {i === 0 && <div style={{ flex: 1 }} />}

                {/* Circle */}
                <button
                  type="button"
                  onClick={onStepClick ? () => onStepClick(i) : undefined}
                  style={{
                    width: circleSize,
                    height: circleSize,
                    minWidth: circleSize,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: fontSizes.xs,
                    fontWeight: fontWeights.semibold,
                    cursor: onStepClick ? 'pointer' : 'default',
                    padding: 0,
                    lineHeight: 1,
                    ...(step.status === 'done'
                      ? {
                          background: 'var(--accent-green)',
                          color: '#ffffff',
                          border: 'none',
                        }
                      : step.status === 'current'
                        ? {
                            background: 'var(--bg-primary)',
                            color: 'var(--accent-green)',
                            border: '2px solid var(--accent-green)',
                          }
                        : {
                            background: 'var(--bg-primary)',
                            color: 'var(--text-muted)',
                            border: '2px solid var(--border)',
                          }),
                  }}
                >
                  {step.status === 'done' ? (
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 12 12"
                      fill="none"
                      style={{ display: 'block' }}
                    >
                      <path
                        d="M2 6l3 3 5-5"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  ) : (
                    i + 1
                  )}
                </button>

                {/* Right line */}
                {!isLast && (
                  <div
                    style={{
                      flex: 1,
                      height: 2,
                      background:
                        steps[i + 1]?.status === 'pending'
                          ? 'var(--border)'
                          : 'var(--accent-green)',
                    }}
                  />
                )}
                {isLast && <div style={{ flex: 1 }} />}
              </div>

              {/* Label */}
              <span
                style={{
                  marginTop: 6,
                  fontSize: fontSizes.xs,
                  color: step.status === 'current' ? 'var(--text-primary)' : 'var(--text-muted)',
                  fontWeight: step.status === 'current' ? fontWeights.semibold : fontWeights.normal,
                  textAlign: 'center',
                  maxWidth: 80,
                  wordBreak: 'break-word',
                }}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Vertical layout for mobile via inline style tag */}
      <style>{`
        @media (max-width: 480px) {
          /* StepIndicator mobile override handled by parent if needed */
        }
      `}</style>
    </>
  );
}
