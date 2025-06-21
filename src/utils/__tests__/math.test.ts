import { describe, it, expect } from 'vitest';
import { rotateCoordinate, rotateShape, translateShape, getShapeBounds, normalizeShape } from '../math';
import type { PolyominoShape } from '@/game/types';

describe('rotateCoordinate', () => {
  it('should rotate 90 degrees clockwise', () => {
    expect(rotateCoordinate([1, 0], 90)).toEqual([0, 1]);
    expect(rotateCoordinate([0, 1], 90)).toEqual([-1, 0]);
    expect(rotateCoordinate([-1, 0], 90)).toEqual([0, -1]);
    expect(rotateCoordinate([0, -1], 90)).toEqual([1, 0]);
  });

  it('should rotate 180 degrees', () => {
    expect(rotateCoordinate([1, 0], 180)).toEqual([-1, 0]);
    expect(rotateCoordinate([0, 1], 180)).toEqual([0, -1]);
    expect(rotateCoordinate([-1, 0], 180)).toEqual([1, 0]);
    expect(rotateCoordinate([0, -1], 180)).toEqual([0, 1]);
  });

  it('should rotate 270 degrees clockwise', () => {
    expect(rotateCoordinate([1, 0], 270)).toEqual([0, -1]);
    expect(rotateCoordinate([0, 1], 270)).toEqual([1, 0]);
    expect(rotateCoordinate([-1, 0], 270)).toEqual([0, 1]);
    expect(rotateCoordinate([0, -1], 270)).toEqual([-1, 0]);
  });

  it('should handle 0 degrees (no rotation)', () => {
    expect(rotateCoordinate([1, 2], 0)).toEqual([1, 2]);
    expect(rotateCoordinate([-3, 4], 0)).toEqual([-3, 4]);
  });

  it('should handle angles greater than 360', () => {
    expect(rotateCoordinate([1, 0], 450)).toEqual([0, 1]); // 450 % 360 = 90
    expect(rotateCoordinate([1, 0], 720)).toEqual([1, 0]); // 720 % 360 = 0
  });

  it('should handle negative angles', () => {
    expect(rotateCoordinate([1, 0], -90)).toEqual([0, -1]); // Same as 270
    expect(rotateCoordinate([1, 0], -180)).toEqual([-1, 0]); // Same as 180
  });
});

describe('rotateShape', () => {
  it('should rotate a shape 90 degrees clockwise', () => {
    const shape: PolyominoShape = [[0, 0], [1, 0], [0, 1]];
    const rotated = rotateShape(shape, 90);
    expect(rotated).toEqual([[0, 0], [0, 1], [-1, 0]]);
  });

  it('should rotate a line shape', () => {
    const shape: PolyominoShape = [[0, 0], [1, 0], [2, 0], [3, 0]];
    const rotated90 = rotateShape(shape, 90);
    expect(rotated90).toEqual([[0, 0], [0, 1], [0, 2], [0, 3]]);
    
    const rotated180 = rotateShape(shape, 180);
    expect(rotated180).toEqual([[0, 0], [-1, 0], [-2, 0], [-3, 0]]);
  });

  it('should preserve shape integrity', () => {
    const shape: PolyominoShape = [[0, 0], [1, 0], [1, 1], [2, 1]];
    const rotated = rotateShape(shape, 90);
    // Check that the shape still has the same number of cells
    expect(rotated).toHaveLength(shape.length);
  });

  it('should return to original after 360 degree rotation', () => {
    const shape: PolyominoShape = [[0, 0], [1, 0], [0, 1], [1, 2]];
    const rotated360 = rotateShape(shape, 360);
    expect(rotated360).toEqual(shape);
  });
});

describe('translateShape', () => {
  it('should translate shape by given offset', () => {
    const shape: PolyominoShape = [[0, 0], [1, 0], [0, 1]];
    const translated = translateShape(shape, [2, 3]);
    expect(translated).toEqual([[2, 3], [3, 3], [2, 4]]);
  });

  it('should handle negative translations', () => {
    const shape: PolyominoShape = [[5, 5], [6, 5], [5, 6]];
    const translated = translateShape(shape, [-3, -2]);
    expect(translated).toEqual([[2, 3], [3, 3], [2, 4]]);
  });

  it('should handle zero translation', () => {
    const shape: PolyominoShape = [[1, 2], [2, 2], [3, 2]];
    const translated = translateShape(shape, [0, 0]);
    expect(translated).toEqual(shape);
  });

  it('should not mutate original shape', () => {
    const shape: PolyominoShape = [[0, 0], [1, 0]];
    const original = [...shape];
    translateShape(shape, [5, 5]);
    expect(shape).toEqual(original);
  });
});

describe('getShapeBounds', () => {
  it('should calculate bounds for a simple shape', () => {
    const shape: PolyominoShape = [[0, 0], [1, 0], [0, 1], [1, 1]];
    const bounds = getShapeBounds(shape);
    expect(bounds).toEqual({
      minX: 0,
      maxX: 1,
      minY: 0,
      maxY: 1,
      width: 2,
      height: 2
    });
  });

  it('should handle negative coordinates', () => {
    const shape: PolyominoShape = [[-2, -1], [-1, -1], [0, 0], [1, 1]];
    const bounds = getShapeBounds(shape);
    expect(bounds).toEqual({
      minX: -2,
      maxX: 1,
      minY: -1,
      maxY: 1,
      width: 4,
      height: 3
    });
  });

  it('should handle single cell shape', () => {
    const shape: PolyominoShape = [[5, 7]];
    const bounds = getShapeBounds(shape);
    expect(bounds).toEqual({
      minX: 5,
      maxX: 5,
      minY: 7,
      maxY: 7,
      width: 1,
      height: 1
    });
  });

  it('should handle line shapes', () => {
    const horizontalLine: PolyominoShape = [[0, 0], [1, 0], [2, 0], [3, 0]];
    const hBounds = getShapeBounds(horizontalLine);
    expect(hBounds).toEqual({
      minX: 0,
      maxX: 3,
      minY: 0,
      maxY: 0,
      width: 4,
      height: 1
    });

    const verticalLine: PolyominoShape = [[0, 0], [0, 1], [0, 2], [0, 3]];
    const vBounds = getShapeBounds(verticalLine);
    expect(vBounds).toEqual({
      minX: 0,
      maxX: 0,
      minY: 0,
      maxY: 3,
      width: 1,
      height: 4
    });
  });

  it('should throw error for empty shape', () => {
    const shape: PolyominoShape = [];
    expect(() => getShapeBounds(shape)).toThrow('Shape cannot be empty');
  });
});

describe('normalizeShape', () => {
  it('should normalize shape to origin', () => {
    const shape: PolyominoShape = [[2, 3], [3, 3], [2, 4]];
    const normalized = normalizeShape(shape);
    expect(normalized).toEqual([[0, 0], [1, 0], [0, 1]]);
  });

  it('should handle negative coordinates', () => {
    const shape: PolyominoShape = [[-2, -1], [-1, -1], [-2, 0]];
    const normalized = normalizeShape(shape);
    expect(normalized).toEqual([[0, 0], [1, 0], [0, 1]]);
  });

  it('should preserve relative positions', () => {
    const shape: PolyominoShape = [[5, 10], [7, 10], [6, 11], [6, 12]];
    const normalized = normalizeShape(shape);
    expect(normalized).toEqual([[0, 0], [2, 0], [1, 1], [1, 2]]);
  });

  it('should handle already normalized shapes', () => {
    const shape: PolyominoShape = [[0, 0], [1, 0], [0, 1]];
    const normalized = normalizeShape(shape);
    expect(normalized).toEqual(shape);
  });

  it('should handle single cell', () => {
    const shape: PolyominoShape = [[10, 20]];
    const normalized = normalizeShape(shape);
    expect(normalized).toEqual([[0, 0]]);
  });

  it('should not mutate original shape', () => {
    const shape: PolyominoShape = [[5, 5], [6, 5]];
    const original = [...shape];
    normalizeShape(shape);
    expect(shape).toEqual(original);
  });

  it('should throw error for empty shape', () => {
    const shape: PolyominoShape = [];
    expect(() => normalizeShape(shape)).toThrow('Shape cannot be empty');
  });
});