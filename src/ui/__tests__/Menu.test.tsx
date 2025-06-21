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

  it('should highlight selected item', () => {
    render(
      <Menu
        items={mockItems}
        colorScheme={mockColorScheme}
        selectedIndex={1}
      />
    );

    const settingsItem = screen.getByTestId('menu-item-settings');
    expect(settingsItem).toHaveAttribute('data-selected', 'true');
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

    fireEvent.click(disabledItem);
    expect(itemsWithDisabled[4]!.action).not.toHaveBeenCalled();
  });

  it('should handle keyboard navigation', () => {
    const onSelectionChange = vi.fn();
    
    render(
      <Menu
        items={mockItems}
        colorScheme={mockColorScheme}
        selectedIndex={0}
        onSelectionChange={onSelectionChange}
      />
    );

    const menu = screen.getByTestId('menu');
    
    fireEvent.keyDown(menu, { key: 'ArrowDown' });
    expect(onSelectionChange).toHaveBeenCalledWith(1);

    fireEvent.keyDown(menu, { key: 'ArrowUp' });
    expect(onSelectionChange).toHaveBeenCalledWith(3); // Wrap to end
  });

  it('should trigger action on Enter key', () => {
    const onSelectionChange = vi.fn();
    
    render(
      <Menu
        items={mockItems}
        colorScheme={mockColorScheme}
        selectedIndex={0}
        onSelectionChange={onSelectionChange}
      />
    );

    const menu = screen.getByTestId('menu');
    fireEvent.keyDown(menu, { key: 'Enter' });
    expect(mockItems[0]!.action).toHaveBeenCalledTimes(1);
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