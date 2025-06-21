import { describe, it, expect } from 'vitest';
import {
  initLockDelay,
  updateLockDelay,
  shouldLockPiece,
  resetLockDelay,
  isLockDelayActive,
  getRemainingLockTime
} from '../lockDelay';

describe('initLockDelay', () => {
  it('should create initial lock delay state', () => {
    const state = initLockDelay();
    
    expect(state.isActive).toBe(false);
    expect(state.timer).toBe(0);
    expect(state.resetCount).toBe(0);
    expect(state.lastResetTime).toBe(0);
  });
});

describe('updateLockDelay', () => {
  it('should activate lock delay when piece lands', () => {
    const state = initLockDelay();
    const newState = updateLockDelay(state, true, false, 1000);
    
    expect(newState.isActive).toBe(true);
    expect(newState.timer).toBe(0);
    expect(newState.lastResetTime).toBe(1000);
  });

  it('should increment timer when active', () => {
    let state = initLockDelay();
    state = updateLockDelay(state, true, false, 1000);
    state = updateLockDelay(state, true, false, 1016); // 16ms later
    
    expect(state.timer).toBe(16);
    expect(state.isActive).toBe(true);
  });

  it('should reset timer on movement', () => {
    let state = initLockDelay();
    state = updateLockDelay(state, true, false, 1000);
    state = updateLockDelay(state, true, false, 1200); // 200ms later
    state = updateLockDelay(state, true, true, 1300); // Move/rotate
    
    expect(state.timer).toBe(0);
    expect(state.resetCount).toBe(1);
    expect(state.lastResetTime).toBe(1300);
  });

  it('should not reset after max resets', () => {
    let state = initLockDelay();
    state = { ...state, isActive: true, resetCount: 15 }; // Max resets reached
    
    const newState = updateLockDelay(state, true, true, 1000);
    
    expect(newState.timer).toBe(0); // Timer continues
    expect(newState.resetCount).toBe(15); // No more resets
  });

  it('should deactivate when piece is not grounded', () => {
    let state = initLockDelay();
    state = updateLockDelay(state, true, false, 1000);
    state = updateLockDelay(state, false, false, 1100); // No longer grounded
    
    expect(state.isActive).toBe(false);
    expect(state.timer).toBe(0);
    expect(state.resetCount).toBe(0);
  });
});

describe('shouldLockPiece', () => {
  it('should not lock inactive delay', () => {
    const state = initLockDelay();
    expect(shouldLockPiece(state, 500)).toBe(false);
  });

  it('should lock when delay time exceeded', () => {
    let state = initLockDelay();
    state = { ...state, isActive: true, timer: 501 };
    
    expect(shouldLockPiece(state, 500)).toBe(true);
  });

  it('should not lock before delay time', () => {
    let state = initLockDelay();
    state = { ...state, isActive: true, timer: 499 };
    
    expect(shouldLockPiece(state, 500)).toBe(false);
  });

  it('should lock immediately after max resets', () => {
    let state = initLockDelay();
    state = { ...state, isActive: true, timer: 100, resetCount: 15 };
    
    expect(shouldLockPiece(state, 500)).toBe(true);
  });

  it('should handle exactly delay time', () => {
    let state = initLockDelay();
    state = { ...state, isActive: true, timer: 500 };
    
    expect(shouldLockPiece(state, 500)).toBe(true);
  });
});

describe('resetLockDelay', () => {
  it('should reset all values', () => {
    let state = initLockDelay();
    state = {
      isActive: true,
      timer: 300,
      resetCount: 5,
      lastResetTime: 5000
    };
    
    const reset = resetLockDelay(state);
    
    expect(reset.isActive).toBe(false);
    expect(reset.timer).toBe(0);
    expect(reset.resetCount).toBe(0);
    expect(reset.lastResetTime).toBe(0);
  });
});

describe('isLockDelayActive', () => {
  it('should return active state', () => {
    const activeState = { isActive: true, timer: 100, resetCount: 0, lastResetTime: 1000 };
    const inactiveState = { isActive: false, timer: 0, resetCount: 0, lastResetTime: 0 };
    
    expect(isLockDelayActive(activeState)).toBe(true);
    expect(isLockDelayActive(inactiveState)).toBe(false);
  });
});

describe('getRemainingLockTime', () => {
  it('should calculate remaining time', () => {
    const state = { isActive: true, timer: 200, resetCount: 0, lastResetTime: 1000 };
    
    expect(getRemainingLockTime(state, 500)).toBe(300);
  });

  it('should return 0 when exceeded', () => {
    const state = { isActive: true, timer: 600, resetCount: 0, lastResetTime: 1000 };
    
    expect(getRemainingLockTime(state, 500)).toBe(0);
  });

  it('should return full delay when inactive', () => {
    const state = { isActive: false, timer: 0, resetCount: 0, lastResetTime: 0 };
    
    expect(getRemainingLockTime(state, 500)).toBe(500);
  });

  it('should return 0 after max resets', () => {
    const state = { isActive: true, timer: 100, resetCount: 15, lastResetTime: 1000 };
    
    expect(getRemainingLockTime(state, 500)).toBe(0);
  });
});