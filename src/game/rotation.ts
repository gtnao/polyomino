/**
 * Rotation system with shape transformation and kick tables
 */

import type { PolyominoShape, Coordinate, Rotation } from './types';

/**
 * Kick table offsets for SRS-style rotation
 */
const KICK_TABLE = {
  clockwise: [
    [0, 0],   // 1. Try no offset
    [-1, 0],  // 2. Try left
    [1, 0],   // 3. Try right
    [0, -1],  // 4. Try up
    [-1, -1], // 5. Try left-up
    [1, -1],  // 6. Try right-up
  ] as const,
  counterClockwise: [
    [0, 0],   // 1. Try no offset
    [1, 0],   // 2. Try right
    [-1, 0],  // 3. Try left
    [0, -1],  // 4. Try up
    [1, -1],  // 5. Try right-up
    [-1, -1], // 6. Try left-up
  ] as const,
};

/**
 * Rotates a single coordinate around the origin
 * @param coord - The coordinate to rotate
 * @param clockwise - Direction of rotation
 * @returns The rotated coordinate
 */
function rotateCoordinate(coord: Coordinate, clockwise: boolean): Coordinate {
  const [x, y] = coord;
  if (clockwise) {
    // Clockwise 90°: (x, y) -> (y, -x)
    return [y, -x];
  } else {
    // Counter-clockwise 90°: (x, y) -> (-y, x)
    return [-y, x];
  }
}

/**
 * Finds the center of a shape for rotation
 * @param shape - The shape to find center of
 * @returns The center coordinate
 */
function getShapeCenter(shape: PolyominoShape): [number, number] {
  let sumX = 0;
  let sumY = 0;
  
  for (const [x, y] of shape) {
    sumX += x;
    sumY += y;
  }
  
  return [sumX / shape.length, sumY / shape.length];
}

/**
 * Normalizes shape to be centered around origin
 * @param shape - The shape to normalize
 * @returns The normalized shape
 */
function normalizeShape(shape: PolyominoShape): PolyominoShape {
  const [centerX, centerY] = getShapeCenter(shape);
  
  return shape.map(([x, y]) => [
    Math.round(x - centerX),
    Math.round(y - centerY)
  ] as const);
}

/**
 * Rotates a polyomino shape
 * @param shape - The shape to rotate
 * @param clockwise - Direction of rotation
 * @returns The rotated shape
 */
export function rotateShape(shape: PolyominoShape, clockwise: boolean): PolyominoShape {
  // First normalize the shape to center it
  const normalized = normalizeShape(shape);
  
  // Rotate each coordinate
  const rotated = normalized.map(coord => rotateCoordinate(coord, clockwise));
  
  // Re-normalize to ensure consistent positioning
  return normalizeShape(rotated);
}

/**
 * Gets the kick table offsets for a rotation
 * @param clockwise - Direction of rotation
 * @returns Array of offset coordinates to try
 */
export function getKickOffsets(clockwise: boolean): readonly Coordinate[] {
  return clockwise ? KICK_TABLE.clockwise : KICK_TABLE.counterClockwise;
}

/**
 * Applies an offset to a shape
 * @param shape - The shape to offset
 * @param offset - The offset to apply
 * @returns The offset shape
 */
export function applyOffset(shape: PolyominoShape, offset: Coordinate): PolyominoShape {
  const [dx, dy] = offset;
  return shape.map(([x, y]) => [x + dx, y + dy] as const);
}