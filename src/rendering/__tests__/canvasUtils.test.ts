import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  createOffscreenCanvas,
  drawRoundedRect,
  createLinearGradient,
  createRadialGradient,
  drawText,
  drawTextWithShadow,
  measureText,
  saveContext,
  restoreContext,
  applyTransform,
  clearRect,
  drawImage,
  createPattern,
} from '../canvasUtils';

// Mock canvas context
const createMockContext = (): CanvasRenderingContext2D => {
  const gradientMock = {
    addColorStop: vi.fn(),
  };

  const patternMock = {};

  // Create a context object that tracks property changes
  const contextState = {
    fillStyle: '',
    strokeStyle: '',
    lineWidth: 1,
    globalAlpha: 1,
    font: '16px sans-serif',
    textAlign: 'left' as CanvasTextAlign,
    textBaseline: 'alphabetic' as CanvasTextBaseline,
    shadowColor: 'transparent',
    shadowBlur: 0,
    shadowOffsetX: 0,
    shadowOffsetY: 0,
  };

  const mockContext = {
    fillRect: vi.fn(),
    strokeRect: vi.fn(),
    clearRect: vi.fn(),
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    arc: vi.fn(),
    rect: vi.fn(),
    closePath: vi.fn(),
    stroke: vi.fn(),
    fill: vi.fn(),
    save: vi.fn(),
    restore: vi.fn(),
    translate: vi.fn(),
    scale: vi.fn(),
    rotate: vi.fn(),
    setTransform: vi.fn(),
    fillText: vi.fn(),
    strokeText: vi.fn(),
    measureText: vi.fn(() => ({ width: 100 })),
    createLinearGradient: vi.fn(() => gradientMock),
    createRadialGradient: vi.fn(() => gradientMock),
    createPattern: vi.fn(() => patternMock),
    drawImage: vi.fn(),
  };

  // Create getters and setters for state properties
  Object.keys(contextState).forEach((key) => {
    Object.defineProperty(mockContext, key, {
      get: () => contextState[key as keyof typeof contextState],
      set: (value: any) => {
        (contextState as any)[key] = value;
      },
    });
  });

  return mockContext as unknown as CanvasRenderingContext2D;
};

// Mock document.createElement for offscreen canvas
const originalCreateElement = document.createElement;
beforeEach(() => {
  document.createElement = vi.fn((tagName: string) => {
    if (tagName === 'canvas') {
      const ctx = createMockContext();
      return {
        width: 0,
        height: 0,
        getContext: vi.fn(() => ctx),
      } as unknown as HTMLCanvasElement;
    }
    return originalCreateElement.call(document, tagName);
  });
});

describe('createOffscreenCanvas', () => {
  it('should create an offscreen canvas with specified dimensions', () => {
    const { canvas, ctx } = createOffscreenCanvas(800, 600);

    expect(canvas.width).toBe(800);
    expect(canvas.height).toBe(600);
    expect(ctx).toBeDefined();
    expect(canvas.getContext).toHaveBeenCalledWith('2d');
  });

  it('should throw error if context is not available', () => {
    document.createElement = vi.fn(() => ({
      width: 0,
      height: 0,
      getContext: vi.fn(() => null),
    } as unknown as HTMLCanvasElement));

    expect(() => createOffscreenCanvas(100, 100)).toThrow('Failed to get 2D context');
  });
});

describe('drawRoundedRect', () => {
  it('should draw a filled rounded rectangle', () => {
    const ctx = createMockContext();

    drawRoundedRect(ctx, 10, 20, 100, 50, 5, { fill: true, stroke: false });

    expect(ctx.beginPath).toHaveBeenCalled();
    expect(ctx.moveTo).toHaveBeenCalled();
    expect(ctx.arc).toHaveBeenCalledTimes(4); // 4 corners
    expect(ctx.fill).toHaveBeenCalled();
    expect(ctx.stroke).not.toHaveBeenCalled();
  });

  it('should draw a stroked rounded rectangle', () => {
    const ctx = createMockContext();

    drawRoundedRect(ctx, 10, 20, 100, 50, 5, { fill: false, stroke: true });

    expect(ctx.beginPath).toHaveBeenCalled();
    expect(ctx.stroke).toHaveBeenCalled();
    expect(ctx.fill).not.toHaveBeenCalled();
  });

  it('should draw both filled and stroked rectangle', () => {
    const ctx = createMockContext();

    drawRoundedRect(ctx, 10, 20, 100, 50, 5, { fill: true, stroke: true });

    expect(ctx.fill).toHaveBeenCalled();
    expect(ctx.stroke).toHaveBeenCalled();
  });

  it('should handle zero radius (sharp corners)', () => {
    const ctx = createMockContext();

    drawRoundedRect(ctx, 10, 20, 100, 50, 0, { fill: true });

    expect(ctx.beginPath).toHaveBeenCalled();
    expect(ctx.arc).not.toHaveBeenCalled();
    expect(ctx.fill).toHaveBeenCalled();
  });
});

describe('createLinearGradient', () => {
  it('should create a linear gradient with color stops', () => {
    const ctx = createMockContext();
    const colors = [
      { offset: 0, color: '#ff0000' },
      { offset: 0.5, color: '#00ff00' },
      { offset: 1, color: '#0000ff' },
    ];

    const gradient = createLinearGradient(ctx, 0, 0, 100, 100, colors);

    expect(ctx.createLinearGradient).toHaveBeenCalledWith(0, 0, 100, 100);
    expect(gradient.addColorStop).toHaveBeenCalledTimes(3);
    expect(gradient.addColorStop).toHaveBeenCalledWith(0, '#ff0000');
    expect(gradient.addColorStop).toHaveBeenCalledWith(0.5, '#00ff00');
    expect(gradient.addColorStop).toHaveBeenCalledWith(1, '#0000ff');
  });
});

describe('createRadialGradient', () => {
  it('should create a radial gradient with color stops', () => {
    const ctx = createMockContext();
    const colors = [
      { offset: 0, color: '#ffffff' },
      { offset: 1, color: '#000000' },
    ];

    const gradient = createRadialGradient(ctx, 50, 50, 0, 50, 50, 50, colors);

    expect(ctx.createRadialGradient).toHaveBeenCalledWith(50, 50, 0, 50, 50, 50);
    expect(gradient.addColorStop).toHaveBeenCalledTimes(2);
  });
});

describe('drawText', () => {
  it('should draw filled text', () => {
    const ctx = createMockContext();

    drawText(ctx, 'Hello', 100, 50, {
      font: '20px Arial',
      align: 'center',
      baseline: 'middle',
      fill: true,
      stroke: false,
    });

    expect(ctx.font).toBe('20px Arial');
    expect(ctx.textAlign).toBe('center');
    expect(ctx.textBaseline).toBe('middle');
    expect(ctx.fillText).toHaveBeenCalledWith('Hello', 100, 50);
    expect(ctx.strokeText).not.toHaveBeenCalled();
  });

  it('should draw stroked text', () => {
    const ctx = createMockContext();

    drawText(ctx, 'World', 200, 100, {
      stroke: true,
      fill: false,
    });

    expect(ctx.strokeText).toHaveBeenCalledWith('World', 200, 100);
    expect(ctx.fillText).not.toHaveBeenCalled();
  });

  it('should apply default options', () => {
    const ctx = createMockContext();

    drawText(ctx, 'Test', 50, 50);

    expect(ctx.fillText).toHaveBeenCalledWith('Test', 50, 50);
  });
});

describe('drawTextWithShadow', () => {
  it('should draw text with shadow effect', () => {
    const ctx = createMockContext();
    let capturedShadowColor = '';
    let capturedShadowBlur = 0;
    let capturedShadowOffsetX = 0;
    let capturedShadowOffsetY = 0;

    // Capture shadow values when fillText is called
    ctx.fillText = vi.fn(() => {
      capturedShadowColor = ctx.shadowColor;
      capturedShadowBlur = ctx.shadowBlur;
      capturedShadowOffsetX = ctx.shadowOffsetX;
      capturedShadowOffsetY = ctx.shadowOffsetY;
    });

    drawTextWithShadow(ctx, 'Shadow', 100, 100, {
      font: '24px Bold',
      shadowColor: '#000000',
      shadowBlur: 5,
      shadowOffsetX: 2,
      shadowOffsetY: 2,
    });

    expect(ctx.font).toBe('24px Bold');
    expect(capturedShadowColor).toBe('#000000');
    expect(capturedShadowBlur).toBe(5);
    expect(capturedShadowOffsetX).toBe(2);
    expect(capturedShadowOffsetY).toBe(2);
    expect(ctx.fillText).toHaveBeenCalledWith('Shadow', 100, 100);
  });

  it('should reset shadow after drawing', () => {
    const ctx = createMockContext();

    drawTextWithShadow(ctx, 'Test', 50, 50);

    expect(ctx.shadowColor).toBe('transparent');
    expect(ctx.shadowBlur).toBe(0);
    expect(ctx.shadowOffsetX).toBe(0);
    expect(ctx.shadowOffsetY).toBe(0);
  });
});

describe('measureText', () => {
  it('should measure text width with specified font', () => {
    const ctx = createMockContext();

    const width = measureText(ctx, 'Measure me', '18px sans-serif');

    expect(ctx.font).toBe('18px sans-serif');
    expect(ctx.measureText).toHaveBeenCalledWith('Measure me');
    expect(width).toBe(100);
  });
});

describe('saveContext and restoreContext', () => {
  it('should save and restore context state', () => {
    const ctx = createMockContext();

    saveContext(ctx);
    expect(ctx.save).toHaveBeenCalled();

    restoreContext(ctx);
    expect(ctx.restore).toHaveBeenCalled();
  });
});

describe('applyTransform', () => {
  it('should apply translation', () => {
    const ctx = createMockContext();

    applyTransform(ctx, { translate: { x: 100, y: 50 } });

    expect(ctx.translate).toHaveBeenCalledWith(100, 50);
  });

  it('should apply scale', () => {
    const ctx = createMockContext();

    applyTransform(ctx, { scale: { x: 2, y: 3 } });

    expect(ctx.scale).toHaveBeenCalledWith(2, 3);
  });

  it('should apply rotation', () => {
    const ctx = createMockContext();

    applyTransform(ctx, { rotate: Math.PI / 2 });

    expect(ctx.rotate).toHaveBeenCalledWith(Math.PI / 2);
  });

  it('should apply multiple transformations in order', () => {
    const ctx = createMockContext();

    applyTransform(ctx, {
      translate: { x: 50, y: 50 },
      rotate: Math.PI / 4,
      scale: { x: 2, y: 2 },
    });

    // Verify order: translate -> rotate -> scale
    expect(ctx.translate).toHaveBeenCalledWith(50, 50);
    expect(ctx.rotate).toHaveBeenCalledWith(Math.PI / 4);
    expect(ctx.scale).toHaveBeenCalledWith(2, 2);
  });
});

describe('clearRect', () => {
  it('should clear a rectangular area', () => {
    const ctx = createMockContext();

    clearRect(ctx, 10, 20, 100, 50);

    expect(ctx.clearRect).toHaveBeenCalledWith(10, 20, 100, 50);
  });
});

describe('drawImage', () => {
  it('should draw an image', () => {
    const ctx = createMockContext();
    const img = new Image();

    drawImage(ctx, img, 0, 0);

    expect(ctx.drawImage).toHaveBeenCalledWith(img, 0, 0);
  });

  it('should draw an image with dimensions', () => {
    const ctx = createMockContext();
    const img = new Image();

    drawImage(ctx, img, 10, 20, 100, 50);

    expect(ctx.drawImage).toHaveBeenCalledWith(img, 10, 20, 100, 50);
  });

  it('should draw an image with source and destination rectangles', () => {
    const ctx = createMockContext();
    const img = new Image();

    drawImage(ctx, img, 0, 0, 100, 100, 50, 50, 200, 200);

    expect(ctx.drawImage).toHaveBeenCalledWith(img, 0, 0, 100, 100, 50, 50, 200, 200);
  });
});

describe('createPattern', () => {
  it('should create a pattern from an image', () => {
    const ctx = createMockContext();
    const img = new Image();

    const pattern = createPattern(ctx, img, 'repeat');

    expect(ctx.createPattern).toHaveBeenCalledWith(img, 'repeat');
    expect(pattern).toBeDefined();
  });

  it('should throw error if pattern creation fails', () => {
    const ctx = createMockContext();
    ctx.createPattern = vi.fn(() => null);
    const img = new Image();

    expect(() => createPattern(ctx, img, 'repeat')).toThrow('Failed to create pattern');
  });
});