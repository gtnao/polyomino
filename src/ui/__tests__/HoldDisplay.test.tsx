import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { HoldDisplay } from '../HoldDisplay';
import type { Polyomino, ColorScheme } from '../../game/types';

describe('HoldDisplay', () => {
  const mockPolyomino: Polyomino = {
    id: 'test-piece',
    cells: [[0, 0], [1, 0], [0, 1], [1, 1]],
    rotations: 1,
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

  it('should render hold display container', () => {
    render(
      <HoldDisplay
        heldPiece={null}
        colorScheme={mockColorScheme}
        canHold={true}
      />
    );

    const container = screen.getByTestId('hold-display');
    expect(container).toBeInTheDocument();
  });

  it('should render held piece when provided', () => {
    render(
      <HoldDisplay
        heldPiece={mockPolyomino}
        colorScheme={mockColorScheme}
        canHold={true}
      />
    );

    const canvas = screen.getByTestId('hold-piece-canvas');
    expect(canvas).toBeInTheDocument();
  });

  it('should show empty state when no held piece', () => {
    render(
      <HoldDisplay
        heldPiece={null}
        colorScheme={mockColorScheme}
        canHold={true}
      />
    );

    const emptyState = screen.getByTestId('hold-empty-state');
    expect(emptyState).toBeInTheDocument();
  });

  it('should apply disabled style when cannot hold', () => {
    render(
      <HoldDisplay
        heldPiece={mockPolyomino}
        colorScheme={mockColorScheme}
        canHold={false}
      />
    );

    const container = screen.getByTestId('hold-display');
    expect(container).toHaveStyle({ opacity: '0.5' });
  });

  it('should apply custom className', () => {
    render(
      <HoldDisplay
        heldPiece={null}
        colorScheme={mockColorScheme}
        canHold={true}
        className="custom-hold"
      />
    );

    const container = screen.getByTestId('hold-display');
    expect(container).toHaveClass('custom-hold');
  });

  it('should render with custom cell size', () => {
    render(
      <HoldDisplay
        heldPiece={mockPolyomino}
        colorScheme={mockColorScheme}
        canHold={true}
        cellSize={25}
      />
    );

    const canvas = screen.getByTestId('hold-piece-canvas');
    expect(canvas).toHaveAttribute('width', '125'); // (max(2,2,4) + 1) * 25 = 5 * 25
  });

  it('should show title when enabled', () => {
    render(
      <HoldDisplay
        heldPiece={null}
        colorScheme={mockColorScheme}
        canHold={true}
        showTitle
      />
    );

    expect(screen.getByText('Hold')).toBeInTheDocument();
  });

  it('should apply hover effect when can hold', () => {
    const { container } = render(
      <HoldDisplay
        heldPiece={mockPolyomino}
        colorScheme={mockColorScheme}
        canHold={true}
      />
    );

    const display = container.querySelector('[data-testid="hold-display"]');
    expect(display).toHaveStyle({
      cursor: 'pointer',
    });
  });

  it('should not apply hover effect when cannot hold', () => {
    const { container } = render(
      <HoldDisplay
        heldPiece={mockPolyomino}
        colorScheme={mockColorScheme}
        canHold={false}
      />
    );

    const display = container.querySelector('[data-testid="hold-display"]');
    expect(display).toHaveStyle({
      cursor: 'not-allowed',
    });
  });
});