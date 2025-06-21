import React from 'react';
import type { ColorScheme, HighScore } from '../game/types';
import { Breadcrumb } from './Breadcrumb';
import { getPolyominoName } from '../utils/polyominoNames';

export interface HighScoresScreenProps {
  colorScheme: ColorScheme;
  highScores: HighScore[];
  polyominoSize: number;
  onBack: () => void;
  onClear?: () => void;
  onSizeChange?: (size: number) => void;
  availableSizes?: number[];
}

export const HighScoresScreen: React.FC<HighScoresScreenProps> = ({
  colorScheme,
  highScores,
  polyominoSize,
  onBack,
  onClear,
  onSizeChange,
  availableSizes = [4, 5, 6, 7, 8, 9],
}) => {
  const { colors } = colorScheme;
  
  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    backgroundColor: colors.background,
    color: colors.text,
    fontFamily: 'monospace',
    position: 'relative',
  };
  
  const panelStyle: React.CSSProperties = {
    backgroundColor: colors.ui.panel,
    border: `2px solid ${colors.ui.border}`,
    borderRadius: '8px',
    padding: '40px',
    minWidth: '600px',
  };
  
  const titleStyle: React.CSSProperties = {
    fontSize: '36px',
    fontWeight: 'bold',
    marginBottom: '10px',
    textAlign: 'center',
  };
  
  const subtitleStyle: React.CSSProperties = {
    fontSize: '20px',
    color: colors.textSecondary,
    marginBottom: '30px',
    textAlign: 'center',
  };
  
  const tableStyle: React.CSSProperties = {
    width: '100%',
    borderCollapse: 'collapse',
    marginBottom: '30px',
  };
  
  const headerStyle: React.CSSProperties = {
    borderBottom: `2px solid ${colors.ui.border}`,
    padding: '10px',
    textAlign: 'left',
    fontWeight: 'bold',
  };
  
  const cellStyle: React.CSSProperties = {
    borderBottom: `1px solid ${colors.ui.border}`,
    padding: '10px',
  };
  
  const rankStyle: React.CSSProperties = {
    ...cellStyle,
    width: '50px',
    textAlign: 'center',
    fontWeight: 'bold',
  };
  
  const scoreStyle: React.CSSProperties = {
    ...cellStyle,
    fontWeight: 'bold',
    color: colors.pieces[0],
  };
  
  const buttonStyle: React.CSSProperties = {
    backgroundColor: 'transparent',
    color: colors.textSecondary,
    border: 'none',
    borderRadius: '4px',
    padding: '10px 20px',
    fontSize: '16px',
    fontFamily: 'monospace',
    cursor: 'pointer',
    marginTop: '30px',
    transition: 'color 0.2s ease',
    textDecoration: 'underline',
  };
  
  const emptyMessageStyle: React.CSSProperties = {
    textAlign: 'center',
    color: colors.textSecondary,
    padding: '40px',
    fontSize: '18px',
  };
  
  // Format time from seconds to MM:SS
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Format date to YYYY-MM-DD HH:MM
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}`;
  };
  
  return (
    <div data-testid="high-scores-screen" style={containerStyle}>
      <Breadcrumb
        items={[
          { label: 'Main Menu', onClick: onBack },
          { label: 'High Scores' },
        ]}
        colorScheme={colorScheme}
      />
      <h1 style={{
        ...titleStyle,
        marginBottom: '20px',
      }}>High Scores</h1>
      <div style={panelStyle}>
        {onSizeChange ? (
          <div style={{ ...subtitleStyle, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
            <label style={{ fontSize: '18px' }}>Size:</label>
            <select
              value={polyominoSize}
              onChange={(e) => onSizeChange(parseInt(e.target.value))}
              style={{
                backgroundColor: colors.ui.button,
                color: colors.text,
                border: `2px solid ${colors.ui.border}`,
                borderRadius: '4px',
                padding: '5px 10px',
                fontSize: '18px',
                fontFamily: 'monospace',
                cursor: 'pointer',
              }}
            >
              {availableSizes.map(size => (
                <option key={size} value={size}>
                  {getPolyominoName(size)}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <h2 style={subtitleStyle}>{getPolyominoName(polyominoSize)}</h2>
        )}
        
        {highScores.length === 0 ? (
          <div style={emptyMessageStyle}>
            No high scores yet. Be the first to set a record!
          </div>
        ) : (
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={headerStyle}>Rank</th>
                <th style={headerStyle}>Score</th>
                <th style={headerStyle}>Level</th>
                <th style={headerStyle}>Lines</th>
                <th style={headerStyle}>Time</th>
                <th style={headerStyle}>Date</th>
              </tr>
            </thead>
            <tbody>
              {highScores.slice(0, 10).map((score, index) => (
                <tr key={index}>
                  <td style={rankStyle}>#{index + 1}</td>
                  <td style={scoreStyle}>{score.score.toLocaleString()}</td>
                  <td style={cellStyle}>{score.level}</td>
                  <td style={cellStyle}>{score.lines}</td>
                  <td style={cellStyle}>{formatTime(score.time)}</td>
                  <td style={cellStyle}>{formatDate(score.date)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
          <button
            style={buttonStyle}
            onClick={onBack}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = colors.text;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = colors.textSecondary;
            }}
          >
            ← Back
          </button>
          {highScores.length > 0 && onClear && (
            <button
              style={{
                ...buttonStyle,
                backgroundColor: '#ff4757',
              }}
              onClick={() => {
                if (confirm('Are you sure you want to clear all high scores?')) {
                  onClear();
                }
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = '0.8';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = '1';
              }}
            >
              Clear Scores
            </button>
          )}
        </div>
      </div>
    </div>
  );
};