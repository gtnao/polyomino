import { describe, it, expect, beforeEach } from 'vitest';
import {
  generatePolyominoes,
  normalizePolyomino,
  getAllRotations,
  getBoundingBox,
  arePolyominoesEqual,
  isCanonicalForm,
  clearPolyominoCache
} from '../generator';
import type { PolyominoShape } from '@/game/types';

describe('generatePolyominoes', () => {
  beforeEach(() => {
    clearPolyominoCache();
  });
  
  it('should generate correct number of polyominoes for each size', () => {
    // Known polyomino counts for free polyominoes (with reflections considered same)
    const expectedCounts = {
      1: 1,   // monomino
      2: 1,   // domino
      3: 2,   // trominoes
      4: 5,   // tetrominoes (free polyominoes)
      5: 12,  // pentominoes (free polyominoes)
      6: 35,  // hexominoes (free polyominoes)
    };

    for (const [size, expectedCount] of Object.entries(expectedCounts)) {
      const polyominoes = generatePolyominoes(Number(size));
      expect(polyominoes).toHaveLength(expectedCount);
    }
  });

  it('should generate unique polyominoes', () => {
    const polyominoes = generatePolyominoes(5);
    
    // Check that no two polyominoes are identical
    for (let i = 0; i < polyominoes.length; i++) {
      for (let j = i + 1; j < polyominoes.length; j++) {
        expect(arePolyominoesEqual(polyominoes[i]!, polyominoes[j]!)).toBe(false);
      }
    }
  });

  it('should generate valid connected polyominoes', () => {
    const polyominoes = generatePolyominoes(4);
    
    for (const shape of polyominoes) {
      // Check correct size
      expect(shape).toHaveLength(4);
      
      // Check that shape is connected (validated separately)
      expect(isConnected(shape)).toBe(true);
    }
  });

  it('should generate normalized polyominoes', () => {
    const polyominoes = generatePolyominoes(5);
    
    for (const shape of polyominoes) {
      // Check that shape is normalized (leftmost column is 0 and topmost row is 0)
      const hasZeroX = shape.some(([x, _y]) => x === 0);
      const hasZeroY = shape.some(([_x, y]) => y === 0);
      expect(hasZeroX).toBe(true);
      expect(hasZeroY).toBe(true);
      
      // Check that no negative coordinates
      const hasNegative = shape.some(([x, y]) => x < 0 || y < 0);
      expect(hasNegative).toBe(false);
      
      // Check that shape is in canonical form
      expect(isCanonicalForm(shape)).toBe(true);
    }
  });
});

describe('normalizePolyomino', () => {
  it('should move polyomino to origin', () => {
    const shape: PolyominoShape = [[2, 3], [3, 3], [2, 4], [3, 4]];
    const normalized = normalizePolyomino(shape);
    
    expect(normalized).toEqual([[0, 0], [1, 0], [0, 1], [1, 1]]);
  });

  it('should handle negative coordinates', () => {
    const shape: PolyominoShape = [[-2, -1], [-1, -1], [-2, 0], [-1, 0]];
    const normalized = normalizePolyomino(shape);
    
    expect(normalized).toEqual([[0, 0], [1, 0], [0, 1], [1, 1]]);
  });

  it('should preserve shape structure', () => {
    const shape: PolyominoShape = [[5, 5], [6, 5], [7, 5], [6, 6]]; // T-shape
    const normalized = normalizePolyomino(shape);
    
    expect(normalized).toEqual([[0, 0], [1, 0], [2, 0], [1, 1]]);
  });
});

describe('getAllRotations', () => {
  it('should generate 4 rotations for asymmetric shape', () => {
    const shape: PolyominoShape = [[0, 0], [1, 0], [0, 1]]; // L-shape
    const rotations = getAllRotations(shape);
    
    expect(rotations).toHaveLength(4);
    
    // Each rotation should be different
    for (let i = 0; i < rotations.length; i++) {
      for (let j = i + 1; j < rotations.length; j++) {
        expect(arePolyominoesEqual(rotations[i]!, rotations[j]!)).toBe(false);
      }
    }
  });

  it('should generate fewer unique rotations for symmetric shapes', () => {
    const square: PolyominoShape = [[0, 0], [1, 0], [0, 1], [1, 1]];
    const rotations = getAllRotations(square);
    
    // Square has only 1 unique rotation (all rotations are the same)
    const uniqueRotations = getUniqueShapes(rotations);
    expect(uniqueRotations).toHaveLength(1);
  });

  it('should handle line shape rotations', () => {
    const line: PolyominoShape = [[0, 0], [1, 0], [2, 0], [3, 0]];
    const rotations = getAllRotations(line);
    
    // Line has 2 unique rotations (horizontal and vertical)
    const uniqueRotations = getUniqueShapes(rotations);
    expect(uniqueRotations).toHaveLength(2);
  });
});

describe('getBoundingBox', () => {
  it('should calculate correct bounding box', () => {
    const shape: PolyominoShape = [[0, 0], [1, 0], [2, 0], [1, 1]];
    const box = getBoundingBox(shape);
    
    expect(box).toEqual({
      width: 3,
      height: 2,
      offsetX: 0,
      offsetY: 0
    });
  });

  it('should handle shapes not at origin', () => {
    const shape: PolyominoShape = [[2, 3], [3, 3], [4, 3], [3, 4]];
    const box = getBoundingBox(shape);
    
    expect(box).toEqual({
      width: 3,
      height: 2,
      offsetX: 2,
      offsetY: 3
    });
  });

  it('should handle single cell', () => {
    const shape: PolyominoShape = [[5, 7]];
    const box = getBoundingBox(shape);
    
    expect(box).toEqual({
      width: 1,
      height: 1,
      offsetX: 5,
      offsetY: 7
    });
  });
});

describe('arePolyominoesEqual', () => {
  it('should identify identical polyominoes', () => {
    const shape1: PolyominoShape = [[0, 0], [1, 0], [0, 1], [1, 1]];
    const shape2: PolyominoShape = [[0, 0], [1, 0], [0, 1], [1, 1]];
    
    expect(arePolyominoesEqual(shape1, shape2)).toBe(true);
  });

  it('should identify different polyominoes', () => {
    const shape1: PolyominoShape = [[0, 0], [1, 0], [0, 1], [1, 1]];
    const shape2: PolyominoShape = [[0, 0], [1, 0], [2, 0], [3, 0]];
    
    expect(arePolyominoesEqual(shape1, shape2)).toBe(false);
  });

  it('should handle different sizes', () => {
    const shape1: PolyominoShape = [[0, 0], [1, 0], [0, 1]];
    const shape2: PolyominoShape = [[0, 0], [1, 0], [0, 1], [1, 1]];
    
    expect(arePolyominoesEqual(shape1, shape2)).toBe(false);
  });

  it('should handle same coordinates in different order', () => {
    const shape1: PolyominoShape = [[0, 0], [1, 0], [0, 1], [1, 1]];
    const shape2: PolyominoShape = [[1, 1], [0, 1], [1, 0], [0, 0]];
    
    expect(arePolyominoesEqual(shape1, shape2)).toBe(true);
  });
});

describe('isCanonicalForm', () => {
  it('should identify canonical forms', () => {
    // Canonical form: lexicographically smallest among all rotations/reflections
    const canonical: PolyominoShape = [[0, 0], [0, 1], [1, 0]];
    expect(isCanonicalForm(canonical)).toBe(true);
  });

  it('should reject non-canonical forms', () => {
    // This L-shape can be rotated to a lexicographically smaller form
    const nonCanonical: PolyominoShape = [[0, 0], [1, 0], [1, 1]];
    // const canonical = [[0, 0], [0, 1], [1, 0]];
    
    // The canonical form should be smaller lexicographically
    expect(isCanonicalForm(nonCanonical)).toBe(false);
  });

  it('should handle symmetric shapes', () => {
    // Square is its own canonical form
    const square: PolyominoShape = [[0, 0], [0, 1], [1, 0], [1, 1]];
    expect(isCanonicalForm(square)).toBe(true);
  });
});

// Helper function to check if a polyomino is connected
function isConnected(shape: PolyominoShape): boolean {
  if (shape.length === 0) {return false;}
  
  const cells = new Set(shape.map(([x, y]) => `${x},${y}`));
  const visited = new Set<string>();
  const queue = [`${shape[0]![0]},${shape[0]![1]}`];
  
  while (queue.length > 0) {
    const current = queue.shift()!;
    if (visited.has(current)) {continue;}
    visited.add(current);
    
    const [x, y] = current.split(',').map(Number) as [number, number];
    const neighbors = [
      [x + 1, y],
      [x - 1, y],
      [x, y + 1],
      [x, y - 1]
    ];
    
    for (const [nx, ny] of neighbors) {
      const key = `${nx},${ny}`;
      if (cells.has(key) && !visited.has(key)) {
        queue.push(key);
      }
    }
  }
  
  return visited.size === shape.length;
}

// Helper function to get unique shapes from a list
function getUniqueShapes(shapes: PolyominoShape[]): PolyominoShape[] {
  const unique: PolyominoShape[] = [];
  
  for (const shape of shapes) {
    const isUnique = !unique.some(u => arePolyominoesEqual(u, shape));
    if (isUnique) {
      unique.push(shape);
    }
  }
  
  return unique;
}