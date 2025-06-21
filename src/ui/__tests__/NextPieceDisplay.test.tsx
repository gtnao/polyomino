import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { NextPieceDisplay } from '../NextPieceDisplay';
import type { Polyomino, ColorScheme } from '../../game/types';

describe('NextPieceDisplay', () => {
  const mockPolyominoes: Polyomino[] = [
    {
      id: 'piece1',
      cells: [[1, 1], [1, 0]],
      rotations: 4,
    },
    {
      id: 'piece2',
      cells: [[1, 1, 1]],
      rotations: 2,
    },
    {
      id: 'piece3',
      cells: [[1, 0], [1, 1]],
      rotations: 4,
    },
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
  };

  it('should render next pieces display', () => {
    render(
      <NextPieceDisplay
        nextPieces={mockPolyominoes}
        colorScheme={mockColorScheme}
      />
    );

    const container = screen.getByTestId('next-piece-display');
    expect(container).toBeInTheDocument();
  });

  it('should render correct number of pieces', () => {
    render(
      <NextPieceDisplay
        nextPieces={mockPolyominoes}
        colorScheme={mockColorScheme}
      />
    );

    const canvases = screen.getAllByTestId(/^next-piece-\d+$/);
    expect(canvases).toHaveLength(3);
  });

  it('should render empty state when no pieces', () => {
    render(
      <NextPieceDisplay
        nextPieces={[]}
        colorScheme={mockColorScheme}
      />
    );

    const container = screen.getByTestId('next-piece-display');
    const canvases = screen.queryAllByTestId(/^next-piece-\d+$/);
    
    expect(container).toBeInTheDocument();
    expect(canvases).toHaveLength(0);
  });

  it('should apply custom className', () => {
    render(
      <NextPieceDisplay
        nextPieces={mockPolyominoes}
        colorScheme={mockColorScheme}
        className="custom-next-display"
      />
    );

    const container = screen.getByTestId('next-piece-display');
    expect(container).toHaveClass('custom-next-display');
  });

  it('should render with custom cell size', () => {
    render(
      <NextPieceDisplay
        nextPieces={mockPolyominoes}
        colorScheme={mockColorScheme}
        cellSize={20}
      />
    );

    const canvases = screen.getAllByTestId(/^next-piece-\d+$/);
    expect(canvases[0]).toHaveAttribute('width', '60'); // 3 cells * 20
  });

  it('should limit displayed pieces to maxPieces', () => {
    render(
      <NextPieceDisplay
        nextPieces={mockPolyominoes}
        colorScheme={mockColorScheme}
        maxPieces={2}
      />
    );

    const canvases = screen.getAllByTestId(/^next-piece-\d+$/);
    expect(canvases).toHaveLength(2);
  });

  it('should show title when provided', () => {
    render(
      <NextPieceDisplay
        nextPieces={mockPolyominoes}
        colorScheme={mockColorScheme}
        showTitle
      />
    );

    expect(screen.getByText('Next')).toBeInTheDocument();
  });

  it('should render pieces with proper styling', () => {
    render(
      <NextPieceDisplay
        nextPieces={mockPolyominoes}
        colorScheme={mockColorScheme}
      />
    );

    const pieceContainers = screen.getAllByTestId(/^next-piece-container-\d+$/);
    expect(pieceContainers[0]).toHaveStyle({
      opacity: '1',
    });
    expect(pieceContainers[1]).toHaveStyle({
      opacity: '0.8',
    });
    expect(pieceContainers[2]).toHaveStyle({
      opacity: '0.6',
    });
  });
});