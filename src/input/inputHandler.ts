import type { InputState, KeyBinding, GameAction } from '../game/types';

// Store active event listeners for cleanup
const listenerMap = new WeakMap<HTMLElement, {
  keydown: (e: KeyboardEvent) => void;
  keyup: (e: KeyboardEvent) => void;
}>();

/**
 * Creates initial input state
 * @returns New input state
 */
export function createInputState(): InputState {
  return {
    pressedKeys: new Set<string>(),
    dasState: {
      action: null,
      timer: 0,
      charged: false
    },
    lastActionTime: {} as Record<GameAction, number>
  };
}

/**
 * Processes keyboard input event
 * @param state - Current input state
 * @param eventType - Type of keyboard event
 * @param key - The key that was pressed/released
 * @param bindings - Current key bindings
 * @param currentTime - Current timestamp
 * @returns Updated input state
 */
export function processInput(
  state: InputState,
  eventType: 'keydown' | 'keyup',
  key: string,
  bindings: KeyBinding[],
  currentTime: number
): InputState {
  // Find action for this key
  const action = getActionForKey(bindings, key);
  
  // Ignore unbound keys
  if (!action) {
    return state;
  }
  
  // Create new state
  const newState: InputState = {
    pressedKeys: new Set(state.pressedKeys),
    dasState: { ...state.dasState },
    lastActionTime: { ...state.lastActionTime }
  };
  
  if (eventType === 'keydown') {
    // Add key to pressed set
    newState.pressedKeys.add(key);
    
    // Record action time
    newState.lastActionTime[action] = currentTime;
    
    // Handle DAS for movement actions
    if (action === 'moveLeft' || action === 'moveRight') {
      // Cancel opposite direction or start new DAS
      if (newState.dasState.action !== action) {
        newState.dasState = {
          action,
          timer: 0,
          charged: false
        };
      }
    }
  } else { // keyup
    // Remove key from pressed set
    newState.pressedKeys.delete(key);
    
    // Check if action is still pressed (other keys)
    const stillPressed = isActionPressed(newState, action, bindings);
    
    // Cancel DAS if movement key released and not still pressed
    if (!stillPressed && 
        (action === 'moveLeft' || action === 'moveRight') &&
        newState.dasState.action === action) {
      newState.dasState = {
        action: null,
        timer: 0,
        charged: false
      };
    }
  }
  
  return newState;
}

/**
 * Updates DAS (Delayed Auto Shift) state
 * @param state - Current input state
 * @param deltaTime - Time elapsed since last update (ms)
 * @param dasDelay - Initial delay before auto-repeat (ms)
 * @param dasInterval - Interval between auto-repeats (ms)
 * @returns Updated input state
 */
export function updateDAS(
  state: InputState,
  deltaTime: number,
  dasDelay: number,
  dasInterval: number
): InputState {
  // No DAS active
  if (!state.dasState.action) {
    return state;
  }
  
  const newState: InputState = {
    pressedKeys: new Set(state.pressedKeys),
    dasState: { ...state.dasState },
    lastActionTime: { ...state.lastActionTime }
  };
  
  // If already charged, process intervals
  if (state.dasState.charged) {
    // Update timer
    newState.dasState.timer += deltaTime;
    
    // Check if we should trigger based on the deltaTime
    // For small deltas, trigger at most once
    // For large deltas, trigger multiple times
    const maxTriggers = Math.max(1, Math.floor(deltaTime / dasInterval));
    let triggers = 0;
    
    while (newState.dasState.timer >= dasInterval && triggers < maxTriggers) {
      newState.dasState.timer -= dasInterval;
      triggers++;
    }
    
    if (triggers > 0 && newState.dasState.action) {
      newState.lastActionTime[newState.dasState.action] = Date.now();
    }
  } else {
    // Not charged yet, just accumulate time
    newState.dasState.timer += deltaTime;
    
    // Check if DAS should charge
    if (newState.dasState.timer >= dasDelay) {
      newState.dasState.charged = true;
    }
  }
  
  return newState;
}

/**
 * Checks if an action is currently pressed
 * @param state - Current input state
 * @param action - Action to check
 * @param bindings - Current key bindings
 * @returns True if action is pressed
 */
export function isActionPressed(
  state: InputState,
  action: GameAction,
  bindings: KeyBinding[]
): boolean {
  const binding = bindings.find(b => b.action === action);
  if (!binding) {return false;}
  
  return binding.keys.some(key => state.pressedKeys.has(key));
}

/**
 * Gets all currently active actions
 * @param state - Current input state
 * @param bindings - Current key bindings
 * @returns Array of active actions
 */
export function getActiveActions(
  state: InputState,
  bindings: KeyBinding[]
): GameAction[] {
  const actions = new Set<GameAction>();
  
  for (const binding of bindings) {
    if (binding.keys.some(key => state.pressedKeys.has(key))) {
      actions.add(binding.action);
    }
  }
  
  return Array.from(actions);
}

/**
 * Sets up keyboard input listeners
 * @param element - Element to attach listeners to
 * @param initialState - Initial input state
 * @param bindings - Current key bindings
 * @param onInput - Callback for input changes
 */
export function setupInputListeners(
  element: HTMLElement,
  initialState: InputState,
  bindings: KeyBinding[],
  onInput: (state: InputState, triggeredAction: GameAction | null) => void
): void {
  let currentState = initialState;
  
  const handleKeyDown = (e: KeyboardEvent): void => {
    const key = e.key;
    const action = getActionForKey(bindings, key);
    
    // Prevent default for bound keys
    if (action) {
      e.preventDefault();
      
      const newState = processInput(currentState, 'keydown', key, bindings, Date.now());
      currentState = newState;
      onInput(newState, action);
    }
  };
  
  const handleKeyUp = (e: KeyboardEvent): void => {
    const key = e.key;
    const action = getActionForKey(bindings, key);
    
    if (action) {
      e.preventDefault();
      
      const newState = processInput(currentState, 'keyup', key, bindings, Date.now());
      currentState = newState;
      onInput(newState, null);
    }
  };
  
  // Add listeners
  element.addEventListener('keydown', handleKeyDown);
  element.addEventListener('keyup', handleKeyUp);
  
  // Store for cleanup
  listenerMap.set(element, { keydown: handleKeyDown, keyup: handleKeyUp });
}

/**
 * Removes keyboard input listeners
 * @param element - Element to remove listeners from
 */
export function teardownInputListeners(element: HTMLElement): void {
  const listeners = listenerMap.get(element);
  
  if (listeners) {
    element.removeEventListener('keydown', listeners.keydown);
    element.removeEventListener('keyup', listeners.keyup);
    listenerMap.delete(element);
  }
}

/**
 * Helper to get action for a key
 * @param bindings - Current key bindings
 * @param key - The key to look up
 * @returns The action or null
 */
function getActionForKey(
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