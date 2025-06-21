import React, { useState } from 'react';
import type { ColorScheme, ColorSchemeName } from '../game/types';
import { Menu } from './Menu';
import { AudioSettings } from './AudioSettings';
import { GraphicsSettings } from './GraphicsSettings';
import { ControlsSettings } from './ControlsSettings';

export interface SettingsScreenProps {
  colorScheme: ColorScheme;
  colorSchemeName: ColorSchemeName;
  soundEnabled: boolean;
  musicEnabled: boolean;
  effectVolume: number;
  musicVolume: number;
  particleEffects: boolean;
  ghostPieceEnabled: boolean;
  onColorSchemeChange: (scheme: ColorSchemeName) => void;
  onSoundToggle: (enabled: boolean) => void;
  onMusicToggle: (enabled: boolean) => void;
  onEffectVolumeChange: (volume: number) => void;
  onMusicVolumeChange: (volume: number) => void;
  onParticleToggle: (enabled: boolean) => void;
  onGhostPieceToggle: (enabled: boolean) => void;
  onBack: () => void;
}

type SettingsView = 'main' | 'audio' | 'controls' | 'graphics';

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  colorScheme,
  colorSchemeName,
  soundEnabled,
  musicEnabled,
  effectVolume,
  musicVolume,
  particleEffects,
  ghostPieceEnabled,
  onColorSchemeChange,
  onSoundToggle,
  onMusicToggle,
  onEffectVolumeChange,
  onMusicVolumeChange,
  onParticleToggle,
  onGhostPieceToggle,
  onBack,
}) => {
  const [currentView, setCurrentView] = useState<SettingsView>('main');

  const handleBack = () => {
    setCurrentView('main');
  };

  if (currentView === 'audio') {
    return (
      <AudioSettings
        colorScheme={colorScheme}
        soundEnabled={soundEnabled}
        musicEnabled={musicEnabled}
        effectVolume={effectVolume}
        musicVolume={musicVolume}
        onSoundToggle={onSoundToggle}
        onMusicToggle={onMusicToggle}
        onEffectVolumeChange={onEffectVolumeChange}
        onMusicVolumeChange={onMusicVolumeChange}
        onBack={handleBack}
      />
    );
  }

  if (currentView === 'controls') {
    return (
      <ControlsSettings
        colorScheme={colorScheme}
        onBack={handleBack}
      />
    );
  }

  if (currentView === 'graphics') {
    return (
      <GraphicsSettings
        colorScheme={colorScheme}
        currentSchemeName={colorSchemeName}
        particleEffects={particleEffects}
        ghostPieceEnabled={ghostPieceEnabled}
        onColorSchemeChange={onColorSchemeChange}
        onParticleToggle={onParticleToggle}
        onGhostPieceToggle={onGhostPieceToggle}
        onBack={handleBack}
      />
    );
  }

  const menuItems = [
    { id: 'audio', label: 'Audio Settings', action: () => setCurrentView('audio') },
    { id: 'controls', label: 'Controls', action: () => setCurrentView('controls') },
    { id: 'graphics', label: 'Graphics', action: () => setCurrentView('graphics') },
    { id: 'back', label: 'Back to Main Menu', action: onBack },
  ];

  return (
    <div
      data-testid="settings-screen"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        backgroundColor: colorScheme.colors.background,
        color: colorScheme.colors.text,
        fontFamily: 'monospace',
      }}
    >
      <h1
        style={{
          color: colorScheme.colors.text,
          fontSize: '36px',
          marginBottom: '40px',
        }}
      >
        Settings
      </h1>
      
      <Menu
        items={menuItems}
        colorScheme={colorScheme}
      />
    </div>
  );
};