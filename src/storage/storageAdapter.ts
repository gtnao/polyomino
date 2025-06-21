/**
 * Storage adapter interface
 */
export interface StorageAdapter {
  getItem<T>(key: string): Promise<T | null>;
  setItem<T>(key: string, value: T): Promise<void>;
  removeItem(key: string): Promise<void>;
  clear(): Promise<void>;
  keys(): Promise<string[]>;
  has(key: string): Promise<boolean>;
}

/**
 * LocalStorage adapter
 */
export class LocalStorageAdapter implements StorageAdapter {
  getItem<T>(key: string): Promise<T | null> {
    try {
      const item = localStorage.getItem(key);
      if (item === null) {
        return Promise.resolve(null);
      }
      return Promise.resolve(JSON.parse(item) as T);
    } catch {
      return Promise.resolve(null);
    }
  }

  setItem<T>(key: string, value: T): Promise<void> {
    try {
      const serialized = JSON.stringify(value);
      localStorage.setItem(key, serialized);
      return Promise.resolve();
    } catch (error) {
      return Promise.reject(error);
    }
  }

  removeItem(key: string): Promise<void> {
    localStorage.removeItem(key);
    return Promise.resolve();
  }

  clear(): Promise<void> {
    localStorage.clear();
    return Promise.resolve();
  }

  keys(): Promise<string[]> {
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key !== null) {
        keys.push(key);
      }
    }
    return Promise.resolve(keys);
  }

  has(key: string): Promise<boolean> {
    return Promise.resolve(localStorage.getItem(key) !== null);
  }
}

/**
 * Memory storage adapter for environments without localStorage
 */
export class MemoryStorageAdapter implements StorageAdapter {
  private storage = new Map<string, string>();

  getItem<T>(key: string): Promise<T | null> {
    const item = this.storage.get(key);
    if (item === undefined) {
      return Promise.resolve(null);
    }
    try {
      return Promise.resolve(JSON.parse(item) as T);
    } catch {
      return Promise.resolve(null);
    }
  }

  setItem<T>(key: string, value: T): Promise<void> {
    try {
      const serialized = JSON.stringify(value);
      this.storage.set(key, serialized);
      return Promise.resolve();
    } catch (error) {
      return Promise.reject(error);
    }
  }

  removeItem(key: string): Promise<void> {
    this.storage.delete(key);
    return Promise.resolve();
  }

  clear(): Promise<void> {
    this.storage.clear();
    return Promise.resolve();
  }

  keys(): Promise<string[]> {
    return Promise.resolve(Array.from(this.storage.keys()));
  }

  has(key: string): Promise<boolean> {
    return Promise.resolve(this.storage.has(key));
  }
}

/**
 * Creates a storage adapter based on environment
 * @returns Storage adapter
 */
export function createStorageAdapter(): StorageAdapter {
  try {
    // Test if localStorage is available
    const testKey = '__storage_test__';
    localStorage.setItem(testKey, 'test');
    localStorage.removeItem(testKey);
    return new LocalStorageAdapter();
  } catch {
    // Fallback to memory storage
    console.warn('LocalStorage not available, using memory storage');
    return new MemoryStorageAdapter();
  }
}