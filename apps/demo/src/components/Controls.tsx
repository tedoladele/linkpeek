'use client';

import { type CSSProperties } from 'react';

export interface ControlValues {
  theme: 'light' | 'dark' | 'system';
  openDelay: number;
  closeDelay: number;
  interactive: boolean;
}

interface ControlsProps {
  values: ControlValues;
  onChange: (values: ControlValues) => void;
  modeBadge: { label: string; color: string };
}

const barStyle: CSSProperties = {
  position: 'sticky',
  top: 0,
  zIndex: 100,
  background: '#fff',
  borderBottom: '1px solid #e5e7eb',
  padding: '12px 24px',
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: 20,
  fontSize: '0.8125rem',
  color: '#374151',
};

const groupStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 6,
};

const labelStyle: CSSProperties = {
  fontWeight: 500,
  color: '#6b7280',
  whiteSpace: 'nowrap',
};

const btnBase: CSSProperties = {
  border: '1px solid #d1d5db',
  borderRadius: 6,
  padding: '4px 10px',
  fontSize: '0.75rem',
  fontWeight: 500,
  cursor: 'pointer',
  background: '#fff',
  color: '#374151',
  transition: 'all 120ms ease',
  lineHeight: 1.4,
};

const btnActive: CSSProperties = {
  ...btnBase,
  background: '#1a1a1a',
  color: '#fff',
  borderColor: '#1a1a1a',
};

const sliderStyle: CSSProperties = {
  width: 80,
  accentColor: '#2563eb',
};

const badgeStyle = (color: string): CSSProperties => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  padding: '4px 12px',
  borderRadius: 999,
  fontSize: '0.75rem',
  fontWeight: 600,
  color,
  background: `${color}10`,
  border: `1px solid ${color}30`,
  whiteSpace: 'nowrap',
});

export function Controls({ values, onChange, modeBadge }: ControlsProps) {
  const update = (partial: Partial<ControlValues>) =>
    onChange({ ...values, ...partial });

  const themes: Array<'light' | 'dark' | 'system'> = [
    'light',
    'dark',
    'system',
  ];

  return (
    <div style={barStyle}>
      {/* Mode badge */}
      <div style={badgeStyle(modeBadge.color)}>
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: modeBadge.color,
          }}
        />
        {modeBadge.label}
      </div>

      {/* Theme */}
      <div style={groupStyle}>
        <span style={labelStyle}>Theme</span>
        <div style={{ display: 'flex', gap: 2 }}>
          {themes.map((t) => (
            <button
              key={t}
              type="button"
              style={values.theme === t ? btnActive : btnBase}
              onClick={() => update({ theme: t })}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Open delay */}
      <div style={groupStyle}>
        <span style={labelStyle}>Open</span>
        <input
          type="range"
          min={50}
          max={500}
          step={10}
          value={values.openDelay}
          onChange={(e) => update({ openDelay: Number(e.target.value) })}
          style={sliderStyle}
        />
        <span style={{ fontVariantNumeric: 'tabular-nums', minWidth: 36 }}>
          {values.openDelay}ms
        </span>
      </div>

      {/* Close delay */}
      <div style={groupStyle}>
        <span style={labelStyle}>Close</span>
        <input
          type="range"
          min={50}
          max={500}
          step={10}
          value={values.closeDelay}
          onChange={(e) => update({ closeDelay: Number(e.target.value) })}
          style={sliderStyle}
        />
        <span style={{ fontVariantNumeric: 'tabular-nums', minWidth: 36 }}>
          {values.closeDelay}ms
        </span>
      </div>

      {/* Interactive */}
      <div style={groupStyle}>
        <label
          style={{ ...labelStyle, display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}
        >
          <input
            type="checkbox"
            checked={values.interactive}
            onChange={(e) => update({ interactive: e.target.checked })}
            style={{ accentColor: '#2563eb' }}
          />
          Interactive
        </label>
      </div>
    </div>
  );
}
