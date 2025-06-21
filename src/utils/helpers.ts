/**
 * Shuffles an array using Fisher-Yates algorithm
 * @param array - The array to shuffle
 * @returns A new shuffled array
 */
export function shuffle<T>(array: readonly T[]): T[] {
  const result = [...array];
  
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j]!, result[i]!];
  }
  
  return result;
}

/**
 * Clamps a value between min and max
 * @param value - The value to clamp
 * @param min - The minimum value
 * @param max - The maximum value
 * @returns The clamped value
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Deep clones an object or array
 * @param obj - The object to clone
 * @returns A deep clone of the object
 */
export function deepClone<T>(obj: T): T {
  const visited = new WeakSet<object>();
  let hasCircularReference = false;
  
  function clone<U>(item: U): U {
    // Handle primitive types
    if (item === null || typeof item !== 'object') {
      return item;
    }
    
    // Check for circular references
    if (visited.has(item as object)) {
      hasCircularReference = true;
      return item; // Return the item itself on circular reference
    }
    
    visited.add(item as object);
    
    // Handle Date
    if (item instanceof Date) {
      return new Date(item.getTime()) as U;
    }
    
    // Handle Array
    if (Array.isArray(item)) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return item.map(element => clone(element)) as U;
    }
    
    // Handle Object
    const clonedObj = {} as Record<string, unknown>;
    for (const key in item) {
      if (Object.prototype.hasOwnProperty.call(item, key)) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        clonedObj[key] = clone((item as Record<string, unknown>)[key]);
      }
    }
    return clonedObj as U;
  }
  
  const result = clone(obj);
  
  // If circular reference detected, return original object
  if (hasCircularReference) {
    return obj;
  }
  
  return result;
}

/**
 * Generates a range of numbers
 * @param start - The start of the range (inclusive)
 * @param end - The end of the range (exclusive)
 * @param step - The step between values (default: 1)
 * @returns An array of numbers in the range
 */
export function range(start: number, end: number, step: number = 1): number[] {
  const result: number[] = [];
  
  // Handle invalid step
  if (step === 0) {
    return result;
  }
  
  // Handle invalid direction
  if ((step > 0 && start >= end) || (step < 0 && start <= end)) {
    return result;
  }
  
  if (step > 0) {
    for (let i = start; i < end; i += step) {
      result.push(i);
    }
  } else {
    for (let i = start; i > end; i += step) {
      result.push(i);
    }
  }
  
  return result;
}