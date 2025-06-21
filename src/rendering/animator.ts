import type { Animation, RenderContext, Coordinate } from '../game/types';

/**
 * Creates a new animation
 * @param type - Animation type
 * @param duration - Duration in milliseconds
 * @param data - Animation-specific data
 * @returns Animation object
 */
export function createAnimation(
  type: Animation['type'],
  duration: number,
  data: unknown
): Animation {
  return {
    type,
    startTime: performance.now(),
    duration,
    data,
  };
}

/**
 * Updates an animation (placeholder for future extensions)
 * @param animation - Animation to update
 * @returns Updated animation
 */
export function updateAnimation(animation: Animation): Animation {
  // Currently animations are time-based and don't need explicit updates
  // This function exists for future extensions (e.g., interactive animations)
  return animation;
}

/**
 * Checks if an animation is complete
 * @param animation - Animation to check
 * @returns True if animation is complete
 */
export function isAnimationComplete(animation: Animation): boolean {
  const elapsed = performance.now() - animation.startTime;
  return elapsed >= animation.duration;
}

/**
 * Gets the progress of an animation (0-1)
 * @param animation - Animation to check
 * @returns Progress value between 0 and 1
 */
export function getAnimationProgress(animation: Animation): number {
  const elapsed = performance.now() - animation.startTime;
  const progress = elapsed / animation.duration;
  return Math.max(0, Math.min(1, progress));
}

/**
 * Creates a line clear animation
 * @param lines - Array of line indices to clear
 * @param duration - Animation duration
 * @returns Line clear animation
 */
export function createLineClearAnimation(lines: number[], duration: number): Animation {
  return createAnimation('lineClear', duration, { lines });
}

/**
 * Creates a level up animation
 * @param level - New level
 * @param duration - Animation duration
 * @returns Level up animation
 */
export function createLevelUpAnimation(level: number, duration: number): Animation {
  return createAnimation('levelUp', duration, { level });
}

/**
 * Creates a piece placement animation
 * @param position - Piece position
 * @param shape - Piece shape
 * @param color - Piece color
 * @param duration - Animation duration
 * @returns Piece place animation
 */
export function createPiecePlaceAnimation(
  position: Coordinate,
  shape: Coordinate[],
  color: string,
  duration: number
): Animation {
  return createAnimation('piecePlace', duration, { position, shape, color });
}

/**
 * Creates a game over animation
 * @param duration - Animation duration
 * @returns Game over animation
 */
export function createGameOverAnimation(duration: number): Animation {
  return createAnimation('gameOver', duration, {});
}

/**
 * Animation manager for handling multiple animations
 */
export class AnimationManager {
  private animations: Animation[] = [];

  /**
   * Adds an animation to the manager
   * @param animation - Animation to add
   */
  add(animation: Animation): void {
    this.animations.push(animation);
  }

  /**
   * Updates all animations and removes completed ones
   */
  update(): void {
    this.animations = this.animations.filter(anim => !isAnimationComplete(anim));
  }

  /**
   * Clears all animations
   */
  clear(): void {
    this.animations = [];
  }

  /**
   * Gets all active animations
   * @returns Array of animations
   */
  getAnimations(): Animation[] {
    return this.animations;
  }

  /**
   * Checks if there are any active animations
   * @returns True if animations are active
   */
  hasActiveAnimations(): boolean {
    return this.animations.length > 0;
  }
}

/**
 * Updates a list of animations and returns active ones
 * @param animations - Animations to update
 * @returns Active animations
 */
export function updateAnimations(animations: Animation[]): Animation[] {
  return animations.filter(anim => !isAnimationComplete(anim));
}

/**
 * Renders all active animations
 * @param context - Render context
 * @param animations - Animations to render
 */
export function renderAnimations(context: RenderContext, animations: Animation[]): void {
  for (const animation of animations) {
    context.ctx.save();
    renderAnimation(context, animation);
    context.ctx.restore();
  }
}

/**
 * Renders a single animation based on its type
 * @param context - Render context
 * @param animation - Animation to render
 */
function renderAnimation(context: RenderContext, animation: Animation): void {
  const progress = getAnimationProgress(animation);

  switch (animation.type) {
    case 'lineClear':
      renderLineClearAnimation(context, animation, progress);
      break;
    case 'levelUp':
      renderLevelUpAnimation(context, animation, progress);
      break;
    case 'piecePlace':
      renderPiecePlaceAnimation(context, animation, progress);
      break;
    case 'gameOver':
      renderGameOverAnimation(context, animation, progress);
      break;
  }
}

/**
 * Renders line clear animation
 * @param context - Render context
 * @param animation - Animation data
 * @param progress - Animation progress (0-1)
 */
function renderLineClearAnimation(
  context: RenderContext,
  animation: Animation,
  progress: number
): void {
  const { lines } = animation.data as { lines: number[] };
  const { ctx, config, theme } = context;
  const { cellSize } = config.rendering;
  const { width } = config.boardDimensions;

  // Flash effect
  const opacity = 1 - progress;
  const scale = 1 + progress * 0.2;

  for (const line of lines) {
    ctx.globalAlpha = opacity;
    const colorIndex = line % theme.colors.effects.lineClear.length;
    ctx.fillStyle = theme.colors.effects.lineClear[colorIndex]!;
    
    const y = line * cellSize;
    const centerX = (width * cellSize) / 2;
    const centerY = y + cellSize / 2;

    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.scale(scale, scale);
    ctx.translate(-centerX, -centerY);
    
    ctx.fillRect(0, y, width * cellSize, cellSize);
    ctx.restore();
  }
}

/**
 * Renders level up animation
 * @param context - Render context
 * @param animation - Animation data
 * @param progress - Animation progress (0-1)
 */
function renderLevelUpAnimation(
  context: RenderContext,
  animation: Animation,
  progress: number
): void {
  const { level } = animation.data as { level: number };
  const { ctx, config, theme } = context;
  const { width, height } = config.boardDimensions;
  const { cellSize } = config.rendering;

  // Wave effect across the board
  const waveHeight = easeOutElastic(progress) * height * cellSize;
  
  ctx.globalAlpha = (1 - progress) * 0.5;
  const colorIndex = level % theme.colors.effects.levelUp.length;
  ctx.fillStyle = theme.colors.effects.levelUp[colorIndex]!;
  
  ctx.fillRect(0, height * cellSize - waveHeight, width * cellSize, waveHeight);
}

/**
 * Renders piece placement animation
 * @param context - Render context
 * @param animation - Animation data
 * @param progress - Animation progress (0-1)
 */
function renderPiecePlaceAnimation(
  context: RenderContext,
  animation: Animation,
  progress: number
): void {
  const { position, shape, color } = animation.data as {
    position: Coordinate;
    shape: Coordinate[];
    color: string;
  };
  const { ctx, config } = context;
  const { cellSize } = config.rendering;
  const [offsetX, offsetY] = position;

  // Pulse effect
  const scale = 1 + easeOutElastic(progress) * 0.3;
  const opacity = 1 - progress;

  ctx.globalAlpha = opacity * 0.6;
  ctx.fillStyle = color;

  for (const [x, y] of shape) {
    const pixelX = (offsetX + x) * cellSize;
    const pixelY = (offsetY + y) * cellSize;
    const centerX = pixelX + cellSize / 2;
    const centerY = pixelY + cellSize / 2;

    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.scale(scale, scale);
    ctx.translate(-centerX, -centerY);
    
    ctx.fillRect(pixelX, pixelY, cellSize, cellSize);
    ctx.restore();
  }
}

/**
 * Renders game over animation
 * @param context - Render context
 * @param animation - Animation data
 * @param progress - Animation progress (0-1)
 */
function renderGameOverAnimation(
  context: RenderContext,
  _animation: Animation,
  progress: number
): void {
  const { ctx, config, theme } = context;
  const { width, height } = config.boardDimensions;
  const { cellSize } = config.rendering;

  // Fade to dark overlay
  const opacity = easeInExpo(progress) * 0.8;
  
  ctx.globalAlpha = opacity;
  ctx.fillStyle = theme.colors.effects.gameOver;
  ctx.fillRect(0, 0, width * cellSize, height * cellSize);
}

/**
 * Linear interpolation between two values
 * @param start - Start value
 * @param end - End value
 * @param t - Progress (0-1)
 * @returns Interpolated value
 */
export function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * t;
}

/**
 * Cubic ease in/out function
 * @param t - Progress (0-1)
 * @returns Eased value
 */
export function easeInOutCubic(t: number): number {
  return t < 0.5 
    ? 4 * t * t * t 
    : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

/**
 * Elastic ease out function
 * @param t - Progress (0-1)
 * @returns Eased value
 */
export function easeOutElastic(t: number): number {
  if (t === 0) {
    return 0;
  }
  if (t === 1) {
    return 1;
  }
  
  const c4 = (2 * Math.PI) / 3;
  return Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
}

/**
 * Exponential ease in function
 * @param t - Progress (0-1)
 * @returns Eased value
 */
export function easeInExpo(t: number): number {
  if (t === 0) {
    return 0;
  }
  if (t === 1) {
    return 1;
  }
  return Math.pow(2, 10 * t - 10);
}