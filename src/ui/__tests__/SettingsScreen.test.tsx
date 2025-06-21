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

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render settings screen', () => {
    render(
      <SettingsScreen
        colorScheme={mockColorScheme}
        onBack={mockOnBack}
      />
    );

    const settingsScreen = screen.getByTestId('settings-screen');
    expect(settingsScreen).toBeInTheDocument();
  });

  it('should display Settings title', () => {
    render(
      <SettingsScreen
        colorScheme={mockColorScheme}
        onBack={mockOnBack}
      />
    );

    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  it('should render all settings menu items', () => {
    render(
      <SettingsScreen
        colorScheme={mockColorScheme}
        onBack={mockOnBack}
      />
    );

    expect(screen.getByText('Audio Settings')).toBeInTheDocument();
    expect(screen.getByText('Controls')).toBeInTheDocument();
    expect(screen.getByText('Graphics')).toBeInTheDocument();
    expect(screen.getByText('Back to Main Menu')).toBeInTheDocument();
  });

  it('should call onBack when Back to Main Menu is clicked', () => {
    render(
      <SettingsScreen
        colorScheme={mockColorScheme}
        onBack={mockOnBack}
      />
    );

    fireEvent.click(screen.getByText('Back to Main Menu'));
    expect(mockOnBack).toHaveBeenCalledTimes(1);
  });

  it('should use correct color scheme', () => {
    render(
      <SettingsScreen
        colorScheme={mockColorScheme}
        onBack={mockOnBack}
      />
    );

    const settingsScreen = screen.getByTestId('settings-screen');
    expect(settingsScreen).toHaveStyle({
      backgroundColor: mockColorScheme.colors.background,
      color: mockColorScheme.colors.text,
    });
  });
});