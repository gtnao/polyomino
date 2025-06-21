import { describe, it, expect } from 'vitest';
import {
  createEmptyBoard,
  placePiece,
  removePiece,
  getFilledLines,
  clearLines,
  isValidPosition,
  getOccupiedCells,
  isCellOccupied
} from '../board';
import type { PolyominoShape, Coordinate } from '@/game/types';

describe('createEmptyBoard', () => {
  it('should create a board with correct dimensions', () => {
    const board = createEmptyBoard(10, 20);
    expect(board).toHaveLength(20); // height
    expect(board[0]).toHaveLength(10); // width
  });

  it('should create a board filled with null cells', () => {
    const board = createEmptyBoard(5, 3);
    for (let y = 0; y < 3; y++) {
      for (let x = 0; x < 5; x++) {
        expect(board[y]![x]).toBeNull();
      }
    }
  });

  it('should handle edge cases', () => {
    const board1 = createEmptyBoard(1, 1);
    expect(board1).toHaveLength(1);
    expect(board1[0]).toHaveLength(1);
    
    const board2 = createEmptyBoard(100, 50);
    expect(board2).toHaveLength(50);
    expect(board2[0]).toHaveLength(100);
  });

  it('should create immutable board', () => {
    const board = createEmptyBoard(5, 5);
    expect(() => {
      // Testing immutability - this should throw an error
      (board as any).push([]);
    }).toThrow();
  });
});

describe('placePiece', () => {
  it('should place a piece on an empty board', () => {
    const board = createEmptyBoard(10, 10);
    const shape: PolyominoShape = [[0, 0], [1, 0], [0, 1], [1, 1]]; // Square
    const position: Coordinate = [3, 3];
    
    const newBoard = placePiece(board, shape, position, 'O', '#ffff00');
    
    // Check that piece was placed correctly
    expect(newBoard[3]![3]).toEqual({ type: 'O', color: '#ffff00' });
    expect(newBoard[3]![4]).toEqual({ type: 'O', color: '#ffff00' });
    expect(newBoard[4]![3]).toEqual({ type: 'O', color: '#ffff00' });
    expect(newBoard[4]![4]).toEqual({ type: 'O', color: '#ffff00' });
    
    // Check that other cells remain null
    expect(newBoard[2]![3]).toBeNull();
    expect(newBoard[3]![2]).toBeNull();
  });

  it('should not mutate the original board', () => {
    const board = createEmptyBoard(5, 5);
    const shape: PolyominoShape = [[0, 0]];
    const position: Coordinate = [2, 2];
    
    const newBoard = placePiece(board, shape, position, 'I', '#00ffff');
    
    expect(board[2]![2]).toBeNull();
    expect(newBoard[2]![2]).toEqual({ type: 'I', color: '#00ffff' });
    expect(board).not.toBe(newBoard);
  });

  it('should handle pieces at board edges', () => {
    const board = createEmptyBoard(5, 5);
    const shape: PolyominoShape = [[0, 0], [1, 0]];
    
    // Top-left corner
    const board1 = placePiece(board, shape, [0, 0], 'I', '#00ffff');
    expect(board1[0]![0]).toEqual({ type: 'I', color: '#00ffff' });
    expect(board1[0]![1]).toEqual({ type: 'I', color: '#00ffff' });
    
    // Bottom-right corner
    const board2 = placePiece(board, shape, [3, 4], 'I', '#00ffff');
    expect(board2[4]![3]).toEqual({ type: 'I', color: '#00ffff' });
    expect(board2[4]![4]).toEqual({ type: 'I', color: '#00ffff' });
  });

  it('should overwrite existing cells', () => {
    let board = createEmptyBoard(5, 5);
    const shape1: PolyominoShape = [[0, 0], [1, 0]];
    const shape2: PolyominoShape = [[0, 0]];
    
    board = placePiece(board, shape1, [1, 1], 'A', '#ff0000');
    board = placePiece(board, shape2, [1, 1], 'B', '#00ff00');
    
    expect(board[1]![1]).toEqual({ type: 'B', color: '#00ff00' });
    expect(board[1]![2]).toEqual({ type: 'A', color: '#ff0000' });
  });
});

describe('removePiece', () => {
  it('should remove a piece from the board', () => {
    let board = createEmptyBoard(5, 5);
    const shape: PolyominoShape = [[0, 0], [1, 0], [0, 1]];
    const position: Coordinate = [1, 1];
    
    board = placePiece(board, shape, position, 'L', '#ff8800');
    const clearedBoard = removePiece(board, shape, position);
    
    expect(clearedBoard[1]![1]).toBeNull();
    expect(clearedBoard[1]![2]).toBeNull();
    expect(clearedBoard[2]![1]).toBeNull();
  });

  it('should not affect other pieces', () => {
    let board = createEmptyBoard(5, 5);
    const shape1: PolyominoShape = [[0, 0], [1, 0]];
    const shape2: PolyominoShape = [[0, 0], [0, 1]];
    
    board = placePiece(board, shape1, [0, 0], 'A', '#ff0000');
    board = placePiece(board, shape2, [3, 0], 'B', '#00ff00');
    
    const clearedBoard = removePiece(board, shape1, [0, 0]);
    
    // First piece removed
    expect(clearedBoard[0]![0]).toBeNull();
    expect(clearedBoard[0]![1]).toBeNull();
    
    // Second piece remains
    expect(clearedBoard[0]![3]).toEqual({ type: 'B', color: '#00ff00' });
    expect(clearedBoard[1]![3]).toEqual({ type: 'B', color: '#00ff00' });
  });
});

describe('getFilledLines', () => {
  it('should detect fully filled lines', () => {
    let board = createEmptyBoard(3, 5);
    
    // Fill line 2 completely
    board = placePiece(board, [[0, 0]], [0, 2], 'X', '#ffffff');
    board = placePiece(board, [[0, 0]], [1, 2], 'X', '#ffffff');
    board = placePiece(board, [[0, 0]], [2, 2], 'X', '#ffffff');
    
    const filledLines = getFilledLines(board);
    expect(filledLines).toEqual([2]);
  });

  it('should detect multiple filled lines', () => {
    let board = createEmptyBoard(2, 4);
    
    // Fill lines 1 and 3
    for (let x = 0; x < 2; x++) {
      board = placePiece(board, [[0, 0]], [x, 1], 'X', '#ffffff');
      board = placePiece(board, [[0, 0]], [x, 3], 'X', '#ffffff');
    }
    
    const filledLines = getFilledLines(board);
    expect(filledLines).toEqual([1, 3]);
  });

  it('should not detect partially filled lines', () => {
    let board = createEmptyBoard(3, 3);
    
    // Fill line 1 partially (2 out of 3)
    board = placePiece(board, [[0, 0]], [0, 1], 'X', '#ffffff');
    board = placePiece(board, [[0, 0]], [1, 1], 'X', '#ffffff');
    
    const filledLines = getFilledLines(board);
    expect(filledLines).toEqual([]);
  });

  it('should handle empty board', () => {
    const board = createEmptyBoard(5, 10);
    const filledLines = getFilledLines(board);
    expect(filledLines).toEqual([]);
  });
});

describe('clearLines', () => {
  it('should clear specified lines and drop above lines', () => {
    let board = createEmptyBoard(3, 5);
    
    // Setup: place pieces
    board = placePiece(board, [[0, 0]], [1, 0], 'A', '#ff0000'); // Top
    board = placePiece(board, [[0, 0], [1, 0], [2, 0]], [0, 2], 'B', '#00ff00'); // Line to clear
    board = placePiece(board, [[0, 0]], [1, 4], 'C', '#0000ff'); // Bottom
    
    const result = clearLines(board, [2]);
    
    // Check that line was cleared and above line dropped
    expect(result.board[1]![1]).toEqual({ type: 'A', color: '#ff0000' }); // Dropped from row 0
    expect(result.board[2]![0]).toBeNull(); // Cleared
    expect(result.board[2]![1]).toBeNull(); // Cleared
    expect(result.board[2]![2]).toBeNull(); // Cleared
    expect(result.board[4]![1]).toEqual({ type: 'C', color: '#0000ff' }); // Unchanged
    
    expect(result.clearedLines).toEqual([2]);
    expect(result.score).toBe(100); // Base score for 1 line
  });

  it('should handle multiple lines', () => {
    let board = createEmptyBoard(2, 5);
    
    // Fill multiple lines
    for (const y of [1, 2, 4]) {
      for (let x = 0; x < 2; x++) {
        board = placePiece(board, [[0, 0]], [x, y], 'X', '#ffffff');
      }
    }
    
    const result = clearLines(board, [1, 2, 4]);
    
    // All lines should be cleared
    expect(result.board[4]![0]).toBeNull();
    expect(result.board[4]![1]).toBeNull();
    expect(result.clearedLines).toEqual([1, 2, 4]);
    expect(result.score).toBe(500); // Base score for 3 lines
  });

  it('should calculate scores correctly', () => {
    const board = createEmptyBoard(5, 10);
    
    // Test different line counts
    expect(clearLines(board, [0]).score).toBe(100); // 1 line
    expect(clearLines(board, [0, 1]).score).toBe(300); // 2 lines
    expect(clearLines(board, [0, 1, 2]).score).toBe(500); // 3 lines
    expect(clearLines(board, [0, 1, 2, 3]).score).toBe(800); // 4 lines
    expect(clearLines(board, [0, 1, 2, 3, 4]).score).toBe(1200); // 5 lines: 1000 + 200*(5-4)
  });

  it('should handle empty lines array', () => {
    const board = createEmptyBoard(5, 5);
    const result = clearLines(board, []);
    
    expect(result.board).toEqual(board);
    expect(result.clearedLines).toEqual([]);
    expect(result.score).toBe(0);
  });
});

describe('isValidPosition', () => {
  it('should validate positions within bounds', () => {
    const board = createEmptyBoard(5, 5);
    const shape: PolyominoShape = [[0, 0], [1, 0]];
    
    expect(isValidPosition(board, shape, [0, 0])).toBe(true);
    expect(isValidPosition(board, shape, [3, 0])).toBe(true);
    expect(isValidPosition(board, shape, [0, 4])).toBe(true);
    expect(isValidPosition(board, shape, [3, 4])).toBe(true);
  });

  it('should reject positions out of bounds', () => {
    const board = createEmptyBoard(5, 5);
    const shape: PolyominoShape = [[0, 0], [1, 0]];
    
    expect(isValidPosition(board, shape, [-1, 0])).toBe(false); // Left
    expect(isValidPosition(board, shape, [4, 0])).toBe(false); // Right
    expect(isValidPosition(board, shape, [0, -1])).toBe(false); // Top
    expect(isValidPosition(board, shape, [0, 5])).toBe(false); // Bottom
  });

  it('should detect collisions with existing pieces', () => {
    let board = createEmptyBoard(5, 5);
    board = placePiece(board, [[0, 0]], [2, 2], 'X', '#ffffff');
    
    const shape: PolyominoShape = [[0, 0]];
    
    expect(isValidPosition(board, shape, [2, 2])).toBe(false); // Collision
    expect(isValidPosition(board, shape, [2, 1])).toBe(true); // No collision
    expect(isValidPosition(board, shape, [1, 2])).toBe(true); // No collision
  });

  it('should validate complex shapes', () => {
    const board = createEmptyBoard(10, 10);
    const tShape: PolyominoShape = [[0, 0], [1, 0], [2, 0], [1, 1]];
    
    expect(isValidPosition(board, tShape, [0, 0])).toBe(true);
    expect(isValidPosition(board, tShape, [7, 0])).toBe(true);
    expect(isValidPosition(board, tShape, [8, 0])).toBe(false); // Out of bounds
  });
});

describe('getOccupiedCells', () => {
  it('should return coordinates of all occupied cells', () => {
    let board = createEmptyBoard(5, 5);
    board = placePiece(board, [[0, 0], [1, 0]], [1, 1], 'I', '#00ffff');
    board = placePiece(board, [[0, 0]], [3, 3], 'O', '#ffff00');
    
    const occupied = getOccupiedCells(board);
    
    expect(occupied).toHaveLength(3);
    expect(occupied).toContainEqual([1, 1]);
    expect(occupied).toContainEqual([2, 1]);
    expect(occupied).toContainEqual([3, 3]);
  });

  it('should return empty array for empty board', () => {
    const board = createEmptyBoard(5, 5);
    const occupied = getOccupiedCells(board);
    expect(occupied).toEqual([]);
  });
});

describe('isCellOccupied', () => {
  it('should correctly check cell occupation', () => {
    let board = createEmptyBoard(5, 5);
    board = placePiece(board, [[0, 0]], [2, 2], 'X', '#ffffff');
    
    expect(isCellOccupied(board, 2, 2)).toBe(true);
    expect(isCellOccupied(board, 2, 1)).toBe(false);
    expect(isCellOccupied(board, 1, 2)).toBe(false);
  });

  it('should handle out of bounds coordinates', () => {
    const board = createEmptyBoard(5, 5);
    
    expect(isCellOccupied(board, -1, 0)).toBe(true); // Out of bounds = occupied
    expect(isCellOccupied(board, 0, -1)).toBe(true);
    expect(isCellOccupied(board, 5, 0)).toBe(true);
    expect(isCellOccupied(board, 0, 5)).toBe(true);
  });
});