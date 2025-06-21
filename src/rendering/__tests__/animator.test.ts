import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  createAnimation,
  updateAnimation,
  isAnimationComplete,
  getAnimationProgress,
  createLineClearAnimation,
  createLevelUpAnimation,
  createPiecePlaceAnimation,
  createGameOverAnimation,
  AnimationManager,
  updateAnimations,
  renderAnimations,
  lerp,
  easeInOutCubic,
  easeOutElastic,
  easeInExpo,
} from '../animator';
import type { Animation, RenderContext, Coordinate, ColorScheme } from '../../game/types';

// Mock performance.now
const mockNow = vi.fn(() => 1000);
global.performance = {
  now: mockNow,
} as any;

// Mock render context
const createMockContext = (): RenderContext => {
  const mockCtx = {
    save: vi.fn(),
    restore: vi.fn(),
    globalAlpha: 1,
    fillStyle: '',
    strokeStyle: '',
    lineWidth: 1,
    fillRect: vi.fn(),
    strokeRect: vi.fn(),
    translate: vi.fn(),
    scale: vi.fn(),
    rotate: vi.fn(),
  };

  const theme: ColorScheme = {
    name: 'test',
    colors: {
      background: '#000000',
      board: '#111111',
      grid: '#222222',
      text: '#ffffff',
      textSecondary: '#cccccc',
      ghost: '#333333',
      pieces: ['#ff0000', '#00ff00', '#0000ff'],
      ui: {
        panel: '#444444',
        button: '#555555',
        buttonHover: '#666666',
        border: '#777777',
      },
      effects: {
        lineClear: ['#ffff00', '#ff00ff', '#00ffff'],
        levelUp: ['#ff8800', '#88ff00', '#0088ff'],
        gameOver: '#ff0000',
      },
    },
  };

  return {
    canvas: { width: 800, height: 600 } as HTMLCanvasElement,
    ctx: mockCtx as unknown as CanvasRenderingContext2D,
    config: {
      rendering: {
        cellSize: 20,
        gridLineWidth: 1,
        animationDuration: 300,
      },
      boardDimensions: {
        width: 10,
        height: 20,
      },
    } as any,
    theme,
  };
};

beforeEach(() => {
  mockNow.mockReturnValue(1000);
});

describe('createAnimation', () => {
  it('should create a new animation', () => {
    const animation = createAnimation('lineClear', 500, { lines: [10, 11, 12] });

    expect(animation.type).toBe('lineClear');
    expect(animation.startTime).toBe(1000);
    expect(animation.duration).toBe(500);
    expect(animation.data).toEqual({ lines: [10, 11, 12] });
  });

  it('should use current time as start time', () => {
    mockNow.mockReturnValue(2500);
    const animation = createAnimation('levelUp', 1000, { level: 5 });

    expect(animation.startTime).toBe(2500);
  });
});

describe('updateAnimation', () => {
  it('should not change animation if not started', () => {
    mockNow.mockReturnValue(500);
    const animation: Animation = {
      type: 'piecePlace',
      startTime: 1000,
      duration: 300,
      data: {},
    };

    const updated = updateAnimation(animation);
    expect(updated).toEqual(animation);
  });

  it('should update animation time', () => {
    mockNow.mockReturnValue(1150);
    const animation: Animation = {
      type: 'gameOver',
      startTime: 1000,
      duration: 300,
      data: {},
    };

    const updated = updateAnimation(animation);
    expect(updated).toEqual(animation); // Animation object remains the same
  });
});

describe('isAnimationComplete', () => {
  it('should return false if animation is not complete', () => {
    mockNow.mockReturnValue(1150);
    const animation: Animation = {
      type: 'lineClear',
      startTime: 1000,
      duration: 300,
      data: {},
    };

    expect(isAnimationComplete(animation)).toBe(false);
  });

  it('should return true if animation is complete', () => {
    mockNow.mockReturnValue(1400);
    const animation: Animation = {
      type: 'lineClear',
      startTime: 1000,
      duration: 300,
      data: {},
    };

    expect(isAnimationComplete(animation)).toBe(true);
  });

  it('should return false if animation has not started', () => {
    mockNow.mockReturnValue(900);
    const animation: Animation = {
      type: 'lineClear',
      startTime: 1000,
      duration: 300,
      data: {},
    };

    expect(isAnimationComplete(animation)).toBe(false);
  });
});

describe('getAnimationProgress', () => {
  it('should return 0 if animation has not started', () => {
    mockNow.mockReturnValue(900);
    const animation: Animation = {
      type: 'levelUp',
      startTime: 1000,
      duration: 300,
      data: {},
    };

    expect(getAnimationProgress(animation)).toBe(0);
  });

  it('should return progress between 0 and 1', () => {
    mockNow.mockReturnValue(1150);
    const animation: Animation = {
      type: 'levelUp',
      startTime: 1000,
      duration: 300,
      data: {},
    };

    expect(getAnimationProgress(animation)).toBe(0.5);
  });

  it('should return 1 if animation is complete', () => {
    mockNow.mockReturnValue(1400);
    const animation: Animation = {
      type: 'levelUp',
      startTime: 1000,
      duration: 300,
      data: {},
    };

    expect(getAnimationProgress(animation)).toBe(1);
  });
});

describe('Animation factory functions', () => {
  it('should create line clear animation', () => {
    const lines = [5, 6, 7, 8];
    const animation = createLineClearAnimation(lines, 400);

    expect(animation.type).toBe('lineClear');
    expect(animation.duration).toBe(400);
    expect(animation.data).toEqual({ lines });
  });

  it('should create level up animation', () => {
    const animation = createLevelUpAnimation(10, 600);

    expect(animation.type).toBe('levelUp');
    expect(animation.duration).toBe(600);
    expect(animation.data).toEqual({ level: 10 });
  });

  it('should create piece place animation', () => {
    const position: Coordinate = [5, 10];
    const shape: Coordinate[] = [[0, 0], [1, 0], [0, 1], [1, 1]];
    const animation = createPiecePlaceAnimation(position, shape, '#ff0000', 200);

    expect(animation.type).toBe('piecePlace');
    expect(animation.duration).toBe(200);
    expect(animation.data).toEqual({ position, shape, color: '#ff0000' });
  });

  it('should create game over animation', () => {
    const animation = createGameOverAnimation(1500);

    expect(animation.type).toBe('gameOver');
    expect(animation.duration).toBe(1500);
    expect(animation.data).toEqual({});
  });
});

describe('AnimationManager', () => {
  it('should create manager with empty animations', () => {
    const manager = new AnimationManager();

    expect(manager.getAnimations()).toEqual([]);
  });

  it('should add animation', () => {
    const manager = new AnimationManager();
    const animation = createAnimation('lineClear', 300, {});

    manager.add(animation);

    expect(manager.getAnimations()).toHaveLength(1);
    expect(manager.getAnimations()[0]).toBe(animation);
  });

  it('should add multiple animations', () => {
    const manager = new AnimationManager();
    const anim1 = createAnimation('lineClear', 300, {});
    const anim2 = createAnimation('levelUp', 500, {});

    manager.add(anim1);
    manager.add(anim2);

    expect(manager.getAnimations()).toHaveLength(2);
  });

  it('should update animations and remove completed ones', () => {
    mockNow.mockReturnValue(1000);
    const manager = new AnimationManager();
    const anim1 = createAnimation('lineClear', 300, {});
    const anim2 = createAnimation('levelUp', 500, {});

    manager.add(anim1);
    manager.add(anim2);

    // Move time forward past first animation
    mockNow.mockReturnValue(1400);
    manager.update();

    expect(manager.getAnimations()).toHaveLength(1);
    expect(manager.getAnimations()[0]).toBe(anim2);
  });

  it('should clear all animations', () => {
    const manager = new AnimationManager();
    manager.add(createAnimation('lineClear', 300, {}));
    manager.add(createAnimation('levelUp', 500, {}));

    manager.clear();

    expect(manager.getAnimations()).toEqual([]);
  });

  it('should check if any animations are active', () => {
    const manager = new AnimationManager();

    expect(manager.hasActiveAnimations()).toBe(false);

    manager.add(createAnimation('lineClear', 300, {}));

    expect(manager.hasActiveAnimations()).toBe(true);
  });
});

describe('updateAnimations', () => {
  it('should update all animations and return active ones', () => {
    mockNow.mockReturnValue(1000);
    const animations = [
      createAnimation('lineClear', 300, {}),
      createAnimation('levelUp', 500, {}),
    ];

    mockNow.mockReturnValue(1400);
    const active = updateAnimations(animations);

    expect(active).toHaveLength(1);
    expect(active[0]?.type).toBe('levelUp');
  });

  it('should return empty array if all animations complete', () => {
    mockNow.mockReturnValue(1000);
    const animations = [createAnimation('lineClear', 300, {})];

    mockNow.mockReturnValue(2000);
    const active = updateAnimations(animations);

    expect(active).toEqual([]);
  });
});

describe('renderAnimations', () => {
  it('should render all active animations', () => {
    const context = createMockContext();
    const animations = [
      createLineClearAnimation([10, 11], 300),
      createLevelUpAnimation(5, 500),
    ];

    renderAnimations(context, animations);

    // Should save and restore context at least once for each animation
    // (may be more due to nested save/restore in specific animations)
    expect(context.ctx.save).toHaveBeenCalled();
    expect(context.ctx.restore).toHaveBeenCalled();
    expect(context.ctx.save).toHaveBeenCalledTimes((context.ctx.restore as any).mock.calls.length);
  });

  it('should skip rendering if no animations', () => {
    const context = createMockContext();

    renderAnimations(context, []);

    expect(context.ctx.save).not.toHaveBeenCalled();
  });
});

describe('Easing functions', () => {
  describe('lerp', () => {
    it('should interpolate between values', () => {
      expect(lerp(0, 100, 0)).toBe(0);
      expect(lerp(0, 100, 0.5)).toBe(50);
      expect(lerp(0, 100, 1)).toBe(100);
    });

    it('should handle negative values', () => {
      expect(lerp(-50, 50, 0.5)).toBe(0);
      expect(lerp(-100, -50, 0.5)).toBe(-75);
    });
  });

  describe('easeInOutCubic', () => {
    it('should ease values', () => {
      expect(easeInOutCubic(0)).toBe(0);
      expect(easeInOutCubic(0.5)).toBe(0.5);
      expect(easeInOutCubic(1)).toBe(1);
    });

    it('should have smooth acceleration and deceleration', () => {
      expect(easeInOutCubic(0.25)).toBeLessThan(0.25);
      expect(easeInOutCubic(0.75)).toBeGreaterThan(0.75);
    });
  });

  describe('easeOutElastic', () => {
    it('should ease with elastic effect', () => {
      expect(easeOutElastic(0)).toBe(0);
      expect(easeOutElastic(1)).toBeCloseTo(1);
    });

    it('should overshoot and bounce back', () => {
      const mid = easeOutElastic(0.7);
      expect(mid).toBeGreaterThan(1);
    });
  });

  describe('easeInExpo', () => {
    it('should ease exponentially', () => {
      expect(easeInExpo(0)).toBe(0);
      expect(easeInExpo(1)).toBe(1);
    });

    it('should start slow and accelerate', () => {
      expect(easeInExpo(0.1)).toBeLessThan(0.01);
      expect(easeInExpo(0.9)).toBe(0.5); // Math.pow(2, -1) = 0.5
      expect(easeInExpo(0.95)).toBeGreaterThan(0.7);
    });
  });
});