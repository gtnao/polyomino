import type { Coordinate, PolyominoShape } from '@/game/types';

/**
 * Rotates a coordinate around origin by given degrees
 * @param coord - The coordinate to rotate
 * @param degrees - The rotation angle in degrees (clockwise)
 * @returns The rotated coordinate
 */
export function rotateCoordinate(coord: Coordinate, degrees: number): Coordinate {
  // Normalize degrees to 0-360 range
  const normalizedDegrees = ((degrees % 360) + 360) % 360;
  const radians = (normalizedDegrees * Math.PI) / 180;
  
  const [x, y] = coord;
  const cos = Math.cos(radians);
  const sin = Math.sin(radians);
  
  // Rotation matrix multiplication
  let newX = Math.round(x * cos - y * sin);
  let newY = Math.round(x * sin + y * cos);
  
  // Handle -0 case
  if (Object.is(newX, -0)) {
    newX = 0;
  }
  if (Object.is(newY, -0)) {
    newY = 0;
  }
  
  return [newX, newY];
}

/**
 * Rotates a shape around origin by given degrees
 * @param shape - The shape to rotate
 * @param degrees - The rotation angle in degrees (clockwise)
 * @returns The rotated shape
 */
export function rotateShape(shape: PolyominoShape, degrees: number): PolyominoShape {
  return shape.map(coord => rotateCoordinate(coord, degrees));
}

/**
 * Translates a shape by given offset
 * @param shape - The shape to translate
 * @param offset - The [dx, dy] offset to apply
 * @returns The translated shape
 */
export function translateShape(shape: PolyominoShape, offset: Coordinate): PolyominoShape {
  const [dx, dy] = offset;
  return shape.map(([x, y]) => [x + dx, y + dy] as Coordinate);
}

export interface ShapeBounds {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  width: number;
  height: number;
}

/**
 * Calculates the bounding box of a shape
 * @param shape - The shape to analyze
 * @returns The bounding box information
 */
export function getShapeBounds(shape: PolyominoShape): ShapeBounds {
  if (shape.length === 0) {
    throw new Error('Shape cannot be empty');
  }
  
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  
  for (const [x, y] of shape) {
    minX = Math.min(minX, x);
    maxX = Math.max(maxX, x);
    minY = Math.min(minY, y);
    maxY = Math.max(maxY, y);
  }
  
  return {
    minX,
    maxX,
    minY,
    maxY,
    width: maxX - minX + 1,
    height: maxY - minY + 1
  };
}

/**
 * Normalizes a shape to have its top-left corner at origin
 * @param shape - The shape to normalize
 * @returns The normalized shape
 */
export function normalizeShape(shape: PolyominoShape): PolyominoShape {
  if (shape.length === 0) {
    throw new Error('Shape cannot be empty');
  }
  
  const bounds = getShapeBounds(shape);
  return translateShape(shape, [-bounds.minX, -bounds.minY]);
}