import { describe, it, expect } from 'vitest';
import {
  checkCollision,
  getValidMoves,
  findValidRotation,
  canPieceFit,
  getKickTable
} from '../collision';
import { createEmptyBoard, placePiece } from '../board';
import { createPiece } from '../piece';
import type { PolyominoShape } from '../types';

describe('checkCollision', () => {
  it('should detect no collision on empty board', () => {
    const board = createEmptyBoard(10, 20);
    const shape: PolyominoShape = [[0, 0], [1, 0], [0, 1], [1, 1]];
    
    expect(checkCollision(board, shape, [0, 0])).toBe(false);
    expect(checkCollision(board, shape, [5, 10])).toBe(false);
    expect(checkCollision(board, shape, [8, 18])).toBe(false);
  });

  it('should detect collision with board boundaries', () => {
    const board = createEmptyBoard(10, 20);
    const shape: PolyominoShape = [[0, 0], [1, 0], [0, 1], [1, 1]];
    
    // Left boundary
    expect(checkCollision(board, shape, [-1, 0])).toBe(true);
    
    // Right boundary
    expect(checkCollision(board, shape, [9, 0])).toBe(true);
    
    // Top boundary
    expect(checkCollision(board, shape, [0, -1])).toBe(true);
    
    // Bottom boundary
    expect(checkCollision(board, shape, [0, 19])).toBe(true);
  });

  it('should detect collision with existing pieces', () => {
    let board = createEmptyBoard(10, 20);
    board = placePiece(board, [[0, 0]], [5, 10], 'X', '#ffffff');
    
    const shape: PolyominoShape = [[0, 0]];
    
    // Direct collision
    expect(checkCollision(board, shape, [5, 10])).toBe(true);
    
    // No collision
    expect(checkCollision(board, shape, [4, 10])).toBe(false);
    expect(checkCollision(board, shape, [5, 9])).toBe(false);
  });

  it('should handle complex shapes', () => {
    const board = createEmptyBoard(10, 20);
    const tShape: PolyominoShape = [[0, 0], [1, 0], [2, 0], [1, 1]];
    
    // Valid positions
    expect(checkCollision(board, tShape, [0, 0])).toBe(false);
    expect(checkCollision(board, tShape, [7, 0])).toBe(false);
    
    // Invalid positions (out of bounds)
    expect(checkCollision(board, tShape, [8, 0])).toBe(true);
    expect(checkCollision(board, tShape, [0, 19])).toBe(true);
  });
});

describe('getValidMoves', () => {
  it('should return all valid moves for a piece', () => {
    const board = createEmptyBoard(10, 20);
    const piece = createPiece('O', [[0, 0], [1, 0], [0, 1], [1, 1]], [5, 10], '#ffff00');
    
    const moves = getValidMoves(board, piece);
    
    expect(moves.left).toBe(true);
    expect(moves.right).toBe(true);
    expect(moves.down).toBe(true);
    expect(moves.rotateLeft).toBe(true);
    expect(moves.rotateRight).toBe(true);
  });

  it('should detect blocked moves at boundaries', () => {
    const board = createEmptyBoard(10, 20);
    
    // Piece at left edge
    const leftPiece = createPiece('O', [[0, 0], [1, 0], [0, 1], [1, 1]], [0, 10], '#ffff00');
    const leftMoves = getValidMoves(board, leftPiece);
    expect(leftMoves.left).toBe(false);
    expect(leftMoves.right).toBe(true);
    
    // Piece at right edge
    const rightPiece = createPiece('O', [[0, 0], [1, 0], [0, 1], [1, 1]], [8, 10], '#ffff00');
    const rightMoves = getValidMoves(board, rightPiece);
    expect(rightMoves.left).toBe(true);
    expect(rightMoves.right).toBe(false);
    
    // Piece at bottom
    const bottomPiece = createPiece('O', [[0, 0], [1, 0], [0, 1], [1, 1]], [5, 18], '#ffff00');
    const bottomMoves = getValidMoves(board, bottomPiece);
    expect(bottomMoves.down).toBe(false);
  });

  it('should detect blocked rotations', () => {
    let board = createEmptyBoard(10, 20);
    
    // Place obstacles to block I-piece movement
    // I-piece at [5,10] occupies cells [5,10], [6,10], [7,10], [8,10]
    board = placePiece(board, [[0, 0]], [4, 10], 'X', '#ffffff'); // Block left
    board = placePiece(board, [[0, 0]], [9, 10], 'X', '#ffffff'); // Block right (I-piece ends at x=8)
    board = placePiece(board, [[0, 0]], [5, 11], 'X', '#ffffff'); // Block down
    board = placePiece(board, [[0, 0]], [6, 11], 'X', '#ffffff'); // Block down
    board = placePiece(board, [[0, 0]], [7, 11], 'X', '#ffffff'); // Block down
    board = placePiece(board, [[0, 0]], [8, 11], 'X', '#ffffff'); // Block down
    
    const piece = createPiece('I', [[0, 0], [1, 0], [2, 0], [3, 0]], [5, 10], '#00ffff');
    const moves = getValidMoves(board, piece);
    
    expect(moves.left).toBe(false);
    expect(moves.right).toBe(false);
    expect(moves.down).toBe(false);
  });
});

describe('findValidRotation', () => {
  it('should find valid rotation without kicks', () => {
    const board = createEmptyBoard(10, 20);
    const piece = createPiece('T', [[0, 0], [1, 0], [2, 0], [1, 1]], [5, 10], '#ff00ff');
    
    const result = findValidRotation(board, piece, true);
    
    expect(result).not.toBeNull();
    expect(result?.kickIndex).toBe(0); // No kick needed
    expect(result?.position).toEqual([5, 10]);
  });

  it('should apply kick table when needed', () => {
    let board = createEmptyBoard(10, 20);
    
    // Block the direct rotation position
    board = placePiece(board, [[0, 0]], [5, 10], 'X', '#ffffff');
    
    const piece = createPiece('T', [[0, 0], [1, 0], [2, 0], [1, 1]], [5, 10], '#ff00ff');
    const result = findValidRotation(board, piece, true);
    
    expect(result).not.toBeNull();
    expect(result?.kickIndex).toBeGreaterThan(0); // Kick was applied
  });

  it('should return null if no valid rotation exists', () => {
    let board = createEmptyBoard(10, 20);
    
    // Place the I-piece at the edge where it can't rotate
    // Horizontal I-piece at [0, 0] can't rotate to vertical due to board boundaries
    const piece = createPiece('I', [[0, 0], [1, 0], [2, 0], [3, 0]], [0, 0], '#00ffff');
    
    // Block all possible kick positions for rotation
    // When rotating, the piece would need space vertically which is blocked by top boundary
    // Also block potential kick positions
    board = placePiece(board, [[0, 0]], [0, 1], 'X', '#ffffff');
    board = placePiece(board, [[0, 0]], [1, 1], 'X', '#ffffff');
    board = placePiece(board, [[0, 0]], [2, 1], 'X', '#ffffff');
    board = placePiece(board, [[0, 0]], [3, 1], 'X', '#ffffff');
    board = placePiece(board, [[0, 0]], [4, 0], 'X', '#ffffff');
    
    const result = findValidRotation(board, piece, true);
    
    expect(result).toBeNull();
  });

  it('should handle counter-clockwise rotation', () => {
    const board = createEmptyBoard(10, 20);
    const piece = createPiece('L', [[0, 0], [1, 0], [2, 0], [2, 1]], [5, 10], '#ff8800');
    
    const resultCW = findValidRotation(board, piece, true);
    const resultCCW = findValidRotation(board, piece, false);
    
    expect(resultCW).not.toBeNull();
    expect(resultCCW).not.toBeNull();
    
    // Rotated pieces should be different
    expect(resultCW?.piece.shape).not.toEqual(resultCCW?.piece.shape);
  });
});

describe('canPieceFit', () => {
  it('should return true for valid positions', () => {
    const board = createEmptyBoard(10, 20);
    const shape: PolyominoShape = [[0, 0], [1, 0], [0, 1], [1, 1]];
    
    expect(canPieceFit(board, shape, [0, 0])).toBe(true);
    expect(canPieceFit(board, shape, [5, 10])).toBe(true);
    expect(canPieceFit(board, shape, [8, 18])).toBe(true);
  });

  it('should return false for invalid positions', () => {
    const board = createEmptyBoard(10, 20);
    const shape: PolyominoShape = [[0, 0], [1, 0], [0, 1], [1, 1]];
    
    expect(canPieceFit(board, shape, [-1, 0])).toBe(false);
    expect(canPieceFit(board, shape, [9, 0])).toBe(false);
    expect(canPieceFit(board, shape, [0, 19])).toBe(false);
  });

  it('should consider existing pieces', () => {
    let board = createEmptyBoard(10, 20);
    board = placePiece(board, [[0, 0], [1, 0]], [5, 10], 'X', '#ffffff');
    
    const shape: PolyominoShape = [[0, 0], [1, 0]];
    
    expect(canPieceFit(board, shape, [5, 10])).toBe(false); // Collision
    expect(canPieceFit(board, shape, [3, 10])).toBe(true); // No collision
    expect(canPieceFit(board, shape, [5, 11])).toBe(true); // No collision
  });
});

describe('getKickTable', () => {
  it('should return clockwise kick table', () => {
    const kickTable = getKickTable(true);
    
    expect(kickTable).toHaveLength(6);
    expect(kickTable[0]).toEqual([0, 0]); // No kick
    expect(kickTable[1]).toEqual([-1, 0]); // Left
    expect(kickTable[2]).toEqual([1, 0]); // Right
  });

  it('should return counter-clockwise kick table', () => {
    const kickTable = getKickTable(false);
    
    expect(kickTable).toHaveLength(6);
    expect(kickTable[0]).toEqual([0, 0]); // No kick
    expect(kickTable[1]).toEqual([1, 0]); // Right (opposite of CW)
    expect(kickTable[2]).toEqual([-1, 0]); // Left (opposite of CW)
  });

  it('should include vertical kicks', () => {
    const kickTableCW = getKickTable(true);
    const kickTableCCW = getKickTable(false);
    
    // Both should have up kicks
    expect(kickTableCW).toContainEqual([0, -1]);
    expect(kickTableCCW).toContainEqual([0, -1]);
  });
});