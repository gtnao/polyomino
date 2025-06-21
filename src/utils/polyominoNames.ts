/**
 * Get the proper name for a polyomino size
 */
export function getPolyominoName(size: number): string {
  switch (size) {
    case 4:
      return 'Tetromino (4)';
    case 5:
      return 'Pentomino (5)';
    case 6:
      return 'Hexomino (6)';
    case 7:
      return 'Heptomino (7)';
    case 8:
      return 'Octomino (8)';
    case 9:
      return 'Nonomino (9)';
    default:
      return `${size}-Polyomino (${size})`;
  }
}