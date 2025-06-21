import React from 'react';
import type { ColorScheme } from '../game/types';
import { Breadcrumb } from './Breadcrumb';
import { Icon } from './Icon';
import { musicTracks } from '../audio/musicTracks';

interface AudioSettingsProps {
  colorScheme: ColorScheme;
  soundEnabled: boolean;
  musicEnabled: boolean;
  effectVolume: number;
  musicVolume: number;
  selectedMusicTrack?: string;
  onSoundToggle: (enabled: boolean) => void;
  onMusicToggle: (enabled: boolean) => void;
  onEffectVolumeChange: (volume: number) => void;
  onMusicVolumeChange: (volume: number) => void;
  onMusicTrackChange?: (trackId: string) => void;
  onBack: () => void;
}

export const AudioSettings: React.FC<AudioSettingsProps> = ({
  colorScheme,
  soundEnabled,
  musicEnabled,
  effectVolume,
  musicVolume,
  selectedMusicTrack = 'random',
  onSoundToggle,
  onMusicToggle,
  onEffectVolumeChange,
  onMusicVolumeChange,
  onMusicTrackChange,
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
    position: 'relative',
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
  
  const backButtonStyle: React.CSSProperties = {
    backgroundColor: 'transparent',
    color: colors.textSecondary,
    border: 'none',
    borderRadius: '4px',
    padding: '10px 20px',
    fontSize: '16px',
    fontFamily: 'monospace',
    cursor: 'pointer',
    marginTop: '30px',
    transition: 'color 0.2s ease',
    textDecoration: 'underline',
  };
  
  const volumeDisplayStyle: React.CSSProperties = {
    color: colors.textSecondary,
    fontSize: '14px',
  };
  
  return (
    <div style={containerStyle}>
      <Breadcrumb
        items={[
          { label: 'Main Menu', onClick: onBack },
          { label: 'Settings', onClick: onBack },
          { label: 'Audio' },
        ]}
        colorScheme={colorScheme}
      />
      <h2 style={{
        ...titleStyle,
        marginBottom: '20px',
      }}>Audio</h2>
      <div style={panelStyle}>
        
        <div style={settingStyle}>
          <label style={labelStyle}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Icon name={soundEnabled ? 'audio' : 'audioOff'} size={20} />
              <span>Sound Effects</span>
            </span>
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
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Icon name={musicEnabled ? 'music' : 'musicOff'} size={20} />
              <span>Background Music</span>
            </span>
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
        
        {onMusicTrackChange && (
          <div style={settingStyle}>
            <label style={labelStyle}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Icon name="music" size={20} />
                <span>Music Track</span>
              </span>
              <select
                value={selectedMusicTrack}
                onChange={(e) => onMusicTrackChange(e.target.value)}
                disabled={!musicEnabled}
                style={{
                  backgroundColor: colors.ui.button,
                  color: colors.text,
                  border: `2px solid ${colors.ui.border}`,
                  borderRadius: '4px',
                  padding: '8px 12px',
                  fontSize: '14px',
                  fontFamily: 'monospace',
                  cursor: musicEnabled ? 'pointer' : 'not-allowed',
                  opacity: musicEnabled ? 1 : 0.5,
                  marginTop: '8px',
                  width: '100%',
                }}
              >
                {musicTracks.map(track => (
                  <option key={track.id} value={track.id}>
                    {track.name}
                  </option>
                ))}
              </select>
            </label>
          </div>
        )}
        
        <button
          style={backButtonStyle}
          onClick={onBack}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = colors.text;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = colors.textSecondary;
          }}
        >
          ← Back to Settings
        </button>
      </div>
    </div>
  );
};