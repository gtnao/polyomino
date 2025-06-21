import type { GameStats, PieceType } from './types';

export type ScoreAction = 'place' | 'softDrop' | 'hardDrop' | 'lineClear';
export type StatAction = 'piecePlaced' | 'linesCleared' | 'move' | 'rotate' | 'hold' | 'hardDrop' | 'softDrop';

/**
 * Calculates score for a specific action
 * @param action - The action performed
 * @param level - Current game level
 * @param value - Additional value (lines cleared, drop distance, etc.)
 * @returns The score earned
 */
export function calculateScore(action: ScoreAction, level: number, value: number): number {
  switch (action) {
    case 'place':
      return 0; // No score for just placing
    
    case 'softDrop':
      return 0; // No score for soft drop
    
    case 'hardDrop':
      return 0; // No score for hard drop
    
    case 'lineClear': {
      const baseScore = getLineClearScore(value);
      return baseScore * level;
    }
    
    default:
      return 0;
  }
}

/**
 * Gets base score for line clears
 * @param lines - Number of lines cleared
 * @returns Base score value
 */
function getLineClearScore(lines: number): number {
  switch (lines) {
    case 1: return 100;
    case 2: return 300;
    case 3: return 500;
    case 4: return 800;
    default: return 1000 + (lines - 4) * 200;
  }
}

/**
 * Calculates current level based on lines cleared
 * @param lines - Total lines cleared
 * @returns Current level (1-20)
 */
export function calculateLevel(lines: number): number {
  // Level up every 5 lines for more constant progression
  const level = Math.floor(lines / 5) + 1;
  return Math.min(level, 99); // Increase cap to level 99
}

/**
 * Gets the drop interval for a given level
 * @param level - Current level
 * @returns Drop interval in milliseconds
 */
export function getDropInterval(level: number): number {
  // Base interval at level 1 is 400ms (very fast default)
  // Drops significantly faster each level for noticeable progression
  const baseInterval = 400;
  
  // Cap the effective level for speed calculation at level 30
  // This prevents the game from becoming impossibly fast
  const effectiveLevel = Math.min(level, 30);
  
  // 20% faster each level up to level 30
  const speedMultiplier = Math.pow(0.80, effectiveLevel - 1);
  
  // Minimum interval of 50ms (20 drops per second) - humanly playable limit
  const minInterval = 50;
  
  return Math.max(Math.round(baseInterval * speedMultiplier), minInterval);
}

/**
 * Updates game statistics based on an action
 * @param stats - Current statistics
 * @param action - The action performed
 * @param data - Additional data for the action
 * @returns Updated statistics
 */
export function updateStats(
  stats: GameStats,
  action: StatAction,
  data: {
    pieceType?: PieceType;
    lines?: number;
    distance?: number;
  }
): GameStats {
  const newStats = { ...stats };
  
  switch (action) {
    case 'piecePlaced':
      newStats.piecesPlaced++;
      if (data.pieceType) {
        newStats.pieceCounts = { ...newStats.pieceCounts };
        newStats.pieceCounts[data.pieceType] = (newStats.pieceCounts[data.pieceType] || 0) + 1;
      }
      break;
    
    case 'linesCleared':
      if (data.lines) {
        newStats.lineClearCounts = { ...newStats.lineClearCounts };
        newStats.lineClearCounts[data.lines] = (newStats.lineClearCounts[data.lines] || 0) + 1;
      }
      break;
    
    case 'move':
      newStats.totalMoves = (newStats.totalMoves || 0) + 1;
      break;
    
    case 'rotate':
      newStats.totalRotations = (newStats.totalRotations || 0) + 1;
      break;
    
    case 'hold':
      newStats.holdCount = (newStats.holdCount || 0) + 1;
      break;
    
    case 'hardDrop':
      newStats.hardDropCount = (newStats.hardDropCount || 0) + 1;
      break;
    
    case 'softDrop':
      if (data.distance) {
        newStats.softDropDistance += data.distance;
      }
      break;
  }
  
  return newStats;
}

/**
 * Calculates actions per minute
 * @param stats - Game statistics
 * @returns APM value
 */
export function calculateAPM(stats: GameStats): number {
  const endTime = stats.endTime || stats.gameEndTime || Date.now();
  const startTime = stats.startTime || stats.gameStartTime;
  const duration = endTime - startTime;
  
  if (duration <= 0) {return 0;}
  
  const minutes = duration / 60000;
  const totalActions = (stats.totalMoves || stats.moves || 0) + (stats.totalRotations || stats.rotations || 0) + (stats.holdCount || stats.holds || 0);
  
  return Math.round(totalActions / minutes);
}

/**
 * Calculates pieces per second
 * @param stats - Game statistics
 * @returns PPS value
 */
export function calculatePPS(stats: GameStats): number {
  const endTime = stats.endTime || stats.gameEndTime || Date.now();
  const startTime = stats.startTime || stats.gameStartTime;
  const duration = endTime - startTime;
  
  if (duration <= 0) {return 0;}
  
  const seconds = duration / 1000;
  const pps = stats.piecesPlaced / seconds;
  // Return with 2 decimal places instead of rounding to whole number
  return Math.round(pps * 100) / 100;
}

/**
 * Gets the base score for an action
 * @param action - The action type
 * @param value - Optional value for line clears
 * @returns Base score value
 */
export function getScoreForAction(action: string, value?: number): number {
  switch (action) {
    case 'place':
      return 0; // No score for just placing
    
    case 'softDrop':
      return 0; // No score for soft drop
    
    case 'hardDrop':
      return 0; // No score for hard drop
    
    case 'lineClear':
      return getLineClearScore(value || 0);
    
    default:
      return 0;
  }
}