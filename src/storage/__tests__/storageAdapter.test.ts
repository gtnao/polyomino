import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  StorageAdapter,
  LocalStorageAdapter,
  MemoryStorageAdapter,
  createStorageAdapter,
} from '../storageAdapter';

// Mock localStorage
interface MockLocalStorage {
  store: Record<string, string>;
  getItem: any;
  setItem: any;
  removeItem: any;
  clear: any;
  length: number;
  key: any;
}

const mockLocalStorage: MockLocalStorage = {
  store: {},
  getItem: vi.fn((key: string) => mockLocalStorage.store[key] || null),
  setItem: vi.fn((key: string, value: string) => {
    mockLocalStorage.store[key] = value;
  }),
  removeItem: vi.fn((key: string) => {
    delete mockLocalStorage.store[key];
  }),
  clear: vi.fn(() => {
    mockLocalStorage.store = {};
  }),
  get length() {
    return Object.keys(this.store).length;
  },
  key: vi.fn((index: number) => {
    const keys = Object.keys(mockLocalStorage.store);
    return keys[index] || null;
  }),
};

// Replace global localStorage
(global as any).localStorage = mockLocalStorage;

beforeEach(() => {
  vi.clearAllMocks();
  mockLocalStorage.store = {};
});

describe('LocalStorageAdapter', () => {
  let adapter: StorageAdapter;

  beforeEach(() => {
    adapter = new LocalStorageAdapter();
  });

  it('should get item from localStorage', async () => {
    mockLocalStorage.store['test-key'] = JSON.stringify({ value: 'test' });
    
    const result = await adapter.getItem('test-key');
    
    expect(result).toEqual({ value: 'test' });
    expect(mockLocalStorage.getItem).toHaveBeenCalledWith('test-key');
  });

  it('should return null for non-existent key', async () => {
    const result = await adapter.getItem('non-existent');
    
    expect(result).toBeNull();
  });

  it('should return null for invalid JSON', async () => {
    mockLocalStorage.store['bad-json'] = 'not-json{';
    
    const result = await adapter.getItem('bad-json');
    
    expect(result).toBeNull();
  });

  it('should set item in localStorage', async () => {
    const data = { name: 'test', value: 123 };
    
    await adapter.setItem('test-key', data);
    
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
      'test-key',
      JSON.stringify(data)
    );
    expect(mockLocalStorage.store['test-key']).toBe(JSON.stringify(data));
  });

  it('should remove item from localStorage', async () => {
    mockLocalStorage.store['test-key'] = 'value';
    
    await adapter.removeItem('test-key');
    
    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('test-key');
    expect(mockLocalStorage.store['test-key']).toBeUndefined();
  });

  it('should clear all items', async () => {
    mockLocalStorage.store['key1'] = 'value1';
    mockLocalStorage.store['key2'] = 'value2';
    
    await adapter.clear();
    
    expect(mockLocalStorage.clear).toHaveBeenCalled();
    expect(Object.keys(mockLocalStorage.store)).toHaveLength(0);
  });

  it('should list all keys', async () => {
    mockLocalStorage.store['key1'] = 'value1';
    mockLocalStorage.store['key2'] = 'value2';
    mockLocalStorage.store['key3'] = 'value3';
    
    const keys = await adapter.keys();
    
    expect(keys).toEqual(['key1', 'key2', 'key3']);
  });

  it('should check if key exists', async () => {
    mockLocalStorage.store['existing'] = 'value';
    
    expect(await adapter.has('existing')).toBe(true);
    expect(await adapter.has('non-existing')).toBe(false);
  });

  it('should handle localStorage errors gracefully', async () => {
    // Simulate quota exceeded error
    mockLocalStorage.setItem.mockImplementationOnce(() => {
      throw new Error('QuotaExceededError');
    });
    
    await expect(adapter.setItem('key', { data: 'large' })).rejects.toThrow();
  });
});

describe('MemoryStorageAdapter', () => {
  let adapter: StorageAdapter;

  beforeEach(() => {
    adapter = new MemoryStorageAdapter();
  });

  it('should get item from memory', async () => {
    await adapter.setItem('test-key', { value: 'test' });
    
    const result = await adapter.getItem('test-key');
    
    expect(result).toEqual({ value: 'test' });
  });

  it('should return null for non-existent key', async () => {
    const result = await adapter.getItem('non-existent');
    
    expect(result).toBeNull();
  });

  it('should set item in memory', async () => {
    const data = { name: 'test', value: 123 };
    
    await adapter.setItem('test-key', data);
    
    const result = await adapter.getItem('test-key');
    expect(result).toEqual(data);
  });

  it('should remove item from memory', async () => {
    await adapter.setItem('test-key', { value: 'test' });
    
    await adapter.removeItem('test-key');
    
    const result = await adapter.getItem('test-key');
    expect(result).toBeNull();
  });

  it('should clear all items', async () => {
    await adapter.setItem('key1', { value: 1 });
    await adapter.setItem('key2', { value: 2 });
    
    await adapter.clear();
    
    expect(await adapter.getItem('key1')).toBeNull();
    expect(await adapter.getItem('key2')).toBeNull();
  });

  it('should list all keys', async () => {
    await adapter.setItem('key1', { value: 1 });
    await adapter.setItem('key2', { value: 2 });
    await adapter.setItem('key3', { value: 3 });
    
    const keys = await adapter.keys();
    
    expect(keys.sort()).toEqual(['key1', 'key2', 'key3']);
  });

  it('should check if key exists', async () => {
    await adapter.setItem('existing', { value: 'test' });
    
    expect(await adapter.has('existing')).toBe(true);
    expect(await adapter.has('non-existing')).toBe(false);
  });

  it('should store independent copies of data', async () => {
    const original = { value: 'test', nested: { prop: 1 } };
    
    await adapter.setItem('key', original);
    
    // Modify original
    original.value = 'modified';
    original.nested.prop = 2;
    
    // Retrieved data should be unchanged
    const retrieved = await adapter.getItem('key');
    expect(retrieved).toEqual({ value: 'test', nested: { prop: 1 } });
  });
});

describe('createStorageAdapter', () => {
  it('should create LocalStorageAdapter when localStorage is available', () => {
    const adapter = createStorageAdapter();
    
    expect(adapter).toBeInstanceOf(LocalStorageAdapter);
  });

  it('should create MemoryStorageAdapter when localStorage is not available', () => {
    const originalLocalStorage = (global as any).localStorage;
    (global as any).localStorage = undefined;
    
    const adapter = createStorageAdapter();
    
    expect(adapter).toBeInstanceOf(MemoryStorageAdapter);
    
    // Restore
    (global as any).localStorage = originalLocalStorage;
  });

  it('should create MemoryStorageAdapter when localStorage throws', () => {
    const originalLocalStorage = (global as any).localStorage;
    (global as any).localStorage = {
      getItem: (): never => {
        throw new Error('SecurityError');
      },
    };
    
    const adapter = createStorageAdapter();
    
    expect(adapter).toBeInstanceOf(MemoryStorageAdapter);
    
    // Restore
    (global as any).localStorage = originalLocalStorage;
  });
});