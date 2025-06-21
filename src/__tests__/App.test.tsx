import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { App } from '../App';
import React from 'react';

// Mock game manager and game loop
vi.mock('../game/gameManager', () => ({
  createGameManager: vi.fn(() => ({
    startGame: vi.fn(),
    endGame: vi.fn(),
    pauseGame: vi.fn(),
    resumeGame: vi.fn(),
    restartGame: vi.fn(),
    processInput: vi.fn(),
    update: vi.fn(),
    getGameState: vi.fn(() => ({
      status: 'ready',
      config: {
        boardDimensions: { width: 10, height: 20 },
        features: { ghostPieceEnabled: true, holdEnabled: true, nextPieceCount: 5 },
        polyominoSize: 5,
      },
      board: [],
      currentPiece: null,
      ghostPiece: null,
      heldPiece: null,
      nextPieces: [],
      stats: {
        score: 0,
        level: 1,
        lines: 0,
        piecesPlaced: 0,
        moves: 0,
        rotations: 0,
        holds: 0,
        hardDrops: 0,
        softDropDistance: 0,
        gameStartTime: Date.now(),
        gameEndTime: null,
      },
      lastUpdateTime: Date.now(),
    })),
  })),
}));

vi.mock('../game/gameLoop', () => ({
  createGameLoop: vi.fn(() => ({
    start: vi.fn(),
    stop: vi.fn(),
    pause: vi.fn(),
    resume: vi.fn(),
    isRunning: vi.fn(() => false),
    isPaused: vi.fn(() => false),
    getStats: vi.fn(() => ({ fps: 60, frameCount: 0, totalTime: 0, updateTime: 0, renderTime: 0 })),
    resetStats: vi.fn(),
  })),
}));

vi.mock('../rendering/colorSchemes', () => ({
  getColorScheme: vi.fn(() => ({
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
  })),
}));

vi.mock('../storage/storageAdapter', () => ({
  createStorageAdapter: vi.fn(() => ({
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
  })),
}));

vi.mock('../storage/saveManager', () => ({
  SaveManager: vi.fn().mockImplementation(() => ({
    loadHighScores: vi.fn(() => Promise.resolve([])),
    isHighScore: vi.fn(() => Promise.resolve(false)),
    addHighScore: vi.fn(() => Promise.resolve()),
    updateStatistics: vi.fn(() => Promise.resolve()),
  })),
}));

vi.mock('../polyomino/generator', () => ({
  generatePolyominoes: vi.fn(() => [
    [[0, 0], [1, 0], [0, 1], [1, 1], [2, 1]],
    [[0, 0], [1, 0], [2, 0], [3, 0], [1, 1]],
  ]),
}))

// Mock individual UI components to avoid hooks issues
vi.mock('../ui', async () => {
  const actual = await vi.importActual('../ui');
  return {
    ...actual,
    SettingsScreen: vi.fn(({ onBack }) => (
      <div data-testid="settings-screen">
        <button onClick={onBack}>Back to Main Menu</button>
        <button>Audio Settings</button>
        <button>Controls</button>
        <button>Graphics</button>
      </div>
    )),
    HighScoresScreen: vi.fn(({ onBack }) => (
      <div data-testid="high-scores-screen">
        <h1>High Scores</h1>
        <h2>5-Polyomino</h2>
        <p>No high scores yet. Be the first to set a record!</p>
        <button onClick={onBack}>Back to Main Menu</button>
      </div>
    )),
  };
});

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render main menu initially', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Polyomino')).toBeInTheDocument();
      expect(screen.getByText('Start Game')).toBeInTheDocument();
      expect(screen.getByText('Settings')).toBeInTheDocument();
      expect(screen.getByText('High Scores')).toBeInTheDocument();
    });
  });

  it('should navigate to settings screen when Settings is clicked', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Settings')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Settings'));

    await waitFor(() => {
      expect(screen.getByTestId('settings-screen')).toBeInTheDocument();
      expect(screen.getByText('Audio Settings')).toBeInTheDocument();
      expect(screen.getByText('Controls')).toBeInTheDocument();
      expect(screen.getByText('Graphics')).toBeInTheDocument();
      expect(screen.getByText('Back to Main Menu')).toBeInTheDocument();
    });
  });

  it('should navigate to high scores screen when High Scores is clicked', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('High Scores')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('High Scores'));

    await waitFor(() => {
      expect(screen.getByTestId('high-scores-screen')).toBeInTheDocument();
      expect(screen.getByText('High Scores')).toBeInTheDocument();
      expect(screen.getByText('5-Polyomino')).toBeInTheDocument();
      expect(screen.getByText('No high scores yet. Be the first to set a record!')).toBeInTheDocument();
    });
  });

  it('should return to main menu from settings screen', async () => {
    render(<App />);

    // Navigate to settings
    await waitFor(() => {
      expect(screen.getByText('Settings')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText('Settings'));

    await waitFor(() => {
      expect(screen.getByTestId('settings-screen')).toBeInTheDocument();
    });

    // Go back to main menu
    fireEvent.click(screen.getByText('Back to Main Menu'));

    await waitFor(() => {
      expect(screen.getByText('Polyomino')).toBeInTheDocument();
      expect(screen.getByText('Start Game')).toBeInTheDocument();
    });
  });

  it('should return to main menu from high scores screen', async () => {
    render(<App />);

    // Navigate to high scores
    await waitFor(() => {
      expect(screen.getByText('High Scores')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText('High Scores'));

    await waitFor(() => {
      expect(screen.getByTestId('high-scores-screen')).toBeInTheDocument();
    });

    // Go back to main menu
    fireEvent.click(screen.getByText('Back to Main Menu'));

    await waitFor(() => {
      expect(screen.getByText('Polyomino')).toBeInTheDocument();
      expect(screen.getByText('Start Game')).toBeInTheDocument();
    });
  });
});