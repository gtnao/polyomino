import type { ActivePiece, Coordinate, PolyominoShape, Board, PieceType, Rotation } from './types';
import { rotateShape } from '@/utils/math';
import { isValidPosition } from './board';

/**
 * Creates a new active piece
 * @param type - The piece type identifier
 * @param shape - The shape of the piece
 * @param position - The initial position
 * @param color - The color of the piece
 * @returns A new active piece
 */
export function createPiece(
  type: PieceType,
  shape: PolyominoShape,
  position: Coordinate,
  color: string
): ActivePiece {
  return {
    type,
    shape,
    position,
    rotation: 0,
    color
  };
}

/**
 * Rotates a piece clockwise or counter-clockwise
 * @param piece - The piece to rotate
 * @param clockwise - True for clockwise, false for counter-clockwise
 * @returns A new rotated piece
 */
export function rotatePiece(piece: ActivePiece, clockwise: boolean): ActivePiece {
  const degrees = clockwise ? 90 : -90;
  const newRotation = ((piece.rotation + (clockwise ? 1 : -1)) % 4 + 4) % 4 as Rotation;
  const newShape = rotateShape(piece.shape, degrees);
  
  return {
    ...piece,
    shape: newShape,
    rotation: newRotation
  };
}

/**
 * Moves a piece by the given offset
 * @param piece - The piece to move
 * @param offset - The [dx, dy] offset to apply
 * @returns A new moved piece
 */
export function movePiece(piece: ActivePiece, offset: Coordinate): ActivePiece {
  const [dx, dy] = offset;
  const [x, y] = piece.position;
  
  return {
    ...piece,
    position: [x + dx, y + dy]
  };
}

/**
 * Calculates the ghost piece position (where the piece would land)
 * @param board - The game board
 * @param piece - The active piece
 * @returns The Y position where the piece would land
 */
export function getGhostPosition(board: Board, piece: ActivePiece): number {
  let ghostY = piece.position[1];
  
  // Move down until we hit something
  while (isValidPosition(board, piece.shape, [piece.position[0], ghostY + 1])) {
    ghostY++;
  }
  
  return ghostY;
}

/**
 * Gets the absolute positions of all cells in a piece
 * @param piece - The piece to get cells for
 * @returns Array of absolute coordinates
 */
export function getPieceCells(piece: ActivePiece): Coordinate[] {
  const [offsetX, offsetY] = piece.position;
  
  return piece.shape.map(([x, y]) => [x + offsetX, y + offsetY] as Coordinate);
}

/**
 * Applies kick table offsets to find a valid position
 * @param piece - The piece to test
 * @param kickTable - Array of offset positions to try
 * @param validator - Function to validate if a position is valid
 * @returns The first valid position and its index, or null if none found
 */
export function applyKickTable(
  piece: ActivePiece,
  kickTable: readonly Coordinate[],
  validator: (position: Coordinate) => boolean
): { position: Coordinate; kickIndex: number } | null {
  const [baseX, baseY] = piece.position;
  
  for (let i = 0; i < kickTable.length; i++) {
    const [kickX, kickY] = kickTable[i]!;
    const testPosition: Coordinate = [baseX + kickX, baseY + kickY];
    
    if (validator(testPosition)) {
      return {
        position: testPosition,
        kickIndex: i
      };
    }
  }
  
  return null;
}