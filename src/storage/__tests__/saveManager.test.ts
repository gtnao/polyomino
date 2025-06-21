import { describe, it, expect, beforeEach } from 'vitest';
import { SaveManager } from '../saveManager';
import { MemoryStorageAdapter } from '../storageAdapter';
import type { SaveData, HighScore, LifetimeStats, GameConfig, KeyBinding } from '../../game/types';

describe('SaveManager', () => {
  let saveManager: SaveManager;
  let storageAdapter: MemoryStorageAdapter;

  beforeEach(() => {
    storageAdapter = new MemoryStorageAdapter();
    saveManager = new SaveManager(storageAdapter);
  });

  describe('save and load', () => {
    it('should save and load complete save data', async () => {
      const saveData: SaveData = {
        config: {
          polyominoSize: 5,
          audio: {
            soundEnabled: false,
            musicEnabled: true,
            effectVolume: 0.7,
            musicVolume: 0.3,
          },
          theme: {
            colorScheme: 'dracula',
            particleEffects: false,
          },
        },
        highScores: {
          5: [
            {
              score: 10000,
              level: 5,
              lines: 50,
              time: 300,
              date: '2024-01-01',
              polyominoSize: 5,
            },
          ],
        },
        statistics: {
          totalGames: 10,
          totalScore: 50000,
          totalLines: 200,
          totalTime: 3600,
          favoriteSize: 5,
          achievements: [],
        },
        keyBindings: [
          {
            action: 'moveLeft',
            keys: ['ArrowLeft', 'KeyA'],
          },
        ],
      };

      await saveManager.save(saveData);
      const loaded = await saveManager.load();

      expect(loaded).toEqual(saveData);
    });

    it('should return default data if no save exists', async () => {
      const loaded = await saveManager.load();

      expect(loaded.config).toEqual({});
      expect(loaded.highScores).toEqual({});
      expect(loaded.statistics.totalGames).toBe(0);
      expect(loaded.keyBindings).toEqual([]);
    });

    it('should merge with default data for missing fields', async () => {
      await storageAdapter.setItem('polyomino_save', {
        config: { polyominoSize: 6 },
        highScores: {},
        // Missing statistics and keyBindings
      });

      const loaded = await saveManager.load();

      expect(loaded.config.polyominoSize).toBe(6);
      expect(loaded.statistics.totalGames).toBe(0);
      expect(loaded.keyBindings).toEqual([]);
    });
  });

  describe('config management', () => {
    it('should save and load config', async () => {
      const config: Partial<GameConfig> = {
        polyominoSize: 7,
        features: {
          ghostPieceEnabled: false,
          holdEnabled: true,
          nextPieceCount: 5,
        },
      };

      await saveManager.saveConfig(config);
      const loaded = await saveManager.loadConfig();

      expect(loaded).toEqual(config);
    });

    it('should update existing config', async () => {
      await saveManager.saveConfig({
        polyominoSize: 5,
        audio: { soundEnabled: true, musicEnabled: true, effectVolume: 0.5, musicVolume: 0.5 },
      });

      await saveManager.saveConfig({
        audio: { soundEnabled: false, musicEnabled: true, effectVolume: 0.5, musicVolume: 0.5 },
      });

      const loaded = await saveManager.loadConfig();
      expect(loaded.polyominoSize).toBe(5);
      expect(loaded.audio?.soundEnabled).toBe(false);
    });
  });

  describe('high scores', () => {
    it('should save and load high scores', async () => {
      const scores: HighScore[] = [
        {
          score: 15000,
          level: 8,
          lines: 80,
          time: 600,
          date: '2024-01-02',
          polyominoSize: 5,
        },
        {
          score: 12000,
          level: 6,
          lines: 60,
          time: 450,
          date: '2024-01-01',
          polyominoSize: 5,
        },
      ];

      await saveManager.saveHighScores(5, scores);
      const loaded = await saveManager.loadHighScores(5);

      expect(loaded).toEqual(scores);
    });

    it('should return empty array for no high scores', async () => {
      const loaded = await saveManager.loadHighScores(4);
      expect(loaded).toEqual([]);
    });

    it('should add new high score', async () => {
      const existingScore: HighScore = {
        score: 5000,
        level: 3,
        lines: 30,
        time: 200,
        date: '2024-01-01',
        polyominoSize: 5,
      };

      await saveManager.saveHighScores(5, [existingScore]);

      const newScore: HighScore = {
        score: 8000,
        level: 4,
        lines: 40,
        time: 250,
        date: '2024-01-02',
        polyominoSize: 5,
      };

      await saveManager.addHighScore(newScore);
      const loaded = await saveManager.loadHighScores(5);

      expect(loaded).toHaveLength(2);
      expect(loaded[0]).toEqual(newScore); // Should be sorted by score
      expect(loaded[1]).toEqual(existingScore);
    });

    it('should limit high scores to top 10', async () => {
      const scores: HighScore[] = [];
      for (let i = 0; i < 15; i++) {
        scores.push({
          score: (15 - i) * 1000,
          level: i,
          lines: i * 10,
          time: i * 100,
          date: '2024-01-01',
          polyominoSize: 5,
        });
      }

      await saveManager.saveHighScores(5, scores);
      const loaded = await saveManager.loadHighScores(5);

      expect(loaded).toHaveLength(10);
      expect(loaded[0]?.score).toBe(15000);
      expect(loaded[9]?.score).toBe(6000);
    });

    it('should check if score is high score', async () => {
      const scores: HighScore[] = [];
      for (let i = 1; i <= 10; i++) {
        scores.push({
          score: i * 1000,
          level: i,
          lines: i * 10,
          time: i * 100,
          date: '2024-01-01',
          polyominoSize: 5,
        });
      }

      await saveManager.saveHighScores(5, scores);

      expect(await saveManager.isHighScore(11000, 5)).toBe(true);
      expect(await saveManager.isHighScore(1500, 5)).toBe(true); // Higher than lowest (1000)
      expect(await saveManager.isHighScore(500, 5)).toBe(false);
    });

    it('should always be high score if less than 10 scores', async () => {
      const scores: HighScore[] = [
        {
          score: 10000,
          level: 5,
          lines: 50,
          time: 300,
          date: '2024-01-01',
          polyominoSize: 5,
        },
      ];

      await saveManager.saveHighScores(5, scores);

      expect(await saveManager.isHighScore(100, 5)).toBe(true);
    });
  });

  describe('statistics', () => {
    it('should save and load statistics', async () => {
      const stats: LifetimeStats = {
        totalGames: 50,
        totalScore: 250000,
        totalLines: 1000,
        totalTime: 18000,
        favoriteSize: 5,
        achievements: [
          {
            id: 'first_clear',
            name: 'First Clear',
            description: 'Clear your first line',
            unlockedAt: '2024-01-01',
          },
        ],
      };

      await saveManager.saveStatistics(stats);
      const loaded = await saveManager.loadStatistics();

      expect(loaded).toEqual(stats);
    });

    it('should update statistics', async () => {
      const initialStats: LifetimeStats = {
        totalGames: 10,
        totalScore: 50000,
        totalLines: 200,
        totalTime: 3600,
        favoriteSize: 5,
        achievements: [],
      };

      await saveManager.saveStatistics(initialStats);

      await saveManager.updateStatistics({
        gamesPlayed: 2,
        scoreEarned: 10000,
        linesCleared: 50,
        timePlayed: 600,
      });

      const loaded = await saveManager.loadStatistics();

      expect(loaded.totalGames).toBe(12);
      expect(loaded.totalScore).toBe(60000);
      expect(loaded.totalLines).toBe(250);
      expect(loaded.totalTime).toBe(4200);
    });

    it('should unlock achievement', async () => {
      await saveManager.unlockAchievement({
        id: 'speed_demon',
        name: 'Speed Demon',
        description: 'Reach level 10',
        unlockedAt: null,
      });

      const stats = await saveManager.loadStatistics();
      const achievement = stats.achievements.find(a => a.id === 'speed_demon');

      expect(achievement).toBeDefined();
      expect(achievement?.unlockedAt).not.toBeNull();
    });

    it('should not duplicate achievements', async () => {
      const achievement = {
        id: 'master',
        name: 'Master',
        description: 'Score 100,000 points',
        unlockedAt: null,
      };

      await saveManager.unlockAchievement(achievement);
      await saveManager.unlockAchievement(achievement);

      const stats = await saveManager.loadStatistics();
      const count = stats.achievements.filter(a => a.id === 'master').length;

      expect(count).toBe(1);
    });
  });

  describe('key bindings', () => {
    it('should save and load key bindings', async () => {
      const bindings: KeyBinding[] = [
        { action: 'moveLeft', keys: ['ArrowLeft', 'KeyA'] },
        { action: 'moveRight', keys: ['ArrowRight', 'KeyD'] },
        { action: 'softDrop', keys: ['ArrowDown', 'KeyS'] },
      ];

      await saveManager.saveKeyBindings(bindings);
      const loaded = await saveManager.loadKeyBindings();

      expect(loaded).toEqual(bindings);
    });

    it('should update key binding', async () => {
      const bindings: KeyBinding[] = [
        { action: 'moveLeft', keys: ['ArrowLeft', 'KeyA'] },
        { action: 'moveRight', keys: ['ArrowRight', 'KeyD'] },
      ];

      await saveManager.saveKeyBindings(bindings);

      await saveManager.updateKeyBinding('moveLeft', ['KeyQ', 'Numpad4']);

      const loaded = await saveManager.loadKeyBindings();
      const moveLeft = loaded.find(b => b.action === 'moveLeft');

      expect(moveLeft?.keys).toEqual(['KeyQ', 'Numpad4']);
    });

    it('should add new binding if action not exists', async () => {
      await saveManager.updateKeyBinding('pause', ['KeyP', 'Escape']);

      const loaded = await saveManager.loadKeyBindings();
      const pause = loaded.find(b => b.action === 'pause');

      expect(pause).toBeDefined();
      expect(pause?.keys).toEqual(['KeyP', 'Escape']);
    });
  });

  describe('clear data', () => {
    it('should clear all data', async () => {
      const saveData: SaveData = {
        config: { polyominoSize: 5 },
        highScores: {
          5: [{
            score: 10000,
            level: 5,
            lines: 50,
            time: 300,
            date: '2024-01-01',
            polyominoSize: 5,
          }],
        },
        statistics: {
          totalGames: 10,
          totalScore: 50000,
          totalLines: 200,
          totalTime: 3600,
          favoriteSize: 5,
          achievements: [],
        },
        keyBindings: [
          { action: 'moveLeft', keys: ['ArrowLeft'] },
        ],
      };

      await saveManager.save(saveData);
      await saveManager.clearAllData();

      const loaded = await saveManager.load();

      expect(loaded.config).toEqual({});
      expect(loaded.highScores).toEqual({});
      expect(loaded.statistics.totalGames).toBe(0);
      expect(loaded.keyBindings).toEqual([]);
    });
  });

  describe('export and import', () => {
    it('should export data as JSON string', async () => {
      const saveData: SaveData = {
        config: { polyominoSize: 6 },
        highScores: {},
        statistics: {
          totalGames: 5,
          totalScore: 25000,
          totalLines: 100,
          totalTime: 1800,
          favoriteSize: 6,
          achievements: [],
        },
        keyBindings: [],
      };

      await saveManager.save(saveData);
      const exported = await saveManager.exportData();

      expect(exported).toContain('"polyominoSize": 6');
      expect(exported).toContain('"totalGames": 5');
    });

    it('should import data from JSON string', async () => {
      const saveData: SaveData = {
        config: { polyominoSize: 7 },
        highScores: {},
        statistics: {
          totalGames: 20,
          totalScore: 100000,
          totalLines: 400,
          totalTime: 7200,
          favoriteSize: 7,
          achievements: [],
        },
        keyBindings: [],
      };

      const jsonString = JSON.stringify(saveData);
      await saveManager.importData(jsonString);

      const loaded = await saveManager.load();
      expect(loaded.config.polyominoSize).toBe(7);
      expect(loaded.statistics.totalGames).toBe(20);
    });

    it('should handle invalid import data', async () => {
      await expect(saveManager.importData('invalid json')).rejects.toThrow();
      await expect(saveManager.importData('{}')).rejects.toThrow();
    });
  });
});