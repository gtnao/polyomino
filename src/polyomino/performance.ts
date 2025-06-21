/**
 * Performance optimizations for large polyominoes
 */

// Maximum number of unique pieces to use for larger polyominoes
const MAX_PIECES_BY_SIZE: Record<number, number> = {
  1: 1,
  2: 1,
  3: 2,
  4: 7,    // All tetrominos
  5: 12,   // All pentominoes
  6: 35,   // Limited subset
  7: 50,   // Limited subset
  8: 50,   // Limited subset
  9: 50,   // Limited subset - prevent performance issues
};

/**
 * Limits the number of polyomino shapes for performance
 * @param shapes - All possible shapes
 * @param size - Polyomino size
 * @returns Limited subset of shapes
 */
export function limitPolyominoShapes<T>(shapes: T[], size: number): T[] {
  const maxPieces = MAX_PIECES_BY_SIZE[size];
  if (!maxPieces || shapes.length <= maxPieces) {
    return shapes;
  }
  
  // For larger sizes, select a diverse subset
  const selectedShapes: T[] = [];
  const step = Math.ceil(shapes.length / maxPieces);
  
  for (let i = 0; i < shapes.length && selectedShapes.length < maxPieces; i += step) {
    const shape = shapes[i];
    if (shape) {
      selectedShapes.push(shape);
    }
  }
  
  // Always include some random shapes for variety
  while (selectedShapes.length < maxPieces && selectedShapes.length < shapes.length) {
    const randomIndex = Math.floor(Math.random() * shapes.length);
    const randomShape = shapes[randomIndex];
    if (randomShape && !selectedShapes.includes(randomShape)) {
      selectedShapes.push(randomShape);
    }
  }
  
  return selectedShapes;
}