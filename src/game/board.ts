import type { Board, Cell, PolyominoShape, Coordinate, BoardUpdate, PieceType } from './types';

/**
 * Creates an empty board with the specified dimensions
 * @param width - The width of the board
 * @param height - The height of the board
 * @returns An immutable empty board
 */
export function createEmptyBoard(width: number, height: number): Board {
  const board: (readonly Cell[])[] = [];
  
  for (let y = 0; y < height; y++) {
    const row: Cell[] = [];
    for (let x = 0; x < width; x++) {
      row.push(null);
    }
    board.push(Object.freeze(row));
  }
  
  return Object.freeze(board) as Board;
}

/**
 * Places a piece on the board
 * @param board - The current board state
 * @param shape - The shape of the piece to place
 * @param position - The position to place the piece at
 * @param pieceType - The type identifier of the piece
 * @param color - The color of the piece
 * @returns A new board with the piece placed
 */
export function placePiece(
  board: Board,
  shape: PolyominoShape,
  position: Coordinate,
  pieceType: PieceType,
  color: string
): Board {
  const [offsetX, offsetY] = position;
  const newBoard = board.map(row => [...row]);
  
  for (const [x, y] of shape) {
    const boardX = x + offsetX;
    const boardY = y + offsetY;
    
    if (boardY >= 0 && boardY < newBoard.length && 
        boardX >= 0 && boardX < newBoard[0]!.length) {
      newBoard[boardY]![boardX] = { type: pieceType, color };
    }
  }
  
  return newBoard.map(row => Object.freeze(row)) as Board;
}

/**
 * Removes a piece from the board
 * @param board - The current board state
 * @param shape - The shape of the piece to remove
 * @param position - The position of the piece
 * @returns A new board with the piece removed
 */
export function removePiece(
  board: Board,
  shape: PolyominoShape,
  position: Coordinate
): Board {
  const [offsetX, offsetY] = position;
  const newBoard = board.map(row => [...row]);
  
  for (const [x, y] of shape) {
    const boardX = x + offsetX;
    const boardY = y + offsetY;
    
    if (boardY >= 0 && boardY < newBoard.length && 
        boardX >= 0 && boardX < newBoard[0]!.length) {
      newBoard[boardY]![boardX] = null;
    }
  }
  
  return newBoard.map(row => Object.freeze(row)) as Board;
}

/**
 * Gets all fully filled lines on the board
 * @param board - The board to check
 * @returns Array of row indices that are fully filled
 */
export function getFilledLines(board: Board): number[] {
  const filledLines: number[] = [];
  
  for (let y = 0; y < board.length; y++) {
    const row = board[y]!;
    const isFilled = row.every(cell => cell !== null);
    
    if (isFilled) {
      filledLines.push(y);
    }
  }
  
  return filledLines;
}

/**
 * Clears specified lines and drops above lines down
 * @param board - The current board state
 * @param lines - The line indices to clear
 * @returns Board update with new board, cleared lines, and score
 */
export function clearLines(board: Board, lines: number[]): BoardUpdate {
  if (lines.length === 0) {
    return { board, clearedLines: [], score: 0 };
  }
  
  const newBoard: Cell[][] = [];
  const width = board[0]!.length;
  
  // Add empty rows at the top for each cleared line
  for (let i = 0; i < lines.length; i++) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const emptyRow: Cell[] = new Array(width).fill(null);
    newBoard.push(emptyRow);
  }
  
  // Copy non-cleared rows
  for (let y = 0; y < board.length; y++) {
    if (!lines.includes(y)) {
      newBoard.push([...board[y]!]);
    }
  }
  
  // Calculate score based on number of lines cleared
  const score = calculateLineScore(lines.length);
  
  return {
    board: newBoard.map(row => Object.freeze(row)) as Board,
    clearedLines: lines,
    score
  };
}

/**
 * Calculates score for cleared lines
 * @param lineCount - Number of lines cleared
 * @returns The score value
 */
function calculateLineScore(lineCount: number): number {
  switch (lineCount) {
    case 1: return 100;
    case 2: return 300;
    case 3: return 500;
    case 4: return 800;
    default: return 1000 + (lineCount - 4) * 200;
  }
}

/**
 * Checks if a piece position is valid (no collisions, within bounds)
 * @param board - The board to check against
 * @param shape - The shape to validate
 * @param position - The position to check
 * @returns True if the position is valid
 */
export function isValidPosition(
  board: Board,
  shape: PolyominoShape,
  position: Coordinate
): boolean {
  const [offsetX, offsetY] = position;
  
  for (const [x, y] of shape) {
    const boardX = x + offsetX;
    const boardY = y + offsetY;
    
    // Check bounds
    if (boardX < 0 || boardX >= board[0]!.length ||
        boardY < 0 || boardY >= board.length) {
      return false;
    }
    
    // Check collision
    if (board[boardY]![boardX] !== null) {
      return false;
    }
  }
  
  return true;
}

/**
 * Gets all occupied cell coordinates on the board
 * @param board - The board to check
 * @returns Array of coordinates for occupied cells
 */
export function getOccupiedCells(board: Board): Coordinate[] {
  const occupied: Coordinate[] = [];
  
  for (let y = 0; y < board.length; y++) {
    for (let x = 0; x < board[0]!.length; x++) {
      if (board[y]![x] !== null) {
        occupied.push([x, y]);
      }
    }
  }
  
  return occupied;
}

/**
 * Checks if a specific cell is occupied
 * @param board - The board to check
 * @param x - The x coordinate
 * @param y - The y coordinate
 * @returns True if the cell is occupied or out of bounds
 */
export function isCellOccupied(board: Board, x: number, y: number): boolean {
  // Out of bounds is considered occupied
  if (x < 0 || x >= board[0]!.length || y < 0 || y >= board.length) {
    return true;
  }
  
  return board[y]![x] !== null;
}