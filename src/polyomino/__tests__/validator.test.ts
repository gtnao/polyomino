import { describe, it, expect } from 'vitest';
import { isConnected, isValidPolyomino, hasNoDuplicates } from '../validator';
import type { PolyominoShape } from '@/game/types';

describe('isConnected', () => {
  it('should return true for connected polyominoes', () => {
    const connected1: PolyominoShape = [[0, 0], [1, 0], [0, 1], [1, 1]]; // Square
    const connected2: PolyominoShape = [[0, 0], [1, 0], [2, 0], [3, 0]]; // Line
    const connected3: PolyominoShape = [[0, 0], [1, 0], [1, 1], [2, 1]]; // S-shape
    
    expect(isConnected(connected1)).toBe(true);
    expect(isConnected(connected2)).toBe(true);
    expect(isConnected(connected3)).toBe(true);
  });

  it('should return false for disconnected polyominoes', () => {
    const disconnected1: PolyominoShape = [[0, 0], [0, 1], [2, 0], [2, 1]]; // Two separate dominoes
    const disconnected2: PolyominoShape = [[0, 0], [2, 2]]; // Two cells diagonal
    const disconnected3: PolyominoShape = [[0, 0], [1, 0], [3, 0], [4, 0]]; // Gap in line
    
    expect(isConnected(disconnected1)).toBe(false);
    expect(isConnected(disconnected2)).toBe(false);
    expect(isConnected(disconnected3)).toBe(false);
  });

  it('should handle single cell', () => {
    const single: PolyominoShape = [[5, 7]];
    expect(isConnected(single)).toBe(true);
  });

  it('should handle empty shape', () => {
    const empty: PolyominoShape = [];
    expect(isConnected(empty)).toBe(false);
  });

  it('should handle complex connected shapes', () => {
    // T-shape
    const tShape: PolyominoShape = [[0, 0], [1, 0], [2, 0], [1, 1]];
    expect(isConnected(tShape)).toBe(true);
    
    // L-shape
    const lShape: PolyominoShape = [[0, 0], [0, 1], [0, 2], [1, 2]];
    expect(isConnected(lShape)).toBe(true);
  });

  it('should consider only orthogonal connections', () => {
    // Diagonal connections don't count
    const diagonal: PolyominoShape = [[0, 0], [1, 1]];
    expect(isConnected(diagonal)).toBe(false);
    
    // But this is connected via path
    const connected: PolyominoShape = [[0, 0], [1, 0], [1, 1]];
    expect(isConnected(connected)).toBe(true);
  });
});

describe('hasNoDuplicates', () => {
  it('should return true for shapes with unique cells', () => {
    const unique1: PolyominoShape = [[0, 0], [1, 0], [0, 1]];
    const unique2: PolyominoShape = [[0, 0], [1, 0], [2, 0], [3, 0]];
    
    expect(hasNoDuplicates(unique1)).toBe(true);
    expect(hasNoDuplicates(unique2)).toBe(true);
  });

  it('should return false for shapes with duplicate cells', () => {
    const duplicates1: PolyominoShape = [[0, 0], [1, 0], [0, 0]]; // First and last are same
    const duplicates2: PolyominoShape = [[1, 1], [1, 1]]; // Both are same
    const duplicates3: PolyominoShape = [[0, 0], [1, 0], [2, 0], [1, 0]]; // Second and fourth are same
    
    expect(hasNoDuplicates(duplicates1)).toBe(false);
    expect(hasNoDuplicates(duplicates2)).toBe(false);
    expect(hasNoDuplicates(duplicates3)).toBe(false);
  });

  it('should handle empty shape', () => {
    const empty: PolyominoShape = [];
    expect(hasNoDuplicates(empty)).toBe(true);
  });

  it('should handle single cell', () => {
    const single: PolyominoShape = [[42, 42]];
    expect(hasNoDuplicates(single)).toBe(true);
  });
});

describe('isValidPolyomino', () => {
  it('should validate correct polyominoes', () => {
    const valid1: PolyominoShape = [[0, 0], [1, 0], [0, 1], [1, 1]]; // Square
    const valid2: PolyominoShape = [[0, 0], [1, 0], [2, 0], [3, 0]]; // Line
    const valid3: PolyominoShape = [[0, 0], [1, 0], [1, 1], [2, 1]]; // S-shape
    
    expect(isValidPolyomino(valid1)).toBe(true);
    expect(isValidPolyomino(valid2)).toBe(true);
    expect(isValidPolyomino(valid3)).toBe(true);
  });

  it('should reject invalid polyominoes', () => {
    // Empty
    expect(isValidPolyomino([])).toBe(false);
    
    // Disconnected
    const disconnected: PolyominoShape = [[0, 0], [2, 2]];
    expect(isValidPolyomino(disconnected)).toBe(false);
    
    // Has duplicates
    const duplicates: PolyominoShape = [[0, 0], [1, 0], [0, 0]];
    expect(isValidPolyomino(duplicates)).toBe(false);
  });

  it('should validate single cell', () => {
    const single: PolyominoShape = [[0, 0]];
    expect(isValidPolyomino(single)).toBe(true);
  });

  it('should reject polyominoes with both issues', () => {
    // Disconnected AND has duplicates
    const invalid: PolyominoShape = [[0, 0], [0, 0], [2, 2]];
    expect(isValidPolyomino(invalid)).toBe(false);
  });
});