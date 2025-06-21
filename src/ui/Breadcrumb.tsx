import React from 'react';
import type { ColorScheme } from '../game/types';

export interface BreadcrumbItem {
  label: string;
  onClick?: () => void;
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
  colorScheme: ColorScheme;
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ items, colorScheme }) => {
  const { colors } = colorScheme;
  
  const containerStyle: React.CSSProperties = {
    position: 'absolute',
    top: '60px',
    left: '40px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    fontFamily: 'monospace',
    fontSize: '16px',
    backgroundColor: `${colors.ui.panel}cc`,
    padding: '8px 16px',
    borderRadius: '4px',
    backdropFilter: 'blur(4px)',
  };
  
  const itemStyle: React.CSSProperties = {
    color: colors.textSecondary,
    cursor: 'pointer',
    transition: 'color 0.2s ease',
  };
  
  const separatorStyle: React.CSSProperties = {
    color: colors.textSecondary,
    userSelect: 'none',
    opacity: 0.5,
    fontSize: '18px',
  };
  
  const currentItemStyle: React.CSSProperties = {
    color: colors.text,
    fontWeight: 'bold',
  };
  
  return (
    <div style={containerStyle} data-testid="breadcrumb">
      {items.map((item, index) => (
        <React.Fragment key={index}>
          {index > 0 && <span style={separatorStyle}>/</span>}
          <span
            style={
              index === items.length - 1
                ? currentItemStyle
                : item.onClick
                ? itemStyle
                : { ...itemStyle, cursor: 'default' }
            }
            onClick={item.onClick}
            onMouseEnter={(e) => {
              if (item.onClick && index !== items.length - 1) {
                e.currentTarget.style.color = colors.text;
              }
            }}
            onMouseLeave={(e) => {
              if (item.onClick && index !== items.length - 1) {
                e.currentTarget.style.color = colors.textSecondary;
              }
            }}
          >
            {item.label}
          </span>
        </React.Fragment>
      ))}
    </div>
  );
};