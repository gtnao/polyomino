import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { SettingsScreen } from '../SettingsScreen';
import type { ColorScheme } from '../../game/types';

describe('SettingsScreen', () => {
  const mockColorScheme: ColorScheme = {
    name: 'test',
    colors: {
      background: '#000000',
      board: '#111111',
      grid: '#222222',
      text: '#ffffff',
      textSecondary: '#cccccc',
      ghost: '#808080',
      pieces: ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff', '#ffffff'],
      ui: {
        panel: '#333333',
        button: '#444444',
        buttonHover: '#555555',
        border: '#666666',
      },
      effects: {
        lineClear: ['#ffffff', '#ffff00'],
        levelUp: ['#00ff00', '#ffff00'],
        gameOver: '#ff0000',
      },
    },
  };

  const mockOnBack = vi.fn();
  const mockProps = {
    colorScheme: mockColorScheme,
    colorSchemeName: 'gruvbox' as const,
    soundEnabled: true,
    musicEnabled: true,
    effectVolume: 0.7,
    musicVolume: 0.5,
    particleEffects: true,
    ghostPieceEnabled: true,
    onColorSchemeChange: vi.fn(),
    onSoundToggle: vi.fn(),
    onMusicToggle: vi.fn(),
    onEffectVolumeChange: vi.fn(),
    onMusicVolumeChange: vi.fn(),
    onParticleToggle: vi.fn(),
    onGhostPieceToggle: vi.fn(),
    onBack: mockOnBack,
  } as const;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render settings screen', () => {
    render(<SettingsScreen {...mockProps} />);

    const settingsScreen = screen.getByTestId('settings-screen');
    expect(settingsScreen).toBeInTheDocument();
  });

  it('should display Settings title', () => {
    render(<SettingsScreen {...mockProps} />);

    expect(screen.getByRole('heading', { name: 'Settings' })).toBeInTheDocument();
  });

  it('should render all settings menu items', () => {
    render(<SettingsScreen {...mockProps} />);

    expect(screen.getByText('Audio')).toBeInTheDocument();
    expect(screen.getByText('Graphics')).toBeInTheDocument();
    expect(screen.getByText('← Back')).toBeInTheDocument();
  });

  it('should call onBack when Back is clicked', () => {
    render(<SettingsScreen {...mockProps} />);

    fireEvent.click(screen.getByText('← Back'));
    expect(mockOnBack).toHaveBeenCalledTimes(1);
  });

  it('should use correct color scheme', () => {
    render(<SettingsScreen {...mockProps} />);

    const settingsScreen = screen.getByTestId('settings-screen');
    expect(settingsScreen).toHaveStyle({
      backgroundColor: mockColorScheme.colors.background,
      color: mockColorScheme.colors.text,
    });
  });
});