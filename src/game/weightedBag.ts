import type { PieceType, PieceDefinition } from './types';
import { selectWeightedPiece } from '../polyomino/hardcodedShapes';

/**
 * Weighted bag system for piece selection
 */
export interface WeightedPieceBag {
  pieceDefinitions: PieceDefinition[];
  history: PieceType[]; // 最近出たピースの履歴（偏り防止用）
  maxHistorySize: number;
}

/**
 * Creates a new weighted bag
 * @param pieceDefinitions - All available piece definitions with weights
 * @returns A new weighted bag
 */
export function createWeightedBag(pieceDefinitions: PieceDefinition[]): WeightedPieceBag {
  if (!pieceDefinitions || pieceDefinitions.length === 0) {
    throw new Error('Cannot create weighted bag with empty piece definitions');
  }
  
  return {
    pieceDefinitions,
    history: [],
    maxHistorySize: Math.min(10, Math.floor(pieceDefinitions.length / 2)) // 履歴サイズは全ピース数の半分まで
  };
}

/**
 * Gets the next piece using weighted selection
 * @param bag - The current weighted bag
 * @returns The next piece type and updated bag
 */
export function getNextWeightedPiece(bag: WeightedPieceBag): {
  piece: PieceType;
  bag: WeightedPieceBag;
} {
  // 安全性チェック
  if (!bag.pieceDefinitions || bag.pieceDefinitions.length === 0) {
    throw new Error('No piece definitions available in weighted bag');
  }
  
  // ハードコードされたピースがある場合（3-7）は重み付き選択を使用
  const hasWeights = bag.pieceDefinitions.some(def => def.weight !== undefined);
  
  if (hasWeights) {
    // 重み付き選択用のデータ構造に変換
    const weightedPieces = bag.pieceDefinitions.map(def => ({
      shape: def.shape,
      name: def.id,
      weight: def.weight || 10 // デフォルト重み
    }));
    
    // 履歴に基づいて重みを調整（最近出たピースの重みを下げる）
    const adjustedPieces = weightedPieces.map(piece => {
      const recentCount = bag.history.filter(h => h === piece.name).length;
      const adjustmentFactor = Math.pow(0.7, recentCount); // 履歴にある回数分、30%ずつ重みを減らす
      return {
        ...piece,
        weight: piece.weight * adjustmentFactor
      };
    });
    
    // 重み付き選択
    const selectedShape = selectWeightedPiece(adjustedPieces);
    const selectedPiece = bag.pieceDefinitions.find(def => 
      JSON.stringify(def.shape) === JSON.stringify(selectedShape)
    )!;
    
    // 履歴を更新
    const newHistory = [selectedPiece.id, ...bag.history].slice(0, bag.maxHistorySize);
    
    return {
      piece: selectedPiece.id,
      bag: {
        ...bag,
        history: newHistory
      }
    };
  } else {
    // 重みがない場合は通常のランダム選択
    const randomIndex = Math.floor(Math.random() * bag.pieceDefinitions.length);
    const selectedPiece = bag.pieceDefinitions[randomIndex]!;
    
    return {
      piece: selectedPiece.id,
      bag
    };
  }
}

/**
 * Checks if a specific piece type is available
 * @param bag - The bag to check
 * @param pieceType - The piece type to look for
 * @returns True if the piece is available
 */
export function isWeightedPieceAvailable(bag: WeightedPieceBag, pieceType: PieceType): boolean {
  return bag.pieceDefinitions.some(def => def.id === pieceType);
}

/**
 * Gets all available piece types
 * @param bag - The bag to get pieces from
 * @returns Array of available piece types
 */
export function getAvailablePieceTypes(bag: WeightedPieceBag): PieceType[] {
  return bag.pieceDefinitions.map(def => def.id);
}