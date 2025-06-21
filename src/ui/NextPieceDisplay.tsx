import React, { useRef, useEffect } from 'react';
import type { Polyomino, ColorScheme } from '../game/types';
import { getPieceColor } from '../rendering/colorSchemes';

interface NextPieceDisplayProps {
  nextPieces: Polyomino[];
  colorScheme: ColorScheme;
  cellSize?: number;
  maxPieces?: number;
  showTitle?: boolean;
  className?: string;
}

const PiecePreview: React.FC<{
  polyomino: Polyomino;
  colorScheme: ColorScheme;
  cellSize: number;
  index: number;
}> = ({ polyomino, colorScheme, cellSize, index }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Calculate bounds of polyomino to determine canvas size
  const bounds = React.useMemo(() => {
    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;
    
    polyomino.cells.forEach((cell: number[]) => {
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
    
    // Use a canvas size that can fit the piece with some padding
    const canvasSize = Math.max(width, height, 3) + 1;
    
    return { minX, minY, maxX, maxY, width, height, canvasSize };
  }, [polyomino]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const { minX, minY, width, height, canvasSize } = bounds;

    // Center the piece in the canvas
    const offsetX = Math.floor((canvasSize - width) / 2) - minX;
    const offsetY = Math.floor((canvasSize - height) / 2) - minY;

    // Get polyomino color based on colorIndex
    const colorIndex = polyomino.colorIndex || 0;
    const color = getPieceColor(colorScheme, colorIndex);

    // Draw the polyomino cells
    polyomino.cells.forEach((cell: number[]) => {
      const [x, y] = cell;
      if (x !== undefined && y !== undefined) {
        const pixelX = (x + offsetX) * cellSize;
        const pixelY = (y + offsetY) * cellSize;
      
        // Fill the cell
        ctx.fillStyle = color;
        ctx.fillRect(pixelX, pixelY, cellSize, cellSize);
        
        // Draw border
        ctx.strokeStyle = colorScheme.colors.ui.border;
        ctx.lineWidth = 1;
        ctx.strokeRect(pixelX, pixelY, cellSize, cellSize);
      }
    });
  }, [polyomino, colorScheme, cellSize, bounds]);

  return (
    <canvas
      ref={canvasRef}
      width={bounds.canvasSize * cellSize}
      height={bounds.canvasSize * cellSize}
      data-testid={`next-piece-${index}`}
    />
  );
};

export const NextPieceDisplay: React.FC<NextPieceDisplayProps> = ({
  nextPieces,
  colorScheme,
  cellSize = 20,
  maxPieces = 5,
  showTitle = false,
  className,
}) => {
  const piecesToShow = nextPieces.slice(0, maxPieces);

  return (
    <div
      className={className}
      data-testid="next-piece-display"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        padding: '10px',
        backgroundColor: colorScheme.colors.ui.panel,
        border: `2px solid ${colorScheme.colors.ui.border}`,
        borderRadius: '8px',
      }}
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
          Next
        </h3>
      )}
      {piecesToShow.map((polyomino, index) => (
        <div
          key={index}
          data-testid={`next-piece-container-${index}`}
          style={{
            opacity: 1 - index * 0.2,
            transition: 'opacity 0.3s ease',
          }}
        >
          <PiecePreview
            polyomino={polyomino}
            colorScheme={colorScheme}
            cellSize={cellSize * (1 - index * 0.05)}
            index={index}
          />
        </div>
      ))}
    </div>
  );
};