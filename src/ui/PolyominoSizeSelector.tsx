import React from 'react';
import type { ColorScheme } from '../game/types';
import { getPolyominoName } from '../utils/polyominoNames';

interface PolyominoSizeSelectorProps {
  size: 3 | 4 | 5 | 6 | 7;
  onChange: (size: 3 | 4 | 5 | 6 | 7) => void;
  colorScheme: ColorScheme;
  disabled?: boolean;
}

export const PolyominoSizeSelector: React.FC<PolyominoSizeSelectorProps> = ({
  size,
  onChange,
  colorScheme,
  disabled = false,
}) => {
  const { colors } = colorScheme;
  
  const containerStyle: React.CSSProperties = {
    padding: '10px',
    backgroundColor: colors.ui.panel,
    border: `2px solid ${colors.ui.border}`,
    borderRadius: '8px',
  };
  
  const titleStyle: React.CSSProperties = {
    color: colors.text,
    fontSize: '14px',
    fontWeight: 'bold',
    marginBottom: '8px',
    textAlign: 'center',
  };
  
  const selectStyle: React.CSSProperties = {
    width: '100%',
    backgroundColor: colors.ui.button,
    color: colors.text,
    border: `2px solid ${colors.ui.border}`,
    borderRadius: '4px',
    padding: '8px',
    fontSize: '14px',
    fontFamily: 'monospace',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
  };
  
  return (
    <div style={containerStyle}>
      <div style={titleStyle}>POLYOMINO SIZE</div>
      <select
        value={size}
        onChange={(e) => onChange(parseInt(e.target.value) as 3 | 4 | 5 | 6 | 7)}
        disabled={disabled}
        style={selectStyle}
      >
        {[3, 4, 5, 6, 7].map(s => (
          <option key={s} value={s}>
            {s} - {getPolyominoName(s)}
          </option>
        ))}
      </select>
    </div>
  );
};