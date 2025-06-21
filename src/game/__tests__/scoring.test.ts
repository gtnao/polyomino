import { describe, it, expect } from 'vitest';
import {
  calculateScore,
  calculateLevel,
  getDropInterval,
  updateStats,
  calculateAPM,
  calculatePPS,
  getScoreForAction
} from '../scoring';
import type { GameStats } from '../types';

describe('calculateScore', () => {
  it('should calculate score for piece placement', () => {
    const score = calculateScore('place', 1, 0);
    expect(score).toBe(0); // No score for placement
  });

  it('should calculate score for soft drop', () => {
    const score = calculateScore('softDrop', 1, 5);
    expect(score).toBe(0); // No score for soft drop
  });

  it('should calculate score for hard drop', () => {
    const score = calculateScore('hardDrop', 1, 10);
    expect(score).toBe(0); // No score for hard drop
  });

  it('should calculate score for line clears', () => {
    expect(calculateScore('lineClear', 1, 1)).toBe(100);
    expect(calculateScore('lineClear', 1, 2)).toBe(300);
    expect(calculateScore('lineClear', 1, 3)).toBe(500);
    expect(calculateScore('lineClear', 1, 4)).toBe(800);
    expect(calculateScore('lineClear', 1, 5)).toBe(1200);
  });

  it('should multiply line clear score by level', () => {
    expect(calculateScore('lineClear', 5, 1)).toBe(500); // 100 * 5
    expect(calculateScore('lineClear', 10, 2)).toBe(3000); // 300 * 10
    expect(calculateScore('lineClear', 3, 4)).toBe(2400); // 800 * 3
  });

  it('should handle level 0', () => {
    expect(calculateScore('lineClear', 0, 1)).toBe(0); // No score at level 0
    expect(calculateScore('place', 0, 0)).toBe(0); // No score for placement
  });
});

describe('calculateLevel', () => {
  it('should start at level 1', () => {
    expect(calculateLevel(0)).toBe(1);
    expect(calculateLevel(4)).toBe(1);
  });

  it('should increase every 5 lines', () => {
    expect(calculateLevel(5)).toBe(2);
    expect(calculateLevel(9)).toBe(2);
    expect(calculateLevel(10)).toBe(3);
    expect(calculateLevel(25)).toBe(6);
    expect(calculateLevel(50)).toBe(11);
  });

  it('should cap at level 99', () => {
    expect(calculateLevel(490)).toBe(99);
    expect(calculateLevel(500)).toBe(99);
    expect(calculateLevel(1000)).toBe(99);
  });
});

describe('getDropInterval', () => {
  it('should calculate drop interval based on level', () => {
    expect(getDropInterval(1)).toBe(400); // Base 400ms
    expect(getDropInterval(2)).toBe(320); // 400 * 0.80
    expect(getDropInterval(5)).toBe(164); // 400 * 0.80^4
    expect(getDropInterval(10)).toBe(54); // 400 * 0.80^9
  });

  it('should handle high levels', () => {
    expect(getDropInterval(30)).toBe(50); // Capped at level 30, min 50ms
    expect(getDropInterval(50)).toBe(50); // Min interval
  });

  it('should handle level 0', () => {
    expect(getDropInterval(0)).toBe(500); // Special case for level 0
  });
});

describe('updateStats', () => {
  const baseStats: GameStats = {
    score: 0,
    level: 1,
    lines: 0,
    piecesPlaced: 10,
    moves: 100,
    rotations: 20,
    holds: 5,
    hardDrops: 8,
    softDropDistance: 50,
    gameStartTime: 1000,
    gameEndTime: null,
    // Legacy fields
    startTime: 1000,
    endTime: null,
    pieceCounts: { 'I': 2, 'O': 3, 'T': 5 },
    lineClearCounts: { 1: 5, 2: 2 },
    totalMoves: 100,
    totalRotations: 20,
    holdCount: 5,
    hardDropCount: 8,
    apm: 0,
    pps: 0
  };

  it('should update piece placement', () => {
    const newStats = updateStats(baseStats, 'piecePlaced', { pieceType: 'L' });
    
    expect(newStats.piecesPlaced).toBe(11);
    expect(newStats.pieceCounts?.['L']).toBe(1);
    expect(newStats.pieceCounts?.['I']).toBe(2); // Unchanged
  });

  it('should update line clears', () => {
    const newStats = updateStats(baseStats, 'linesCleared', { lines: 3 });
    
    expect(newStats.lineClearCounts?.[3]).toBe(1);
    expect(newStats.lineClearCounts?.[1]).toBe(5); // Unchanged
  });

  it('should update moves', () => {
    const newStats = updateStats(baseStats, 'move', {});
    expect(newStats.totalMoves).toBe(101);
  });

  it('should update rotations', () => {
    const newStats = updateStats(baseStats, 'rotate', {});
    expect(newStats.totalRotations).toBe(21);
  });

  it('should update hold count', () => {
    const newStats = updateStats(baseStats, 'hold', {});
    expect(newStats.holdCount).toBe(6);
  });

  it('should update hard drop', () => {
    const newStats = updateStats(baseStats, 'hardDrop', {});
    expect(newStats.hardDropCount).toBe(9);
  });

  it('should update soft drop distance', () => {
    const newStats = updateStats(baseStats, 'softDrop', { distance: 7 });
    expect(newStats.softDropDistance).toBe(57);
  });

  it('should not mutate original stats', () => {
    const original = { ...baseStats };
    updateStats(baseStats, 'move', {});
    expect(baseStats).toEqual(original);
  });
});

describe('calculateAPM', () => {
  it('should calculate actions per minute', () => {
    const stats: GameStats = {
      score: 0,
      level: 1,
      lines: 0,
      piecesPlaced: 0,
      moves: 60,
      rotations: 30,
      holds: 10,
      hardDrops: 0,
      softDropDistance: 0,
      gameStartTime: 0,
      gameEndTime: 60000, // 1 minute
      startTime: 0,
      endTime: 60000,
      pieceCounts: {},
      lineClearCounts: {},
      totalMoves: 60,
      totalRotations: 30,
      holdCount: 10,
      hardDropCount: 0,
      apm: 0,
      pps: 0
    };
    
    expect(calculateAPM(stats)).toBe(100); // 60 + 30 + 10 = 100 actions in 1 minute
  });

  it('should handle partial minutes', () => {
    const stats: GameStats = {
      score: 0,
      level: 1,
      lines: 0,
      piecesPlaced: 0,
      moves: 30,
      rotations: 15,
      holds: 5,
      hardDrops: 0,
      softDropDistance: 0,
      gameStartTime: 0,
      gameEndTime: 30000, // 30 seconds
      startTime: 0,
      endTime: 30000,
      pieceCounts: {},
      lineClearCounts: {},
      totalMoves: 30,
      totalRotations: 15,
      holdCount: 5,
      hardDropCount: 0,
      apm: 0,
      pps: 0
    };
    
    expect(calculateAPM(stats)).toBe(100); // 50 actions in 0.5 minutes = 100 APM
  });

  it('should handle ongoing game', () => {
    const now = Date.now();
    const stats: GameStats = {
      score: 0,
      level: 1,
      lines: 0,
      piecesPlaced: 0,
      moves: 120,
      rotations: 60,
      holds: 20,
      hardDrops: 0,
      softDropDistance: 0,
      gameStartTime: now - 120000, // Started 2 minutes ago
      gameEndTime: null, // Still playing
      startTime: now - 120000,
      endTime: null,
      pieceCounts: {},
      lineClearCounts: {},
      totalMoves: 120,
      totalRotations: 60,
      holdCount: 20,
      hardDropCount: 0,
      apm: 0,
      pps: 0
    };
    
    const apm = calculateAPM(stats);
    expect(apm).toBeCloseTo(100, 0); // 200 actions in 2 minutes
  });

  it('should return 0 for zero duration', () => {
    const stats: GameStats = {
      score: 0,
      level: 1,
      lines: 0,
      piecesPlaced: 0,
      moves: 100,
      rotations: 50,
      holds: 10,
      hardDrops: 0,
      softDropDistance: 0,
      gameStartTime: 1000,
      gameEndTime: 1000,
      startTime: 1000,
      endTime: 1000,
      pieceCounts: {},
      lineClearCounts: {},
      totalMoves: 100,
      totalRotations: 50,
      holdCount: 10,
      hardDropCount: 0,
      apm: 0,
      pps: 0
    };
    
    expect(calculateAPM(stats)).toBe(0);
  });
});

describe('calculatePPS', () => {
  it('should calculate pieces per second', () => {
    const stats: GameStats = {
      score: 0,
      level: 1,
      lines: 0,
      piecesPlaced: 20,
      moves: 0,
      rotations: 0,
      holds: 0,
      hardDrops: 0,
      softDropDistance: 0,
      gameStartTime: 0,
      gameEndTime: 10000, // 10 seconds
      startTime: 0,
      endTime: 10000,
      pieceCounts: {},
      lineClearCounts: {},
      totalMoves: 0,
      totalRotations: 0,
      holdCount: 0,
      hardDropCount: 0,
      apm: 0,
      pps: 0
    };
    
    expect(calculatePPS(stats)).toBe(2); // 20 pieces in 10 seconds
  });

  it('should handle ongoing game', () => {
    const now = Date.now();
    const stats: GameStats = {
      score: 0,
      level: 1,
      lines: 0,
      piecesPlaced: 15,
      moves: 0,
      rotations: 0,
      holds: 0,
      hardDrops: 0,
      softDropDistance: 0,
      gameStartTime: now - 5000, // Started 5 seconds ago
      gameEndTime: null,
      startTime: now - 5000,
      endTime: null,
      pieceCounts: {},
      lineClearCounts: {},
      totalMoves: 0,
      totalRotations: 0,
      holdCount: 0,
      hardDropCount: 0,
      apm: 0,
      pps: 0
    };
    
    expect(calculatePPS(stats)).toBeCloseTo(3, 0); // 15 pieces in 5 seconds
  });

  it('should return 0 for zero duration', () => {
    const stats: GameStats = {
      score: 0,
      level: 1,
      lines: 0,
      piecesPlaced: 100,
      moves: 0,
      rotations: 0,
      holds: 0,
      hardDrops: 0,
      softDropDistance: 0,
      gameStartTime: 1000,
      gameEndTime: 1000,
      startTime: 1000,
      endTime: 1000,
      pieceCounts: {},
      lineClearCounts: {},
      totalMoves: 0,
      totalRotations: 0,
      holdCount: 0,
      hardDropCount: 0,
      apm: 0,
      pps: 0
    };
    
    expect(calculatePPS(stats)).toBe(0);
  });
});

describe('getScoreForAction', () => {
  it('should return correct scores for actions', () => {
    expect(getScoreForAction('place')).toBe(0); // No score for placement
    expect(getScoreForAction('softDrop')).toBe(0); // No score for soft drop
    expect(getScoreForAction('hardDrop')).toBe(0); // No score for hard drop
  });

  it('should return line clear base scores', () => {
    expect(getScoreForAction('lineClear', 1)).toBe(100);
    expect(getScoreForAction('lineClear', 2)).toBe(300);
    expect(getScoreForAction('lineClear', 3)).toBe(500);
    expect(getScoreForAction('lineClear', 4)).toBe(800);
    expect(getScoreForAction('lineClear', 5)).toBe(1200);
    expect(getScoreForAction('lineClear', 6)).toBe(1400);
  });

  it('should default to 0 for unknown actions', () => {
    expect(getScoreForAction('unknown' as string)).toBe(0);
  });
});