import type { LockDelayState } from './types';

/**
 * Maximum number of lock delay resets allowed
 */
const MAX_RESET_COUNT = 15;

/**
 * Initializes lock delay state
 * @returns Initial lock delay state
 */
export function initLockDelay(): LockDelayState {
  return {
    isActive: false,
    timer: 0,
    resetCount: 0,
    lastResetTime: 0
  };
}

/**
 * Updates lock delay state based on piece status
 * @param state - Current lock delay state
 * @param isGrounded - Whether the piece is touching the ground/other pieces
 * @param hasMoved - Whether the piece moved or rotated this frame
 * @param currentTime - Current timestamp in milliseconds
 * @returns Updated lock delay state
 */
export function updateLockDelay(
  state: LockDelayState,
  isGrounded: boolean,
  hasMoved: boolean,
  currentTime: number
): LockDelayState {
  // If not grounded, deactivate lock delay
  if (!isGrounded) {
    return initLockDelay();
  }

  // If grounded but not yet active, activate
  if (!state.isActive) {
    return {
      isActive: true,
      timer: 0,
      resetCount: 0,
      lastResetTime: currentTime
    };
  }

  // Calculate elapsed time first
  const elapsed = state.lastResetTime === 0 ? 0 : currentTime - state.lastResetTime;
  const newTimer = state.timer + elapsed;

  // If moved/rotated and haven't exceeded max resets
  if (hasMoved && state.resetCount < MAX_RESET_COUNT) {
    return {
      isActive: true,
      timer: 0,
      resetCount: state.resetCount + 1,
      lastResetTime: currentTime
    };
  }

  // Update timer (whether moved with max resets or didn't move)
  return {
    ...state,
    timer: newTimer,
    lastResetTime: currentTime
  };
}

/**
 * Determines if a piece should be locked
 * @param state - Current lock delay state
 * @param lockDelayMs - Lock delay duration in milliseconds
 * @returns Whether the piece should be locked
 */
export function shouldLockPiece(state: LockDelayState, lockDelayMs: number): boolean {
  if (!state.isActive) {
    return false;
  }

  // Lock if timer exceeded OR max resets reached
  return state.timer >= lockDelayMs || state.resetCount >= MAX_RESET_COUNT;
}

/**
 * Resets lock delay state to initial values
 * @param state - Current lock delay state (unused, but kept for consistency)
 * @returns Reset lock delay state
 */
export function resetLockDelay(_state: LockDelayState): LockDelayState {
  return initLockDelay();
}

/**
 * Checks if lock delay is currently active
 * @param state - Current lock delay state
 * @returns Whether lock delay is active
 */
export function isLockDelayActive(state: LockDelayState): boolean {
  return state.isActive;
}

/**
 * Calculates remaining time before piece locks
 * @param state - Current lock delay state
 * @param lockDelayMs - Lock delay duration in milliseconds
 * @returns Remaining time in milliseconds (0 if should lock)
 */
export function getRemainingLockTime(state: LockDelayState, lockDelayMs: number): number {
  if (!state.isActive) {
    return lockDelayMs;
  }

  if (state.resetCount >= MAX_RESET_COUNT) {
    return 0;
  }

  const remaining = lockDelayMs - state.timer;
  return Math.max(0, remaining);
}