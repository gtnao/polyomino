import type { PolyominoShape, Coordinate } from '@/game/types';

/**
 * Checks if a polyomino is connected (all cells are reachable from any other cell)
 * @param shape - The polyomino shape to check
 * @returns True if the shape is connected
 */
export function isConnected(shape: PolyominoShape): boolean {
  if (shape.length === 0) {return false;}
  if (shape.length === 1) {return true;}
  
  // Convert to set for O(1) lookup
  const cells = new Set(shape.map(([x, y]) => `${x},${y}`));
  const visited = new Set<string>();
  
  // Start from the first cell
  const queue: string[] = [`${shape[0]![0]},${shape[0]![1]}`];
  
  while (queue.length > 0) {
    const current = queue.shift()!;
    if (visited.has(current)) {continue;}
    
    visited.add(current);
    
    // Check all 4 orthogonal neighbors
    const [x, y] = current.split(',').map(Number) as [number, number];
    const neighbors: Coordinate[] = [
      [x + 1, y],
      [x - 1, y],
      [x, y + 1],
      [x, y - 1]
    ];
    
    for (const [nx, ny] of neighbors) {
      const key = `${nx},${ny}`;
      if (cells.has(key) && !visited.has(key)) {
        queue.push(key);
      }
    }
  }
  
  // Check if all cells were visited
  return visited.size === shape.length;
}

/**
 * Checks if a polyomino has no duplicate cells
 * @param shape - The polyomino shape to check
 * @returns True if there are no duplicate cells
 */
export function hasNoDuplicates(shape: PolyominoShape): boolean {
  const seen = new Set<string>();
  
  for (const [x, y] of shape) {
    const key = `${x},${y}`;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
  }
  
  return true;
}

/**
 * Validates if a shape is a valid polyomino
 * @param shape - The shape to validate
 * @returns True if the shape is a valid polyomino
 */
export function isValidPolyomino(shape: PolyominoShape): boolean {
  // Check if empty
  if (shape.length === 0) {return false;}
  
  // Check for duplicates
  if (!hasNoDuplicates(shape)) {return false;}
  
  // Check if connected
  if (!isConnected(shape)) {return false;}
  
  return true;
}