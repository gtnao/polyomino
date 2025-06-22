import { describe, it, expect } from 'vitest';
import { getPieceDefinitions, getPieceDefinitionById, getPieceTypes } from '../shapes';
import type { PolyominoShape } from '@/game/types';

describe('polyomino shapes', () => {
  describe('tetromino validation', () => {
    it('should have exactly 7 tetrominoes', () => {
      const tetrominoes = getPieceDefinitions(4);
      expect(tetrominoes).toHaveLength(7);
    });

    it('should have all standard tetromino types', () => {
      const tetrominoes = getPieceDefinitions(4);
      const ids = tetrominoes.map(t => t.id);
      
      // All 7 standard Tetris pieces
      expect(ids).toContain('I');
      expect(ids).toContain('O');
      expect(ids).toContain('T');
      expect(ids).toContain('S');
      expect(ids).toContain('Z');
      expect(ids).toContain('L');
      expect(ids).toContain('J');
    });

    it('should have S and Z pieces as distinct shapes', () => {
      const tetrominoes = getPieceDefinitions(4);
      const S = tetrominoes.find(t => t.id === 'S')!;
      const Z = tetrominoes.find(t => t.id === 'Z')!;
      
      expect(S).toBeDefined();
      expect(Z).toBeDefined();
      
      // S and Z should not be identical
      expect(shapeToString(S.shape)).not.toBe(shapeToString(Z.shape));
      
      // Verify S shape:  ##
      //                 ##
      expect(S.shape).toContainEqual([1, 0]);
      expect(S.shape).toContainEqual([2, 0]);
      expect(S.shape).toContainEqual([0, 1]);
      expect(S.shape).toContainEqual([1, 1]);
      
      // Verify Z shape: ##
      //                  ##
      expect(Z.shape).toContainEqual([0, 0]);
      expect(Z.shape).toContainEqual([1, 0]);
      expect(Z.shape).toContainEqual([1, 1]);
      expect(Z.shape).toContainEqual([2, 1]);
    });

    it('should have correct rotations for each tetromino', () => {
      const tetrominoes = getPieceDefinitions(4);
      
      tetrominoes.forEach(piece => {
        expect(piece.rotations).toHaveLength(4);
        
        // Special cases for symmetric pieces
        if (piece.id === 'O') {
          // O piece is same in all rotations
          const uniqueRotations = getUniqueShapes([...piece.rotations]);
          expect(uniqueRotations).toHaveLength(1);
        } else if (piece.id === 'I' || piece.id === 'S' || piece.id === 'Z') {
          // I, S, Z have 2 unique rotations
          const uniqueRotations = getUniqueShapes([...piece.rotations]);
          expect(uniqueRotations).toHaveLength(2);
        } else {
          // T, L, J have 4 unique rotations
          const uniqueRotations = getUniqueShapes([...piece.rotations]);
          expect(uniqueRotations).toHaveLength(4);
        }
      });
    });
  });

  describe('polyomino counts', () => {
    // Expected counts for one-sided polyominoes (reflections count as different)
    const expectedOneSidedCounts = {
      1: 1,   // monomino
      2: 1,   // domino
      3: 2,   // trominoes
      4: 7,   // tetrominoes (standard Tetris pieces)
      5: 18,  // pentominoes (one-sided)
      6: 60,  // hexominoes (one-sided)
    };

    // Expected counts for free polyominoes (reflections count as same)
    const expectedFreeCounts = {
      1: 1,   // monomino
      2: 1,   // domino
      3: 2,   // trominoes
      4: 5,   // tetrominoes (free)
      5: 12,  // pentominoes (free)
      6: 15,  // hexominoes (hardcoded subset, not all 35)
    };

    it('should generate correct number of pieces for each size', () => {
      // Size 4 is special-cased to use one-sided tetrominoes
      const tetromino4 = getPieceDefinitions(4);
      expect(tetromino4).toHaveLength(expectedOneSidedCounts[4]);

      // Other sizes use free polyominoes from generator
      for (const size of [5, 6] as const) {
        const pieces = getPieceDefinitions(size);
        expect(pieces).toHaveLength(expectedFreeCounts[size]);
      }
    });
  });

  describe('getPieceDefinitionById', () => {
    it('should find tetromino pieces by ID', () => {
      const S = getPieceDefinitionById('S');
      expect(S).toBeDefined();
      expect(S?.id).toBe('S');
      
      const Z = getPieceDefinitionById('Z');
      expect(Z).toBeDefined();
      expect(Z?.id).toBe('Z');
    });

    it('should return null for non-existent ID', () => {
      const piece = getPieceDefinitionById('INVALID' as any);
      expect(piece).toBeNull();
    });
  });

  describe('getPieceTypes', () => {
    it('should return all piece IDs for a size', () => {
      const types = getPieceTypes(4);
      expect(types).toHaveLength(7);
      expect(types).toContain('S');
      expect(types).toContain('Z');
    });
  });
});

// Helper functions
function shapeToString(shape: PolyominoShape): string {
  const sorted = [...shape].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  return JSON.stringify(sorted);
}

function getUniqueShapes(shapes: PolyominoShape[]): PolyominoShape[] {
  const unique: PolyominoShape[] = [];
  const seen = new Set<string>();
  
  for (const shape of shapes) {
    const key = shapeToString(shape);
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(shape);
    }
  }
  
  return unique;
}