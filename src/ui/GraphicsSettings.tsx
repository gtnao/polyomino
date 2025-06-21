import React from 'react';
import type { ColorScheme, ColorSchemeName } from '../game/types';

interface GraphicsSettingsProps {
  colorScheme: ColorScheme;
  currentSchemeName: ColorSchemeName;
  particleEffects: boolean;
  ghostPieceEnabled: boolean;
  onColorSchemeChange: (scheme: ColorSchemeName) => void;
  onParticleToggle: (enabled: boolean) => void;
  onGhostPieceToggle: (enabled: boolean) => void;
  onBack: () => void;
}

const COLOR_SCHEMES: ColorSchemeName[] = [
  'gruvbox',
  'monokai',
  'dracula',
  'nord',
  'solarized',
  'tokyo-night',
];

export const GraphicsSettings: React.FC<GraphicsSettingsProps> = ({
  colorScheme,
  currentSchemeName,
  particleEffects,
  ghostPieceEnabled,
  onColorSchemeChange,
  onParticleToggle,
  onGhostPieceToggle,
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
    minWidth: '400px',
  };
  
  const titleStyle: React.CSSProperties = {
    fontSize: '24px',
    fontWeight: 'bold',
    marginBottom: '30px',
    textAlign: 'center',
  };
  
  const settingStyle: React.CSSProperties = {
    marginBottom: '20px',
  };
  
  const labelStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '10px',
  };
  
  const checkboxStyle: React.CSSProperties = {
    width: '20px',
    height: '20px',
    cursor: 'pointer',
  };
  
  const selectStyle: React.CSSProperties = {
    backgroundColor: colors.ui.button,
    color: colors.text,
    border: `2px solid ${colors.ui.border}`,
    borderRadius: '4px',
    padding: '5px 10px',
    fontSize: '16px',
    fontFamily: 'monospace',
    cursor: 'pointer',
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
    marginTop: '20px',
    width: '100%',
  };
  
  const colorPreviewStyle: React.CSSProperties = {
    display: 'flex',
    gap: '5px',
    marginTop: '10px',
  };
  
  const colorBlockStyle = (color: string): React.CSSProperties => ({
    width: '20px',
    height: '20px',
    backgroundColor: color,
    border: `1px solid ${colors.ui.border}`,
  });
  
  return (
    <div style={containerStyle}>
      <div style={panelStyle}>
        <h2 style={titleStyle}>Graphics Settings</h2>
        
        <div style={settingStyle}>
          <label style={labelStyle}>
            <span>Color Scheme</span>
            <select
              value={currentSchemeName}
              onChange={(e) => onColorSchemeChange(e.target.value as ColorSchemeName)}
              style={selectStyle}
            >
              {COLOR_SCHEMES.map((scheme) => (
                <option key={scheme} value={scheme}>
                  {scheme.charAt(0).toUpperCase() + scheme.slice(1).replace('-', ' ')}
                </option>
              ))}
            </select>
          </label>
          <div style={colorPreviewStyle}>
            {colors.pieces.slice(0, 7).map((color, index) => (
              <div key={index} style={colorBlockStyle(color)} />
            ))}
          </div>
        </div>
        
        <div style={settingStyle}>
          <label style={labelStyle}>
            <span>Ghost Piece</span>
            <input
              type="checkbox"
              checked={ghostPieceEnabled}
              onChange={(e) => onGhostPieceToggle(e.target.checked)}
              style={checkboxStyle}
            />
          </label>
        </div>
        
        <div style={settingStyle}>
          <label style={labelStyle}>
            <span>Particle Effects</span>
            <input
              type="checkbox"
              checked={particleEffects}
              onChange={(e) => onParticleToggle(e.target.checked)}
              style={checkboxStyle}
            />
          </label>
        </div>
        
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