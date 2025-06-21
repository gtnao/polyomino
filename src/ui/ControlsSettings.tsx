import React from 'react';
import type { ColorScheme } from '../game/types';

interface ControlsSettingsProps {
  colorScheme: ColorScheme;
  onBack: () => void;
}

interface ControlMapping {
  action: string;
  keys: string[];
}

const DEFAULT_CONTROLS: ControlMapping[] = [
  { action: 'Move Left', keys: ['←', 'A'] },
  { action: 'Move Right', keys: ['→', 'D'] },
  { action: 'Soft Drop', keys: ['↓', 'S'] },
  { action: 'Hard Drop', keys: ['Space'] },
  { action: 'Rotate Right', keys: ['↑', 'X', 'W'] },
  { action: 'Rotate Left', keys: ['Z', 'Ctrl', 'Q'] },
  { action: 'Hold', keys: ['C', 'Shift'] },
  { action: 'Pause', keys: ['P', 'Esc'] },
];

export const ControlsSettings: React.FC<ControlsSettingsProps> = ({
  colorScheme,
  onBack,
}) => {
  const { colors } = colorScheme;
  
  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    backgroundColor: colors.background,
    color: colors.text,
    fontFamily: 'monospace',
  };
  
  const panelStyle: React.CSSProperties = {
    backgroundColor: colors.ui.panel,
    border: `2px solid ${colors.ui.border}`,
    borderRadius: '8px',
    padding: '40px',
    minWidth: '500px',
  };
  
  const titleStyle: React.CSSProperties = {
    fontSize: '24px',
    fontWeight: 'bold',
    marginBottom: '30px',
    textAlign: 'center',
  };
  
  const controlsTableStyle: React.CSSProperties = {
    width: '100%',
    borderCollapse: 'collapse',
    marginBottom: '20px',
  };
  
  const tableHeaderStyle: React.CSSProperties = {
    borderBottom: `2px solid ${colors.ui.border}`,
    padding: '10px',
    textAlign: 'left',
    fontWeight: 'bold',
  };
  
  const tableCellStyle: React.CSSProperties = {
    borderBottom: `1px solid ${colors.ui.border}`,
    padding: '10px',
  };
  
  const keyStyle: React.CSSProperties = {
    backgroundColor: colors.ui.button,
    border: `1px solid ${colors.ui.border}`,
    borderRadius: '4px',
    padding: '2px 8px',
    marginRight: '5px',
    display: 'inline-block',
    fontSize: '14px',
  };
  
  const buttonStyle: React.CSSProperties = {
    backgroundColor: colors.ui.button,
    color: colors.text,
    border: `2px solid ${colors.ui.border}`,
    borderRadius: '4px',
    padding: '10px 20px',
    fontSize: '16px',
    fontFamily: 'monospace',
    cursor: 'pointer',
    width: '100%',
  };
  
  const noteStyle: React.CSSProperties = {
    color: colors.textSecondary,
    fontSize: '14px',
    textAlign: 'center',
    marginBottom: '20px',
  };
  
  return (
    <div style={containerStyle}>
      <div style={panelStyle}>
        <h2 style={titleStyle}>Controls</h2>
        
        <table style={controlsTableStyle}>
          <thead>
            <tr>
              <th style={tableHeaderStyle}>Action</th>
              <th style={tableHeaderStyle}>Keys</th>
            </tr>
          </thead>
          <tbody>
            {DEFAULT_CONTROLS.map((control, index) => (
              <tr key={index}>
                <td style={tableCellStyle}>{control.action}</td>
                <td style={tableCellStyle}>
                  {control.keys.map((key, keyIndex) => (
                    <span key={keyIndex} style={keyStyle}>
                      {key}
                    </span>
                  ))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        <p style={noteStyle}>
          DAS (Delayed Auto Shift) is enabled for left/right movement
        </p>
        
        <button
          style={buttonStyle}
          onClick={onBack}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = colors.ui.buttonHover;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = colors.ui.button;
          }}
        >
          Back
        </button>
      </div>
    </div>
  );
};