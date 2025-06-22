import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  createWeightedBag,
  getNextWeightedPiece,
  isWeightedPieceAvailable,
  getAvailablePieceTypes,
  type WeightedPieceBag
} from '../weightedBag';
import type { PieceDefinition } from '../types';
import * as hardcodedShapes from '../../polyomino/hardcodedShapes';

// Mock the selectWeightedPiece function
vi.mock('../../polyomino/hardcodedShapes', () => ({
  selectWeightedPiece: vi.fn()
}));

describe('weightedBag', () => {
  const mockSelectWeightedPiece = vi.mocked(hardcodedShapes.selectWeightedPiece);

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(Math, 'random').mockReturnValue(0.5); // Default to middle value
  });

  const createMockPieceDefinitions = (count: number, withWeights = true): PieceDefinition[] => {
    return Array.from({ length: count }, (_, i) => {
      const piece: any = {
        id: `piece-${i}`,
        shape: [[0, 0], [0, 1], [1, 0], [1, i]], // Unique shape for each piece
        rotations: [[[0, 0], [0, 1], [1, 0], [1, i]]],
        boundingBox: { width: 2, height: 2, offsetX: 0, offsetY: 0 },
        colorIndex: i,
        color: `#${((i + 1) * 111111).toString(16).padStart(6, '0')}`, // Mock color
      };
      if (withWeights) {
        piece.weight = 10 + i;
      }
      return piece;
    });
  };

  describe('createWeightedBag', () => {
    it('should create a weighted bag with given piece definitions', () => {
      const pieces = createMockPieceDefinitions(5);
      const bag = createWeightedBag(pieces);

      expect(bag.pieceDefinitions).toEqual(pieces);
      expect(bag.history).toEqual([]);
      expect(bag.maxHistorySize).toBe(2); // floor(5/2) = 2
    });

    it('should limit history size to 10 maximum', () => {
      const pieces = createMockPieceDefinitions(25);
      const bag = createWeightedBag(pieces);

      expect(bag.maxHistorySize).toBe(10); // Should be capped at 10
    });

    it('should throw error when piece definitions are empty', () => {
      expect(() => createWeightedBag([])).toThrow('Cannot create weighted bag with empty piece definitions');
    });

    it('should throw error when piece definitions are null', () => {
      expect(() => createWeightedBag(null as any)).toThrow('Cannot create weighted bag with empty piece definitions');
    });
  });

  describe('getNextWeightedPiece', () => {
    describe('with weighted pieces', () => {
      it('should select a piece using weighted selection', () => {
        const pieces = createMockPieceDefinitions(3);
        const bag = createWeightedBag(pieces);
        
        // Mock the weighted selection to return first shape
        mockSelectWeightedPiece.mockReturnValue(pieces[0]!.shape);

        const result = getNextWeightedPiece(bag);

        expect(result.piece).toBe('piece-0');
        expect(result.bag.history).toEqual(['piece-0']);
        expect(mockSelectWeightedPiece).toHaveBeenCalledWith(
          expect.arrayContaining([
            expect.objectContaining({
              name: 'piece-0',
              weight: 10
            })
          ])
        );
      });

      it('should adjust weights based on history', () => {
        const pieces = createMockPieceDefinitions(3);
        const bag: WeightedPieceBag = {
          ...createWeightedBag(pieces),
          history: ['piece-0', 'piece-0'] // piece-0 appeared twice
        };

        mockSelectWeightedPiece.mockReturnValue(pieces[1]!.shape);

        getNextWeightedPiece(bag);

        // Check that the weight of piece-0 was reduced
        expect(mockSelectWeightedPiece).toHaveBeenCalledWith(
          expect.arrayContaining([
            expect.objectContaining({
              name: 'piece-0',
              weight: 10 * Math.pow(0.7, 2) // Reduced by 0.7^2 for appearing twice
            }),
            expect.objectContaining({
              name: 'piece-1',
              weight: 11 // Original weight
            })
          ])
        );
      });

      it('should maintain history up to max size', () => {
        const pieces = createMockPieceDefinitions(3);
        const bag: WeightedPieceBag = {
          ...createWeightedBag(pieces),
          history: ['piece-1'], // Already has one item
          maxHistorySize: 2
        };

        mockSelectWeightedPiece.mockReturnValue(pieces[2]!.shape);

        const result = getNextWeightedPiece(bag);

        expect(result.piece).toBe('piece-2');
        expect(result.bag.history).toEqual(['piece-2', 'piece-1']);
        expect(result.bag.history.length).toBe(2);
      });

      it('should trim history when exceeding max size', () => {
        const pieces = createMockPieceDefinitions(3);
        const bag: WeightedPieceBag = {
          ...createWeightedBag(pieces),
          history: ['piece-1', 'piece-0'], // Already at max
          maxHistorySize: 2
        };

        mockSelectWeightedPiece.mockReturnValue(pieces[2]!.shape);

        const result = getNextWeightedPiece(bag);

        expect(result.piece).toBe('piece-2');
        expect(result.bag.history).toEqual(['piece-2', 'piece-1']);
        expect(result.bag.history).not.toContain('piece-0'); // Oldest item removed
      });
    });

    describe('without weighted pieces', () => {
      it('should use random selection when pieces have no weights', () => {
        const pieces = createMockPieceDefinitions(3, false); // No weights
        const bag = createWeightedBag(pieces);

        vi.mocked(Math.random).mockReturnValue(0.5); // Will select index 1

        const result = getNextWeightedPiece(bag);

        expect(result.piece).toBe('piece-1');
        expect(result.bag).toBe(bag); // Bag unchanged for random selection
        expect(mockSelectWeightedPiece).not.toHaveBeenCalled();
      });

      it('should handle edge case of random selection at boundaries', () => {
        const pieces = createMockPieceDefinitions(3, false);
        const bag = createWeightedBag(pieces);

        // Test lower boundary
        vi.mocked(Math.random).mockReturnValue(0);
        expect(getNextWeightedPiece(bag).piece).toBe('piece-0');

        // Test upper boundary
        vi.mocked(Math.random).mockReturnValue(0.999);
        expect(getNextWeightedPiece(bag).piece).toBe('piece-2');
      });
    });

    it('should throw error when bag has no piece definitions', () => {
      const bag: WeightedPieceBag = {
        pieceDefinitions: [],
        history: [],
        maxHistorySize: 5
      };

      expect(() => getNextWeightedPiece(bag)).toThrow('No piece definitions available in weighted bag');
    });

    it('should throw error when bag piece definitions is null', () => {
      const bag: WeightedPieceBag = {
        pieceDefinitions: null as any,
        history: [],
        maxHistorySize: 5
      };

      expect(() => getNextWeightedPiece(bag)).toThrow('No piece definitions available in weighted bag');
    });
  });

  describe('isWeightedPieceAvailable', () => {
    it('should return true when piece is available', () => {
      const pieces = createMockPieceDefinitions(3);
      const bag = createWeightedBag(pieces);

      expect(isWeightedPieceAvailable(bag, 'piece-1' as any)).toBe(true);
      expect(isWeightedPieceAvailable(bag, 'piece-2' as any)).toBe(true);
    });

    it('should return false when piece is not available', () => {
      const pieces = createMockPieceDefinitions(3);
      const bag = createWeightedBag(pieces);

      expect(isWeightedPieceAvailable(bag, 'piece-99' as any)).toBe(false);
      expect(isWeightedPieceAvailable(bag, 'nonexistent' as any)).toBe(false);
    });

    it('should handle empty bag', () => {
      const bag: WeightedPieceBag = {
        pieceDefinitions: [],
        history: [],
        maxHistorySize: 5
      };

      expect(isWeightedPieceAvailable(bag, 'any-piece' as any)).toBe(false);
    });
  });

  describe('getAvailablePieceTypes', () => {
    it('should return all available piece types', () => {
      const pieces = createMockPieceDefinitions(3);
      const bag = createWeightedBag(pieces);

      const types = getAvailablePieceTypes(bag);

      expect(types).toEqual(['piece-0', 'piece-1', 'piece-2']);
      expect(types.length).toBe(3);
    });

    it('should return empty array for empty bag', () => {
      const bag: WeightedPieceBag = {
        pieceDefinitions: [],
        history: [],
        maxHistorySize: 5
      };

      const types = getAvailablePieceTypes(bag);

      expect(types).toEqual([]);
    });

    it('should not be affected by history', () => {
      const pieces = createMockPieceDefinitions(3);
      const bag: WeightedPieceBag = {
        ...createWeightedBag(pieces),
        history: ['piece-0', 'piece-1', 'piece-0'] // Some history
      };

      const types = getAvailablePieceTypes(bag);

      expect(types).toEqual(['piece-0', 'piece-1', 'piece-2']);
    });
  });

  describe('integration scenarios', () => {
    it('should handle repeated selections with history tracking', () => {
      const pieces = createMockPieceDefinitions(4);
      let bag = createWeightedBag(pieces);

      // Simulate multiple selections
      const selections: string[] = [];
      for (let i = 0; i < 10; i++) {
        mockSelectWeightedPiece.mockReturnValue(pieces[i % 4]!.shape);
        const result = getNextWeightedPiece(bag);
        selections.push(result.piece);
        bag = result.bag;
      }

      // History should contain only the last maxHistorySize items
      expect(bag.history.length).toBe(bag.maxHistorySize);
      expect(bag.history).toEqual(selections.slice(-bag.maxHistorySize).reverse());
    });

    it('should provide fair distribution with weight adjustments', () => {
      const pieces = createMockPieceDefinitions(3);
      let bag = createWeightedBag(pieces);

      // Track how weights are adjusted over time
      const weightCalls: any[] = [];
      mockSelectWeightedPiece.mockImplementation((weightedPieces) => {
        weightCalls.push([...weightedPieces]);
        return pieces[0]!.shape; // Always return first piece for testing
      });

      // Make several selections
      for (let i = 0; i < 5; i++) {
        const result = getNextWeightedPiece(bag);
        bag = result.bag;
      }

      // Check that weights for piece-0 decreased over time
      const firstCallWeight = weightCalls[0].find((p: any) => p.name === 'piece-0').weight;
      const lastCallWeight = weightCalls[4].find((p: any) => p.name === 'piece-0').weight;
      expect(lastCallWeight).toBeLessThan(firstCallWeight);
    });
  });
});