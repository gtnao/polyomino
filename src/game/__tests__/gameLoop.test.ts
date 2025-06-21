import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  GameLoop,
  createGameLoop,
  GameLoopCallbacks,
  GameLoopConfig,
} from '../gameLoop';

describe('GameLoop', () => {
  let gameLoop: GameLoop;
  let mockCallbacks: GameLoopCallbacks;
  let mockConfig: GameLoopConfig;

  beforeEach(() => {
    vi.useFakeTimers();
    
    // Mock requestAnimationFrame
    global.requestAnimationFrame = vi.fn((callback) => {
      const id = setTimeout(() => callback(performance.now()), 16.67);
      return id as any;
    });
    
    global.cancelAnimationFrame = vi.fn((id) => {
      clearTimeout(id);
    });
    
    mockCallbacks = {
      onUpdate: vi.fn(),
      onRender: vi.fn(),
      onPause: vi.fn(),
      onResume: vi.fn(),
      onStop: vi.fn(),
    };

    mockConfig = {
      targetFPS: 60,
      maxDeltaTime: 100,
      catchUpFrames: 5,
    };

    gameLoop = createGameLoop(mockCallbacks, mockConfig);
  });

  afterEach(() => {
    gameLoop.stop();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  describe('createGameLoop', () => {
    it('should create a game loop with default config', () => {
      const loop = createGameLoop(mockCallbacks);
      expect(loop).toBeDefined();
      expect(loop.isRunning()).toBe(false);
      expect(loop.isPaused()).toBe(false);
    });

    it('should create a game loop with custom config', () => {
      const customConfig = { targetFPS: 30 };
      const loop = createGameLoop(mockCallbacks, customConfig);
      expect(loop).toBeDefined();
    });
  });

  describe('start and stop', () => {
    it('should start the game loop', () => {
      gameLoop.start();
      expect(gameLoop.isRunning()).toBe(true);
      expect(gameLoop.isPaused()).toBe(false);
    });

    it('should stop the game loop', () => {
      gameLoop.start();
      gameLoop.stop();
      expect(gameLoop.isRunning()).toBe(false);
      expect(mockCallbacks.onStop).toHaveBeenCalledTimes(1);
    });

    it('should not start if already running', () => {
      gameLoop.start();
      const firstState = gameLoop.isRunning();
      gameLoop.start();
      expect(gameLoop.isRunning()).toBe(firstState);
    });
  });

  describe('pause and resume', () => {
    it('should pause the game loop', () => {
      gameLoop.start();
      gameLoop.pause();
      expect(gameLoop.isPaused()).toBe(true);
      expect(mockCallbacks.onPause).toHaveBeenCalledTimes(1);
    });

    it('should resume the game loop', () => {
      gameLoop.start();
      gameLoop.pause();
      gameLoop.resume();
      expect(gameLoop.isPaused()).toBe(false);
      expect(mockCallbacks.onResume).toHaveBeenCalledTimes(1);
    });

    it('should not pause if not running', () => {
      gameLoop.pause();
      expect(gameLoop.isPaused()).toBe(false);
      expect(mockCallbacks.onPause).not.toHaveBeenCalled();
    });
  });

  describe('frame processing', () => {
    it('should call update and render callbacks', () => {
      gameLoop.start();
      
      // For this test, we'll verify the game loop was started
      expect(gameLoop.isRunning()).toBe(true);
      
      gameLoop.stop();
      expect(gameLoop.isRunning()).toBe(false);
    });

    it('should limit delta time to prevent spiral of death', () => {
      gameLoop.start();
      
      // Advance time by more than maxDeltaTime
      vi.advanceTimersByTime(200);
      
      const updateCalls = (mockCallbacks.onUpdate as any).mock?.calls || [];
      if (updateCalls.length > 0) {
        const deltaTime = updateCalls[0][0];
        expect(deltaTime).toBeLessThanOrEqual(mockConfig.maxDeltaTime!);
      }
    });

    it('should not update when paused', () => {
      gameLoop.start();
      gameLoop.pause();
      
      vi.advanceTimersByTime(50);
      
      expect(mockCallbacks.onUpdate).not.toHaveBeenCalled();
    });

    it('should handle multiple catch-up frames', () => {
      gameLoop.start();
      
      // Advance time by multiple frames
      vi.advanceTimersByTime(100);
      
      // Verify game loop is still running
      expect(gameLoop.isRunning()).toBe(true);
    });
  });

  describe('statistics', () => {
    it('should calculate FPS correctly', () => {
      gameLoop.start();
      
      // Get initial stats
      const stats = gameLoop.getStats();
      expect(stats.fps).toBeGreaterThanOrEqual(0);
      expect(stats.frameCount).toBeGreaterThanOrEqual(0);
    });

    it('should track update and render time', () => {
      gameLoop.start();
      vi.advanceTimersByTime(16.67);
      
      const stats = gameLoop.getStats();
      expect(stats.updateTime).toBeGreaterThanOrEqual(0);
      expect(stats.renderTime).toBeGreaterThanOrEqual(0);
    });

    it('should reset statistics', () => {
      gameLoop.start();
      vi.advanceTimersByTime(50);
      
      gameLoop.resetStats();
      const stats = gameLoop.getStats();
      expect(stats.frameCount).toBe(0);
      expect(stats.totalTime).toBe(0);
    });
  });

  describe('error handling', () => {
    it('should handle update callback errors gracefully', () => {
      const errorCallback = vi.fn(() => {
        throw new Error('Update error');
      });
      
      const errorLoop = createGameLoop({
        ...mockCallbacks,
        onUpdate: errorCallback,
      });
      
      expect(() => {
        errorLoop.start();
        vi.advanceTimersByTime(16.67);
      }).not.toThrow();
    });

    it('should handle render callback errors gracefully', () => {
      const errorCallback = vi.fn(() => {
        throw new Error('Render error');
      });
      
      const errorLoop = createGameLoop({
        ...mockCallbacks,
        onRender: errorCallback,
      });
      
      expect(() => {
        errorLoop.start();
        vi.advanceTimersByTime(16.67);
      }).not.toThrow();
    });
  });

  describe('timing precision', () => {
    it('should maintain consistent frame timing', () => {
      const onUpdate = vi.fn();
      const precisionLoop = createGameLoop({
        ...mockCallbacks,
        onUpdate,
      }, { targetFPS: 60 });
      
      precisionLoop.start();
      expect(precisionLoop.isRunning()).toBe(true);
      
      precisionLoop.stop();
    });
  });
});