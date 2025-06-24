import type { PolyominoShape } from '../game/types';

export interface WeightedPolyomino {
  shape: PolyominoShape;
  name: string;
  weight: number; // 出現頻度の重み（大きいほど出やすい）
}

// Triomino (3) - 2種類
export const TRIOMINOES: WeightedPolyomino[] = [
  {
    name: 'I3',
    shape: [[0, 0], [1, 0], [2, 0]] as PolyominoShape,
    weight: 60, // 直線は使いやすいので高頻度
  },
  {
    name: 'L3',
    shape: [[0, 0], [1, 0], [0, 1]] as PolyominoShape,
    weight: 40,
  },
];

// Tetromino (4) - 7種類（標準テトリス）
export const TETROMINOES: WeightedPolyomino[] = [
  {
    name: 'I',
    shape: [[0, 0], [1, 0], [2, 0], [3, 0]] as PolyominoShape,
    weight: 10, // 全て同じ確率
  },
  {
    name: 'O',
    shape: [[0, 0], [1, 0], [0, 1], [1, 1]] as PolyominoShape,
    weight: 10,
  },
  {
    name: 'T',
    shape: [[0, 0], [1, 0], [2, 0], [1, 1]] as PolyominoShape,
    weight: 10,
  },
  {
    name: 'S',
    shape: [[1, 0], [2, 0], [0, 1], [1, 1]] as PolyominoShape,
    weight: 10,
  },
  {
    name: 'Z',
    shape: [[0, 0], [1, 0], [1, 1], [2, 1]] as PolyominoShape,
    weight: 10,
  },
  {
    name: 'L',
    shape: [[0, 0], [0, 1], [0, 2], [1, 2]] as PolyominoShape,
    weight: 10,
  },
  {
    name: 'J',
    shape: [[1, 0], [1, 1], [1, 2], [0, 2]] as PolyominoShape,
    weight: 10,
  },
];

// Pentomino (5) - 18種類（テトリス用：回転のみで鏡像含む）
export const PENTOMINOES: WeightedPolyomino[] = [
  // 対称形（鏡像不要）
  {
    name: 'I',
    shape: [[0, 0], [1, 0], [2, 0], [3, 0], [4, 0]] as PolyominoShape,
    weight: 12,
  },
  {
    name: 'T',
    shape: [[0, 0], [1, 0], [2, 0], [1, 1], [1, 2]] as PolyominoShape,
    weight: 11,
  },
  {
    name: 'U',
    shape: [[0, 0], [2, 0], [0, 1], [1, 1], [2, 1]] as PolyominoShape,
    weight: 10,
  },
  {
    name: 'V',
    shape: [[0, 0], [0, 1], [0, 2], [1, 2], [2, 2]] as PolyominoShape,
    weight: 10,
  },
  {
    name: 'W',
    shape: [[0, 0], [0, 1], [1, 1], [1, 2], [2, 2]] as PolyominoShape,
    weight: 9,
  },
  {
    name: 'X',
    shape: [[1, 0], [0, 1], [1, 1], [2, 1], [1, 2]] as PolyominoShape,
    weight: 11,
  },
  // 非対称形ペア
  {
    name: 'F',
    shape: [[1, 0], [2, 0], [0, 1], [1, 1], [1, 2]] as PolyominoShape,
    weight: 9,
  },
  {
    name: 'F2',
    shape: [[0, 0], [1, 0], [1, 1], [2, 1], [1, 2]] as PolyominoShape,
    weight: 9,
  },
  {
    name: 'L',
    shape: [[0, 0], [0, 1], [0, 2], [0, 3], [1, 3]] as PolyominoShape,
    weight: 10,
  },
  {
    name: 'J',
    shape: [[1, 0], [1, 1], [1, 2], [1, 3], [0, 3]] as PolyominoShape,
    weight: 10,
  },
  {
    name: 'N',
    shape: [[1, 0], [1, 1], [0, 1], [0, 2], [0, 3]] as PolyominoShape,
    weight: 10,
  },
  {
    name: 'N2',
    shape: [[0, 0], [0, 1], [1, 1], [1, 2], [1, 3]] as PolyominoShape,
    weight: 10,
  },
  {
    name: 'P',
    shape: [[0, 0], [1, 0], [0, 1], [1, 1], [0, 2]] as PolyominoShape,
    weight: 10,
  },
  {
    name: 'Q',
    shape: [[0, 0], [1, 0], [0, 1], [1, 1], [1, 2]] as PolyominoShape,
    weight: 10,
  },
  {
    name: 'Y',
    shape: [[1, 0], [0, 1], [1, 1], [1, 2], [1, 3]] as PolyominoShape,
    weight: 10,
  },
  {
    name: 'Y2',
    shape: [[0, 0], [0, 1], [1, 1], [0, 2], [0, 3]] as PolyominoShape,
    weight: 10,
  },
  {
    name: 'Z',
    shape: [[0, 0], [1, 0], [1, 1], [1, 2], [2, 2]] as PolyominoShape,
    weight: 9,
  },
  {
    name: 'S',
    shape: [[1, 0], [2, 0], [0, 1], [1, 1], [0, 2]] as PolyominoShape,
    weight: 9,
  },
];

// Hexomino (6) - 35種類から厳選
export const HEXOMINOES: WeightedPolyomino[] = [
  {
    name: 'I6',
    shape: [[0, 0], [1, 0], [2, 0], [3, 0], [4, 0], [5, 0]] as PolyominoShape,
    weight: 30, // 最重要
  },
  {
    name: 'O6', // 2x3の長方形
    shape: [[0, 0], [1, 0], [2, 0], [0, 1], [1, 1], [2, 1]] as PolyominoShape,
    weight: 20, // とても使いやすい
  },
  {
    name: 'J6',
    shape: [[0, 0], [0, 1], [0, 2], [0, 3], [0, 4], [1, 4]] as PolyominoShape,
    weight: 10,
  },
  {
    name: 'L6',
    shape: [[0, 0], [0, 1], [0, 2], [0, 3], [0, 4], [1, 0]] as PolyominoShape,
    weight: 10,
  },
  {
    name: 'T6',
    shape: [[0, 0], [1, 0], [2, 0], [3, 0], [1, 1], [2, 1]] as PolyominoShape,
    weight: 12,
  },
  {
    name: 'Y6',
    shape: [[0, 0], [1, 0], [1, 1], [2, 1], [1, 2], [1, 3]] as PolyominoShape,
    weight: 8,
  },
  {
    name: 'N6',
    shape: [[0, 0], [0, 1], [1, 1], [1, 2], [1, 3], [1, 4]] as PolyominoShape,
    weight: 7,
  },
  {
    name: 'Z6',
    shape: [[0, 0], [1, 0], [2, 0], [2, 1], [3, 1], [4, 1]] as PolyominoShape,
    weight: 6,
  },
  {
    name: 'P6',
    shape: [[0, 0], [1, 0], [0, 1], [1, 1], [0, 2], [0, 3]] as PolyominoShape,
    weight: 9,
  },
  {
    name: 'U6',
    shape: [[0, 0], [2, 0], [0, 1], [1, 1], [2, 1], [0, 2]] as PolyominoShape,
    weight: 8,
  },
  {
    name: 'X6', // 十字の延長
    shape: [[1, 0], [0, 1], [1, 1], [2, 1], [3, 1], [1, 2]] as PolyominoShape,
    weight: 11,
  },
  {
    name: 'W6',
    shape: [[0, 0], [0, 1], [1, 1], [1, 2], [2, 2], [2, 3]] as PolyominoShape,
    weight: 6,
  },
  {
    name: 'F6',
    shape: [[1, 0], [2, 0], [0, 1], [1, 1], [1, 2], [1, 3]] as PolyominoShape,
    weight: 7,
  },
  {
    name: 'V6',
    shape: [[0, 0], [0, 1], [0, 2], [0, 3], [1, 3], [2, 3]] as PolyominoShape,
    weight: 8,
  },
  {
    name: 'Q6', // コンパクトな形
    shape: [[0, 0], [1, 0], [0, 1], [1, 1], [2, 1], [1, 2]] as PolyominoShape,
    weight: 10,
  },
];

// Heptomino (7) - 108種類から厳選
export const HEPTOMINOES: WeightedPolyomino[] = [
  {
    name: 'I7',
    shape: [[0, 0], [1, 0], [2, 0], [3, 0], [4, 0], [5, 0], [6, 0]] as PolyominoShape,
    weight: 35, // 最重要
  },
  {
    name: 'L7',
    shape: [[0, 0], [0, 1], [0, 2], [0, 3], [0, 4], [0, 5], [1, 5]] as PolyominoShape,
    weight: 12,
  },
  {
    name: 'J7',
    shape: [[1, 0], [1, 1], [1, 2], [1, 3], [1, 4], [1, 5], [0, 5]] as PolyominoShape,
    weight: 12,
  },
  {
    name: 'O7', // コンパクトな形
    shape: [[0, 0], [1, 0], [2, 0], [0, 1], [1, 1], [2, 1], [0, 2]] as PolyominoShape,
    weight: 15,
  },
  {
    name: 'T7',
    shape: [[0, 0], [1, 0], [2, 0], [3, 0], [4, 0], [2, 1], [2, 2]] as PolyominoShape,
    weight: 10,
  },
  {
    name: 'Y7',
    shape: [[0, 0], [1, 0], [1, 1], [2, 1], [1, 2], [1, 3], [1, 4]] as PolyominoShape,
    weight: 8,
  },
  {
    name: 'S7',
    shape: [[1, 0], [2, 0], [3, 0], [0, 1], [1, 1], [2, 1], [3, 1]] as PolyominoShape,
    weight: 9,
  },
  {
    name: 'Z7',
    shape: [[0, 0], [1, 0], [2, 0], [2, 1], [3, 1], [4, 1], [5, 1]] as PolyominoShape,
    weight: 6,
  },
  {
    name: 'U7',
    shape: [[0, 0], [2, 0], [0, 1], [1, 1], [2, 1], [0, 2], [2, 2]] as PolyominoShape,
    weight: 10,
  },
  {
    name: 'P7',
    shape: [[0, 0], [1, 0], [0, 1], [1, 1], [0, 2], [0, 3], [0, 4]] as PolyominoShape,
    weight: 9,
  },
  {
    name: 'N7',
    shape: [[0, 0], [0, 1], [1, 1], [1, 2], [1, 3], [1, 4], [1, 5]] as PolyominoShape,
    weight: 7,
  },
  {
    name: 'W7',
    shape: [[0, 0], [0, 1], [1, 1], [1, 2], [2, 2], [2, 3], [3, 3]] as PolyominoShape,
    weight: 5,
  },
  {
    name: 'F7',
    shape: [[1, 0], [2, 0], [0, 1], [1, 1], [1, 2], [1, 3], [2, 3]] as PolyominoShape,
    weight: 7,
  },
  {
    name: 'V7',
    shape: [[0, 0], [0, 1], [0, 2], [0, 3], [0, 4], [1, 4], [2, 4]] as PolyominoShape,
    weight: 8,
  },
  {
    name: 'X7',
    shape: [[1, 0], [0, 1], [1, 1], [2, 1], [3, 1], [1, 2], [1, 3]] as PolyominoShape,
    weight: 10,
  },
  {
    name: 'Q7',
    shape: [[0, 0], [1, 0], [2, 0], [0, 1], [1, 1], [2, 1], [3, 1]] as PolyominoShape,
    weight: 11,
  },
  {
    name: 'R7', // 長方形に近い
    shape: [[0, 0], [1, 0], [2, 0], [3, 0], [0, 1], [1, 1], [2, 1]] as PolyominoShape,
    weight: 14,
  },
  {
    name: 'H7', // H型
    shape: [[0, 0], [2, 0], [0, 1], [1, 1], [2, 1], [0, 2], [2, 2]] as PolyominoShape,
    weight: 9,
  },
];

// 各サイズのピースセットを取得
export function getHardcodedPieces(size: 3 | 4 | 5 | 6 | 7): WeightedPolyomino[] {
  switch (size) {
    case 3:
      return TRIOMINOES;
    case 4:
      return TETROMINOES;
    case 5:
      return PENTOMINOES;
    case 6:
      return HEXOMINOES;
    case 7:
      return HEPTOMINOES;
    default:
      return [];
  }
}

// 重み付きランダム選択
export function selectWeightedPiece(pieces: WeightedPolyomino[]): PolyominoShape {
  const totalWeight = pieces.reduce((sum, piece) => sum + piece.weight, 0);
  let random = Math.random() * totalWeight;
  
  for (const piece of pieces) {
    random -= piece.weight;
    if (random <= 0) {
      return piece.shape;
    }
  }
  
  // フォールバック（通常は到達しない）
  return pieces[0]!.shape;
}

