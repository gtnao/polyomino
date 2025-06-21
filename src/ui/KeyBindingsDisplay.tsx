import React from 'react';
import type { ColorScheme } from '../game/types';

interface KeyBinding {
  action: string;
  keys: string[];
}

interface KeyBindingsDisplayProps {
  colorScheme: ColorScheme;
  showTitle?: boolean;
  className?: string;
}

const KEY_BINDINGS: KeyBinding[] = [
  { action: 'Move Left', keys: ['←', 'A'] },
  { action: 'Move Right', keys: ['→', 'D'] },
  { action: 'Soft Drop', keys: ['↓', 'S'] },
  { action: 'Hard Drop', keys: ['Space'] },
  { action: 'Rotate Right', keys: ['↑', 'W'] },
  { action: 'Rotate Left', keys: ['Q', 'Z', 'Ctrl'] },
  { action: 'Hold', keys: ['C', 'Shift'] },
  { action: 'Pause', keys: ['P', 'Esc'] },
];

export const KeyBindingsDisplay: React.FC<KeyBindingsDisplayProps> = ({
  colorScheme,
  showTitle = true,
  className,
}) => {
  const { colors } = colorScheme;

  const containerStyle: React.CSSProperties = {
    backgroundColor: colors.ui.panel,
    border: `2px solid ${colors.ui.border}`,
    borderRadius: '8px',
    padding: '10px',
    fontFamily: 'monospace',
  };

  const titleStyle: React.CSSProperties = {
    color: colors.text,
    fontSize: '14px',
    fontWeight: 'bold',
    marginBottom: '8px',
    textAlign: 'center' as const,
  };

  const bindingStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '4px',
    fontSize: '11px',
  };

  const actionStyle: React.CSSProperties = {
    color: colors.textSecondary,
    marginRight: '8px',
  };

  const keyStyle: React.CSSProperties = {
    backgroundColor: colors.ui.button,
    color: colors.text,
    padding: '2px 6px',
    borderRadius: '3px',
    border: `1px solid ${colors.ui.border}`,
    marginLeft: '4px',
    fontSize: '10px',
    fontWeight: 'bold',
    display: 'inline-block',
    minWidth: '20px',
    textAlign: 'center' as const,
  };

  const keysContainerStyle: React.CSSProperties = {
    display: 'flex',
    flexWrap: 'wrap' as const,
    justifyContent: 'flex-end',
    maxWidth: '120px',
  };

  return (
    <div 
      className={className}
      style={containerStyle}
      data-testid="key-bindings-display"
    >
      {showTitle && <div style={titleStyle}>Controls</div>}
      
      {KEY_BINDINGS.map((binding) => (
        <div key={binding.action} style={bindingStyle}>
          <span style={actionStyle}>{binding.action}</span>
          <div style={keysContainerStyle}>
            {binding.keys.map((key) => (
              <span key={key} style={keyStyle}>
                {key}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};