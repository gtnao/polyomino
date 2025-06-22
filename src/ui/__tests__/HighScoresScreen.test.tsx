import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { HighScoresScreen } from '../HighScoresScreen';
import type { ColorScheme, HighScore } from '../../game/types';

describe('HighScoresScreen', () => {
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

  const mockHighScores: HighScore[] = [
    { score: 125000, level: 15, lines: 150, time: 900, date: '2024-01-15', polyominoSize: 5 },
    { score: 89000, level: 12, lines: 120, time: 750, date: '2024-01-14', polyominoSize: 5 },
    { score: 67000, level: 10, lines: 95, time: 600, date: '2024-01-13', polyominoSize: 5 },
    { score: 45000, level: 8, lines: 75, time: 450, date: '2024-01-12', polyominoSize: 5 },
    { score: 32000, level: 6, lines: 60, time: 300, date: '2024-01-11', polyominoSize: 5 },
  ];

  const mockOnBack = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render high scores screen', () => {
    render(
      <HighScoresScreen
        colorScheme={mockColorScheme}
        highScores={mockHighScores}
        polyominoSize={5}
        onBack={mockOnBack}
      />
    );

    const highScoresScreen = screen.getByTestId('high-scores-screen');
    expect(highScoresScreen).toBeInTheDocument();
  });

  it('should display High Scores title', () => {
    render(
      <HighScoresScreen
        colorScheme={mockColorScheme}
        highScores={mockHighScores}
        polyominoSize={5}
        onBack={mockOnBack}
      />
    );

    // Use getByRole to specifically target the h1 element
    expect(screen.getByRole('heading', { level: 1, name: 'High Scores' })).toBeInTheDocument();
  });

  it('should render column headers', () => {
    render(
      <HighScoresScreen
        colorScheme={mockColorScheme}
        highScores={mockHighScores}
        polyominoSize={5}
        onBack={mockOnBack}
      />
    );

    expect(screen.getByText('Rank')).toBeInTheDocument();
    expect(screen.getByText('Score')).toBeInTheDocument();
    expect(screen.getByText('Level')).toBeInTheDocument();
    expect(screen.getByText('Lines')).toBeInTheDocument();
    expect(screen.getByText('Time')).toBeInTheDocument();
    expect(screen.getByText('Date')).toBeInTheDocument();
  });

  it('should render high scores data', () => {
    render(
      <HighScoresScreen
        colorScheme={mockColorScheme}
        highScores={mockHighScores}
        polyominoSize={5}
        onBack={mockOnBack}
      />
    );

    // Check for first high score entry
    expect(screen.getByText('#1')).toBeInTheDocument();
    expect(screen.getByText('125,000')).toBeInTheDocument();

    // Check for last high score entry
    expect(screen.getByText('#5')).toBeInTheDocument();
    expect(screen.getByText('32,000')).toBeInTheDocument();
  });

  it('should display empty message when no high scores', () => {
    render(
      <HighScoresScreen
        colorScheme={mockColorScheme}
        highScores={[]}
        polyominoSize={5}
        onBack={mockOnBack}
      />
    );

    expect(screen.getByText('No high scores yet. Be the first to set a record!')).toBeInTheDocument();
  });

  it('should call onBack when Back to Main Menu is clicked', () => {
    render(
      <HighScoresScreen
        colorScheme={mockColorScheme}
        highScores={mockHighScores}
        polyominoSize={5}
        onBack={mockOnBack}
      />
    );

    fireEvent.click(screen.getByText('← Back'));
    expect(mockOnBack).toHaveBeenCalledTimes(1);
  });

  it('should use correct color scheme', () => {
    render(
      <HighScoresScreen
        colorScheme={mockColorScheme}
        highScores={mockHighScores}
        polyominoSize={5}
        onBack={mockOnBack}
      />
    );

    const highScoresScreen = screen.getByTestId('high-scores-screen');
    expect(highScoresScreen).toHaveStyle({
      backgroundColor: mockColorScheme.colors.background,
      color: mockColorScheme.colors.text,
    });
  });
});