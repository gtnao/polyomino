import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ScoreDisplay } from '../ScoreDisplay';
import type { GameStats, ColorScheme } from '../../game/types';

describe('ScoreDisplay', () => {
  const mockStats: GameStats = {
    score: 12345,
    level: 5,
    lines: 42,
    piecesPlaced: 150,
    moves: 300,
    rotations: 75,
    holds: 20,
    hardDrops: 50,
    softDropDistance: 200,
    gameStartTime: Date.now() - 180000, // 3 minutes ago
    gameEndTime: null,
  };

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

  it('should render score display', () => {
    render(
      <ScoreDisplay
        stats={mockStats}
        colorScheme={mockColorScheme}
      />
    );

    const container = screen.getByTestId('score-display');
    expect(container).toBeInTheDocument();
  });

  it('should display score', () => {
    render(
      <ScoreDisplay
        stats={mockStats}
        colorScheme={mockColorScheme}
      />
    );

    expect(screen.getByTestId('score-value')).toHaveTextContent('12,345');
  });

  it('should display level', () => {
    render(
      <ScoreDisplay
        stats={mockStats}
        colorScheme={mockColorScheme}
      />
    );

    expect(screen.getByTestId('level-value')).toHaveTextContent('5');
  });

  it('should display lines', () => {
    render(
      <ScoreDisplay
        stats={mockStats}
        colorScheme={mockColorScheme}
      />
    );

    expect(screen.getByTestId('lines-value')).toHaveTextContent('42');
  });

  it('should calculate and display time', () => {
    render(
      <ScoreDisplay
        stats={mockStats}
        colorScheme={mockColorScheme}
      />
    );

    expect(screen.getByTestId('time-value')).toHaveTextContent('3:00');
  });

  it('should display extended stats when enabled', () => {
    render(
      <ScoreDisplay
        stats={mockStats}
        colorScheme={mockColorScheme}
        showExtendedStats
      />
    );

    expect(screen.getByTestId('apm-value')).toBeDefined();
    expect(screen.getByTestId('pps-value')).toBeDefined();
  });

  it('should apply custom className', () => {
    render(
      <ScoreDisplay
        stats={mockStats}
        colorScheme={mockColorScheme}
        className="custom-score"
      />
    );

    const container = screen.getByTestId('score-display');
    expect(container).toHaveClass('custom-score');
  });

  it('should format large numbers with commas', () => {
    const largeStats: GameStats = {
      ...mockStats,
      score: 1234567,
    };

    render(
      <ScoreDisplay
        stats={largeStats}
        colorScheme={mockColorScheme}
      />
    );

    expect(screen.getByTestId('score-value')).toHaveTextContent('1,234,567');
  });

  it('should handle game end time', () => {
    const endedStats: GameStats = {
      ...mockStats,
      gameEndTime: Date.now() - 60000, // Ended 1 minute ago
    };

    render(
      <ScoreDisplay
        stats={endedStats}
        colorScheme={mockColorScheme}
      />
    );

    expect(screen.getByTestId('time-value')).toHaveTextContent('2:00');
  });

  it('should show compact layout when specified', () => {
    render(
      <ScoreDisplay
        stats={mockStats}
        colorScheme={mockColorScheme}
        layout="compact"
      />
    );

    const container = screen.getByTestId('score-display');
    expect(container).toHaveStyle({
      flexDirection: 'row',
    });
  });

  it('should hide labels when specified', () => {
    render(
      <ScoreDisplay
        stats={mockStats}
        colorScheme={mockColorScheme}
        showLabels={false}
      />
    );

    expect(screen.queryByText('Score')).not.toBeInTheDocument();
    expect(screen.queryByText('Level')).not.toBeInTheDocument();
    expect(screen.queryByText('Lines')).not.toBeInTheDocument();
  });
});