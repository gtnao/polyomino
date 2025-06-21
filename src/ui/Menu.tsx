import React from 'react';
import type { ColorScheme } from '../game/types';
import { Icon, type IconName } from './Icon';

interface MenuItem {
  id: string;
  label: string;
  action: () => void;
  disabled?: boolean;
  icon?: IconName;
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
  selectedIndex: _selectedIndex = 0,
  onSelectionChange: _onSelectionChange,
  title,
  direction = 'vertical',
  className,
}) => {
  const handleItemClick = (index: number) => {
    const item = items[index];
    if (!item || item.disabled) return;

    if (_onSelectionChange) {
      _onSelectionChange(index);
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

  const getItemStyle = (_index: number, item: MenuItem): React.CSSProperties => {
    const isDisabled = item.disabled;

    return {
      padding: '12px 20px',
      backgroundColor: 'transparent',
      color: isDisabled 
        ? colorScheme.colors.grid 
        : colorScheme.colors.text,
      border: '2px solid transparent',
      borderRadius: '4px',
      cursor: isDisabled ? 'not-allowed' : 'pointer',
      fontSize: '16px',
      fontWeight: 'normal',
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
          data-disabled={item.disabled}
          style={getItemStyle(index, item)}
          onClick={() => handleItemClick(index)}
          onMouseEnter={(e) => {
            if (!item.disabled) {
              e.currentTarget.style.backgroundColor = colorScheme.colors.ui.buttonHover;
              e.currentTarget.style.transform = 'scale(1.02)';
            }
          }}
          onMouseLeave={(e) => {
            if (!item.disabled) {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.transform = 'scale(1)';
            }
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            {item.icon && (
              <Icon 
                name={item.icon} 
                size={20} 
                color={item.disabled ? colorScheme.colors.grid : colorScheme.colors.text}
              />
            )}
            <span>{item.label}</span>
          </div>
        </div>
      ))}
    </div>
  );
};