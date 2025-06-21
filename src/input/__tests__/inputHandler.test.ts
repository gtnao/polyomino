import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  setupInputListeners,
  teardownInputListeners,
  processInput,
  updateDAS,
  createInputState,
  isActionPressed,
  getActiveActions
} from '../inputHandler';
import type { InputState, KeyBinding, GameAction } from '../../game/types';

describe('createInputState', () => {
  it('should create initial input state', () => {
    const state = createInputState();
    
    expect(state.pressedKeys.size).toBe(0);
    expect(state.dasState.action).toBeNull();
    expect(state.dasState.timer).toBe(0);
    expect(state.dasState.charged).toBe(false);
    expect(Object.keys(state.lastActionTime)).toHaveLength(0);
  });
});

describe('processInput', () => {
  let state: InputState;
  let bindings: KeyBinding[];
  
  beforeEach(() => {
    state = createInputState();
    bindings = [
      { action: 'moveLeft', keys: ['ArrowLeft', 'a'] },
      { action: 'moveRight', keys: ['ArrowRight', 'd'] },
      { action: 'hardDrop', keys: [' '] },
      { action: 'pause', keys: ['p', 'Escape'] }
    ];
  });
  
  it('should handle key down events', () => {
    const newState = processInput(state, 'keydown', 'ArrowLeft', bindings, 1000);
    
    expect(newState.pressedKeys.has('ArrowLeft')).toBe(true);
    expect(newState.dasState.action).toBe('moveLeft');
    expect(newState.dasState.timer).toBe(0);
    expect(newState.lastActionTime.moveLeft).toBe(1000);
  });
  
  it('should handle key up events', () => {
    state.pressedKeys.add('ArrowLeft');
    state.dasState = { action: 'moveLeft', timer: 100, charged: false };
    
    const newState = processInput(state, 'keyup', 'ArrowLeft', bindings, 2000);
    
    expect(newState.pressedKeys.has('ArrowLeft')).toBe(false);
    expect(newState.dasState.action).toBeNull();
  });
  
  it('should not start DAS for non-movement actions', () => {
    const newState = processInput(state, 'keydown', ' ', bindings, 1000);
    
    expect(newState.pressedKeys.has(' ')).toBe(true);
    expect(newState.dasState.action).toBeNull();
    expect(newState.lastActionTime.hardDrop).toBe(1000);
  });
  
  it('should handle multiple keys for same action', () => {
    const state1 = processInput(state, 'keydown', 'ArrowLeft', bindings, 1000);
    const state2 = processInput(state1, 'keydown', 'a', bindings, 1100);
    
    expect(state2.pressedKeys.has('ArrowLeft')).toBe(true);
    expect(state2.pressedKeys.has('a')).toBe(true);
    expect(state2.dasState.action).toBe('moveLeft');
  });
  
  it('should cancel DAS when opposite direction is pressed', () => {
    const state1 = processInput(state, 'keydown', 'ArrowLeft', bindings, 1000);
    const state2 = processInput(state1, 'keydown', 'ArrowRight', bindings, 1100);
    
    expect(state2.dasState.action).toBe('moveRight');
    expect(state2.dasState.timer).toBe(0);
  });
  
  it('should maintain DAS when releasing one of multiple keys', () => {
    const state1 = processInput(state, 'keydown', 'ArrowLeft', bindings, 1000);
    const state2 = processInput(state1, 'keydown', 'a', bindings, 1100);
    const state3 = processInput(state2, 'keyup', 'ArrowLeft', bindings, 1200);
    
    expect(state3.pressedKeys.has('a')).toBe(true);
    expect(state3.dasState.action).toBe('moveLeft');
  });
  
  it('should ignore unbound keys', () => {
    const newState = processInput(state, 'keydown', 'q', bindings, 1000);
    
    expect(newState.pressedKeys.has('q')).toBe(false);
    expect(newState).toEqual(state);
  });
  
  it('should not mutate original state', () => {
    const originalKeys = new Set(state.pressedKeys);
    processInput(state, 'keydown', 'ArrowLeft', bindings, 1000);
    
    expect(state.pressedKeys).toEqual(originalKeys);
  });
});

describe('updateDAS', () => {
  let state: InputState;
  
  beforeEach(() => {
    state = createInputState();
  });
  
  it('should not update when no DAS action', () => {
    const newState = updateDAS(state, 16, 167, 33);
    expect(newState).toEqual(state);
  });
  
  it('should increment timer when not charged', () => {
    state.dasState = { action: 'moveLeft', timer: 50, charged: false };
    
    const newState = updateDAS(state, 16, 167, 33);
    
    expect(newState.dasState.timer).toBe(66);
    expect(newState.dasState.charged).toBe(false);
  });
  
  it('should charge DAS when delay is reached', () => {
    state.dasState = { action: 'moveLeft', timer: 160, charged: false };
    
    const newState = updateDAS(state, 16, 167, 33);
    
    expect(newState.dasState.timer).toBe(176);
    expect(newState.dasState.charged).toBe(true);
  });
  
  it('should reset timer by interval when charged', () => {
    state.dasState = { action: 'moveLeft', timer: 200, charged: true };
    state.lastActionTime = { moveLeft: 0 } as Record<GameAction, number>;
    
    const newState = updateDAS(state, 16, 167, 33);
    
    expect(newState.dasState.timer).toBe(216 - 33);
    expect(newState.lastActionTime.moveLeft).toBeGreaterThan(0);
  });
  
  it('should handle multiple interval resets in one update', () => {
    state.dasState = { action: 'moveRight', timer: 200, charged: true };
    state.lastActionTime = { moveRight: 0 } as Record<GameAction, number>;
    
    const newState = updateDAS(state, 100, 167, 33); // 100ms delta
    
    // Should trigger 3 intervals (100 / 33 = 3)
    expect(newState.dasState.timer).toBe(200 + 100 - 99); // 3 * 33 = 99
    expect(newState.lastActionTime.moveRight).toBeGreaterThan(0);
  });
  
  it('should not mutate original state', () => {
    state.dasState = { action: 'moveLeft', timer: 50, charged: false };
    const originalTimer = state.dasState.timer;
    
    updateDAS(state, 16, 167, 33);
    
    expect(state.dasState.timer).toBe(originalTimer);
  });
});

describe('isActionPressed', () => {
  let state: InputState;
  let bindings: KeyBinding[];
  
  beforeEach(() => {
    state = createInputState();
    bindings = [
      { action: 'moveLeft', keys: ['ArrowLeft', 'a'] },
      { action: 'hardDrop', keys: [' '] }
    ];
  });
  
  it('should return true when any key for action is pressed', () => {
    state.pressedKeys.add('a');
    
    expect(isActionPressed(state, 'moveLeft', bindings)).toBe(true);
  });
  
  it('should return false when no keys for action are pressed', () => {
    state.pressedKeys.add(' ');
    
    expect(isActionPressed(state, 'moveLeft', bindings)).toBe(false);
  });
  
  it('should handle multiple keys pressed for same action', () => {
    state.pressedKeys.add('ArrowLeft');
    state.pressedKeys.add('a');
    
    expect(isActionPressed(state, 'moveLeft', bindings)).toBe(true);
  });
  
  it('should return false for unbound action', () => {
    state.pressedKeys.add('z');
    
    expect(isActionPressed(state, 'rotateLeft', bindings)).toBe(false);
  });
});

describe('getActiveActions', () => {
  let state: InputState;
  let bindings: KeyBinding[];
  
  beforeEach(() => {
    state = createInputState();
    bindings = [
      { action: 'moveLeft', keys: ['ArrowLeft', 'a'] },
      { action: 'moveRight', keys: ['ArrowRight', 'd'] },
      { action: 'hardDrop', keys: [' '] },
      { action: 'rotateRight', keys: ['ArrowUp', 'x'] }
    ];
  });
  
  it('should return all currently pressed actions', () => {
    state.pressedKeys.add('a');
    state.pressedKeys.add(' ');
    state.pressedKeys.add('x');
    
    const actions = getActiveActions(state, bindings);
    
    expect(actions).toHaveLength(3);
    expect(actions).toContain('moveLeft');
    expect(actions).toContain('hardDrop');
    expect(actions).toContain('rotateRight');
  });
  
  it('should return empty array when no keys pressed', () => {
    const actions = getActiveActions(state, bindings);
    
    expect(actions).toEqual([]);
  });
  
  it('should not duplicate actions when multiple keys pressed', () => {
    state.pressedKeys.add('ArrowLeft');
    state.pressedKeys.add('a'); // Both map to moveLeft
    
    const actions = getActiveActions(state, bindings);
    
    expect(actions).toEqual(['moveLeft']);
  });
  
  it('should ignore unbound keys', () => {
    state.pressedKeys.add('q');
    state.pressedKeys.add('w');
    
    const actions = getActiveActions(state, bindings);
    
    expect(actions).toEqual([]);
  });
});

describe('setupInputListeners and teardownInputListeners', () => {
  let mockElement: HTMLElement;
  let state: InputState;
  let bindings: KeyBinding[];
  let onInput: ReturnType<typeof vi.fn>;
  
  beforeEach(() => {
    mockElement = document.createElement('div');
    state = createInputState();
    bindings = [
      { action: 'moveLeft', keys: ['ArrowLeft'] },
      { action: 'pause', keys: ['p'] }
    ];
    onInput = vi.fn();
  });
  
  afterEach(() => {
    teardownInputListeners(mockElement);
  });
  
  it('should setup keyboard event listeners', () => {
    const addEventListenerSpy = vi.spyOn(mockElement, 'addEventListener');
    
    setupInputListeners(mockElement, state, bindings, onInput);
    
    expect(addEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
    expect(addEventListenerSpy).toHaveBeenCalledWith('keyup', expect.any(Function));
  });
  
  it('should handle keydown events', () => {
    setupInputListeners(mockElement, state, bindings, onInput);
    
    const event = new KeyboardEvent('keydown', { key: 'ArrowLeft' });
    mockElement.dispatchEvent(event);
    
    expect(onInput).toHaveBeenCalledWith(
      expect.objectContaining({
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        pressedKeys: expect.any(Set),
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        dasState: expect.objectContaining({ action: 'moveLeft' })
      }),
      'moveLeft'
    );
  });
  
  it('should handle keyup events', () => {
    state.pressedKeys.add('p');
    setupInputListeners(mockElement, state, bindings, onInput);
    
    const event = new KeyboardEvent('keyup', { key: 'p' });
    mockElement.dispatchEvent(event);
    
    expect(onInput).toHaveBeenCalledWith(
      expect.objectContaining({
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        pressedKeys: expect.any(Set)
      }),
      null
    );
  });
  
  it('should prevent default for bound keys', () => {
    setupInputListeners(mockElement, state, bindings, onInput);
    
    const event = new KeyboardEvent('keydown', { key: 'ArrowLeft' });
    const preventDefaultSpy = vi.spyOn(event, 'preventDefault');
    
    mockElement.dispatchEvent(event);
    
    expect(preventDefaultSpy).toHaveBeenCalled();
  });
  
  it('should not prevent default for unbound keys', () => {
    setupInputListeners(mockElement, state, bindings, onInput);
    
    const event = new KeyboardEvent('keydown', { key: 'q' });
    const preventDefaultSpy = vi.spyOn(event, 'preventDefault');
    
    mockElement.dispatchEvent(event);
    
    expect(preventDefaultSpy).not.toHaveBeenCalled();
  });
  
  it('should remove listeners on teardown', () => {
    const removeEventListenerSpy = vi.spyOn(mockElement, 'removeEventListener');
    
    setupInputListeners(mockElement, state, bindings, onInput);
    teardownInputListeners(mockElement);
    
    expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
    expect(removeEventListenerSpy).toHaveBeenCalledWith('keyup', expect.any(Function));
  });
  
  it('should not call onInput after teardown', () => {
    setupInputListeners(mockElement, state, bindings, onInput);
    teardownInputListeners(mockElement);
    
    const event = new KeyboardEvent('keydown', { key: 'ArrowLeft' });
    mockElement.dispatchEvent(event);
    
    expect(onInput).not.toHaveBeenCalled();
  });
});