import React from 'react';
import type { ColorScheme } from '../game/types';

interface MenuItem {
  id: string;
  label: string;
  action: () => void;
  disabled?: boolean;
}

interface MenuProps {
  items: MenuItem[];
  colorScheme: ColorScheme;
  selectedIndex?: number;
  onSelectionChange?: (index: number) => void;
  title?: string;
  direction?: 'vertical' | 'horizontal';
  className?: string;
}

export const Menu: React.FC<MenuProps> = ({
  items,
  colorScheme,
  selectedIndex = 0,
  onSelectionChange,
  title,
  direction = 'vertical',
  className,
}) => {
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (!onSelectionChange) return;

    const enabledItems = items.filter(item => !item.disabled);
    const selectedItem = items[selectedIndex];
    if (!selectedItem) return;
    
    const currentEnabledIndex = enabledItems.findIndex(
      item => item.id === selectedItem.id
    );

    switch (event.key) {
      case 'ArrowDown':
      case 'ArrowRight':
        event.preventDefault();
        const nextIndex = (currentEnabledIndex + 1) % enabledItems.length;
        const nextEnabledItem = enabledItems[nextIndex];
        if (nextEnabledItem) {
          const nextItemIndex = items.findIndex(
            item => item.id === nextEnabledItem.id
          );
          onSelectionChange(nextItemIndex);
        }
        break;

      case 'ArrowUp':
      case 'ArrowLeft':
        event.preventDefault();
        const prevIndex = currentEnabledIndex === 0 
          ? enabledItems.length - 1 
          : currentEnabledIndex - 1;
        const prevEnabledItem = enabledItems[prevIndex];
        if (prevEnabledItem) {
          const prevItemIndex = items.findIndex(
            item => item.id === prevEnabledItem.id
          );
          onSelectionChange(prevItemIndex);
        }
        break;

      case 'Enter':
      case ' ':
        event.preventDefault();
        if (selectedItem && !selectedItem.disabled) {
          selectedItem.action();
        }
        break;
    }
  };

  const handleItemClick = (index: number) => {
    const item = items[index];
    if (!item || item.disabled) return;

    if (onSelectionChange) {
      onSelectionChange(index);
    }
    item.action();
  };

  const menuStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: direction === 'vertical' ? 'column' : 'row',
    gap: '10px',
    padding: '20px',
    backgroundColor: colorScheme.colors.ui.panel,
    border: `2px solid ${colorScheme.colors.ui.border}`,
    borderRadius: '8px',
    outline: 'none',
  };

  const getItemStyle = (index: number, item: MenuItem): React.CSSProperties => {
    const isSelected = index === selectedIndex;
    const isDisabled = item.disabled;

    return {
      padding: '12px 20px',
      backgroundColor: isSelected 
        ? colorScheme.colors.ui.buttonHover 
        : 'transparent',
      color: isDisabled 
        ? colorScheme.colors.grid 
        : colorScheme.colors.text,
      border: isSelected 
        ? `2px solid ${colorScheme.colors.text}` 
        : '2px solid transparent',
      borderRadius: '4px',
      cursor: isDisabled ? 'not-allowed' : 'pointer',
      fontSize: '16px',
      fontWeight: isSelected ? 'bold' : 'normal',
      textAlign: 'center' as const,
      transition: 'all 0.2s ease',
      userSelect: 'none' as const,
      opacity: isDisabled ? 0.5 : 1,
    };
  };

  return (
    <div
      className={className}
      data-testid="menu"
      style={menuStyle}
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      {title && (
        <h2
          style={{
            margin: '0 0 20px 0',
            color: colorScheme.colors.text,
            fontSize: '24px',
            fontWeight: 'bold',
            textAlign: 'center',
          }}
        >
          {title}
        </h2>
      )}
      
      {items.map((item, index) => (
        <div
          key={item.id}
          data-testid={`menu-item-${item.id}`}
          data-selected={index === selectedIndex}
          data-disabled={item.disabled}
          style={getItemStyle(index, item)}
          onClick={() => handleItemClick(index)}
          onMouseEnter={() => {
            if (!item.disabled && onSelectionChange) {
              onSelectionChange(index);
            }
          }}
        >
          {item.label}
        </div>
      ))}
    </div>
  );
};