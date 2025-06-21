import { describe, it, expect } from 'vitest';
import {
  createPiece,
  rotatePiece,
  movePiece,
  getGhostPosition,
  getPieceCells,
  applyKickTable
} from '../piece';
import { createEmptyBoard } from '../board';
import type { ActivePiece, Coordinate, PolyominoShape, Board } from '../types';

describe('createPiece', () => {
  it('should create a piece with correct properties', () => {
    const shape: PolyominoShape = [[0, 0], [1, 0], [0, 1], [1, 1]];
    const piece = createPiece('O', shape, [5, 10], '#ffff00');
    
    expect(piece).toEqual({
      type: 'O',
      shape,
      position: [5, 10],
      rotation: 0,
      color: '#ffff00'
    });
  });

  it('should default rotation to 0', () => {
    const shape: PolyominoShape = [[0, 0], [1, 0], [2, 0]];
    const piece = createPiece('I', shape, [0, 0], '#00ffff');
    
    expect(piece.rotation).toBe(0);
  });
});

describe('rotatePiece', () => {
  it('should rotate piece clockwise', () => {
    const piece: ActivePiece = {
      type: 'L',
      shape: [[0, 0], [1, 0], [0, 1]],
      position: [5, 5],
      rotation: 0,
      color: '#ff8800'
    };
    
    const rotated = rotatePiece(piece, true);
    
    expect(rotated.rotation).toBe(1);
    // Shape should be rotated 90 degrees clockwise
    expect(rotated.shape).toContainEqual([0, 0]);
    expect(rotated.shape).toContainEqual([0, 1]);
    expect(rotated.shape).toContainEqual([-1, 0]);
  });

  it('should rotate piece counter-clockwise', () => {
    const piece: ActivePiece = {
      type: 'L',
      shape: [[0, 0], [1, 0], [0, 1]],
      position: [5, 5],
      rotation: 0,
      color: '#ff8800'
    };
    
    const rotated = rotatePiece(piece, false);
    
    expect(rotated.rotation).toBe(3); // 0 -> 3 (counter-clockwise)
    // Shape should be rotated 90 degrees counter-clockwise
    expect(rotated.shape).toContainEqual([0, 0]);
    expect(rotated.shape).toContainEqual([0, -1]);
    expect(rotated.shape).toContainEqual([1, 0]);
  });

  it('should wrap rotation values', () => {
    const piece: ActivePiece = {
      type: 'T',
      shape: [[0, 0], [1, 0], [2, 0], [1, 1]],
      position: [5, 5],
      rotation: 3,
      color: '#ff00ff'
    };
    
    const rotatedCW = rotatePiece(piece, true);
    expect(rotatedCW.rotation).toBe(0); // 3 -> 0
    
    const piece2 = { ...piece, rotation: 0 as const };
    const rotatedCCW = rotatePiece(piece2, false);
    expect(rotatedCCW.rotation).toBe(3); // 0 -> 3
  });

  it('should not mutate original piece', () => {
    const piece: ActivePiece = {
      type: 'S',
      shape: [[0, 0], [1, 0], [1, 1], [2, 1]],
      position: [5, 5],
      rotation: 0,
      color: '#00ff00'
    };
    
    const originalShape = [...piece.shape];
    const originalRotation = piece.rotation;
    
    rotatePiece(piece, true);
    
    expect(piece.shape).toEqual(originalShape);
    expect(piece.rotation).toBe(originalRotation);
  });
});

describe('movePiece', () => {
  it('should move piece by offset', () => {
    const piece: ActivePiece = {
      type: 'I',
      shape: [[0, 0], [1, 0], [2, 0], [3, 0]],
      position: [5, 10],
      rotation: 0,
      color: '#00ffff'
    };
    
    const moved = movePiece(piece, [2, -1]);
    
    expect(moved.position).toEqual([7, 9]);
    expect(moved.shape).toEqual(piece.shape); // Shape unchanged
    expect(moved.type).toBe(piece.type);
  });

  it('should handle negative offsets', () => {
    const piece: ActivePiece = {
      type: 'O',
      shape: [[0, 0], [1, 0], [0, 1], [1, 1]],
      position: [5, 5],
      rotation: 0,
      color: '#ffff00'
    };
    
    const moved = movePiece(piece, [-3, -2]);
    
    expect(moved.position).toEqual([2, 3]);
  });

  it('should handle zero offset', () => {
    const piece: ActivePiece = {
      type: 'T',
      shape: [[0, 0], [1, 0], [2, 0], [1, 1]],
      position: [5, 5],
      rotation: 0,
      color: '#ff00ff'
    };
    
    const moved = movePiece(piece, [0, 0]);
    
    expect(moved.position).toEqual([5, 5]);
  });

  it('should not mutate original piece', () => {
    const piece: ActivePiece = {
      type: 'L',
      shape: [[0, 0], [1, 0], [2, 0], [2, 1]],
      position: [5, 5],
      rotation: 0,
      color: '#ff8800'
    };
    
    const originalPosition = [...piece.position];
    
    movePiece(piece, [10, 10]);
    
    expect(piece.position).toEqual(originalPosition);
  });
});

describe('getGhostPosition', () => {
  it('should find lowest valid position', () => {
    const board = createEmptyBoard(10, 20);
    const piece: ActivePiece = {
      type: 'I',
      shape: [[0, 0], [1, 0], [2, 0], [3, 0]],
      position: [3, 5],
      rotation: 0,
      color: '#00ffff'
    };
    
    const ghostY = getGhostPosition(board, piece);
    
    expect(ghostY).toBe(19); // Bottom of the board
  });

  it('should stop above existing pieces', () => {
    let board = createEmptyBoard(10, 20);
    
    // Place a piece at the bottom
    board = board.map((row, y) => {
      if (y === 18) {
        return row.map((cell, x) => x === 5 ? { type: 'X', color: '#ffffff' } : cell);
      }
      return row;
    }) as Board;
    
    const piece: ActivePiece = {
      type: 'O',
      shape: [[0, 0], [1, 0], [0, 1], [1, 1]],
      position: [4, 5],
      rotation: 0,
      color: '#ffff00'
    };
    
    const ghostY = getGhostPosition(board, piece);
    
    expect(ghostY).toBe(16); // Stops above the existing piece
  });

  it('should return current position if already at bottom', () => {
    const board = createEmptyBoard(10, 20);
    const piece: ActivePiece = {
      type: 'T',
      shape: [[0, 0], [1, 0], [2, 0], [1, 1]],
      position: [3, 18],
      rotation: 0,
      color: '#ff00ff'
    };
    
    const ghostY = getGhostPosition(board, piece);
    
    expect(ghostY).toBe(18);
  });

  it('should handle pieces at different rotations', () => {
    const board = createEmptyBoard(10, 20);
    const piece: ActivePiece = {
      type: 'I',
      shape: [[0, 0], [0, 1], [0, 2], [0, 3]], // Vertical I-piece
      position: [5, 5],
      rotation: 1,
      color: '#00ffff'
    };
    
    const ghostY = getGhostPosition(board, piece);
    
    expect(ghostY).toBe(16); // 20 - 4 (piece height)
  });
});

describe('getPieceCells', () => {
  it('should return absolute positions of piece cells', () => {
    const piece: ActivePiece = {
      type: 'O',
      shape: [[0, 0], [1, 0], [0, 1], [1, 1]],
      position: [3, 5],
      rotation: 0,
      color: '#ffff00'
    };
    
    const cells = getPieceCells(piece);
    
    expect(cells).toHaveLength(4);
    expect(cells).toContainEqual([3, 5]);
    expect(cells).toContainEqual([4, 5]);
    expect(cells).toContainEqual([3, 6]);
    expect(cells).toContainEqual([4, 6]);
  });

  it('should handle offset positions', () => {
    const piece: ActivePiece = {
      type: 'L',
      shape: [[0, 0], [1, 0], [2, 0], [2, 1]],
      position: [7, 15],
      rotation: 0,
      color: '#ff8800'
    };
    
    const cells = getPieceCells(piece);
    
    expect(cells).toContainEqual([7, 15]);
    expect(cells).toContainEqual([8, 15]);
    expect(cells).toContainEqual([9, 15]);
    expect(cells).toContainEqual([9, 16]);
  });

  it('should handle single cell piece', () => {
    const piece: ActivePiece = {
      type: 'M',
      shape: [[0, 0]],
      position: [5, 10],
      rotation: 0,
      color: '#ffffff'
    };
    
    const cells = getPieceCells(piece);
    
    expect(cells).toEqual([[5, 10]]);
  });
});

describe('applyKickTable', () => {
  it('should apply kick offsets in order', () => {
    const piece: ActivePiece = {
      type: 'T',
      shape: [[0, 0], [1, 0], [2, 0], [1, 1]],
      position: [5, 5],
      rotation: 0,
      color: '#ff00ff'
    };
    
    const kickTable: Coordinate[] = [
      [0, 0],   // Try original position
      [-1, 0],  // Try left
      [1, 0],   // Try right
      [0, -1],  // Try up
    ];
    
    // const board = createEmptyBoard(10, 20);
    
    // Mock validator that accepts position [4, 5] (left kick)
    const validator = (p: Coordinate): boolean => {
      return p[0] === 4 && p[1] === 5;
    };
    
    const result = applyKickTable(piece, kickTable, validator);
    
    expect(result).toEqual({
      position: [4, 5],
      kickIndex: 1
    });
  });

  it('should return null if no valid position found', () => {
    const piece: ActivePiece = {
      type: 'I',
      shape: [[0, 0], [1, 0], [2, 0], [3, 0]],
      position: [5, 5],
      rotation: 0,
      color: '#00ffff'
    };
    
    const kickTable: Coordinate[] = [
      [0, 0],
      [-1, 0],
      [1, 0],
    ];
    
    // Validator that always returns false
    const validator = (): boolean => false;
    
    const result = applyKickTable(piece, kickTable, validator);
    
    expect(result).toBeNull();
  });

  it('should return first valid position', () => {
    const piece: ActivePiece = {
      type: 'S',
      shape: [[0, 0], [1, 0], [1, 1], [2, 1]],
      position: [5, 5],
      rotation: 0,
      color: '#00ff00'
    };
    
    const kickTable: Coordinate[] = [
      [0, 0],
      [-1, 0],
      [1, 0],
      [0, -1],
    ];
    
    // Validator that accepts any position
    const validator = (): boolean => true;
    
    const result = applyKickTable(piece, kickTable, validator);
    
    expect(result).toEqual({
      position: [5, 5], // Original position (first in table)
      kickIndex: 0
    });
  });
});