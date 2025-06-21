/**
 * Canvas utility functions for common drawing operations
 */

/**
 * Creates an offscreen canvas for buffering or compositing
 * @param width - Canvas width
 * @param height - Canvas height
 * @returns Canvas and context
 */
export function createOffscreenCanvas(
  width: number,
  height: number
): { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D } {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Failed to get 2D context for offscreen canvas');
  }
  
  return { canvas, ctx };
}

/**
 * Options for drawing rounded rectangles
 */
interface RoundedRectOptions {
  fill?: boolean;
  stroke?: boolean;
}

/**
 * Draws a rounded rectangle
 * @param ctx - Canvas context
 * @param x - X position
 * @param y - Y position
 * @param width - Rectangle width
 * @param height - Rectangle height
 * @param radius - Corner radius
 * @param options - Drawing options
 */
export function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
  options: RoundedRectOptions = { fill: true }
): void {
  ctx.beginPath();
  
  if (radius === 0) {
    // Sharp corners
    ctx.rect(x, y, width, height);
  } else {
    // Rounded corners
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.arc(x + width - radius, y + radius, radius, -Math.PI / 2, 0);
    ctx.lineTo(x + width, y + height - radius);
    ctx.arc(x + width - radius, y + height - radius, radius, 0, Math.PI / 2);
    ctx.lineTo(x + radius, y + height);
    ctx.arc(x + radius, y + height - radius, radius, Math.PI / 2, Math.PI);
    ctx.lineTo(x, y + radius);
    ctx.arc(x + radius, y + radius, radius, Math.PI, Math.PI * 1.5);
    ctx.closePath();
  }
  
  if (options.fill) {
    ctx.fill();
  }
  
  if (options.stroke) {
    ctx.stroke();
  }
}

/**
 * Color stop for gradients
 */
interface ColorStop {
  offset: number;
  color: string;
}

/**
 * Creates a linear gradient
 * @param ctx - Canvas context
 * @param x0 - Start X
 * @param y0 - Start Y
 * @param x1 - End X
 * @param y1 - End Y
 * @param colorStops - Array of color stops
 * @returns Linear gradient
 */
export function createLinearGradient(
  ctx: CanvasRenderingContext2D,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  colorStops: ColorStop[]
): CanvasGradient {
  const gradient = ctx.createLinearGradient(x0, y0, x1, y1);
  
  for (const stop of colorStops) {
    gradient.addColorStop(stop.offset, stop.color);
  }
  
  return gradient;
}

/**
 * Creates a radial gradient
 * @param ctx - Canvas context
 * @param x0 - Inner circle X
 * @param y0 - Inner circle Y
 * @param r0 - Inner circle radius
 * @param x1 - Outer circle X
 * @param y1 - Outer circle Y
 * @param r1 - Outer circle radius
 * @param colorStops - Array of color stops
 * @returns Radial gradient
 */
export function createRadialGradient(
  ctx: CanvasRenderingContext2D,
  x0: number,
  y0: number,
  r0: number,
  x1: number,
  y1: number,
  r1: number,
  colorStops: ColorStop[]
): CanvasGradient {
  const gradient = ctx.createRadialGradient(x0, y0, r0, x1, y1, r1);
  
  for (const stop of colorStops) {
    gradient.addColorStop(stop.offset, stop.color);
  }
  
  return gradient;
}

/**
 * Text drawing options
 */
interface TextOptions {
  font?: string;
  align?: CanvasTextAlign;
  baseline?: CanvasTextBaseline;
  fill?: boolean;
  stroke?: boolean;
}

/**
 * Draws text with options
 * @param ctx - Canvas context
 * @param text - Text to draw
 * @param x - X position
 * @param y - Y position
 * @param options - Text options
 */
export function drawText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  options: TextOptions = {}
): void {
  const {
    font = ctx.font,
    align = 'left',
    baseline = 'alphabetic',
    fill = true,
    stroke = false,
  } = options;
  
  ctx.font = font;
  ctx.textAlign = align;
  ctx.textBaseline = baseline;
  
  if (fill) {
    ctx.fillText(text, x, y);
  }
  
  if (stroke) {
    ctx.strokeText(text, x, y);
  }
}

/**
 * Text with shadow options
 */
interface TextShadowOptions extends TextOptions {
  shadowColor?: string;
  shadowBlur?: number;
  shadowOffsetX?: number;
  shadowOffsetY?: number;
}

/**
 * Draws text with shadow effect
 * @param ctx - Canvas context
 * @param text - Text to draw
 * @param x - X position
 * @param y - Y position
 * @param options - Shadow options
 */
export function drawTextWithShadow(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  options: TextShadowOptions = {}
): void {
  const {
    shadowColor = '#000000',
    shadowBlur = 4,
    shadowOffsetX = 2,
    shadowOffsetY = 2,
    ...textOptions
  } = options;
  
  // Apply shadow
  ctx.shadowColor = shadowColor;
  ctx.shadowBlur = shadowBlur;
  ctx.shadowOffsetX = shadowOffsetX;
  ctx.shadowOffsetY = shadowOffsetY;
  
  // Draw text
  drawText(ctx, text, x, y, textOptions);
  
  // Reset shadow to transparent
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
}

/**
 * Measures text width
 * @param ctx - Canvas context
 * @param text - Text to measure
 * @param font - Font to use
 * @returns Text width
 */
export function measureText(
  ctx: CanvasRenderingContext2D,
  text: string,
  font?: string
): number {
  if (font) {
    ctx.font = font;
  }
  
  return ctx.measureText(text).width;
}

/**
 * Saves the canvas context state
 * @param ctx - Canvas context
 */
export function saveContext(ctx: CanvasRenderingContext2D): void {
  ctx.save();
}

/**
 * Restores the canvas context state
 * @param ctx - Canvas context
 */
export function restoreContext(ctx: CanvasRenderingContext2D): void {
  ctx.restore();
}

/**
 * Transform options
 */
interface TransformOptions {
  translate?: { x: number; y: number };
  rotate?: number;
  scale?: { x: number; y: number };
}

/**
 * Applies transformations to the context
 * @param ctx - Canvas context
 * @param options - Transform options
 */
export function applyTransform(
  ctx: CanvasRenderingContext2D,
  options: TransformOptions
): void {
  if (options.translate) {
    ctx.translate(options.translate.x, options.translate.y);
  }
  
  if (options.rotate !== undefined) {
    ctx.rotate(options.rotate);
  }
  
  if (options.scale) {
    ctx.scale(options.scale.x, options.scale.y);
  }
}

/**
 * Clears a rectangular area
 * @param ctx - Canvas context
 * @param x - X position
 * @param y - Y position
 * @param width - Width
 * @param height - Height
 */
export function clearRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number
): void {
  ctx.clearRect(x, y, width, height);
}

/**
 * Draws an image with various options
 * @param ctx - Canvas context
 * @param image - Image to draw
 * @param args - Drawing arguments (supports multiple overloads)
 */
export function drawImage(
  ctx: CanvasRenderingContext2D,
  image: CanvasImageSource,
  ...args: number[]
): void {
  // Use proper overload signatures
  if (args.length === 2) {
    ctx.drawImage(image, args[0]!, args[1]!);
  } else if (args.length === 4) {
    ctx.drawImage(image, args[0]!, args[1]!, args[2]!, args[3]!);
  } else if (args.length === 8) {
    ctx.drawImage(image, args[0]!, args[1]!, args[2]!, args[3]!, args[4]!, args[5]!, args[6]!, args[7]!);
  }
}

/**
 * Creates a pattern from an image
 * @param ctx - Canvas context
 * @param image - Image source
 * @param repetition - Repetition type
 * @returns Canvas pattern
 */
export function createPattern(
  ctx: CanvasRenderingContext2D,
  image: CanvasImageSource,
  repetition: string | null
): CanvasPattern {
  const pattern = ctx.createPattern(image, repetition);
  
  if (!pattern) {
    throw new Error('Failed to create pattern');
  }
  
  return pattern;
}