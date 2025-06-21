import { describe, it, expect } from 'vitest';
import { shuffle, clamp, deepClone, range } from '../helpers';

describe('shuffle', () => {
  it('should return an array with the same length', () => {
    const arr = [1, 2, 3, 4, 5];
    const shuffled = shuffle(arr);
    expect(shuffled).toHaveLength(arr.length);
  });

  it('should contain all the original elements', () => {
    const arr = [1, 2, 3, 4, 5];
    const shuffled = shuffle(arr);
    expect(shuffled.sort()).toEqual(arr.sort());
  });

  it('should not mutate the original array', () => {
    const arr = [1, 2, 3, 4, 5];
    const original = [...arr];
    shuffle(arr);
    expect(arr).toEqual(original);
  });

  it('should handle empty arrays', () => {
    const arr: number[] = [];
    const shuffled = shuffle(arr);
    expect(shuffled).toEqual([]);
  });

  it('should handle single element arrays', () => {
    const arr = [42];
    const shuffled = shuffle(arr);
    expect(shuffled).toEqual([42]);
  });

  it('should produce different orders (statistically)', () => {
    const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const results = new Set<string>();
    
    // Run shuffle multiple times to check randomness
    for (let i = 0; i < 100; i++) {
      results.add(JSON.stringify(shuffle(arr)));
    }
    
    // With 10 elements, we should see multiple different orders
    expect(results.size).toBeGreaterThan(1);
  });
});

describe('clamp', () => {
  it('should return the value if within range', () => {
    expect(clamp(5, 0, 10)).toBe(5);
    expect(clamp(0, -10, 10)).toBe(0);
    expect(clamp(-5, -10, 0)).toBe(-5);
  });

  it('should return min if value is less than min', () => {
    expect(clamp(-5, 0, 10)).toBe(0);
    expect(clamp(-100, -10, 10)).toBe(-10);
    expect(clamp(5, 10, 20)).toBe(10);
  });

  it('should return max if value is greater than max', () => {
    expect(clamp(15, 0, 10)).toBe(10);
    expect(clamp(100, -10, 10)).toBe(10);
    expect(clamp(25, 10, 20)).toBe(20);
  });

  it('should handle edge cases', () => {
    expect(clamp(10, 10, 10)).toBe(10);
    expect(clamp(0, 0, 0)).toBe(0);
    expect(clamp(-5, -5, -5)).toBe(-5);
  });

  it('should work with decimal numbers', () => {
    expect(clamp(5.5, 0.0, 10.0)).toBe(5.5);
    expect(clamp(-0.5, 0.0, 1.0)).toBe(0.0);
    expect(clamp(1.5, 0.0, 1.0)).toBe(1.0);
  });
});

describe('deepClone', () => {
  it('should clone primitive values', () => {
    expect(deepClone(42)).toBe(42);
    expect(deepClone('hello')).toBe('hello');
    expect(deepClone(true)).toBe(true);
    expect(deepClone(null)).toBe(null);
    expect(deepClone(undefined)).toBe(undefined);
  });

  it('should clone arrays', () => {
    const arr = [1, 2, 3];
    const cloned = deepClone(arr);
    expect(cloned).toEqual(arr);
    expect(cloned).not.toBe(arr);
  });

  it('should clone nested arrays', () => {
    const arr = [[1, 2], [3, 4], [5, 6]];
    const cloned = deepClone(arr);
    expect(cloned).toEqual(arr);
    expect(cloned).not.toBe(arr);
    expect(cloned[0]).not.toBe(arr[0]);
  });

  it('should clone objects', () => {
    const obj = { a: 1, b: 2, c: 3 };
    const cloned = deepClone(obj);
    expect(cloned).toEqual(obj);
    expect(cloned).not.toBe(obj);
  });

  it('should clone nested objects', () => {
    const obj = { a: { b: { c: 1 } }, d: [1, 2, 3] };
    const cloned = deepClone(obj);
    expect(cloned).toEqual(obj);
    expect(cloned).not.toBe(obj);
    expect(cloned.a).not.toBe(obj.a);
    expect(cloned.a.b).not.toBe(obj.a.b);
    expect(cloned.d).not.toBe(obj.d);
  });

  it('should handle circular references by returning the original', () => {
    interface CircularObj {
      a: number;
      circular?: CircularObj;
    }
    const obj: CircularObj = { a: 1 };
    obj.circular = obj;
    const cloned = deepClone(obj);
    expect(cloned).toBe(obj); // Falls back to original on circular reference
  });

  it('should handle complex nested structures', () => {
    const complex = {
      num: 42,
      str: 'hello',
      bool: true,
      nil: null,
      arr: [1, [2, 3], { a: 4 }],
      obj: {
        nested: {
          deep: {
            value: 'found'
          }
        }
      }
    };
    const cloned = deepClone(complex);
    expect(cloned).toEqual(complex);
    expect(cloned).not.toBe(complex);
    expect(cloned.arr).not.toBe(complex.arr);
    expect(cloned.obj.nested).not.toBe(complex.obj.nested);
  });
});

describe('range', () => {
  it('should generate a range of numbers', () => {
    expect(range(0, 5)).toEqual([0, 1, 2, 3, 4]);
    expect(range(1, 4)).toEqual([1, 2, 3]);
    expect(range(5, 10)).toEqual([5, 6, 7, 8, 9]);
  });

  it('should handle single element ranges', () => {
    expect(range(0, 1)).toEqual([0]);
    expect(range(5, 6)).toEqual([5]);
    expect(range(10, 11)).toEqual([10]);
  });

  it('should return empty array for invalid ranges', () => {
    expect(range(5, 5)).toEqual([]);
    expect(range(10, 5)).toEqual([]);
    expect(range(0, 0)).toEqual([]);
  });

  it('should work with negative numbers', () => {
    expect(range(-5, 0)).toEqual([-5, -4, -3, -2, -1]);
    expect(range(-3, 3)).toEqual([-3, -2, -1, 0, 1, 2]);
    expect(range(-10, -5)).toEqual([-10, -9, -8, -7, -6]);
  });

  it('should handle optional step parameter', () => {
    expect(range(0, 10, 2)).toEqual([0, 2, 4, 6, 8]);
    expect(range(1, 10, 2)).toEqual([1, 3, 5, 7, 9]);
    expect(range(0, 5, 0.5)).toEqual([0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5]);
  });

  it('should handle negative steps for descending ranges', () => {
    expect(range(5, 0, -1)).toEqual([5, 4, 3, 2, 1]);
    expect(range(10, 0, -2)).toEqual([10, 8, 6, 4, 2]);
    expect(range(0, -5, -1)).toEqual([0, -1, -2, -3, -4]);
  });

  it('should return empty array for invalid step', () => {
    expect(range(0, 5, 0)).toEqual([]);
    expect(range(0, 5, -1)).toEqual([]);
    expect(range(5, 0, 1)).toEqual([]);
  });
});