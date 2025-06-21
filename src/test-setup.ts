import '@testing-library/jest-dom';

// Mock canvas for tests
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-return */
HTMLCanvasElement.prototype.getContext = function(contextType: string): any {
  if (contextType === '2d') {
    return {
      clearRect: () => {},
      fillRect: () => {},
      strokeRect: () => {},
      beginPath: () => {},
      moveTo: () => {},
      lineTo: () => {},
      closePath: () => {},
      stroke: () => {},
      fill: () => {},
      arc: () => {},
      rect: () => {},
      save: () => {},
      restore: () => {},
      translate: () => {},
      rotate: () => {},
      scale: () => {},
      drawImage: () => {},
      createLinearGradient: (): CanvasGradient => ({ addColorStop: (): void => {} } as CanvasGradient),
      createRadialGradient: (): CanvasGradient => ({ addColorStop: (): void => {} } as CanvasGradient),
      getImageData: () => ({ data: [] }),
      putImageData: () => {},
      measureText: () => ({ width: 0 }),
      fillText: () => {},
      strokeText: () => {},
      canvas: { width: 0, height: 0 },
      fillStyle: '',
      strokeStyle: '',
      lineWidth: 1,
      font: '',
      textAlign: 'start',
      textBaseline: 'alphabetic',
      globalAlpha: 1,
    } as any;
  }
  return null;
};