/**
 * Game loop implementation with fixed timestep and variable rendering
 */

export interface GameLoopCallbacks {
  onUpdate: (deltaTime: number) => void;
  onRender: () => void;
  onPause?: () => void;
  onResume?: () => void;
  onStop?: () => void;
}

export interface GameLoopConfig {
  targetFPS?: number;
  maxDeltaTime?: number;
  catchUpFrames?: number;
}

export interface GameLoopStats {
  fps: number;
  frameCount: number;
  totalTime: number;
  updateTime: number;
  renderTime: number;
}

export interface GameLoop {
  start(): void;
  stop(): void;
  pause(): void;
  resume(): void;
  isRunning(): boolean;
  isPaused(): boolean;
  getStats(): GameLoopStats;
  resetStats(): void;
}

const DEFAULT_CONFIG: Required<GameLoopConfig> = {
  targetFPS: 60,
  maxDeltaTime: 100, // Maximum delta time in ms to prevent spiral of death
  catchUpFrames: 5, // Maximum number of update frames to catch up
};

/**
 * Creates a new game loop instance
 * @param callbacks - Game loop callbacks
 * @param config - Configuration options
 * @returns GameLoop instance
 */
export function createGameLoop(
  callbacks: GameLoopCallbacks,
  config: GameLoopConfig = {}
): GameLoop {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  const targetFrameTime = 1000 / finalConfig.targetFPS;

  let isRunning = false;
  let isPaused = false;
  let lastTime = 0;
  let accumulator = 0;
  let animationFrameId = 0;

  // Statistics
  let frameCount = 0;
  let totalTime = 0;
  let lastFPSTime = 0;
  let fpsCounter = 0;
  let currentFPS = 0;
  let updateTime = 0;
  let renderTime = 0;

  /**
   * Main game loop function
   * @param currentTime - Current timestamp
   */
  function gameLoopStep(currentTime: number): void {
    if (!isRunning) {return;}

    // Calculate delta time
    const deltaTime = Math.min(
      currentTime - lastTime,
      finalConfig.maxDeltaTime
    );
    lastTime = currentTime;
    accumulator += deltaTime;

    // Update statistics
    totalTime += deltaTime;
    
    // Update FPS counter
    if (currentTime - lastFPSTime >= 1000) {
      currentFPS = fpsCounter;
      fpsCounter = 0;
      lastFPSTime = currentTime;
    }

    // Process updates with fixed timestep
    let updateFrames = 0;
    while (accumulator >= targetFrameTime && updateFrames < finalConfig.catchUpFrames) {
      if (!isPaused) {
        try {
          const updateStartTime = performance.now();
          callbacks.onUpdate(targetFrameTime);
          updateTime = performance.now() - updateStartTime;
        } catch (error) {
          console.error('Error in game update:', error);
        }
      }
      
      accumulator -= targetFrameTime;
      updateFrames++;
    }

    // Render frame
    try {
      const renderStartTime = performance.now();
      callbacks.onRender();
      renderTime = performance.now() - renderStartTime;
    } catch (error) {
      console.error('Error in game render:', error);
    }

    frameCount++;
    fpsCounter++;

    // Schedule next frame
    if (isRunning) {
      animationFrameId = requestAnimationFrame(gameLoopStep);
    }
  }

  return {
    start(): void {
      if (isRunning) {return;}

      isRunning = true;
      isPaused = false;
      lastTime = performance.now();
      accumulator = 0;
      
      animationFrameId = requestAnimationFrame(gameLoopStep);
    },

    stop(): void {
      if (!isRunning) {return;}

      isRunning = false;
      isPaused = false;
      
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = 0;
      }

      callbacks.onStop?.();
    },

    pause(): void {
      if (!isRunning || isPaused) {return;}

      isPaused = true;
      callbacks.onPause?.();
    },

    resume(): void {
      if (!isRunning || !isPaused) {return;}

      isPaused = false;
      // Reset accumulator to prevent catch-up
      accumulator = 0;
      lastTime = performance.now();
      
      callbacks.onResume?.();
    },

    isRunning(): boolean {
      return isRunning;
    },

    isPaused(): boolean {
      return isPaused;
    },

    getStats(): GameLoopStats {
      return {
        fps: currentFPS,
        frameCount,
        totalTime,
        updateTime,
        renderTime,
      };
    },

    resetStats(): void {
      frameCount = 0;
      totalTime = 0;
      lastFPSTime = performance.now();
      fpsCounter = 0;
      currentFPS = 0;
      updateTime = 0;
      renderTime = 0;
    },
  };
}