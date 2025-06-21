import { describe, it, expect } from 'vitest';
import {
  getDefaultKeyBindings,
  setKeyBinding,
  getKeysForAction,
  getActionForKey,
  hasKeyConflict,
  validateKeyBindings,
  resetKeyBindings
} from '../keyConfig';
import type { KeyBinding, GameAction } from '../../game/types';

describe('getDefaultKeyBindings', () => {
  it('should return default key bindings', () => {
    const bindings = getDefaultKeyBindings();
    
    expect(bindings).toHaveLength(8);
    
    // Check each action has proper keys
    const bindingMap = bindings.reduce((acc, binding) => {
      acc[binding.action] = binding.keys;
      return acc;
    }, {} as Record<GameAction, string[]>);
    
    expect(bindingMap.moveLeft).toEqual(['ArrowLeft', 'a']);
    expect(bindingMap.moveRight).toEqual(['ArrowRight', 'd']);
    expect(bindingMap.softDrop).toEqual(['ArrowDown', 's']);
    expect(bindingMap.hardDrop).toEqual([' ']);
    expect(bindingMap.rotateRight).toEqual(['ArrowUp', 'x']);
    expect(bindingMap.rotateLeft).toEqual(['z', 'Control']);
    expect(bindingMap.hold).toEqual(['c', 'Shift']);
    expect(bindingMap.pause).toEqual(['p', 'Escape']);
  });
  
  it('should return a new array each time', () => {
    const bindings1 = getDefaultKeyBindings();
    const bindings2 = getDefaultKeyBindings();
    
    expect(bindings1).not.toBe(bindings2);
    expect(bindings1).toEqual(bindings2);
  });
});

describe('setKeyBinding', () => {
  it('should update existing action with new keys', () => {
    const bindings = getDefaultKeyBindings();
    const newBindings = setKeyBinding(bindings, 'moveLeft', ['q', 'a']);
    
    const moveLeftBinding = newBindings.find(b => b.action === 'moveLeft');
    expect(moveLeftBinding?.keys).toEqual(['q', 'a']);
  });
  
  it('should not mutate original bindings', () => {
    const bindings = getDefaultKeyBindings();
    const originalKeys = bindings.find(b => b.action === 'moveLeft')?.keys;
    
    setKeyBinding(bindings, 'moveLeft', ['q']);
    
    const afterKeys = bindings.find(b => b.action === 'moveLeft')?.keys;
    expect(afterKeys).toEqual(originalKeys);
  });
  
  it('should handle empty keys array', () => {
    const bindings = getDefaultKeyBindings();
    const newBindings = setKeyBinding(bindings, 'hold', []);
    
    const holdBinding = newBindings.find(b => b.action === 'hold');
    expect(holdBinding?.keys).toEqual([]);
  });
  
  it('should normalize key names', () => {
    const bindings = getDefaultKeyBindings();
    const newBindings = setKeyBinding(bindings, 'pause', ['ESCAPE', 'P']);
    
    const pauseBinding = newBindings.find(b => b.action === 'pause');
    expect(pauseBinding?.keys).toEqual(['Escape', 'p']);
  });
});

describe('getKeysForAction', () => {
  it('should return keys for given action', () => {
    const bindings = getDefaultKeyBindings();
    const keys = getKeysForAction(bindings, 'hardDrop');
    
    expect(keys).toEqual([' ']);
  });
  
  it('should return empty array for non-existent action', () => {
    const bindings: KeyBinding[] = [];
    const keys = getKeysForAction(bindings, 'moveLeft');
    
    expect(keys).toEqual([]);
  });
});

describe('getActionForKey', () => {
  it('should return action for given key', () => {
    const bindings = getDefaultKeyBindings();
    
    expect(getActionForKey(bindings, 'ArrowLeft')).toBe('moveLeft');
    expect(getActionForKey(bindings, 'a')).toBe('moveLeft');
    expect(getActionForKey(bindings, ' ')).toBe('hardDrop');
  });
  
  it('should return null for unbound key', () => {
    const bindings = getDefaultKeyBindings();
    
    expect(getActionForKey(bindings, 'q')).toBeNull();
    expect(getActionForKey(bindings, '1')).toBeNull();
  });
  
  it('should be case-sensitive', () => {
    const bindings = getDefaultKeyBindings();
    
    expect(getActionForKey(bindings, 'z')).toBe('rotateLeft');
    expect(getActionForKey(bindings, 'Z')).toBeNull();
  });
});

describe('hasKeyConflict', () => {
  it('should detect conflicts when same key used for multiple actions', () => {
    const bindings: KeyBinding[] = [
      { action: 'moveLeft', keys: ['a', 'q'] },
      { action: 'moveRight', keys: ['d', 'a'] }
    ];
    
    const conflicts = hasKeyConflict(bindings);
    
    expect(conflicts).toBe(true);
  });
  
  it('should return false when no conflicts', () => {
    const bindings = getDefaultKeyBindings();
    
    expect(hasKeyConflict(bindings)).toBe(false);
  });
  
  it('should handle empty bindings', () => {
    expect(hasKeyConflict([])).toBe(false);
  });
  
  it('should handle single action with duplicate keys', () => {
    const bindings: KeyBinding[] = [
      { action: 'moveLeft', keys: ['a', 'a'] }
    ];
    
    // Single action can have duplicate keys (will be normalized elsewhere)
    expect(hasKeyConflict(bindings)).toBe(false);
  });
});

describe('validateKeyBindings', () => {
  it('should return valid for default bindings', () => {
    const bindings = getDefaultKeyBindings();
    const result = validateKeyBindings(bindings);
    
    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
  });
  
  it('should detect missing required actions', () => {
    const bindings: KeyBinding[] = [
      { action: 'moveLeft', keys: ['a'] },
      { action: 'moveRight', keys: ['d'] }
      // Missing other required actions
    ];
    
    const result = validateKeyBindings(bindings);
    
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Missing key binding for action: softDrop');
    expect(result.errors).toContain('Missing key binding for action: hardDrop');
  });
  
  it('should detect key conflicts', () => {
    const bindings: KeyBinding[] = [
      { action: 'moveLeft', keys: ['a'] },
      { action: 'moveRight', keys: ['a'] },
      { action: 'softDrop', keys: ['s'] },
      { action: 'hardDrop', keys: [' '] },
      { action: 'rotateRight', keys: ['x'] },
      { action: 'rotateLeft', keys: ['z'] },
      { action: 'hold', keys: ['c'] },
      { action: 'pause', keys: ['p'] }
    ];
    
    const result = validateKeyBindings(bindings);
    
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Key conflict detected: key "a" is used for multiple actions');
  });
  
  it('should detect empty key arrays', () => {
    const bindings: KeyBinding[] = [
      { action: 'moveLeft', keys: [] },
      { action: 'moveRight', keys: ['d'] },
      { action: 'softDrop', keys: ['s'] },
      { action: 'hardDrop', keys: [' '] },
      { action: 'rotateRight', keys: ['x'] },
      { action: 'rotateLeft', keys: ['z'] },
      { action: 'hold', keys: ['c'] },
      { action: 'pause', keys: ['p'] }
    ];
    
    const result = validateKeyBindings(bindings);
    
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Action moveLeft has no keys assigned');
  });
});

describe('resetKeyBindings', () => {
  it('should return default key bindings', () => {
    const customBindings: KeyBinding[] = [
      { action: 'moveLeft', keys: ['q'] }
    ];
    
    const reset = resetKeyBindings(customBindings);
    
    expect(reset).toEqual(getDefaultKeyBindings());
  });
  
  it('should ignore input parameter', () => {
    expect(resetKeyBindings([])).toEqual(getDefaultKeyBindings());
    expect(resetKeyBindings(null as unknown as KeyBinding[])).toEqual(getDefaultKeyBindings());
  });
});