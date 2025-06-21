import type { 
  SaveData, 
  HighScore, 
  LifetimeStats, 
  GameConfig, 
  KeyBinding,
  Achievement,
  GameAction,
} from '../game/types';
import type { StorageAdapter } from './storageAdapter';

const SAVE_KEY = 'polyomino_save';

/**
 * Default save data
 */
const DEFAULT_SAVE_DATA: SaveData = {
  config: {},
  highScores: {},
  statistics: {
    totalGames: 0,
    totalScore: 0,
    totalLines: 0,
    totalTime: 0,
    favoriteSize: 5,
    achievements: [],
  },
  keyBindings: [],
};

/**
 * Save manager for game data persistence
 */
export class SaveManager {
  constructor(private storage: StorageAdapter) {}

  /**
   * Saves complete game data
   * @param data - Save data
   */
  async save(data: SaveData): Promise<void> {
    await this.storage.setItem(SAVE_KEY, data);
  }

  /**
   * Loads complete game data
   * @returns Save data
   */
  async load(): Promise<SaveData> {
    const data = await this.storage.getItem<SaveData>(SAVE_KEY);
    if (!data) {
      return { ...DEFAULT_SAVE_DATA };
    }

    // Merge with defaults to handle missing fields
    return {
      config: data.config || {},
      highScores: data.highScores || {},
      statistics: {
        ...DEFAULT_SAVE_DATA.statistics,
        ...(data.statistics || {}),
      },
      keyBindings: data.keyBindings || [],
    };
  }

  /**
   * Saves game config
   * @param config - Game config
   */
  async saveConfig(config: Partial<GameConfig>): Promise<void> {
    const data = await this.load();
    data.config = { ...data.config, ...config };
    await this.save(data);
  }

  /**
   * Loads game config
   * @returns Game config
   */
  async loadConfig(): Promise<Partial<GameConfig>> {
    const data = await this.load();
    return data.config;
  }

  /**
   * Saves high scores for a specific polyomino size
   * @param size - Polyomino size
   * @param scores - High scores
   */
  async saveHighScores(size: number, scores: HighScore[]): Promise<void> {
    const data = await this.load();
    // Sort by score descending and limit to top 10
    const sorted = [...scores].sort((a, b) => b.score - a.score).slice(0, 10);
    data.highScores[size] = sorted;
    await this.save(data);
  }

  /**
   * Loads high scores for a specific polyomino size
   * @param size - Polyomino size
   * @returns High scores
   */
  async loadHighScores(size: number): Promise<HighScore[]> {
    const data = await this.load();
    return data.highScores[size] || [];
  }

  /**
   * Adds a new high score
   * @param score - High score to add
   */
  async addHighScore(score: HighScore): Promise<void> {
    const scores = await this.loadHighScores(score.polyominoSize);
    scores.push(score);
    await this.saveHighScores(score.polyominoSize, scores);
  }

  /**
   * Checks if a score qualifies as a high score
   * @param score - Score to check
   * @param size - Polyomino size
   * @returns True if high score
   */
  async isHighScore(score: number, size: number): Promise<boolean> {
    const scores = await this.loadHighScores(size);
    if (scores.length < 10) {
      return true;
    }
    // Scores are sorted descending, so check against the lowest (last) score
    const lowestScore = scores[scores.length - 1];
    return score > (lowestScore?.score || 0);
  }

  /**
   * Saves lifetime statistics
   * @param stats - Lifetime statistics
   */
  async saveStatistics(stats: LifetimeStats): Promise<void> {
    const data = await this.load();
    data.statistics = stats;
    await this.save(data);
  }

  /**
   * Loads lifetime statistics
   * @returns Lifetime statistics
   */
  async loadStatistics(): Promise<LifetimeStats> {
    const data = await this.load();
    return data.statistics;
  }

  /**
   * Updates statistics with game results
   * @param update - Statistics update
   */
  async updateStatistics(update: {
    gamesPlayed?: number;
    scoreEarned?: number;
    linesCleared?: number;
    timePlayed?: number;
  }): Promise<void> {
    const stats = await this.loadStatistics();
    
    if (update.gamesPlayed) {
      stats.totalGames += update.gamesPlayed;
    }
    if (update.scoreEarned) {
      stats.totalScore += update.scoreEarned;
    }
    if (update.linesCleared) {
      stats.totalLines += update.linesCleared;
    }
    if (update.timePlayed) {
      stats.totalTime += update.timePlayed;
    }

    await this.saveStatistics(stats);
  }

  /**
   * Unlocks an achievement
   * @param achievement - Achievement to unlock
   */
  async unlockAchievement(achievement: Achievement): Promise<void> {
    const stats = await this.loadStatistics();
    
    // Check if already unlocked
    if (stats.achievements.some(a => a.id === achievement.id)) {
      return;
    }

    // Add with unlock date
    stats.achievements.push({
      ...achievement,
      unlockedAt: new Date().toISOString(),
    });

    await this.saveStatistics(stats);
  }

  /**
   * Saves key bindings
   * @param bindings - Key bindings
   */
  async saveKeyBindings(bindings: KeyBinding[]): Promise<void> {
    const data = await this.load();
    data.keyBindings = bindings;
    await this.save(data);
  }

  /**
   * Loads key bindings
   * @returns Key bindings
   */
  async loadKeyBindings(): Promise<KeyBinding[]> {
    const data = await this.load();
    return data.keyBindings;
  }

  /**
   * Updates a key binding
   * @param action - Game action
   * @param keys - New keys
   */
  async updateKeyBinding(action: GameAction, keys: string[]): Promise<void> {
    const bindings = await this.loadKeyBindings();
    const index = bindings.findIndex(b => b.action === action);

    if (index >= 0) {
      bindings[index] = { action, keys };
    } else {
      bindings.push({ action, keys });
    }

    await this.saveKeyBindings(bindings);
  }

  /**
   * Clears all saved data
   */
  async clearAllData(): Promise<void> {
    await this.save({
      config: {},
      highScores: {},
      statistics: {
        ...DEFAULT_SAVE_DATA.statistics,
      },
      keyBindings: [],
    });
  }

  /**
   * Exports save data as JSON string
   * @returns JSON string
   */
  async exportData(): Promise<string> {
    const data = await this.load();
    return JSON.stringify(data, null, 2);
  }

  /**
   * Imports save data from JSON string
   * @param jsonString - JSON string
   */
  async importData(jsonString: string): Promise<void> {
    try {
      const data = JSON.parse(jsonString) as SaveData;
      
      // Validate required fields
      if (!data.config || !data.highScores || !data.statistics || !data.keyBindings) {
        throw new Error('Invalid save data format');
      }

      await this.save(data);
    } catch (error) {
      throw new Error(`Failed to import data: ${String(error)}`);
    }
  }
}