import React from 'react';
import type { ColorScheme, HighScore } from '../game/types';

export interface HighScoresScreenProps {
  colorScheme: ColorScheme;
  highScores: HighScore[];
  polyominoSize: number;
  onBack: () => void;
}

export const HighScoresScreen: React.FC<HighScoresScreenProps> = ({
  colorScheme,
  highScores,
  polyominoSize,
  onBack,
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
    backgroundColor: colors.ui.button,
    color: colors.text,
    border: `2px solid ${colors.ui.border}`,
    borderRadius: '4px',
    padding: '10px 20px',
    fontSize: '16px',
    fontFamily: 'monospace',
    cursor: 'pointer',
    marginTop: '20px',
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
  
  return (
    <div data-testid="high-scores-screen" style={containerStyle}>
      <div style={panelStyle}>
        <h1 style={titleStyle}>High Scores</h1>
        <h2 style={subtitleStyle}>{polyominoSize}-Polyomino</h2>
        
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
                  <td style={cellStyle}>{score.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        
        <button
          style={buttonStyle}
          onClick={onBack}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = colors.ui.buttonHover;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = colors.ui.button;
          }}
        >
          Back to Main Menu
        </button>
      </div>
    </div>
  );
};