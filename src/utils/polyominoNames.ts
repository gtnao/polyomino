/**
 * Get the proper name for a polyomino size
 */
export function getPolyominoName(size: number): string {
  switch (size) {
    case 4:
      return 'Tetromino';
    case 5:
      return 'Pentomino';
    case 6:
      return 'Hexomino';
    case 7:
      return 'Heptomino';
    case 8:
      return 'Octomino';
    case 9:
      return 'Nonomino';
    default:
      return `${size}-Polyomino`;
  }
}