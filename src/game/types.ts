// ============================================
// 基本型
// ============================================

// 座標（イミュータブル）
export type Coordinate = readonly [x: number, y: number];

// ポリオミノ形状（座標の配列）
export type PolyominoShape = readonly Coordinate[];

// ポリオミノ定義（UI用）
export interface Polyomino {
  id: string;
  cells: number[][];
  rotations: number;
  shape?: PolyominoShape; // For game logic
  colorIndex?: number; // Index for color mapping
  color?: string; // Predefined color from piece definitions
}

// ピースタイプ（動的生成のため文字列ID）
export type PieceType = string;

// 回転角度
export type Rotation = 0 | 1 | 2 | 3;

// ゲーム状態
export type GameStatus =
  | 'ready'
  | 'playing'
  | 'paused'
  | 'gameover'
  | 'loading';

// アプリケーション画面タイプ
export type AppScreen =
  | 'main'
  | 'settings'
  | 'highScores';

// ============================================
// ゲーム設定
// ============================================

export interface GameConfig {
  polyominoSize: 3 | 4 | 5 | 6 | 7 | 8 | 9;
  boardDimensions: {
    width: number;
    height: number;
  };
  rendering: {
    cellSize: number;
    gridLineWidth: number;
    animationDuration: number;
  };
  gameplay: {
    initialDropInterval: number;
    softDropMultiplier: number;
    lockDelay: number;
    maxLockResets: number;
    dasDelay: number;
    dasInterval: number;
  };
  features: {
    ghostPieceEnabled: boolean;
    holdEnabled: boolean;
    nextPieceCount: number;
  };
  audio: {
    soundEnabled: boolean;
    musicEnabled: boolean;
    effectVolume: number;
    musicVolume: number;
  };
  theme: {
    colorScheme: ColorSchemeName;
    particleEffects: boolean;
  };
}

// ============================================
// ゲーム状態
// ============================================

export interface GameState {
  // ボード状態
  board: Board;

  // ピース関連
  currentPiece: ActivePiece | null;
  ghostPiece: GhostPiece | null;
  nextPieces: Polyomino[];
  heldPiece: Polyomino | null;

  // ゲーム進行
  status: GameStatus;
  config: GameConfig;
  stats: GameStats;
  lastUpdateTime: number;
}

// ============================================
// ピース関連
// ============================================

export interface ActivePiece {
  type: PieceType;
  shape: PolyominoShape;
  position: Coordinate;
  rotation: Rotation;
  color: string;
}

export interface GhostPiece {
  position: Coordinate;
  shape: PolyominoShape;
}

export interface PieceDefinition {
  id: PieceType;
  shape: PolyominoShape;
  rotations: readonly PolyominoShape[];
  color: string;
  boundingBox: BoundingBox;
  weight?: number; // 出現頻度の重み（オプショナル）
}

export interface BoundingBox {
  width: number;
  height: number;
  offsetX: number;
  offsetY: number;
}

export interface PieceBag {
  pieces: PieceType[];
}

// ============================================
// ロックディレイ
// ============================================

export interface LockDelayState {
  isActive: boolean;
  timer: number;
  resetCount: number;
  lastResetTime: number;
}

// ============================================
// ボード
// ============================================

export type Cell = {
  type: PieceType;
  color: string;
} | null;

export type Board = readonly (readonly Cell[])[];

export interface BoardUpdate {
  board: Board;
  clearedLines: number[];
  score: number;
}

// ============================================
// 入力
// ============================================

export type GameAction = 
  | 'moveLeft'
  | 'moveRight'
  | 'softDrop'
  | 'hardDrop'
  | 'rotateRight'
  | 'rotateLeft'
  | 'hold'
  | 'pause';

export interface InputState {
  pressedKeys: Set<string>;
  dasState: {
    action: 'moveLeft' | 'moveRight' | null;
    timer: number;
    charged: boolean;
  };
  lastActionTime: Record<GameAction, number>;
}

export interface KeyBinding {
  action: GameAction;
  keys: string[];
}

// ============================================
// レンダリング
// ============================================

export interface RenderContext {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  config: GameConfig;
  theme: ColorScheme;
}

export interface ColorScheme {
  name: string;
  colors: {
    background: string;
    board: string;
    grid: string;
    text: string;
    textSecondary: string;
    ghost: string;
    pieces: string[];
    ui: {
      panel: string;
      button: string;
      buttonHover: string;
      border: string;
    };
    effects: {
      lineClear: string[];
      levelUp: string[];
      gameOver: string;
    };
  };
}

export type ColorSchemeName =
  | 'gruvbox'
  | 'monokai'
  | 'dracula'
  | 'nord'
  | 'solarized'
  | 'tokyo-night';

// ============================================
// アニメーション
// ============================================

export interface Animation {
  type: 'lineClear' | 'levelUp' | 'piecePlace' | 'gameOver';
  startTime: number;
  duration: number;
  data: unknown;
}

export interface Particle {
  position: Coordinate;
  velocity: Coordinate;
  lifetime: number;
  color: string;
  size: number;
}

// ============================================
// 音声
// ============================================

export interface SoundEffect {
  name: string;
  frequency: number;
  duration: number;
  type: OscillatorType;
  envelope: {
    attack: number;
    decay: number;
    sustain: number;
    release: number;
  };
  filter?: {
    type: BiquadFilterType;
    frequency: number;
    q: number;
  };
}

// ============================================
// 統計
// ============================================

export interface GameStats {
  score: number;
  level: number;
  lines: number;
  piecesPlaced: number;
  moves: number;
  rotations: number;
  holds: number;
  hardDrops: number;
  softDropDistance: number;
  gameStartTime: number;
  gameEndTime: number | null;
  // Legacy fields for backwards compatibility
  startTime?: number;
  endTime?: number | null;
  pieceCounts?: Record<PieceType, number>;
  lineClearCounts?: Record<number, number>;
  totalMoves?: number;
  totalRotations?: number;
  holdCount?: number;
  hardDropCount?: number;
  apm?: number; // Actions Per Minute
  pps?: number; // Pieces Per Second
}

// ============================================
// ストレージ
// ============================================

// (Input types already defined above, removing duplicates)

export interface SaveData {
  config: Partial<GameConfig>;
  highScores: Record<number, HighScore[]>;
  statistics: LifetimeStats;
  keyBindings: KeyBinding[];
}

export interface HighScore {
  score: number;
  level: number;
  lines: number;
  time: number;
  date: string;
  polyominoSize: number;
}

export interface LifetimeStats {
  totalGames: number;
  totalScore: number;
  totalLines: number;
  totalTime: number;
  favoriteSize: number;
  achievements: Achievement[];
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  unlockedAt: string | null;
}

// ============================================
// エラーハンドリング
// ============================================

export interface GameError {
  code: string;
  message: string;
  context?: unknown;
  recoverable: boolean;
}

export type Result<T, E = GameError> =
  | { ok: true; value: T }
  | { ok: false; error: E };