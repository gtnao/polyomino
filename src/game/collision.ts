import type { Board, PolyominoShape, Coordinate, ActivePiece } from './types';
import { isValidPosition } from './board';
import { rotatePiece, applyKickTable } from './piece';

/**
 * Checks if placing a shape at a position would cause a collision
 * @param board - The game board
 * @param shape - The shape to check
 * @param position - The position to check
 * @returns True if there would be a collision
 */
export function checkCollision(
  board: Board,
  shape: PolyominoShape,
  position: Coordinate
): boolean {
  return !isValidPosition(board, shape, position);
}

/**
 * Gets all valid moves for a piece
 * @param board - The game board
 * @param piece - The active piece
 * @returns Object indicating which moves are valid
 */
export function getValidMoves(
  board: Board,
  piece: ActivePiece
): {
  left: boolean;
  right: boolean;
  down: boolean;
  rotateLeft: boolean;
  rotateRight: boolean;
} {
  const [x, y] = piece.position;
  
  return {
    left: !checkCollision(board, piece.shape, [x - 1, y]),
    right: !checkCollision(board, piece.shape, [x + 1, y]),
    down: !checkCollision(board, piece.shape, [x, y + 1]),
    rotateLeft: findValidRotation(board, piece, false) !== null,
    rotateRight: findValidRotation(board, piece, true) !== null
  };
}

/**
 * Finds a valid rotation for a piece using kick tables
 * @param board - The game board
 * @param piece - The piece to rotate
 * @param clockwise - True for clockwise rotation
 * @returns The rotated piece with new position, or null if no valid rotation
 */
export function findValidRotation(
  board: Board,
  piece: ActivePiece,
  clockwise: boolean
): { piece: ActivePiece; position: Coordinate; kickIndex: number } | null {
  const rotatedPiece = rotatePiece(piece, clockwise);
  const kickTable = getKickTable(clockwise);
  
  const result = applyKickTable(
    rotatedPiece,
    kickTable,
    (position) => !checkCollision(board, rotatedPiece.shape, position)
  );
  
  if (result) {
    return {
      piece: { ...rotatedPiece, position: result.position },
      position: result.position,
      kickIndex: result.kickIndex
    };
  }
  
  return null;
}

/**
 * Checks if a piece can fit at a given position
 * @param board - The game board
 * @param shape - The shape to check
 * @param position - The position to check
 * @returns True if the piece can fit
 */
export function canPieceFit(
  board: Board,
  shape: PolyominoShape,
  position: Coordinate
): boolean {
  return isValidPosition(board, shape, position);
}

/**
 * Gets the kick table for rotation
 * @param clockwise - True for clockwise rotation
 * @returns Array of kick offsets to try
 */
export function getKickTable(clockwise: boolean): readonly Coordinate[] {
  // SRS-inspired kick table
  if (clockwise) {
    return [
      [0, 0],   // 1. No kick
      [-1, 0],  // 2. Left
      [1, 0],   // 3. Right
      [0, -1],  // 4. Up
      [-1, -1], // 5. Left-Up
      [1, -1],  // 6. Right-Up
    ];
  } else {
    return [
      [0, 0],   // 1. No kick
      [1, 0],   // 2. Right (opposite of CW)
      [-1, 0],  // 3. Left (opposite of CW)
      [0, -1],  // 4. Up
      [1, -1],  // 5. Right-Up (opposite of CW)
      [-1, -1], // 6. Left-Up (opposite of CW)
    ];
  }
}