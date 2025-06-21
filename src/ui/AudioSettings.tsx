import React, { useState } from 'react';
import type { ColorScheme } from '../game/types';

interface AudioSettingsProps {
  colorScheme: ColorScheme;
  soundEnabled: boolean;
  musicEnabled: boolean;
  effectVolume: number;
  musicVolume: number;
  onSoundToggle: (enabled: boolean) => void;
  onMusicToggle: (enabled: boolean) => void;
  onEffectVolumeChange: (volume: number) => void;
  onMusicVolumeChange: (volume: number) => void;
  onBack: () => void;
}

export const AudioSettings: React.FC<AudioSettingsProps> = ({
  colorScheme,
  soundEnabled,
  musicEnabled,
  effectVolume,
  musicVolume,
  onSoundToggle,
  onMusicToggle,
  onEffectVolumeChange,
  onMusicVolumeChange,
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
  
  const sliderStyle: React.CSSProperties = {
    width: '100%',
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
  
  const volumeDisplayStyle: React.CSSProperties = {
    color: colors.textSecondary,
    fontSize: '14px',
  };
  
  return (
    <div style={containerStyle}>
      <div style={panelStyle}>
        <h2 style={titleStyle}>Audio Settings</h2>
        
        <div style={settingStyle}>
          <label style={labelStyle}>
            <span>Sound Effects</span>
            <input
              type="checkbox"
              checked={soundEnabled}
              onChange={(e) => onSoundToggle(e.target.checked)}
              style={checkboxStyle}
            />
          </label>
        </div>
        
        <div style={settingStyle}>
          <label style={labelStyle}>
            <span>Background Music</span>
            <input
              type="checkbox"
              checked={musicEnabled}
              onChange={(e) => onMusicToggle(e.target.checked)}
              style={checkboxStyle}
            />
          </label>
        </div>
        
        <div style={settingStyle}>
          <label>
            <div style={labelStyle}>
              <span>Effect Volume</span>
              <span style={volumeDisplayStyle}>{Math.round(effectVolume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={effectVolume * 100}
              onChange={(e) => onEffectVolumeChange(parseInt(e.target.value) / 100)}
              disabled={!soundEnabled}
              style={{
                ...sliderStyle,
                opacity: soundEnabled ? 1 : 0.5,
              }}
            />
          </label>
        </div>
        
        <div style={settingStyle}>
          <label>
            <div style={labelStyle}>
              <span>Music Volume</span>
              <span style={volumeDisplayStyle}>{Math.round(musicVolume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={musicVolume * 100}
              onChange={(e) => onMusicVolumeChange(parseInt(e.target.value) / 100)}
              disabled={!musicEnabled}
              style={{
                ...sliderStyle,
                opacity: musicEnabled ? 1 : 0.5,
              }}
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