import type { ReactNode } from 'react';
import { radii, fontSizes, fontWeights, transitions } from '@shared/design/tokens';

interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => ReactNode;
  width?: string;
}

interface Props<T> {
  columns: Column<T>[];
  data: T[];
  onRowClick?: (item: T) => void;
  emptyMessage?: string;
}

export function Table<T extends Record<string, unknown>>({
  columns,
  data,
  onRowClick,
  emptyMessage = 'No data',
}: Props<T>) {
  return (
    <div style={{ overflowX: 'auto', borderRadius: radii.md, border: '1px solid var(--border)' }}>
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontSize: fontSizes.sm,
          fontFamily: 'inherit',
        }}
      >
        <thead>
          <tr>
            {columns.map(col => (
              <th
                key={col.key}
                style={{
                  background: 'var(--bg-secondary)',
                  fontWeight: fontWeights.semibold,
                  fontSize: fontSizes.xs,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  padding: '8px 16px',
                  textAlign: 'left',
                  color: 'var(--text-secondary)',
                  borderBottom: '1px solid var(--border)',
                  width: col.width,
                  whiteSpace: 'nowrap',
                }}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                style={{
                  padding: '24px 16px',
                  textAlign: 'center',
                  color: 'var(--text-muted)',
                  fontSize: fontSizes.sm,
                }}
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((item, rowIndex) => (
              <tr
                key={rowIndex}
                onClick={onRowClick ? () => onRowClick(item) : undefined}
                onMouseEnter={
                  onRowClick
                    ? e => {
                        e.currentTarget.style.background = 'var(--hover-bg)';
                      }
                    : undefined
                }
                onMouseLeave={
                  onRowClick
                    ? e => {
                        e.currentTarget.style.background = '';
                      }
                    : undefined
                }
                style={{
                  cursor: onRowClick ? 'pointer' : undefined,
                  transition: `background ${transitions.fast}`,
                  borderBottom: '1px solid var(--border)',
                }}
              >
                {columns.map(col => (
                  <td
                    key={col.key}
                    style={{
                      padding: '8px 16px',
                      fontSize: fontSizes.sm,
                      color: 'var(--text-primary)',
                    }}
                  >
                    {col.render ? col.render(item) : (item[col.key] as ReactNode)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
