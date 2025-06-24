import type { 
  RenderContext, 
  Board, 
  ActivePiece, 
  GhostPiece, 
  GameConfig, 
  ColorScheme 
} from '../game/types';

/**
 * Initializes the canvas rendering context
 * @param canvas - The canvas element
 * @param config - Game configuration
 * @param theme - Color scheme to use
 * @returns The render context
 */
export function initCanvas(
  canvas: HTMLCanvasElement,
  config: GameConfig,
  theme: ColorScheme
): RenderContext {
  const ctx = canvas.getContext('2d');
  
  if (!ctx) {
    throw new Error('Failed to get 2D context');
  }

  // Set canvas size based on board dimensions
  const { width, height } = config.boardDimensions;
  const { cellSize } = config.rendering;
  
  canvas.width = width * cellSize;
  canvas.height = height * cellSize;

  // Enable image smoothing for better rendering
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  return {
    canvas,
    ctx,
    config,
    theme,
  };
}

/**
 * Clears the entire canvas with background color
 * @param context - The render context
 */
export function clearCanvas(context: RenderContext): void {
  const { ctx, canvas, theme } = context;
  
  ctx.fillStyle = theme.colors.background;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

/**
 * Renders a single cell
 * @param context - The render context
 * @param x - X coordinate in board space
 * @param y - Y coordinate in board space
 * @param color - Cell color
 * @param opacity - Cell opacity (0-1)
 * @param border - Whether to draw border
 */
export function renderCell(
  context: RenderContext,
  x: number,
  y: number,
  color: string,
  opacity: number = 1,
  border: boolean = false
): void {
  const { ctx, config, theme } = context;
  const { cellSize, gridLineWidth } = config.rendering;
  
  // Calculate pixel position
  const pixelX = x * cellSize;
  const pixelY = y * cellSize;
  
  // Save context state
  ctx.save();
  
  // Set opacity
  ctx.globalAlpha = opacity;
  
  // Fill cell
  ctx.fillStyle = color;
  const padding = gridLineWidth;
  ctx.fillRect(
    pixelX + padding,
    pixelY + padding,
    cellSize - padding * 2,
    cellSize - padding * 2
  );
  
  // Draw border if requested
  if (border) {
    ctx.globalAlpha = 1;
    ctx.strokeStyle = theme.colors.grid;
    ctx.lineWidth = gridLineWidth;
    ctx.strokeRect(pixelX, pixelY, cellSize, cellSize);
  }
  
  // Restore context state
  ctx.restore();
}

/**
 * Renders the game board
 * @param context - The render context
 * @param board - The game board
 */
export function renderBoard(context: RenderContext, board: Board): void {
  for (let y = 0; y < board.length; y++) {
    const row = board[y];
    if (!row) {
      continue;
    }
    
    for (let x = 0; x < row.length; x++) {
      const cell = row[x];
      if (cell) {
        renderCell(context, x, y, cell.color);
      }
    }
  }
}

/**
 * Renders the active piece
 * @param context - The render context
 * @param piece - The active piece
 */
export function renderPiece(context: RenderContext, piece: ActivePiece): void {
  const [offsetX, offsetY] = piece.position;
  
  // piece.color already contains the actual color from the color scheme
  for (const [x, y] of piece.shape) {
    renderCell(
      context,
      offsetX + x,
      offsetY + y,
      piece.color
    );
  }
}

/**
 * Renders the ghost piece
 * @param context - The render context
 * @param ghost - The ghost piece
 */
export function renderGhost(context: RenderContext, ghost: GhostPiece): void {
  const { theme } = context;
  const [offsetX, offsetY] = ghost.position;
  
  for (const [x, y] of ghost.shape) {
    renderCell(
      context,
      offsetX + x,
      offsetY + y,
      theme.colors.ghost,
      0.3
    );
  }
}

/**
 * Renders the grid lines
 * @param context - The render context
 */
export function renderGrid(context: RenderContext): void {
  const { ctx, config } = context;
  const { width, height } = config.boardDimensions;
  const { cellSize, gridLineWidth } = config.rendering;
  
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = gridLineWidth;
  ctx.globalAlpha = 0.5;
  
  ctx.beginPath();
  
  // Vertical lines
  for (let x = 0; x <= width; x++) {
    const pixelX = x * cellSize;
    ctx.moveTo(pixelX, 0);
    ctx.lineTo(pixelX, height * cellSize);
  }
  
  // Horizontal lines
  for (let y = 0; y <= height; y++) {
    const pixelY = y * cellSize;
    ctx.moveTo(0, pixelY);
    ctx.lineTo(width * cellSize, pixelY);
  }
  
  ctx.stroke();
  ctx.globalAlpha = 1;
}

/**
 * Renders the complete game state
 * @param context - The render context
 * @param board - The game board
 * @param currentPiece - The active piece (if any)
 * @param ghostPiece - The ghost piece (if any)
 */
export function renderGame(
  context: RenderContext,
  board: Board,
  currentPiece: ActivePiece | null,
  ghostPiece: GhostPiece | null
): void {
  // Clear canvas
  clearCanvas(context);
  
  // Draw board background
  const { ctx, config, theme } = context;
  const { width, height } = config.boardDimensions;
  const { cellSize } = config.rendering;
  
  ctx.fillStyle = theme.colors.board;
  ctx.fillRect(0, 0, width * cellSize, height * cellSize);
  
  // Render board
  renderBoard(context, board);
  
  // Render ghost piece if enabled and available
  if (context.config.features.ghostPieceEnabled && ghostPiece) {
    renderGhost(context, ghostPiece);
  }
  
  // Render current piece
  if (currentPiece) {
    renderPiece(context, currentPiece);
  }
  
  // Render grid overlay
  renderGrid(context);
}