import { describe, it, expect } from 'vitest';
import {
  createBag,
  getNextPiece,
  refillBag,
  isPieceAvailable,
  getRemainingPieces
} from '../bag';
import type { PieceType, PieceBag } from '../types';

describe('createBag', () => {
  it('should create a bag with all piece types', () => {
    const pieceTypes: PieceType[] = ['I', 'O', 'T', 'S', 'Z', 'L', 'J'];
    const bag = createBag(pieceTypes);
    
    expect(bag.pieces).toHaveLength(7);
    expect(bag.pieces.sort()).toEqual(pieceTypes.sort());
  });

  it('should shuffle the pieces', () => {
    const pieceTypes: PieceType[] = ['I', 'O', 'T', 'S', 'Z', 'L', 'J'];
    
    // Create multiple bags to check for randomization
    const bags = Array.from({ length: 10 }, () => createBag(pieceTypes));
    const sequences = bags.map(bag => bag.pieces.join(''));
    
    // At least some sequences should be different
    const uniqueSequences = new Set(sequences);
    expect(uniqueSequences.size).toBeGreaterThan(1);
  });

  it('should handle small sets', () => {
    const pieceTypes: PieceType[] = ['A', 'B'];
    const bag = createBag(pieceTypes);
    
    expect(bag.pieces).toHaveLength(2);
    expect(bag.pieces).toContain('A');
    expect(bag.pieces).toContain('B');
  });

  it('should handle single piece type', () => {
    const pieceTypes: PieceType[] = ['X'];
    const bag = createBag(pieceTypes);
    
    expect(bag.pieces).toEqual(['X']);
  });
});

describe('getNextPiece', () => {
  it('should return next piece and update bag', () => {
    const pieceTypes: PieceType[] = ['I', 'O', 'T'];
    const initialBag = { pieces: ['T', 'I', 'O'] };
    
    const result = getNextPiece(initialBag, pieceTypes);
    
    expect(result.piece).toBe('T');
    expect(result.bag.pieces).toEqual(['I', 'O']);
  });

  it('should refill bag when empty', () => {
    const pieceTypes: PieceType[] = ['I', 'O', 'T'];
    const emptyBag = { pieces: [] };
    
    const result = getNextPiece(emptyBag, pieceTypes);
    
    expect(pieceTypes).toContain(result.piece);
    expect(result.bag.pieces).toHaveLength(2); // 3 total - 1 taken
  });

  it('should maintain all pieces in refilled bag', () => {
    const pieceTypes: PieceType[] = ['A', 'B', 'C', 'D'];
    let bag: PieceBag = { pieces: [] }; // Start with empty bag
    
    // Get all pieces from 2 full bags
    const pieces: PieceType[] = [];
    for (let i = 0; i < 8; i++) { // 2 full cycles
      const result = getNextPiece(bag, pieceTypes);
      pieces.push(result.piece);
      bag = result.bag;
    }
    
    // Check that we got exactly 2 of each piece
    const counts = pieces.reduce((acc, piece) => {
      acc[piece] = (acc[piece] || 0) + 1;
      return acc;
    }, {} as Record<PieceType, number>);
    
    expect(counts['A']).toBe(2);
    expect(counts['B']).toBe(2);
    expect(counts['C']).toBe(2);
    expect(counts['D']).toBe(2);
  });
});

describe('refillBag', () => {
  it('should create a new shuffled bag', () => {
    const pieceTypes: PieceType[] = ['I', 'O', 'T', 'S', 'Z'];
    const bag = refillBag(pieceTypes);
    
    expect(bag.pieces).toHaveLength(5);
    expect(bag.pieces.sort()).toEqual(pieceTypes.sort());
  });

  it('should produce different orders', () => {
    const pieceTypes: PieceType[] = ['1', '2', '3', '4', '5', '6', '7'];
    
    const bags = Array.from({ length: 20 }, () => refillBag(pieceTypes));
    const sequences = bags.map(bag => bag.pieces.join(''));
    const uniqueSequences = new Set(sequences);
    
    // With 7 pieces, we should see multiple different orders
    expect(uniqueSequences.size).toBeGreaterThan(1);
  });
});

describe('isPieceAvailable', () => {
  it('should return true if piece is in bag', () => {
    const bag = { pieces: ['I', 'O', 'T', 'S'] };
    
    expect(isPieceAvailable(bag, 'I')).toBe(true);
    expect(isPieceAvailable(bag, 'T')).toBe(true);
    expect(isPieceAvailable(bag, 'S')).toBe(true);
  });

  it('should return false if piece is not in bag', () => {
    const bag = { pieces: ['I', 'O', 'T'] };
    
    expect(isPieceAvailable(bag, 'Z')).toBe(false);
    expect(isPieceAvailable(bag, 'L')).toBe(false);
    expect(isPieceAvailable(bag, 'J')).toBe(false);
  });

  it('should handle empty bag', () => {
    const bag = { pieces: [] };
    
    expect(isPieceAvailable(bag, 'I')).toBe(false);
  });
});

describe('getRemainingPieces', () => {
  it('should return copy of remaining pieces', () => {
    const pieces = ['I', 'O', 'T', 'S'];
    const bag = { pieces };
    
    const remaining = getRemainingPieces(bag);
    
    expect(remaining).toEqual(pieces);
    expect(remaining).not.toBe(pieces); // Should be a copy
  });

  it('should return empty array for empty bag', () => {
    const bag = { pieces: [] };
    const remaining = getRemainingPieces(bag);
    
    expect(remaining).toEqual([]);
  });

  it('should not affect original bag when modified', () => {
    const bag = { pieces: ['I', 'O', 'T'] };
    const remaining = getRemainingPieces(bag);
    
    remaining.push('Z');
    
    expect(bag.pieces).toEqual(['I', 'O', 'T']);
  });
});