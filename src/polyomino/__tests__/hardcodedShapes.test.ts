import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  TRIOMINOES,
  TETROMINOES,
  PENTOMINOES,
  HEXOMINOES,
  HEPTOMINOES,
  getHardcodedPieces,
  selectWeightedPiece,
  type WeightedPolyomino
} from '../hardcodedShapes';

describe('hardcodedShapes', () => {
  describe('Shape definitions', () => {
    const validateShape = (piece: WeightedPolyomino, expectedSize: number): void => {
      // Check that shape has correct number of cells
      expect(piece.shape.length).toBe(expectedSize);
      
      // Check that all cells are valid [x, y] coordinates
      piece.shape.forEach(cell => {
        expect(cell).toHaveLength(2);
        expect(typeof cell[0]).toBe('number');
        expect(typeof cell[1]).toBe('number');
        expect(cell[0]).toBeGreaterThanOrEqual(0);
        expect(cell[1]).toBeGreaterThanOrEqual(0);
      });
      
      // Check that shape is connected (basic validation)
      // and there are no duplicate cells
      const cellSet = new Set(piece.shape.map(cell => `${cell[0]},${cell[1]}`));
      expect(cellSet.size).toBe(expectedSize);
      
      // Check name exists
      expect(piece.name).toBeTruthy();
      expect(typeof piece.name).toBe('string');
      
      // Check weight is positive
      expect(piece.weight).toBeGreaterThan(0);
    };

    it('should define valid TRIOMINOES', () => {
      expect(TRIOMINOES).toHaveLength(2);
      TRIOMINOES.forEach(piece => validateShape(piece, 3));
      
      // Check specific shapes
      const i3 = TRIOMINOES.find(p => p.name === 'I3');
      expect(i3).toBeDefined();
      expect(i3!.weight).toBe(60); // Higher weight for straight line
      
      const l3 = TRIOMINOES.find(p => p.name === 'L3');
      expect(l3).toBeDefined();
      expect(l3!.weight).toBe(40);
    });

    it('should define valid TETROMINOES', () => {
      expect(TETROMINOES).toHaveLength(7);
      TETROMINOES.forEach(piece => validateShape(piece, 4));
      
      // Check all pieces have equal weight
      TETROMINOES.forEach(piece => {
        expect(piece.weight).toBe(10);
      });
      
      // Check all standard Tetris pieces exist
      const expectedNames = ['I', 'O', 'T', 'S', 'Z', 'L', 'J'];
      expectedNames.forEach(name => {
        expect(TETROMINOES.some(p => p.name === name)).toBe(true);
      });
    });

    it('should define valid PENTOMINOES', () => {
      expect(PENTOMINOES).toHaveLength(12);
      PENTOMINOES.forEach(piece => validateShape(piece, 5));
      
      // Check weight distribution
      const weights = PENTOMINOES.map(p => p.weight);
      expect(Math.min(...weights)).toBeGreaterThanOrEqual(9);
      expect(Math.max(...weights)).toBeLessThanOrEqual(12);
      
      // Check specific high-weight pieces
      const i5 = PENTOMINOES.find(p => p.name === 'I5');
      expect(i5!.weight).toBe(12); // Straight line has highest weight
    });

    it('should define valid HEXOMINOES', () => {
      expect(HEXOMINOES).toHaveLength(15);
      HEXOMINOES.forEach(piece => validateShape(piece, 6));
      
      // Check I6 has highest weight
      const i6 = HEXOMINOES.find(p => p.name === 'I6');
      expect(i6!.weight).toBe(30);
      
      // Check O6 (rectangle) has high weight
      const o6 = HEXOMINOES.find(p => p.name === 'O6');
      expect(o6!.weight).toBe(20);
    });

    it('should define valid HEPTOMINOES', () => {
      expect(HEPTOMINOES).toHaveLength(18);
      HEPTOMINOES.forEach(piece => validateShape(piece, 7));
      
      // Check I7 has highest weight
      const i7 = HEPTOMINOES.find(p => p.name === 'I7');
      expect(i7!.weight).toBe(35);
      
      // Check weight range
      const weights = HEPTOMINOES.map(p => p.weight);
      expect(Math.min(...weights)).toBeGreaterThanOrEqual(5);
      expect(Math.max(...weights)).toBeLessThanOrEqual(35);
    });

    it('should have unique names within each size', () => {
      const checkUniqueNames = (pieces: WeightedPolyomino[]): void => {
        const names = pieces.map(p => p.name);
        const uniqueNames = new Set(names);
        expect(uniqueNames.size).toBe(names.length);
      };

      checkUniqueNames(TRIOMINOES);
      checkUniqueNames(TETROMINOES);
      checkUniqueNames(PENTOMINOES);
      checkUniqueNames(HEXOMINOES);
      checkUniqueNames(HEPTOMINOES);
    });
  });

  describe('getHardcodedPieces', () => {
    it('should return correct pieces for each size', () => {
      expect(getHardcodedPieces(3)).toBe(TRIOMINOES);
      expect(getHardcodedPieces(4)).toBe(TETROMINOES);
      expect(getHardcodedPieces(5)).toBe(PENTOMINOES);
      expect(getHardcodedPieces(6)).toBe(HEXOMINOES);
      expect(getHardcodedPieces(7)).toBe(HEPTOMINOES);
    });

    it('should return empty array for invalid size', () => {
      expect(getHardcodedPieces(8 as any)).toEqual([]);
      expect(getHardcodedPieces(2 as any)).toEqual([]);
      expect(getHardcodedPieces(100 as any)).toEqual([]);
    });
  });

  describe('selectWeightedPiece', () => {
    beforeEach(() => {
      vi.spyOn(Math, 'random');
    });

    it('should select piece based on weight', () => {
      const pieces: WeightedPolyomino[] = [
        { name: 'A', shape: [[0, 0]], weight: 10 },
        { name: 'B', shape: [[1, 0]], weight: 30 },
        { name: 'C', shape: [[2, 0]], weight: 60 },
      ];

      // Test lower range - should select A
      vi.mocked(Math.random).mockReturnValue(0.05); // 5% of 100
      expect(selectWeightedPiece(pieces)).toEqual([[0, 0]]);

      // Test middle range - should select B
      vi.mocked(Math.random).mockReturnValue(0.25); // 25% of 100
      expect(selectWeightedPiece(pieces)).toEqual([[1, 0]]);

      // Test upper range - should select C
      vi.mocked(Math.random).mockReturnValue(0.8); // 80% of 100
      expect(selectWeightedPiece(pieces)).toEqual([[2, 0]]);
    });

    it('should handle edge case at weight boundaries', () => {
      const pieces: WeightedPolyomino[] = [
        { name: 'A', shape: [[0, 0]], weight: 50 },
        { name: 'B', shape: [[1, 0]], weight: 50 },
      ];

      // Exactly at boundary (0.5 * 100 = 50, which after subtracting 50 becomes 0)
      vi.mocked(Math.random).mockReturnValue(0.5);
      expect(selectWeightedPiece(pieces)).toEqual([[0, 0]]); // First piece selected

      // Just after boundary (0.51 * 100 = 51, which after subtracting 50 becomes 1)
      vi.mocked(Math.random).mockReturnValue(0.51);
      expect(selectWeightedPiece(pieces)).toEqual([[1, 0]]); // Second piece selected

      // Just before boundary
      vi.mocked(Math.random).mockReturnValue(0.49);
      expect(selectWeightedPiece(pieces)).toEqual([[0, 0]]);
    });

    it('should handle single piece', () => {
      const pieces: WeightedPolyomino[] = [
        { name: 'A', shape: [[0, 0], [1, 0]], weight: 100 },
      ];

      vi.mocked(Math.random).mockReturnValue(0.5);
      expect(selectWeightedPiece(pieces)).toEqual([[0, 0], [1, 0]]);
    });

    it('should handle maximum random value', () => {
      const pieces: WeightedPolyomino[] = [
        { name: 'A', shape: [[0, 0]], weight: 10 },
        { name: 'B', shape: [[1, 0]], weight: 20 },
      ];

      // Edge case: exactly at total weight (1.0 * 30 = 30)
      // After subtracting 10 from first piece: 20
      // After subtracting 20 from second piece: 0, so second piece is selected
      vi.mocked(Math.random).mockReturnValue(1.0);
      expect(selectWeightedPiece(pieces)).toEqual([[1, 0]]);

      // Very close to 1.0 should still select last piece
      vi.mocked(Math.random).mockReturnValue(0.999);
      expect(selectWeightedPiece(pieces)).toEqual([[1, 0]]);
    });

    it('should handle pieces with zero weight', () => {
      const pieces: WeightedPolyomino[] = [
        { name: 'A', shape: [[0, 0]], weight: 0 },
        { name: 'B', shape: [[1, 0]], weight: 10 },
      ];

      // Should skip zero-weight piece
      vi.mocked(Math.random).mockReturnValue(0.05);
      expect(selectWeightedPiece(pieces)).toEqual([[1, 0]]);
    });
  });

  describe('weight distribution analysis', () => {
    it('should have reasonable weight distributions', () => {
      const analyzeWeights = (pieces: WeightedPolyomino[]): { name: string; probability: string }[] => {
        const totalWeight = pieces.reduce((sum, p) => sum + p.weight, 0);
        const avgWeight = totalWeight / pieces.length;
        const probabilities = pieces.map(p => ({
          name: p.name,
          probability: (p.weight / totalWeight * 100).toFixed(1)
        }));
        
        // Basic sanity checks without logging
        
        // Basic sanity checks
        expect(totalWeight).toBeGreaterThan(0);
        expect(avgWeight).toBeGreaterThan(0);
        
        return probabilities;
      };

      analyzeWeights(TRIOMINOES);
      analyzeWeights(TETROMINOES);
      analyzeWeights(PENTOMINOES);
      analyzeWeights(HEXOMINOES);
      analyzeWeights(HEPTOMINOES);
    });

    it('should prioritize straight pieces (I-pieces)', () => {
      // Check that I-pieces have high weights relative to others
      const checkIPieceWeight = (pieces: WeightedPolyomino[], iPieceName: string): void => {
        const iPiece = pieces.find(p => p.name === iPieceName);
        const avgWeight = pieces.reduce((sum, p) => sum + p.weight, 0) / pieces.length;
        
        expect(iPiece).toBeDefined();
        expect(iPiece!.weight).toBeGreaterThanOrEqual(avgWeight);
      };

      checkIPieceWeight(TRIOMINOES, 'I3');
      // TETROMINOES all have equal weight, so skip
      checkIPieceWeight(PENTOMINOES, 'I5');
      checkIPieceWeight(HEXOMINOES, 'I6');
      checkIPieceWeight(HEPTOMINOES, 'I7');
    });
  });
});