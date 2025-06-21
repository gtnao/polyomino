import React from 'react';
import type { ColorScheme } from '../game/types';

interface GameLayoutProps {
  children: React.ReactNode;
  colorScheme: ColorScheme;
  leftSidebar?: React.ReactNode;
  rightSidebar?: React.ReactNode;
  fullscreen?: boolean;
  centerContent?: boolean;
  responsive?: boolean;
  className?: string;
}

export const GameLayout: React.FC<GameLayoutProps> = ({
  children,
  colorScheme,
  leftSidebar,
  rightSidebar,
  fullscreen = false,
  centerContent = false,
  responsive = true,
  className,
}) => {
  const layoutStyle: React.CSSProperties = {
    display: 'flex',
    backgroundColor: colorScheme.colors.background,
    color: colorScheme.colors.text,
    minHeight: fullscreen ? '100vh' : 'auto',
    height: fullscreen ? '100vh' : 'auto',
    width: fullscreen ? '100vw' : 'auto',
    fontFamily: 'monospace',
    overflow: fullscreen ? 'hidden' : 'auto',
  };

  const mainContentStyle: React.CSSProperties = {
    flex: 1,
    display: centerContent ? 'flex' : 'block',
    alignItems: centerContent ? 'center' : 'stretch',
    justifyContent: centerContent ? 'center' : 'flex-start',
    padding: '20px',
    minWidth: 0, // Allow content to shrink
  };

  const sidebarStyle: React.CSSProperties = {
    minWidth: '200px',
    maxWidth: '300px',
    padding: '20px',
    borderLeft: rightSidebar ? `1px solid ${colorScheme.colors.ui.border}` : 'none',
    borderRight: leftSidebar ? `1px solid ${colorScheme.colors.ui.border}` : 'none',
  };

  // Note: CSS-in-JS doesn't support media queries directly
  // In a real implementation, we'd use a CSS-in-JS library or CSS modules

  return (
    <div
      className={className}
      data-testid="game-layout"
      data-responsive={responsive}
      style={layoutStyle}
    >
      {leftSidebar && (
        <aside
          data-testid="left-sidebar"
          style={{
            ...sidebarStyle,
            borderRight: `1px solid ${colorScheme.colors.ui.border}`,
            borderLeft: 'none',
          }}
        >
          {leftSidebar}
        </aside>
      )}
      
      <main
        data-testid="main-content"
        style={mainContentStyle}
      >
        {children}
      </main>
      
      {rightSidebar && (
        <aside
          data-testid="right-sidebar"
          style={{
            ...sidebarStyle,
            borderLeft: `1px solid ${colorScheme.colors.ui.border}`,
            borderRight: 'none',
          }}
        >
          {rightSidebar}
        </aside>
      )}
    </div>
  );
};