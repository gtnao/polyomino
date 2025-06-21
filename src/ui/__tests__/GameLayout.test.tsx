import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { GameLayout } from '../GameLayout';
import type { ColorScheme } from '../../game/types';

describe('GameLayout', () => {
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

  it('should render game layout', () => {
    render(
      <GameLayout colorScheme={mockColorScheme}>
        <div>Game Content</div>
      </GameLayout>
    );

    const layout = screen.getByTestId('game-layout');
    expect(layout).toBeInTheDocument();
    expect(screen.getByText('Game Content')).toBeInTheDocument();
  });

  it('should render with left sidebar', () => {
    render(
      <GameLayout 
        colorScheme={mockColorScheme}
        leftSidebar={<div>Left Sidebar</div>}
      >
        <div>Main Content</div>
      </GameLayout>
    );

    expect(screen.getByText('Left Sidebar')).toBeInTheDocument();
    expect(screen.getByTestId('left-sidebar')).toBeInTheDocument();
  });

  it('should render with right sidebar', () => {
    render(
      <GameLayout 
        colorScheme={mockColorScheme}
        rightSidebar={<div>Right Sidebar</div>}
      >
        <div>Main Content</div>
      </GameLayout>
    );

    expect(screen.getByText('Right Sidebar')).toBeInTheDocument();
    expect(screen.getByTestId('right-sidebar')).toBeInTheDocument();
  });

  it('should render with both sidebars', () => {
    render(
      <GameLayout 
        colorScheme={mockColorScheme}
        leftSidebar={<div>Left Sidebar</div>}
        rightSidebar={<div>Right Sidebar</div>}
      >
        <div>Main Content</div>
      </GameLayout>
    );

    expect(screen.getByTestId('left-sidebar')).toBeInTheDocument();
    expect(screen.getByTestId('right-sidebar')).toBeInTheDocument();
    expect(screen.getByText('Main Content')).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    render(
      <GameLayout 
        colorScheme={mockColorScheme}
        className="custom-layout"
      >
        <div>Content</div>
      </GameLayout>
    );

    const layout = screen.getByTestId('game-layout');
    expect(layout).toHaveClass('custom-layout');
  });

  it('should apply background color from color scheme', () => {
    render(
      <GameLayout colorScheme={mockColorScheme}>
        <div>Content</div>
      </GameLayout>
    );

    const layout = screen.getByTestId('game-layout');
    expect(layout).toHaveStyle({
      backgroundColor: '#000000',
    });
  });

  it('should handle fullscreen mode', () => {
    render(
      <GameLayout 
        colorScheme={mockColorScheme}
        fullscreen
      >
        <div>Content</div>
      </GameLayout>
    );

    const layout = screen.getByTestId('game-layout');
    expect(layout).toHaveStyle({
      height: '100vh',
      width: '100vw',
    });
  });

  it('should center content when specified', () => {
    render(
      <GameLayout 
        colorScheme={mockColorScheme}
        centerContent
      >
        <div>Content</div>
      </GameLayout>
    );

    const mainContent = screen.getByTestId('main-content');
    expect(mainContent).toHaveStyle({
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    });
  });

  it('should apply responsive layout', () => {
    render(
      <GameLayout 
        colorScheme={mockColorScheme}
        responsive
        leftSidebar={<div>Left</div>}
        rightSidebar={<div>Right</div>}
      >
        <div>Content</div>
      </GameLayout>
    );

    const layout = screen.getByTestId('game-layout');
    expect(layout).toHaveAttribute('data-responsive', 'true');
  });
});