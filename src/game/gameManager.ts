/**
 * Game state manager that coordinates all game systems
 */

import type {
  GameState,
  GhostPiece,
  GameStats,
  GameAction,
  GameConfig,
  Polyomino,
  PolyominoShape,
  ActivePiece,
  Coordinate,
  Board,
  ColorSchemeName,
} from './types';
import { createEmptyBoard, placePiece, getFilledLines, clearLines } from './board';
import { checkCollision } from './collision';
import { calculateScore, calculateLevel, getDropInterval, updateStats } from './scoring';
import { createBag, getNextPiece } from './bag';
import { initLockDelay, updateLockDelay, shouldLockPiece, resetLockDelay } from './lockDelay';
import { getColorScheme } from '../rendering/colorSchemes';
import { rotateShape, getKickOffsets } from './rotation';
import { getPieceDefinitions } from '../polyomino/shapes';
import { adjustBrightness, adjustSaturation } from '../rendering/colorUtils';

/**
 * Calculate distinct colors for pieces, using variations when needed
 */
export function calculatePieceColors(numPieces: number, baseColors: string[]): string[] {
  const colors: string[] = [];
  const numBaseColors = baseColors.length;
  
  for (let i = 0; i < numPieces; i++) {
    if (i < numBaseColors && baseColors[i]) {
      // Use base colors directly for the first pieces
      colors.push(baseColors[i]!);
    } else {
      // Apply variations for additional pieces
      const baseIndex = i % numBaseColors;
      const baseColor = baseColors[baseIndex] || '#888888';
      const variationLevel = Math.floor(i / numBaseColors);
      
      // Apply different variations based on the level
      let variedColor = baseColor;
      if (variationLevel === 1) {
        // First round of variations: make darker
        variedColor = adjustBrightness(baseColor, -25);
      } else if (variationLevel === 2) {
        // Second round: make lighter
        variedColor = adjustBrightness(baseColor, 25);
      } else if (variationLevel === 3) {
        // Third round: adjust saturation down
        variedColor = adjustSaturation(baseColor, -30);
      } else if (variationLevel === 4) {
        // Fourth round: adjust saturation up
        variedColor = adjustSaturation(baseColor, 30);
      } else {
        // Further rounds: combine adjustments
        const brightAdjust = (variationLevel % 2 === 0) ? 20 : -20;
        const satAdjust = (variationLevel % 3 === 0) ? 25 : -25;
        variedColor = adjustSaturation(adjustBrightness(baseColor, brightAdjust), satAdjust);
      }
      
      colors.push(variedColor);
    }
  }
  
  return colors;
}

export interface GameManagerConfig {
  polyominoSize?: 4 | 5 | 6 | 7 | 8 | 9;
  boardWidth?: number;
  boardHeight?: number;
  startLevel?: number;
  enableAudio?: boolean;
  theme?: {
    colorScheme?: ColorSchemeName;
    particleEffects?: boolean;
  };
}

export interface GameManagerEvents {
  onGameStart?: () => void;
  onGameEnd?: () => void;
  onPause?: () => void;
  onResume?: () => void;
  onLineClear?: (lines: number[]) => void;
  onLevelUp?: (newLevel: number) => void;
  onPiecePlace?: () => void;
  onPieceMove?: () => void;
  onPieceRotate?: () => void;
  onHold?: () => void;
}

export interface GameManager {
  startGame(): void;
  endGame(): void;
  pauseGame(): void;
  resumeGame(): void;
  restartGame(): void;
  processInput(action: GameAction): void;
  update(deltaTime: number): void;
  getGameState(): GameState;
}

const DEFAULT_CONFIG: Required<GameManagerConfig> = {
  polyominoSize: 5,
  boardWidth: 10,
  boardHeight: 20,
  startLevel: 1,
  enableAudio: true,
  theme: {
    colorScheme: 'gruvbox',
  },
};

/**
 * Creates a new piece from polyomino data
 */
function createPiece(
  id: string,
  shape: PolyominoShape,
  position: Coordinate,
  rotation: number = 0,
  predefinedColor?: string
): ActivePiece {
  // Use predefined color if provided (from polyomino with variations)
  const actualColor = predefinedColor || '#888888';
  
  return {
    type: id,
    shape,
    position,
    rotation: rotation as 0 | 1 | 2 | 3,
    color: actualColor,
  };
}

/**
 * Moves a piece by an offset
 */
function movePiece(piece: ActivePiece, offset: Coordinate): ActivePiece {
  return {
    ...piece,
    position: [piece.position[0] + offset[0], piece.position[1] + offset[1]] as const,
  };
}

/**
 * Rotates a piece
 */
function rotatePiece(piece: ActivePiece, clockwise: boolean): ActivePiece {
  // Rotate the shape coordinates
  const rotatedShape = rotateShape(piece.shape, clockwise);
  
  // Update rotation value
  const delta = clockwise ? 1 : -1;
  const newRotation = ((piece.rotation + delta + 4) % 4) as 0 | 1 | 2 | 3;
  
  return {
    ...piece,
    shape: rotatedShape,
    rotation: newRotation,
  };
}

/**
 * Gets the ghost position for a piece using binary search
 */
function getGhostPosition(
  board: Board,
  shape: PolyominoShape,
  position: Coordinate
): Coordinate {
  const [x, currentY] = position;
  
  // Binary search for the landing position
  let low = currentY;
  let high = board.length - 1;
  let result = currentY;
  
  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    
    if (!checkCollision(board, shape, [x, mid])) {
      // Can place here, try lower
      result = mid;
      low = mid + 1;
    } else {
      // Can't place here, try higher
      high = mid - 1;
    }
  }
  
  return [x, result] as const;
}

/**
 * Creates a new game manager instance
 * @param config - Game configuration
 * @param events - Event callbacks
 * @returns GameManager instance
 */
export function createGameManager(
  config: GameManagerConfig = {},
  events: GameManagerEvents = {}
): GameManager {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  
  // Get piece definitions for the specified size
  const pieceDefinitions = getPieceDefinitions(finalConfig.polyominoSize);
  
  // Get theme colors
  const theme = getColorScheme(finalConfig.theme?.colorScheme || 'gruvbox');
  const baseColors = theme.colors.pieces;
  
  // Calculate piece colors with variations for larger sets
  const pieceColors = calculatePieceColors(pieceDefinitions.length, baseColors);
  
  const polyominoes: Polyomino[] = pieceDefinitions.map((def, index) => ({
    id: def.id,
    cells: def.shape.map(coord => [coord[0], coord[1]]),
    rotations: def.rotations.length,
    shape: def.shape,
    colorIndex: index,
    color: pieceColors[index] || '#888888', // Pre-calculated color with fallback
  }));
  
  let gameState: GameState = createInitialGameState(finalConfig, polyominoes);
  let dropTimer = 0;
  let lockDelay = initLockDelay();
  let pieceBag = createBag(polyominoes.map(p => p.id));
  let nextPieces: Polyomino[] = [];
  let canHold = true;
  
  // Ghost piece cache to avoid redundant calculations
  const ghostPieceCache: { position: Coordinate | null; pieceX: number; pieceShape: PolyominoShape | null } = {
    position: null,
    pieceX: -1,
    pieceShape: null
  };

  /**
   * Creates the initial game state
   */
  function createInitialGameState(
    config: Required<GameManagerConfig>,
    _polyominoes: Polyomino[]
  ): GameState {
    const gameConfig: GameConfig = {
      polyominoSize: config.polyominoSize,
      boardDimensions: {
        width: config.boardWidth,
        height: config.boardHeight,
      },
      rendering: {
        cellSize: 30,
        gridLineWidth: 1,
        animationDuration: 300,
      },
      features: {
        ghostPieceEnabled: true,
        holdEnabled: true,
        nextPieceCount: 5,
      },
      gameplay: {
        initialDropInterval: 1000,
        softDropMultiplier: 20,
        lockDelay: 500,
        maxLockResets: 15,
        dasDelay: 133,
        dasInterval: 33,
      },
      audio: {
        soundEnabled: config.enableAudio,
        musicEnabled: config.enableAudio,
        effectVolume: 0.7,
        musicVolume: 0.5,
      },
      theme: {
        colorScheme: config.theme?.colorScheme || 'gruvbox',
        particleEffects: true,
      },
    };

    const stats: GameStats = {
      score: 0,
      level: config.startLevel,
      lines: 0,
      piecesPlaced: 0,
      moves: 0,
      rotations: 0,
      holds: 0,
      hardDrops: 0,
      softDropDistance: 0,
      gameStartTime: Date.now(),
      gameEndTime: null,
      pieceCounts: {},
    };

    return {
      status: 'ready',
      config: gameConfig,
      board: createEmptyBoard(config.boardWidth, config.boardHeight),
      currentPiece: null,
      ghostPiece: null,
      heldPiece: null,
      nextPieces: [],
      stats,
      lastUpdateTime: Date.now(),
    };
  }

  /**
   * Spawns a new piece
   */
  function spawnPiece(): void {
    const result = getNextPiece(pieceBag, polyominoes.map(p => p.id));
    const pieceId = result.piece;
    pieceBag = result.bag;
    const polyomino = polyominoes.find(p => p.id === pieceId);
    if (!polyomino) {return;}

    // Refill bag if needed (ensure we have enough for next pieces)
    if (pieceBag.pieces.length < gameState.config.features.nextPieceCount) {
      const newBag = createBag(polyominoes.map(p => p.id));
      pieceBag = {
        pieces: [...pieceBag.pieces, ...newBag.pieces]
      };
    }

    // Update next pieces
    nextPieces = [];
    for (let i = 0; i < gameState.config.features.nextPieceCount; i++) {
      const nextId = pieceBag.pieces[i];
      const next = polyominoes.find(p => p.id === nextId);
      if (next) {nextPieces.push(next);}
    }

    const spawnPosition: Coordinate = [
      Math.floor(gameState.config.boardDimensions.width / 2) - 1,
      0,
    ];

    const newPiece = createPiece(polyomino.id, polyomino.shape!, spawnPosition, 0, polyomino.color);

    // Check if spawn position is valid
    if (checkCollision(gameState.board, newPiece.shape, newPiece.position)) {
      gameState.status = 'gameover';
      gameState.stats.gameEndTime = Date.now();
      events.onGameEnd?.();
      return;
    }

    gameState.currentPiece = newPiece;
    gameState.ghostPiece = updateGhostPiece();
    gameState.nextPieces = nextPieces;
    
    lockDelay = resetLockDelay(lockDelay);
    canHold = true;
  }

  /**
   * Updates the ghost piece position with caching
   */
  function updateGhostPiece(): GhostPiece | null {
    if (!gameState.currentPiece || !gameState.config.features.ghostPieceEnabled) {
      ghostPieceCache.position = null;
      return null;
    }

    const currentX = gameState.currentPiece.position[0];
    const currentShape = gameState.currentPiece.shape;
    
    // Check if we can use cached position
    if (ghostPieceCache.position && 
        ghostPieceCache.pieceX === currentX && 
        ghostPieceCache.pieceShape === currentShape) {
      return {
        position: ghostPieceCache.position,
        shape: currentShape,
      };
    }

    // Calculate new ghost position
    const ghostPosition = getGhostPosition(gameState.board, currentShape, gameState.currentPiece.position);
    
    // Update cache
    ghostPieceCache.position = ghostPosition;
    ghostPieceCache.pieceX = currentX;
    ghostPieceCache.pieceShape = currentShape;
    
    return {
      position: ghostPosition,
      shape: currentShape,
    };
  }

  /**
   * Places the current piece on the board
   */
  function placePieceOnBoard(): void {
    if (!gameState.currentPiece) {return;}

    gameState.board = placePiece(
      gameState.board,
      gameState.currentPiece.shape,
      gameState.currentPiece.position,
      gameState.currentPiece.type,
      gameState.currentPiece.color
    );
    gameState.stats = updateStats(gameState.stats, 'piecePlaced', { pieceType: gameState.currentPiece.type });
    
    events.onPiecePlace?.();

    // Check for line clears
    const filledLines = getFilledLines(gameState.board);
    if (filledLines.length > 0) {
      const clearResult = clearLines(gameState.board, filledLines);
      gameState.board = clearResult.board;
      
      const lineScore = calculateScore('lineClear', filledLines.length, gameState.stats.level);
      gameState.stats.score += lineScore;
      gameState.stats.lines += filledLines.length;
      
      const newLevel = calculateLevel(gameState.stats.lines);
      if (newLevel > gameState.stats.level) {
        gameState.stats.level = newLevel;
        events.onLevelUp?.(newLevel);
        
        // Log the new drop speed for debugging
        const newInterval = getDropInterval(newLevel);
        console.log(`[Level Up] Level ${newLevel}, Drop interval: ${newInterval}ms`);
      }
      
      events.onLineClear?.(filledLines);
    }

    gameState.currentPiece = null;
    gameState.ghostPiece = null;
    
    spawnPiece();
  }

  /**
   * Attempts to move the current piece
   */
  function tryMovePiece(direction: 'left' | 'right' | 'down'): boolean {
    if (!gameState.currentPiece) {return false;}

    const offset: Coordinate = direction === 'left' ? [-1, 0] :
                  direction === 'right' ? [1, 0] :
                  [0, 1];

    const newPiece = movePiece(gameState.currentPiece, offset);

    if (!checkCollision(gameState.board, newPiece.shape, newPiece.position)) {
      gameState.currentPiece = newPiece;
      gameState.ghostPiece = updateGhostPiece();
      
      if (direction !== 'down') {
        gameState.stats = updateStats(gameState.stats, 'move', {});
        events.onPieceMove?.();
      }

      return true;
    }

    return false;
  }

  /**
   * Attempts to rotate the current piece
   */
  function tryRotatePiece(direction: 'clockwise' | 'counterclockwise'): boolean {
    if (!gameState.currentPiece) {return false;}

    const clockwise = direction === 'clockwise';
    const newPiece = rotatePiece(gameState.currentPiece, clockwise);

    // Try rotation with kick table offsets
    const kickOffsets = getKickOffsets(clockwise);
    
    for (const [offsetX, offsetY] of kickOffsets) {
      const testPosition: Coordinate = [
        newPiece.position[0] + offsetX,
        newPiece.position[1] + offsetY
      ];
      
      if (!checkCollision(gameState.board, newPiece.shape, testPosition)) {
        // Rotation successful with this offset
        gameState.currentPiece = {
          ...newPiece,
          position: testPosition
        };
        gameState.ghostPiece = updateGhostPiece();
        gameState.stats = updateStats(gameState.stats, 'rotate', {});
        events.onPieceRotate?.();
        
        // Reset lock delay on successful rotation
        if (lockDelay.isActive) {
          lockDelay = updateLockDelay(lockDelay, false, true, Date.now());
        }
        
        return true;
      }
    }

    return false;
  }

  /**
   * Performs a hard drop
   */
  function hardDrop(): void {
    if (!gameState.currentPiece) {return;}

    const ghostPosition = getGhostPosition(gameState.board, gameState.currentPiece.shape, gameState.currentPiece.position);
    const dropDistance = ghostPosition[1] - gameState.currentPiece.position[1];
    
    gameState.currentPiece = { ...gameState.currentPiece, position: ghostPosition };
    gameState.stats.score += calculateScore('hardDrop', dropDistance, gameState.stats.level);
    gameState.stats = updateStats(gameState.stats, 'hardDrop', {});
    
    placePieceOnBoard();
  }

  /**
   * Performs a soft drop
   */
  function softDrop(): void {
    if (!gameState.currentPiece) {return;}

    if (tryMovePiece('down')) {
      gameState.stats.score += calculateScore('softDrop', 1, gameState.stats.level);
      gameState.stats = updateStats(gameState.stats, 'softDrop', { distance: 1 });
    }
  }

  /**
   * Attempts to hold the current piece
   */
  function holdPiece(): void {
    if (!gameState.currentPiece || !canHold || !gameState.config.features.holdEnabled) {
      return;
    }

    const currentPolyomino = polyominoes.find(p => p.id === gameState.currentPiece!.type)!;

    if (gameState.heldPiece) {
      // Swap current piece with held piece
      const spawnPosition: Coordinate = [
        Math.floor(gameState.config.boardDimensions.width / 2) - 1,
        0,
      ];
      
      gameState.currentPiece = createPiece(gameState.heldPiece.id, gameState.heldPiece.shape!, spawnPosition, 0, gameState.heldPiece.color);
      gameState.heldPiece = currentPolyomino;
    } else {
      // Hold current piece and spawn new one
      gameState.heldPiece = currentPolyomino;
      spawnPiece();
    }

    gameState.ghostPiece = updateGhostPiece();
    gameState.stats = updateStats(gameState.stats, 'hold', {});
    canHold = false;
    events.onHold?.();
  }

  return {
    startGame(): void {
      gameState = createInitialGameState(finalConfig, polyominoes);
      gameState.status = 'playing';
      pieceBag = createBag(polyominoes.map(p => p.id));
      dropTimer = 0;
      canHold = true;
      
      // Log initial drop speed
      const initialInterval = getDropInterval(gameState.stats.level);
      console.log(`[Game Start] Level ${gameState.stats.level}, Drop interval: ${initialInterval}ms`);
      
      spawnPiece();
      events.onGameStart?.();
    },

    endGame(): void {
      if (gameState.status === 'playing') {
        gameState.status = 'gameover';
        gameState.stats.gameEndTime = Date.now();
        events.onGameEnd?.();
      }
    },

    pauseGame(): void {
      if (gameState.status === 'playing') {
        gameState.status = 'paused';
        events.onPause?.();
      }
    },

    resumeGame(): void {
      if (gameState.status === 'paused') {
        gameState.status = 'playing';
        events.onResume?.();
      }
    },

    restartGame(): void {
      gameState = createInitialGameState(finalConfig, polyominoes);
      gameState.status = 'playing';
      pieceBag = createBag(polyominoes.map(p => p.id));
      dropTimer = 0;
      canHold = true;
      
      spawnPiece();
      events.onGameStart?.();
    },

    processInput(action: GameAction): void {
      if (gameState.status !== 'playing') {return;}

      switch (action) {
        case 'moveLeft':
          tryMovePiece('left');
          break;
        case 'moveRight':
          tryMovePiece('right');
          break;
        case 'softDrop':
          softDrop();
          break;
        case 'hardDrop':
          hardDrop();
          break;
        case 'rotateRight':
          tryRotatePiece('clockwise');
          break;
        case 'rotateLeft':
          tryRotatePiece('counterclockwise');
          break;
        case 'hold':
          holdPiece();
          break;
        case 'pause':
          this.pauseGame();
          break;
      }
    },

    update(deltaTime: number): void {
      if (gameState.status !== 'playing') {return;}

      gameState.lastUpdateTime = Date.now();
      dropTimer += deltaTime;

      const dropInterval = getDropInterval(gameState.stats.level);

      // Handle automatic piece dropping
      if (dropTimer >= dropInterval) {
        if (gameState.currentPiece) {
          if (!tryMovePiece('down')) {
            // Piece can't move down, start lock delay
            lockDelay = updateLockDelay(lockDelay, true, false, Date.now());
            
            if (shouldLockPiece(lockDelay, gameState.config.gameplay.lockDelay)) {
              placePieceOnBoard();
              lockDelay = resetLockDelay(lockDelay);
            }
          } else {
            // Piece moved down successfully, reset lock delay
            lockDelay = resetLockDelay(lockDelay);
          }
        }
        
        dropTimer = 0;
      }
    },

    getGameState(): GameState {
      return { ...gameState };
    },
  };
}