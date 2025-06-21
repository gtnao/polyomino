import React, { useRef, useEffect } from 'react';
import type { Polyomino, ColorScheme } from '../game/types';
import { getPieceColor } from '../rendering/colorSchemes';

interface HoldDisplayProps {
  heldPiece: Polyomino | null;
  colorScheme: ColorScheme;
  canHold: boolean;
  cellSize?: number;
  showTitle?: boolean;
  className?: string;
}

export const HoldDisplay: React.FC<HoldDisplayProps> = ({
  heldPiece,
  colorScheme,
  canHold,
  cellSize = 20,
  showTitle = false,
  className,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Calculate bounds of held piece to determine canvas size
  const bounds = React.useMemo(() => {
    if (!heldPiece) return { canvasSize: 4 };
    
    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;
    
    heldPiece.cells.forEach((cell: number[]) => {
      const [x, y] = cell;
      if (x !== undefined && y !== undefined) {
        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x);
        minY = Math.min(minY, y);
        maxY = Math.max(maxY, y);
      }
    });

    const width = maxX - minX + 1;
    const height = maxY - minY + 1;
    const canvasSize = Math.max(width, height, 4) + 1;
    
    return { minX, minY, maxX, maxY, width, height, canvasSize };
  }, [heldPiece]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !heldPiece) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const { minX = 0, minY = 0, width = 0, height = 0, canvasSize } = bounds;

    // Center the piece in the canvas
    const offsetX = Math.floor((canvasSize - width) / 2) - minX;
    const offsetY = Math.floor((canvasSize - height) / 2) - minY;

    // Get polyomino color based on colorIndex
    const colorIndex = heldPiece.colorIndex || 0;
    const color = getPieceColor(colorScheme, colorIndex);

    // Draw the polyomino cells
    heldPiece.cells.forEach((cell: number[]) => {
      const [x, y] = cell;
      if (x !== undefined && y !== undefined) {
        const pixelX = (x + offsetX) * cellSize;
        const pixelY = (y + offsetY) * cellSize;
      
        // Fill the cell
        ctx.fillStyle = color;
        ctx.globalAlpha = canHold ? 1.0 : 0.5;
        ctx.fillRect(pixelX, pixelY, cellSize, cellSize);
        
        // Draw border
        ctx.strokeStyle = colorScheme.colors.ui.border;
        ctx.lineWidth = 1;
        ctx.strokeRect(pixelX, pixelY, cellSize, cellSize);
        
        // Reset alpha
        ctx.globalAlpha = 1.0;
      }
    });
  }, [heldPiece, colorScheme, cellSize, canHold, bounds]);

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    padding: '15px',
    backgroundColor: colorScheme.colors.ui.panel,
    border: `2px solid ${colorScheme.colors.ui.border}`,
    borderRadius: '8px',
    opacity: canHold ? 1 : 0.5,
    cursor: canHold ? 'pointer' : 'not-allowed',
    transition: 'all 0.3s ease',
    minWidth: '120px',
    minHeight: '120px',
  };

  return (
    <div
      className={className}
      data-testid="hold-display"
      style={containerStyle}
    >
      {showTitle && (
        <h3
          style={{
            margin: 0,
            color: colorScheme.colors.text,
            fontSize: '16px',
            fontWeight: 'bold',
            textAlign: 'center',
          }}
        >
          Hold
        </h3>
      )}
      {heldPiece ? (
        <canvas
          ref={canvasRef}
          width={bounds.canvasSize * cellSize}
          height={bounds.canvasSize * cellSize}
          data-testid="hold-piece-canvas"
          style={{
            display: 'block',
            margin: '0 auto',
          }}
        />
      ) : (
        <div
          data-testid="hold-empty-state"
          style={{
            width: bounds.canvasSize * cellSize,
            height: bounds.canvasSize * cellSize,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: `2px dashed ${colorScheme.colors.grid}`,
            borderRadius: '4px',
            color: colorScheme.colors.grid,
            fontSize: '14px',
          }}
        >
          Empty
        </div>
      )}
    </div>
  );
};