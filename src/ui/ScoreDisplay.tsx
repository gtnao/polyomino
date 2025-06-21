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
}

const StatItem: React.FC<StatItemProps> = ({ 
  label, 
  value, 
  testId, 
  colorScheme,
  size = 'medium' 
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
      {label && (
        <span 
          style={{ 
            color: colorScheme.colors.text, 
            fontSize: labelSize,
            opacity: 0.8,
          }}
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

  return (
    <div
      className={className}
      data-testid="score-display"
      style={containerStyle}
    >
      <StatItem
        {...(showLabels && { label: 'Score' })}
        value={formatNumber(stats.score)}
        testId="score-value"
        colorScheme={colorScheme}
        size="large"
      />
      
      <StatItem
        {...(showLabels && { label: 'Level' })}
        value={stats.level.toString()}
        testId="level-value"
        colorScheme={colorScheme}
      />
      
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
            {...(showLabels && { label: 'APM' })}
            value={apm.toFixed(1)}
            testId="apm-value"
            colorScheme={colorScheme}
            size="small"
          />
          
          <StatItem
            {...(showLabels && { label: 'PPS' })}
            value={pps.toFixed(2)}
            testId="pps-value"
            colorScheme={colorScheme}
            size="small"
          />
        </>
      )}
    </div>
  );
};