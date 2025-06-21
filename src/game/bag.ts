import type { PieceType } from './types';
import { shuffle } from '@/utils/helpers';

/**
 * Represents a bag of pieces for the 7-bag system
 */
export interface PieceBag {
  pieces: PieceType[];
}

/**
 * Creates a new bag with shuffled pieces
 * @param pieceTypes - All available piece types
 * @returns A new bag with shuffled pieces
 */
export function createBag(pieceTypes: readonly PieceType[]): PieceBag {
  return {
    pieces: shuffle(pieceTypes)
  };
}

/**
 * Gets the next piece from the bag
 * @param bag - The current bag
 * @param allTypes - All available piece types for refilling
 * @returns The next piece and updated bag
 */
export function getNextPiece(
  bag: PieceBag,
  allTypes: readonly PieceType[]
): {
  piece: PieceType;
  bag: PieceBag;
} {
  // Refill if empty
  if (bag.pieces.length === 0) {
    const newBag = refillBag(allTypes);
    return {
      piece: newBag.pieces[0]!,
      bag: { pieces: newBag.pieces.slice(1) }
    };
  }
  
  // Take first piece
  return {
    piece: bag.pieces[0]!,
    bag: { pieces: bag.pieces.slice(1) }
  };
}

/**
 * Refills the bag with a new set of shuffled pieces
 * @param pieceTypes - All available piece types
 * @returns A new filled bag
 */
export function refillBag(pieceTypes: readonly PieceType[]): PieceBag {
  return createBag(pieceTypes);
}

/**
 * Checks if a specific piece type is available in the bag
 * @param bag - The bag to check
 * @param pieceType - The piece type to look for
 * @returns True if the piece is available
 */
export function isPieceAvailable(bag: PieceBag, pieceType: PieceType): boolean {
  return bag.pieces.includes(pieceType);
}

/**
 * Gets a copy of the remaining pieces in the bag
 * @param bag - The bag to get pieces from
 * @returns Array of remaining piece types
 */
export function getRemainingPieces(bag: PieceBag): PieceType[] {
  return [...bag.pieces];
}