import type { PolyominoShape, BoundingBox, Coordinate } from '@/game/types';
import { rotateShape, normalizeShape } from '@/utils/math';

// Cache for memoization
const polyominoCache = new Map<number, PolyominoShape[]>();

/**
 * Clears the polyomino cache (mainly for testing)
 */
export function clearPolyominoCache(): void {
  polyominoCache.clear();
}

/**
 * Generates all unique polyominoes of a given size
 * @param size - The number of cells in each polyomino
 * @returns Array of unique polyominoes
 */
export function generatePolyominoes(size: number): PolyominoShape[] {
  if (size <= 0) {return [];}
  if (size === 1) {return [[[0, 0]]];}
  
  // Check cache first
  if (polyominoCache.has(size)) {
    return [...polyominoCache.get(size)!]; // Return a copy
  }
  
  const polyominoes: PolyominoShape[] = [];
  const seenCanonical = new Set<string>();
  
  // Special case for size 2
  if (size === 2) {
    polyominoes.push([[0, 0], [1, 0]]); // Horizontal domino
    polyominoCache.set(size, polyominoes);
    return [...polyominoes];
  }
  
  // Generate polyominoes by adding one cell to smaller polyominoes
  const smallerPolyominoes = generatePolyominoes(size - 1);
  
  for (const base of smallerPolyominoes) {
    const candidates = getExpansionCandidates(base);
    
    for (const candidate of candidates) {
      const canonical = getCanonicalForm(candidate);
      const key = polyominoToString(canonical);
      
      if (!seenCanonical.has(key)) {
        seenCanonical.add(key);
        polyominoes.push(canonical);
      }
    }
  }
  
  polyominoCache.set(size, polyominoes);
  return [...polyominoes];
}

/**
 * Gets all valid positions where a new cell can be added to expand the polyomino
 */
function getExpansionCandidates(shape: PolyominoShape): PolyominoShape[] {
  const cells = new Set(shape.map(([x, y]) => `${x},${y}`));
  const candidates: PolyominoShape[] = [];
  const adjacentPositions = new Set<string>();
  
  // Find all empty adjacent positions
  for (const [x, y] of shape) {
    const neighbors: Coordinate[] = [
      [x + 1, y],
      [x - 1, y],
      [x, y + 1],
      [x, y - 1]
    ];
    
    for (const [nx, ny] of neighbors) {
      const key = `${nx},${ny}`;
      if (!cells.has(key)) {
        adjacentPositions.add(key);
      }
    }
  }
  
  // Create new polyominoes by adding each adjacent position
  for (const pos of adjacentPositions) {
    const [x, y] = pos.split(',').map(Number) as [number, number];
    candidates.push([...shape, [x, y]]);
  }
  
  return candidates;
}

/**
 * Normalizes a polyomino by translating it so its top-left corner is at origin
 */
export function normalizePolyomino(shape: PolyominoShape): PolyominoShape {
  return normalizeShape(shape);
}

/**
 * Gets all 8 transformations (4 rotations × 2 reflections) of a polyomino
 */
export function getAllTransformations(shape: PolyominoShape): PolyominoShape[] {
  const transformations: PolyominoShape[] = [];
  const seen = new Set<string>();
  
  // Try all 8 transformations
  for (const reflect of [false, true]) {
    const baseShape = reflect ? reflectShape(shape) : shape;
    
    for (let rotation = 0; rotation < 4; rotation++) {
      const rotated = rotateShape(baseShape, rotation * 90);
      const normalized = normalizePolyomino(rotated);
      const key = polyominoToString(normalized);
      
      if (!seen.has(key)) {
        seen.add(key);
        transformations.push(normalized);
      }
    }
  }
  
  return transformations;
}

/**
 * Gets all unique rotations of a polyomino (without reflection)
 */
export function getAllRotations(shape: PolyominoShape): PolyominoShape[] {
  const rotations: PolyominoShape[] = [];
  
  for (let i = 0; i < 4; i++) {
    const rotated = rotateShape(shape, i * 90);
    rotations.push(normalizePolyomino(rotated));
  }
  
  return rotations;
}

/**
 * Reflects a polyomino horizontally (flip along Y-axis)
 */
function reflectShape(shape: PolyominoShape): PolyominoShape {
  return shape.map(([x, y]) => [-x, y] as Coordinate);
}

/**
 * Gets the canonical form of a polyomino (lexicographically smallest transformation)
 */
function getCanonicalForm(shape: PolyominoShape): PolyominoShape {
  const normalized = normalizePolyomino(shape);
  const transformations = getAllTransformations(normalized);
  
  // Find the lexicographically smallest transformation
  let canonical = transformations[0]!;
  let canonicalStr = polyominoToString(canonical);
  
  for (let i = 1; i < transformations.length; i++) {
    const current = transformations[i]!;
    const currentStr = polyominoToString(current);
    
    if (currentStr < canonicalStr) {
      canonical = current;
      canonicalStr = currentStr;
    }
  }
  
  return canonical;
}

/**
 * Checks if a polyomino is in canonical form
 */
export function isCanonicalForm(shape: PolyominoShape): boolean {
  const normalized = normalizePolyomino(shape);
  const canonical = getCanonicalForm(normalized);
  return polyominoToString(normalized) === polyominoToString(canonical);
}

/**
 * Converts a polyomino to a string representation for comparison
 */
function polyominoToString(shape: PolyominoShape): string {
  const sorted = [...shape].sort((a, b) => {
    if (a[0] !== b[0]) {return a[0] - b[0];}
    return a[1] - b[1];
  });
  return JSON.stringify(sorted);
}

/**
 * Checks if two polyominoes are equal (same cells)
 */
export function arePolyominoesEqual(shape1: PolyominoShape, shape2: PolyominoShape): boolean {
  if (shape1.length !== shape2.length) {return false;}
  
  const str1 = polyominoToString(shape1);
  const str2 = polyominoToString(shape2);
  
  return str1 === str2;
}

/**
 * Gets the bounding box of a polyomino
 */
export function getBoundingBox(shape: PolyominoShape): BoundingBox {
  if (shape.length === 0) {
    return { width: 0, height: 0, offsetX: 0, offsetY: 0 };
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
    width: maxX - minX + 1,
    height: maxY - minY + 1,
    offsetX: minX,
    offsetY: minY
  };
}