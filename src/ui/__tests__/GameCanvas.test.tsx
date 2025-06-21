import { render, screen } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { GameCanvas } from '../GameCanvas';
import type { Board, ActivePiece, GhostPiece, ColorScheme, GameConfig } from '../../game/types';
import * as renderer from '../../rendering/renderer';

// Mock renderer module
vi.mock('../../rendering/renderer');

describe('GameCanvas', () => {
  const mockBoard: Board = [
    [null, null, null],
    [null, { type: 'test', color: '#ff0000' }, null],
    [{ type: 'test', color: '#00ff00' }, { type: 'test', color: '#0000ff' }, null],
  ];

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
  } as ColorScheme;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(renderer.initCanvas).mockReturnValue({
      canvas: document.createElement('canvas'),
      ctx: {} as CanvasRenderingContext2D,
      config: {} as GameConfig,
      theme: mockColorScheme,
    });
  });

  it('should render canvas element', () => {
    render(
      <GameCanvas
        board={mockBoard}
        currentPiece={null}
        ghostPiece={null}
        cellSize={30}
        colorScheme={mockColorScheme}
      />
    );

    const canvas = screen.getByTestId('game-canvas');
    expect(canvas).toBeInTheDocument();
    expect(canvas.tagName).toBe('CANVAS');
  });

  it('should initialize canvas on mount', () => {
    const { container } = render(
      <GameCanvas
        board={mockBoard}
        currentPiece={null}
        ghostPiece={null}
        cellSize={30}
        colorScheme={mockColorScheme}
      />
    );

    const canvas = container.querySelector('canvas');
    expect(renderer.initCanvas).toHaveBeenCalledWith(
      canvas,
      expect.objectContaining({
        boardDimensions: expect.objectContaining({
          width: mockBoard[0]!.length,
          height: mockBoard.length,
        }),
        rendering: expect.objectContaining({
          cellSize: 30,
        }),
        features: expect.objectContaining({
          ghostPieceEnabled: true,
          holdEnabled: true,
          nextPieceCount: 5,
        }),
      }),
      mockColorScheme
    );
  });

  it('should render game when props change', () => {
    const currentPiece: ActivePiece = {
      type: 'test',
      shape: [[1, 1] as const] as const,
      position: [1, 1] as const,
      color: '#ff0000',
      rotation: 0,
    };

    const ghostPiece: GhostPiece = {
      position: [1, 2] as const,
      shape: [[1, 1] as const] as const,
    };

    render(
      <GameCanvas
        board={mockBoard}
        currentPiece={currentPiece}
        ghostPiece={ghostPiece}
        cellSize={30}
        colorScheme={mockColorScheme}
      />
    );

    expect(renderer.renderGame).toHaveBeenCalledWith(
      expect.anything(),
      mockBoard,
      currentPiece,
      ghostPiece
    );
  });

  it('should apply custom className', () => {
    render(
      <GameCanvas
        board={mockBoard}
        currentPiece={null}
        ghostPiece={null}
        cellSize={30}
        colorScheme={mockColorScheme}
        className="custom-canvas"
      />
    );

    const canvas = screen.getByTestId('game-canvas');
    expect(canvas).toHaveClass('custom-canvas');
  });

  it('should re-initialize when board dimensions change', () => {
    const { rerender } = render(
      <GameCanvas
        board={mockBoard}
        currentPiece={null}
        ghostPiece={null}
        cellSize={30}
        colorScheme={mockColorScheme}
      />
    );

    const newBoard: Board = [
      [null, null, null, null],
      [null, null, null, null],
    ];

    rerender(
      <GameCanvas
        board={newBoard}
        currentPiece={null}
        ghostPiece={null}
        cellSize={30}
        colorScheme={mockColorScheme}
      />
    );

    expect(renderer.initCanvas).toHaveBeenCalledTimes(2);
  });

  it('should re-initialize when color scheme changes', () => {
    const { rerender } = render(
      <GameCanvas
        board={mockBoard}
        currentPiece={null}
        ghostPiece={null}
        cellSize={30}
        colorScheme={mockColorScheme}
      />
    );

    const newColorScheme: ColorScheme = {
      ...mockColorScheme,
      name: 'new-theme',
    };

    rerender(
      <GameCanvas
        board={mockBoard}
        currentPiece={null}
        ghostPiece={null}
        cellSize={30}
        colorScheme={newColorScheme}
      />
    );

    expect(renderer.initCanvas).toHaveBeenCalledTimes(2);
  });

  it('should handle features configuration', () => {
    render(
      <GameCanvas
        board={mockBoard}
        currentPiece={null}
        ghostPiece={null}
        cellSize={30}
        colorScheme={mockColorScheme}
        features={{
          ghostPieceEnabled: false,
          holdEnabled: false,
          nextPieceCount: 0,
        }}
      />
    );

    expect(renderer.initCanvas).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        features: {
          ghostPieceEnabled: false,
          holdEnabled: false,
          nextPieceCount: 0,
        },
      }),
      expect.anything()
    );
  });
});