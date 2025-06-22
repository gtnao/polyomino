import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { Menu } from '../Menu';
import type { ColorScheme } from '../../game/types';

describe('Menu', () => {
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

  const mockItems = [
    { id: 'start', label: 'Start Game', action: vi.fn() },
    { id: 'settings', label: 'Settings', action: vi.fn() },
    { id: 'scores', label: 'High Scores', action: vi.fn() },
    { id: 'exit', label: 'Exit', action: vi.fn() },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render menu', () => {
    render(
      <Menu
        items={mockItems}
        colorScheme={mockColorScheme}
      />
    );

    const menu = screen.getByTestId('menu');
    expect(menu).toBeInTheDocument();
  });

  it('should render all menu items', () => {
    render(
      <Menu
        items={mockItems}
        colorScheme={mockColorScheme}
      />
    );

    mockItems.forEach(item => {
      expect(screen.getByText(item.label)).toBeInTheDocument();
    });
  });

  it('should handle item click', () => {
    render(
      <Menu
        items={mockItems}
        colorScheme={mockColorScheme}
      />
    );

    fireEvent.click(screen.getByText('Start Game'));
    expect(mockItems[0]!.action).toHaveBeenCalledTimes(1);
  });

  it('should handle hover effects', () => {
    render(
      <Menu
        items={mockItems}
        colorScheme={mockColorScheme}
      />
    );

    const startItem = screen.getByTestId('menu-item-start');
    
    // Test mouse enter
    fireEvent.mouseEnter(startItem);
    // Check that inline styles were applied
    // Note: backgroundColor might be in rgb format
    expect(startItem.style.backgroundColor).toBeTruthy();
    expect(startItem.style.backgroundColor).not.toBe('transparent');
    expect(startItem.style.transform).toBe('scale(1.02)');
    
    // Test mouse leave
    fireEvent.mouseLeave(startItem);
    expect(startItem.style.backgroundColor).toBe('transparent');
    expect(startItem.style.transform).toBe('scale(1)');
  });

  it('should apply custom className', () => {
    render(
      <Menu
        items={mockItems}
        colorScheme={mockColorScheme}
        className="custom-menu"
      />
    );

    const menu = screen.getByTestId('menu');
    expect(menu).toHaveClass('custom-menu');
  });

  it('should show title when provided', () => {
    render(
      <Menu
        items={mockItems}
        colorScheme={mockColorScheme}
        title="Main Menu"
      />
    );

    expect(screen.getByText('Main Menu')).toBeInTheDocument();
  });

  it('should handle disabled items', () => {
    const itemsWithDisabled = [
      ...mockItems,
      { id: 'disabled', label: 'Disabled Item', action: vi.fn(), disabled: true },
    ];

    render(
      <Menu
        items={itemsWithDisabled}
        colorScheme={mockColorScheme}
      />
    );

    const disabledItem = screen.getByTestId('menu-item-disabled');
    expect(disabledItem).toHaveAttribute('data-disabled', 'true');
    expect(disabledItem).toHaveStyle({
      opacity: '0.5',
      cursor: 'not-allowed',
    });

    // Should not trigger hover effects
    const initialBgColor = disabledItem.style.backgroundColor;
    fireEvent.mouseEnter(disabledItem);
    // Background color should remain unchanged for disabled items
    expect(disabledItem.style.backgroundColor).toBe(initialBgColor);

    // Should not trigger action
    fireEvent.click(disabledItem);
    expect(itemsWithDisabled[4]!.action).not.toHaveBeenCalled();
  });


  it('should support vertical and horizontal layouts', () => {
    const { rerender } = render(
      <Menu
        items={mockItems}
        colorScheme={mockColorScheme}
        direction="vertical"
      />
    );

    let menu = screen.getByTestId('menu');
    expect(menu).toHaveStyle({ flexDirection: 'column' });

    rerender(
      <Menu
        items={mockItems}
        colorScheme={mockColorScheme}
        direction="horizontal"
      />
    );

    menu = screen.getByTestId('menu');
    expect(menu).toHaveStyle({ flexDirection: 'row' });
  });
});