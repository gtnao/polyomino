import type { KeyBinding, GameAction } from '../game/types';

/**
 * Default key bindings for the game
 */
const DEFAULT_KEY_BINDINGS: readonly KeyBinding[] = [
  { action: 'moveLeft', keys: ['ArrowLeft', 'a'] },
  { action: 'moveRight', keys: ['ArrowRight', 'd'] },
  { action: 'softDrop', keys: ['ArrowDown', 's'] },
  { action: 'hardDrop', keys: [' '] },
  { action: 'rotateRight', keys: ['ArrowUp', 'x'] },
  { action: 'rotateLeft', keys: ['z', 'Control'] },
  { action: 'hold', keys: ['c', 'Shift'] },
  { action: 'pause', keys: ['p', 'Escape'] }
];

/**
 * All game actions that must have key bindings
 */
const REQUIRED_ACTIONS: readonly GameAction[] = [
  'moveLeft',
  'moveRight',
  'softDrop',
  'hardDrop',
  'rotateRight',
  'rotateLeft',
  'hold',
  'pause'
];

/**
 * Normalizes a key name to consistent format
 * @param key - The key to normalize
 * @returns Normalized key name
 */
function normalizeKey(key: string): string {
  // Handle special cases
  if (key.toUpperCase() === 'ESCAPE') {return 'Escape';}
  if (key === 'CONTROL' || key === 'control') {return 'Control';}
  if (key === 'SHIFT' || key === 'shift') {return 'Shift';}
  
  // Single letter keys should be lowercase
  if (key.length === 1 && /[A-Z]/i.test(key)) {
    return key.toLowerCase();
  }
  
  return key;
}

/**
 * Gets the default key bindings
 * @returns A copy of the default key bindings
 */
export function getDefaultKeyBindings(): KeyBinding[] {
  return DEFAULT_KEY_BINDINGS.map(binding => ({
    action: binding.action,
    keys: [...binding.keys]
  }));
}

/**
 * Sets key binding for a specific action
 * @param bindings - Current key bindings
 * @param action - The action to update
 * @param keys - New keys for the action
 * @returns Updated key bindings
 */
export function setKeyBinding(
  bindings: KeyBinding[],
  action: GameAction,
  keys: string[]
): KeyBinding[] {
  const normalizedKeys = keys.map(normalizeKey);
  
  return bindings.map(binding => {
    if (binding.action === action) {
      return {
        action: binding.action,
        keys: normalizedKeys
      };
    }
    return { ...binding };
  });
}

/**
 * Gets keys assigned to a specific action
 * @param bindings - Current key bindings
 * @param action - The action to look up
 * @returns Array of keys for the action
 */
export function getKeysForAction(
  bindings: KeyBinding[],
  action: GameAction
): string[] {
  const binding = bindings.find(b => b.action === action);
  return binding ? [...binding.keys] : [];
}

/**
 * Gets the action assigned to a specific key
 * @param bindings - Current key bindings
 * @param key - The key to look up
 * @returns The action or null if not found
 */
export function getActionForKey(
  bindings: KeyBinding[],
  key: string
): GameAction | null {
  for (const binding of bindings) {
    if (binding.keys.includes(key)) {
      return binding.action;
    }
  }
  return null;
}

/**
 * Checks if there are any key conflicts in the bindings
 * @param bindings - Key bindings to check
 * @returns True if conflicts exist
 */
export function hasKeyConflict(bindings: KeyBinding[]): boolean {
  const keyToActions = new Map<string, GameAction[]>();
  
  for (const binding of bindings) {
    for (const key of binding.keys) {
      const actions = keyToActions.get(key) || [];
      actions.push(binding.action);
      keyToActions.set(key, actions);
    }
  }
  
  // Check if any key is bound to multiple different actions
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  for (const [_key, actions] of keyToActions) {
    const uniqueActions = new Set(actions);
    if (uniqueActions.size > 1) {
      return true;
    }
  }
  
  return false;
}

/**
 * Validates key bindings for completeness and conflicts
 * @param bindings - Key bindings to validate
 * @returns Validation result
 */
export function validateKeyBindings(bindings: KeyBinding[]): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  // Check for missing actions
  const boundActions = new Set(bindings.map(b => b.action));
  for (const action of REQUIRED_ACTIONS) {
    if (!boundActions.has(action)) {
      errors.push(`Missing key binding for action: ${action}`);
    }
  }
  
  // Check for empty key arrays
  for (const binding of bindings) {
    if (binding.keys.length === 0) {
      errors.push(`Action ${binding.action} has no keys assigned`);
    }
  }
  
  // Check for conflicts
  const keyToActions = new Map<string, Set<GameAction>>();
  
  for (const binding of bindings) {
    for (const key of binding.keys) {
      const actions = keyToActions.get(key) || new Set();
      actions.add(binding.action);
      keyToActions.set(key, actions);
    }
  }
  
  for (const [key, actions] of keyToActions) {
    if (actions.size > 1) {
      errors.push(`Key conflict detected: key "${key}" is used for multiple actions`);
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Resets key bindings to defaults
 * @param bindings - Current bindings (ignored)
 * @returns Default key bindings
 */
export function resetKeyBindings(_bindings: KeyBinding[]): KeyBinding[] {
  return getDefaultKeyBindings();
}