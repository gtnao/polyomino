import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  GameManager,
  createGameManager,
  GameManagerConfig,
} from '../gameManager';

// Mock all dependencies to prevent actual game logic execution
vi.mock('../bag', () => ({
  createBag: vi.fn(() => ({ pieces: ['piece_0', 'piece_1'] })),
  getNextPiece: vi.fn(() => ({ piece: 'piece_0', bag: { pieces: ['piece_1'] } })),
}));

vi.mock('../board', () => ({
  createEmptyBoard: vi.fn(() => []),
  placePiece: vi.fn(() => []),
  getFilledLines: vi.fn(() => []),
  clearLines: vi.fn(() => ({ board: [], clearedLines: [] })),
}));

vi.mock('../collision', () => ({
  checkCollision: vi.fn(() => false),
}));

vi.mock('../scoring', () => ({
  calculateScore: vi.fn(() => 0),
  calculateLevel: vi.fn(() => 1),
  getDropInterval: vi.fn(() => 1000),
  updateStats: vi.fn((stats, updates) => ({ ...stats, ...updates })),
}));

vi.mock('../lockDelay', () => ({
  initLockDelay: vi.fn(() => ({ isActive: false, timer: 0, resetCount: 0, lastResetTime: 0 })),
  updateLockDelay: vi.fn((state) => state),
  shouldLockPiece: vi.fn(() => false),
  resetLockDelay: vi.fn((state) => state),
}));

vi.mock('../../polyomino/generator', () => ({
  generatePolyominoes: vi.fn(() => [
    [[0, 0], [1, 0]] // Simple shape
  ]),
  normalizePolyomino: vi.fn((shape) => shape),
  getAllRotations: vi.fn((shape) => [shape]),
  getBoundingBox: vi.fn(() => ({ minX: 0, minY: 0, maxX: 1, maxY: 0 })),
}));

vi.mock('../../polyomino/shapes', () => ({
  getPieceDefinitions: vi.fn(() => [
    {
      id: 'test1',
      shape: [[0, 0], [1, 0]],
      rotations: [[[0, 0], [1, 0]]],
      color: '#ff0000',
      boundingBox: { minX: 0, minY: 0, maxX: 1, maxY: 0 },
    },
    {
      id: 'test2',
      shape: [[0, 0], [0, 1]],
      rotations: [[[0, 0], [0, 1]]],
      color: '#00ff00',
      boundingBox: { minX: 0, minY: 0, maxX: 0, maxY: 1 },
    },
  ]),
}));

vi.mock('../../polyomino/hardcodedShapes', () => ({
  getHardcodedPieces: vi.fn(() => [
    { name: 'test1', shape: [[0, 0], [1, 0]], weight: 1 },
    { name: 'test2', shape: [[0, 0], [0, 1]], weight: 1 },
  ]),
}));

vi.mock('../weightedBag', () => ({
  createWeightedBag: vi.fn(() => ({ pieces: ['test1', 'test2'] })),
  getNextWeightedPiece: vi.fn(() => ({ piece: 'test1', bag: { pieces: ['test2'] } })),
}));

vi.mock('../rotation', () => ({
  rotateShape: vi.fn((shape) => shape),
  getKickOffsets: vi.fn(() => [[0, 0]]),
}));

vi.mock('../piece', () => ({
  createPiece: vi.fn((type, x, y) => ({
    type,
    shape: [[0, 0], [1, 0]],
    rotation: 0,
    color: '#ff0000',
    x,
    y,
  })),
  movePiece: vi.fn((piece, dx, dy) => ({ ...piece, x: piece.x + dx, y: piece.y + dy })),
  rotatePiece: vi.fn((piece) => piece),
  getPieceCells: vi.fn(() => [[0, 0], [1, 0]]),
  isPositionValid: vi.fn(() => true),
}));

describe('GameManager', () => {
  let gameManager: GameManager;
  let mockConfig: GameManagerConfig;

  beforeEach(() => {
    vi.clearAllMocks();
    mockConfig = {
      polyominoSize: 5,
      boardWidth: 10,
      boardHeight: 20,
      startLevel: 1,
      enableAudio: false,
    };

    gameManager = createGameManager(mockConfig);
  });

  describe('createGameManager', () => {
    it('should create a game manager with default config', () => {
      const manager = createGameManager();
      expect(manager).toBeDefined();
      expect(manager.getGameState().status).toBe('ready');
    });

    it('should create a game manager with custom config', () => {
      const manager = createGameManager(mockConfig);
      expect(manager).toBeDefined();
      expect(manager.getGameState().status).toBe('ready');
    });
  });

  describe('game state', () => {
    it('should start with ready status', () => {
      const state = gameManager.getGameState();
      expect(state.status).toBe('ready');
    });

    it('should have proper initial configuration', () => {
      const state = gameManager.getGameState();
      expect(state.config.boardDimensions.width).toBe(10);
      expect(state.config.boardDimensions.height).toBe(20);
    });

    it('should change status when starting game', () => {
      gameManager.startGame();
      const state = gameManager.getGameState();
      expect(state.status).toBe('playing');
    });

    it('should change status when pausing', () => {
      gameManager.startGame();
      gameManager.pauseGame();
      const state = gameManager.getGameState();
      expect(state.status).toBe('paused');
    });

    it('should change status when ending game', () => {
      gameManager.startGame();
      gameManager.endGame();
      const state = gameManager.getGameState();
      expect(state.status).toBe('gameover');
    });
  });

  describe('input processing', () => {
    it('should ignore input when not playing', () => {
      expect(() => {
        gameManager.processInput('moveLeft');
      }).not.toThrow();
      
      const state = gameManager.getGameState();
      expect(state.status).toBe('ready');
    });

    it('should process input when playing', () => {
      gameManager.startGame();
      expect(() => {
        gameManager.processInput('moveLeft');
      }).not.toThrow();
    });
  });

  describe('game updates', () => {
    it('should handle update when not playing', () => {
      expect(() => {
        gameManager.update(16.67);
      }).not.toThrow();
    });

    it('should handle update when playing', () => {
      gameManager.startGame();
      expect(() => {
        gameManager.update(16.67);
      }).not.toThrow();
    });
  });
});