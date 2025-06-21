import React, { useRef, useEffect } from 'react';
import type { Board, ActivePiece, GhostPiece, ColorScheme, GameConfig } from '../game/types';
import { initCanvas, renderGame } from '../rendering/renderer';

interface GameCanvasProps {
  board: Board;
  currentPiece: ActivePiece | null;
  ghostPiece: GhostPiece | null;
  cellSize: number;
  colorScheme: ColorScheme;
  features?: {
    ghostPieceEnabled?: boolean;
    holdEnabled?: boolean;
    nextPieceCount?: number;
  };
  className?: string;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  board,
  currentPiece,
  ghostPiece,
  cellSize,
  colorScheme,
  features,
  className,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contextRef = useRef<ReturnType<typeof initCanvas> | null>(null);

  // Initialize canvas when component mounts or dimensions/theme change
  useEffect(() => {
    if (!canvasRef.current) return;

    const width = board[0]?.length || 0;
    const height = board.length;

    const config: GameConfig = {
      polyominoSize: 4,
      boardDimensions: {
        width,
        height,
      },
      rendering: {
        cellSize,
        gridLineWidth: 1,
        animationDuration: 300,
      },
      gameplay: {
        initialDropInterval: 1000,
        softDropMultiplier: 0.05,
        lockDelay: 500,
        maxLockResets: 15,
        dasDelay: 133,
        dasInterval: 33,
      },
      features: {
        ghostPieceEnabled: features?.ghostPieceEnabled ?? true,
        holdEnabled: features?.holdEnabled ?? true,
        nextPieceCount: features?.nextPieceCount ?? 5,
      },
      audio: {
        soundEnabled: false,
        musicEnabled: false,
        effectVolume: 0.5,
        musicVolume: 0.3,
      },
      theme: {
        colorScheme: 'gruvbox',
        particleEffects: false,
      },
    };
    
    contextRef.current = initCanvas(
      canvasRef.current,
      config,
      colorScheme
    );
  }, [board.length, board[0]?.length, cellSize, colorScheme, features]);

  // Render game whenever state changes
  useEffect(() => {
    if (!contextRef.current) return;

    renderGame(
      contextRef.current,
      board,
      currentPiece,
      ghostPiece
    );
  }, [board, currentPiece, ghostPiece]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      data-testid="game-canvas"
    />
  );
};