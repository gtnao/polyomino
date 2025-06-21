import React from 'react';
import type { GameStats, ColorScheme } from '../game/types';
import { calculateAPM, calculatePPS } from '../game/scoring';

interface ScoreDisplayProps {
  stats: GameStats;
  colorScheme: ColorScheme;
  highScore?: number;
  showExtendedStats?: boolean;
  showLabels?: boolean;
  layout?: 'vertical' | 'compact';
  className?: string;
}

const formatNumber = (num: number): string => {
  return num.toLocaleString();
};

const formatTime = (startTime: number, endTime: number | null): string => {
  const end = endTime || Date.now();
  const seconds = Math.floor((end - startTime) / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

interface StatItemProps {
  label?: string;
  value: string;
  testId: string;
  colorScheme: ColorScheme;
  size?: 'small' | 'medium' | 'large';
  tooltip?: string;
}

const StatItem: React.FC<StatItemProps> = ({ 
  label, 
  value, 
  testId, 
  colorScheme,
  size = 'medium',
  tooltip
}) => {
  const fontSize = {
    small: '14px',
    medium: '18px',
    large: '24px',
  }[size];

  const labelSize = {
    small: '12px',
    medium: '14px',
    large: '16px',
  }[size];

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    position: 'relative',
  };

  const labelStyle: React.CSSProperties = {
    color: colorScheme.colors.text,
    fontSize: labelSize,
    opacity: 0.8,
    cursor: tooltip ? 'help' : 'default',
  };

  const tooltipStyle: React.CSSProperties = {
    position: 'absolute',
    bottom: '100%',
    left: '50%',
    transform: 'translateX(-50%)',
    backgroundColor: colorScheme.colors.ui.panel,
    color: colorScheme.colors.text,
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '12px',
    whiteSpace: 'nowrap',
    opacity: 0,
    pointerEvents: 'none',
    transition: 'opacity 0.2s ease',
    marginBottom: '4px',
    border: `1px solid ${colorScheme.colors.ui.border}`,
  };

  const [showTooltip, setShowTooltip] = React.useState(false);

  return (
    <div style={containerStyle}>
      {tooltip && showTooltip && (
        <span style={{ ...tooltipStyle, opacity: 1 }}>
          {tooltip}
        </span>
      )}
      {label && (
        <span 
          style={labelStyle}
          onMouseEnter={() => tooltip && setShowTooltip(true)}
          onMouseLeave={() => tooltip && setShowTooltip(false)}
        >
          {label}
        </span>
      )}
      <span 
        data-testid={testId}
        style={{ 
          color: colorScheme.colors.text, 
          fontSize,
          fontWeight: 'bold',
        }}
      >
        {value}
      </span>
    </div>
  );
};

export const ScoreDisplay: React.FC<ScoreDisplayProps> = ({
  stats,
  colorScheme,
  highScore,
  showExtendedStats = false,
  showLabels = true,
  layout = 'vertical',
  className,
}) => {
  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: layout === 'vertical' ? 'column' : 'row',
    gap: '15px',
    padding: '15px',
    backgroundColor: colorScheme.colors.ui.panel,
    border: `2px solid ${colorScheme.colors.ui.border}`,
    borderRadius: '8px',
  };

  const apm = calculateAPM(stats);
  const pps = calculatePPS(stats);
  
  // Calculate progress - simple and correct
  const linesInCurrentLevel = stats.lines % 5;
  const progressPercentage = (linesInCurrentLevel / 5) * 100;
  const linesToNext = 5 - linesInCurrentLevel;
  
  // Check if current score is a new high score
  const isNewHighScore = highScore !== undefined && stats.score > highScore && highScore > 0;

  return (
    <>
      {isNewHighScore && (
        <style>
          {`
            @keyframes pulse {
              0% { transform: scale(1); opacity: 1; }
              50% { transform: scale(1.1); opacity: 0.8; }
              100% { transform: scale(1); opacity: 1; }
            }
          `}
        </style>
      )}
      <div
        className={className}
        data-testid="score-display"
        style={containerStyle}
      >
        <div style={{ position: 'relative' }}>
        <StatItem
          {...(showLabels && { label: 'Score' })}
          value={formatNumber(stats.score)}
          testId="score-value"
          colorScheme={colorScheme}
          size="large"
        />
        {highScore !== undefined && stats.score > highScore && highScore > 0 && (
          <div style={{
            position: 'absolute',
            top: '-20px',
            right: '-10px',
            backgroundColor: colorScheme.colors.pieces[0] || '#ff6b6b',
            color: colorScheme.colors.background,
            padding: '2px 6px',
            borderRadius: '4px',
            fontSize: '12px',
            fontWeight: 'bold',
            animation: 'pulse 1s ease-in-out infinite',
          }}>
            NEW HIGH!
          </div>
        )}
      </div>
      
      <div style={{ minWidth: '80px' }}>
        <StatItem
          {...(showLabels && { label: 'Level' })}
          value={stats.level.toString()}
          testId="level-value"
          colorScheme={colorScheme}
        />
        {/* Level Progress Bar */}
        <div style={{ marginTop: '4px' }}>
          <div style={{
            width: '100%',
            height: '8px',
            backgroundColor: colorScheme.colors.ui.border,
            borderRadius: '4px',
            overflow: 'hidden',
            position: 'relative',
          }}>
            <div 
              data-testid="level-progress-bar"
              style={{
                width: `${progressPercentage}%`,
                height: '100%',
                backgroundColor: colorScheme.colors.pieces[0] || colorScheme.colors.ui.buttonHover,
                transition: 'width 0.3s ease-out',
                position: 'absolute',
                top: 0,
                left: 0,
                boxShadow: progressPercentage > 0 ? '0 0 4px rgba(255,255,255,0.3)' : 'none',
              }} 
            />
          </div>
          <div style={{
            fontSize: '10px',
            color: colorScheme.colors.textSecondary,
            marginTop: '2px',
            textAlign: 'center',
          }}>
            {linesToNext} to next
          </div>
        </div>
      </div>
      
      <StatItem
        {...(showLabels && { label: 'Lines' })}
        value={stats.lines.toString()}
        testId="lines-value"
        colorScheme={colorScheme}
      />
      
      <StatItem
        {...(showLabels && { label: 'Time' })}
        value={formatTime(stats.gameStartTime, stats.gameEndTime)}
        testId="time-value"
        colorScheme={colorScheme}
      />
      
      {highScore !== undefined && (
        <StatItem
          {...(showLabels && { label: 'High' })}
          value={formatNumber(highScore)}
          testId="high-score-value"
          colorScheme={colorScheme}
        />
      )}

      {showExtendedStats && (
        <>
          <StatItem
            {...(showLabels && { label: 'APM', tooltip: 'Actions Per Minute' })}
            value={apm.toFixed(1)}
            testId="apm-value"
            colorScheme={colorScheme}
            size="small"
          />
          
          <StatItem
            {...(showLabels && { label: 'PPS', tooltip: 'Pieces Per Second' })}
            value={pps.toFixed(2)}
            testId="pps-value"
            colorScheme={colorScheme}
            size="small"
          />
        </>
      )}
      </div>
    </>
  );
};