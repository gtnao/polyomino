import React, { useState, useEffect, useCallback, useRef } from 'react';
import type { GameState, GameAction, ColorScheme, AppScreen, ColorSchemeName } from './game/types';
import { createGameManager, GameManager, calculatePieceColors } from './game/gameManager';
import { createGameLoop, GameLoop } from './game/gameLoop';
import { getColorScheme } from './rendering/colorSchemes';
import { createStorageAdapter } from './storage/storageAdapter';
import { SaveManager } from './storage/saveManager';
import { getPieceDefinitions } from './polyomino/shapes';
import { SoundManager } from './audio/soundManager';
import { VisualEffectsManager } from './effects/visualEffects';
import {
  GameCanvas,
  NextPieceDisplay,
  HoldDisplay,
  ScoreDisplay,
  GameLayout,
  Menu,
  SettingsScreen,
  HighScoresScreen,
  PieceStats,
  KeyBindingsDisplay,
  Icon,
} from './ui';
import { FaviconIcon } from './ui/FaviconIcon';

// Default game configuration
const DEFAULT_GAME_CONFIG = {
  polyominoSize: 5 as const,
  boardDimensions: {
    width: 10,
    height: 20,
  },
  rendering: {
    cellSize: 30,
    gridLineWidth: 1,
    animationDuration: 300,
  },
  gameplay: {
    initialDropInterval: 1000,
    softDropMultiplier: 0.05,
    lockDelay: 500,
    maxLockResets: 15,
    dasDelay: 167,
    dasInterval: 33,
  },
  features: {
    ghostPieceEnabled: true,
    holdEnabled: true,
    nextPieceCount: 5,
  },
  audio: {
    soundEnabled: true,
    musicEnabled: true,
    effectVolume: 0.7,
    musicVolume: 0.5,
  },
  theme: {
    colorScheme: 'gruvbox' as const,
    particleEffects: true,
  },
};

// DAS (Delayed Auto Shift) configuration
const DAS_DELAY = 167; // milliseconds
const DAS_INTERVAL = 33; // milliseconds

interface DASState {
  action: 'moveLeft' | 'moveRight' | null;
  timer: number;
  intervalId: number | null;
}

export const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [gameManager, setGameManager] = useState<GameManager | null>(null);
  const [gameLoop, setGameLoop] = useState<GameLoop | null>(null);
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('main');
  const [availablePieces, setAvailablePieces] = useState<any[]>([]);
  const [polyominoSize, setPolyominoSize] = useState<4 | 5 | 6 | 7 | 8 | 9>(DEFAULT_GAME_CONFIG.polyominoSize);
  
  // Settings state
  const [colorSchemeName, setColorSchemeName] = useState<ColorSchemeName>('gruvbox');
  const [colorScheme, setColorScheme] = useState<ColorScheme>(() => getColorScheme('gruvbox'));
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [musicEnabled, setMusicEnabled] = useState(true);
  const [effectVolume, setEffectVolume] = useState(0.7);
  const [musicVolume, setMusicVolume] = useState(0.5);
  const [selectedMusicTrack, setSelectedMusicTrack] = useState('random');
  const [particleEffects, setParticleEffects] = useState(true);
  const [ghostPieceEnabled, setGhostPieceEnabled] = useState(true);
  
  // DAS state
  const dasRef = useRef<DASState>({
    action: null,
    timer: 0,
    intervalId: null,
  });
  
  // Save manager for persistent data
  const [saveManager] = useState(() => new SaveManager(createStorageAdapter()));
  const [highScores, setHighScores] = useState<any[]>([]);
  const [highScoresSize, setHighScoresSize] = useState<number>(polyominoSize);
  const [currentHighScore, setCurrentHighScore] = useState<number>(0);
  
  // Sound manager
  const [soundManager] = useState(() => new SoundManager());
  
  // Visual effects manager
  const [effectsManager] = useState(() => new VisualEffectsManager());

  // Load settings on mount
  useEffect(() => {
    saveManager.loadConfig().then(config => {
      if (config.polyominoSize) {
        setPolyominoSize(config.polyominoSize);
      }
      if (config.theme?.colorScheme) {
        setColorSchemeName(config.theme.colorScheme);
        setColorScheme(getColorScheme(config.theme.colorScheme));
      }
      if (config.features?.ghostPieceEnabled !== undefined) {
        setGhostPieceEnabled(config.features.ghostPieceEnabled);
      }
      if (config.audio?.soundEnabled !== undefined) {
        setSoundEnabled(config.audio.soundEnabled);
      }
      if (config.audio?.musicEnabled !== undefined) {
        setMusicEnabled(config.audio.musicEnabled);
        soundManager.setMusicEnabled(config.audio.musicEnabled);
      }
      if (config.audio?.effectVolume !== undefined) {
        setEffectVolume(config.audio.effectVolume);
        soundManager.setVolume(config.audio.effectVolume);
      }
      if (config.audio?.musicVolume !== undefined) {
        setMusicVolume(config.audio.musicVolume);
        soundManager.setMusicVolume(config.audio.musicVolume);
      }
      if (config.theme?.particleEffects !== undefined) {
        setParticleEffects(config.theme.particleEffects);
      }
    });
  }, []); // Only run once on mount

  // Save settings when they change
  useEffect(() => {
    const saveSettings = async () => {
      await saveManager.saveConfig({
        polyominoSize,
        features: {
          ghostPieceEnabled,
          holdEnabled: true,
          nextPieceCount: 5,
        },
        audio: {
          soundEnabled,
          musicEnabled,
          effectVolume,
          musicVolume,
        },
        theme: {
          colorScheme: colorSchemeName,
          particleEffects,
        },
      });
    };
    
    // Don't save on initial mount
    const timeoutId = setTimeout(() => {
      void saveSettings();
    }, 500);
    
    return () => clearTimeout(timeoutId);
  }, [polyominoSize, colorSchemeName, ghostPieceEnabled, soundEnabled, musicEnabled, effectVolume, musicVolume, particleEffects, saveManager]);

  // Play menu music when on main menu
  // Removed menu music from main screen per user request

  // Load high score on mount and when polyomino size changes
  useEffect(() => {
    saveManager.loadHighScores(polyominoSize).then(scores => {
      if (scores.length > 0 && scores[0]) {
        setCurrentHighScore(scores[0].score);
      } else {
        setCurrentHighScore(0);
      }
    });
  }, [saveManager, polyominoSize]);
  
  // Initialize game systems
  useEffect(() => {
    // Get board dimensions based on polyomino size
    const getBoardDimensions = (size: number) => {
      switch (size) {
        case 4: return { width: 10, height: 20 };
        case 5: return { width: 10, height: 20 };
        case 6: return { width: 12, height: 25 };
        case 7: return { width: 14, height: 28 };
        case 8: return { width: 16, height: 30 };
        case 9: return { width: 18, height: 32 };
        default: return { width: 10, height: 20 };
      }
    };
    
    const { width, height } = getBoardDimensions(polyominoSize);
    const gameConfig = {
      ...DEFAULT_GAME_CONFIG,
      polyominoSize,
      boardDimensions: {
        width,
        height,
      },
      features: {
        ...DEFAULT_GAME_CONFIG.features,
        ghostPieceEnabled,
      },
      audio: {
        ...DEFAULT_GAME_CONFIG.audio,
        soundEnabled,
        musicEnabled,
        effectVolume,
        musicVolume,
      },
      theme: {
        colorScheme: colorSchemeName,
        particleEffects,
      },
    };
    
    const manager = createGameManager({
      ...gameConfig,
      boardWidth: width,
      boardHeight: height,
    }, {
      onGameStart: () => console.log('Game started'),
      onGameEnd: async () => {
        console.log('Game ended');
        const currentState = manager.getGameState();
        if (currentState) {
          const score = currentState.stats.score;
          const isHigh = await saveManager.isHighScore(score, polyominoSize);
          
          if (isHigh) {
            await saveManager.addHighScore({
              score,
              level: currentState.stats.level,
              lines: currentState.stats.lines,
              time: Math.floor((Date.now() - currentState.stats.gameStartTime) / 1000),
              date: new Date().toISOString(),
              polyominoSize: polyominoSize,
            });
            
            // Update current high score
            if (score > currentHighScore) {
              setCurrentHighScore(score);
            }
          }
          
          // Play game over sound and music
          void soundManager.playSound('gameOver');
          void soundManager.stopMusic();
          void soundManager.playGameOverMusic();
          
          // Update statistics
          await saveManager.updateStatistics({
            gamesPlayed: 1,
            scoreEarned: score,
            linesCleared: currentState.stats.lines,
            timePlayed: Math.floor((Date.now() - currentState.stats.gameStartTime) / 1000),
          });
        }
      },
      onPause: () => {
        console.log('Game paused');
        soundManager.pause();
      },
      onResume: () => {
        console.log('Game resumed');
        void soundManager.resume();
      },
      onLineClear: (lines) => {
        console.log('Lines cleared:', lines);
        void soundManager.playSound('lineClear');
        const currentState = manager.getGameState();
        if (currentState) {
          effectsManager.addLineClearEffect(
            lines, 
            colorScheme, 
            currentState.config.boardDimensions.width,
            currentState.config.rendering.cellSize
          );
        }
      },
      onLevelUp: (level) => {
        console.log('Level up:', level);
        void soundManager.playSound('levelUp');
        soundManager.updateMusicTempo(level);
        const currentState = manager.getGameState();
        if (currentState) {
          effectsManager.addLevelUpEffect(
            level,
            colorScheme,
            currentState.config.boardDimensions.width,
            currentState.config.boardDimensions.height,
            currentState.config.rendering.cellSize
          );
        }
      },
      onPiecePlace: () => {
        void soundManager.playSound('drop');
      },
      onPieceMove: () => {
        void soundManager.playSound('move');
      },
      onPieceRotate: () => {
        void soundManager.playSound('rotate');
      },
    });

    const loop = createGameLoop({
      onUpdate: (deltaTime) => {
        manager.update(deltaTime);
        setGameState(manager.getGameState());
      },
      onRender: () => {
        // Rendering is handled by React components
      },
      onPause: () => console.log('Loop paused'),
      onResume: () => console.log('Loop resumed'),
      onStop: () => console.log('Loop stopped'),
    });

    setGameManager(manager);
    setGameLoop(loop);
    setGameState(manager.getGameState());
    
    // Get piece definitions to get available pieces
    const pieceDefinitions = getPieceDefinitions(polyominoSize);
    const pieceColors = calculatePieceColors(pieceDefinitions.length, colorScheme.colors.pieces);
    const pieces = pieceDefinitions.map((def, index) => ({
      id: def.id,
      cells: def.shape.map(coord => [coord[0], coord[1]]),
      rotations: def.rotations.length,
      shape: def.shape,
      colorIndex: index,
      color: pieceColors[index], // Use calculated color with variations
    }));
    setAvailablePieces(pieces);

    return () => {
      loop.stop();
    };
  }, [polyominoSize, saveManager, currentHighScore, soundManager, soundEnabled, ghostPieceEnabled, colorSchemeName, particleEffects, musicEnabled, effectVolume, musicVolume, effectsManager, colorScheme]);

  // Handle input
  const handleInput = useCallback((action: GameAction) => {
    if (gameManager) {
      gameManager.processInput(action);
    }
  }, [gameManager]);

  // Handle game actions
  const startGame = useCallback(() => {
    if (gameManager && gameLoop) {
      gameManager.startGame();
      gameLoop.start();
      // Play game music with a small delay to ensure proper initialization
      void soundManager.stopMusic();
      setTimeout(() => {
        void soundManager.playGameMusic(gameState?.stats.level || 1);
      }, 100);
    }
  }, [gameManager, gameLoop, soundManager, gameState]);

  const pauseGame = useCallback(() => {
    if (gameManager && gameLoop) {
      gameManager.pauseGame();
      gameLoop.pause();
      setGameState(gameManager.getGameState());
    }
  }, [gameManager, gameLoop]);

  const resumeGame = useCallback(() => {
    if (gameManager && gameLoop) {
      gameManager.resumeGame();
      gameLoop.resume();
      setGameState(gameManager.getGameState());
    }
  }, [gameManager, gameLoop]);

  const restartGame = useCallback(() => {
    if (gameManager && gameLoop) {
      gameManager.restartGame();
      // Ensure the game loop is running after restart
      if (!gameLoop.isRunning()) {
        gameLoop.start();
      }
    }
  }, [gameManager, gameLoop]);

  const quitGame = useCallback(() => {
    if (gameManager && gameLoop) {
      gameManager.endGame();
      gameLoop.stop();
      // Reset to main screen
      setCurrentScreen('main');
      // Force update the game state to show it's ready
      const newState = gameManager.getGameState();
      if (newState) {
        setGameState({ ...newState, status: 'ready' });
      }
      // Switch back to menu music
      void soundManager.stopMusic();
      void soundManager.playMenuMusic();
    }
  }, [gameManager, gameLoop, soundManager]);

  // DAS handlers
  const startDAS = useCallback((action: 'moveLeft' | 'moveRight') => {
    const das = dasRef.current;
    
    // Clear any existing DAS
    if (das.intervalId) {
      clearInterval(das.intervalId);
    }
    
    // Perform initial movement
    handleInput(action);
    
    // Set up DAS
    das.action = action;
    das.timer = Date.now();
    
    // Start DAS after delay
    das.intervalId = window.setInterval(() => {
      const elapsed = Date.now() - das.timer;
      if (elapsed >= DAS_DELAY && gameState?.status === 'playing') {
        handleInput(action);
      }
    }, DAS_INTERVAL);
  }, [handleInput, gameState]);
  
  const stopDAS = useCallback(() => {
    const das = dasRef.current;
    if (das.intervalId) {
      clearInterval(das.intervalId);
      das.intervalId = null;
    }
    das.action = null;
    das.timer = 0;
  }, []);

  // Keyboard event handling
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!gameState) return;
      
      // Handle pause/resume separately as it should work in both playing and paused states
      if (event.code === 'Escape' || event.code === 'KeyP') {
        event.preventDefault();
        if (gameState.status === 'playing') {
          pauseGame();
        } else if (gameState.status === 'paused') {
          resumeGame();
        }
        return;
      }
      
      // Other keys only work when playing
      if (gameState.status !== 'playing') return;

      switch (event.code) {
        case 'ArrowLeft':
        case 'KeyA':
          event.preventDefault();
          if (dasRef.current.action !== 'moveLeft') {
            startDAS('moveLeft');
          }
          break;
        case 'ArrowRight':
        case 'KeyD':
          event.preventDefault();
          if (dasRef.current.action !== 'moveRight') {
            startDAS('moveRight');
          }
          break;
        case 'ArrowDown':
        case 'KeyS':
          event.preventDefault();
          handleInput('softDrop');
          break;
        case 'ArrowUp':
        case 'KeyW':
          event.preventDefault();
          handleInput('rotateRight');
          break;
        case 'KeyQ':
        case 'KeyZ':
        case 'ControlLeft':
        case 'ControlRight':
          event.preventDefault();
          handleInput('rotateLeft');
          break;
        case 'Space':
          event.preventDefault();
          handleInput('hardDrop');
          break;
        case 'KeyC':
        case 'ShiftLeft':
          event.preventDefault();
          handleInput('hold');
          break;
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      switch (event.code) {
        case 'ArrowLeft':
        case 'KeyA':
          if (dasRef.current.action === 'moveLeft') {
            stopDAS();
          }
          break;
        case 'ArrowRight':
        case 'KeyD':
          if (dasRef.current.action === 'moveRight') {
            stopDAS();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      stopDAS(); // Clean up DAS on unmount
    };
  }, [gameState, handleInput, pauseGame, resumeGame, startDAS, stopDAS]);

  // Navigation functions
  const goToSettings = useCallback(() => {
    setCurrentScreen('settings');
  }, []);

  const goToHighScores = useCallback(() => {
    setHighScoresSize(polyominoSize);
    setCurrentScreen('highScores');
  }, [polyominoSize]);

  const goToMainMenu = useCallback(() => {
    setCurrentScreen('main');
  }, []);

  // Menu items for different game states
  // Load high scores when showing high scores screen or size changes
  useEffect(() => {
    if (currentScreen === 'highScores') {
      saveManager.loadHighScores(highScoresSize).then(scores => {
        setHighScores(scores);
      });
    }
  }, [currentScreen, highScoresSize, saveManager]);

  const getMenuItems = () => {
    if (!gameState) return [];

    switch (gameState.status) {
      case 'ready':
        return [
          { id: 'start', label: 'Start Game', action: startGame, icon: 'play' as const },
          { id: 'settings', label: 'Settings', action: goToSettings, icon: 'settings' as const },
          { id: 'scores', label: 'High Scores', action: goToHighScores, icon: 'trophy' as const },
        ];
      case 'paused':
        return [
          { id: 'resume', label: 'Resume', action: resumeGame, icon: 'play' as const },
          { id: 'restart', label: 'Restart', action: restartGame, icon: 'restart' as const },
          { id: 'quit', label: 'Quit to Menu', action: quitGame, icon: 'home' as const },
        ];
      case 'gameover':
        return [
          { id: 'restart', label: 'Play Again', action: restartGame, icon: 'restart' as const },
          { id: 'menu', label: 'Main Menu', action: quitGame, icon: 'home' as const },
        ];
      default:
        return [];
    }
  };

  // Settings handlers
  const handleColorSchemeChange = useCallback((scheme: ColorSchemeName) => {
    setColorSchemeName(scheme);
    setColorScheme(getColorScheme(scheme));
    // Recreate game manager with new color scheme
    if (gameManager && gameLoop) {
      const currentState = gameManager.getGameState();
      if (currentState && currentState.status === 'playing') {
        // Don't recreate if game is actively playing
        return;
      }
      
      gameLoop.stop();
      
      const { width, height } = currentState ? currentState.config.boardDimensions : { width: 10, height: 20 };
      const newManager = createGameManager({
        polyominoSize,
        boardWidth: width,
        boardHeight: height,
        theme: {
          colorScheme: scheme,
          particleEffects,
        },
        enableAudio: soundEnabled,
      }, {
        onGameStart: () => console.log('Game started'),
        onGameEnd: async () => {
          console.log('Game ended');
          const currentState = newManager.getGameState();
          if (currentState) {
            const score = currentState.stats.score;
            const isHigh = await saveManager.isHighScore(score, polyominoSize);
            
            if (isHigh) {
              await saveManager.addHighScore({
                score,
                level: currentState.stats.level,
                lines: currentState.stats.lines,
                time: Math.floor((Date.now() - currentState.stats.gameStartTime) / 1000),
                date: new Date().toISOString(),
                polyominoSize: polyominoSize,
              });
              
              if (score > currentHighScore) {
                setCurrentHighScore(score);
              }
            }
            
            await saveManager.updateStatistics({
              gamesPlayed: 1,
              scoreEarned: score,
              linesCleared: currentState.stats.lines,
              timePlayed: Math.floor((Date.now() - currentState.stats.gameStartTime) / 1000),
            });
          }
        },
        onPause: () => {
          console.log('Game paused');
          soundManager.pause();
        },
        onResume: () => {
          console.log('Game resumed');
          void soundManager.resume();
        },
        onLineClear: (lines) => {
          console.log('Lines cleared:', lines);
          void soundManager.playSound('lineClear');
          const currentState = newManager.getGameState();
          if (currentState) {
            effectsManager.addLineClearEffect(
              lines, 
              colorScheme, 
              currentState.config.boardDimensions.width,
              currentState.config.rendering.cellSize
            );
          }
        },
        onLevelUp: (level) => {
          console.log('Level up:', level);
          void soundManager.playSound('levelUp');
          soundManager.updateMusicTempo(level);
          const currentState = newManager.getGameState();
          if (currentState) {
            effectsManager.addLevelUpEffect(
              level,
              colorScheme,
              currentState.config.boardDimensions.width,
              currentState.config.boardDimensions.height,
              currentState.config.rendering.cellSize
            );
          }
        },
        onPiecePlace: () => {
          void soundManager.playSound('drop');
        },
        onPieceMove: () => {
          void soundManager.playSound('move');
        },
        onPieceRotate: () => {
          void soundManager.playSound('rotate');
        },
      });
      
      const newLoop = createGameLoop({
        onUpdate: (deltaTime) => {
          newManager.update(deltaTime);
          setGameState(newManager.getGameState());
        },
        onRender: () => {},
        onPause: () => console.log('Loop paused'),
        onResume: () => console.log('Loop resumed'),
        onStop: () => console.log('Loop stopped'),
      });
      
      setGameManager(newManager);
      setGameLoop(newLoop);
      setGameState(newManager.getGameState());
    }
  }, [gameManager, gameLoop, saveManager, currentHighScore, polyominoSize, soundManager, soundEnabled]);
  
  const handleGhostPieceToggle = useCallback((enabled: boolean) => {
    setGhostPieceEnabled(enabled);
    
    // Recreate game manager with new ghost piece setting
    if (gameManager && gameLoop) {
      const currentState = gameManager.getGameState();
      if (currentState && currentState.status === 'playing') {
        // Don't recreate if game is actively playing
        return;
      }
      
      gameLoop.stop();
      
      const { width, height } = currentState ? currentState.config.boardDimensions : { width: 10, height: 20 };
      const newManager = createGameManager({
        polyominoSize,
        boardWidth: width,
        boardHeight: height,
        theme: {
          colorScheme: colorSchemeName,
          particleEffects,
        },
        enableAudio: soundEnabled,
      }, {
        onGameStart: () => console.log('Game started'),
        onGameEnd: async () => {
          console.log('Game ended');
          const currentState = newManager.getGameState();
          if (currentState) {
            const score = currentState.stats.score;
            const isHigh = await saveManager.isHighScore(score, polyominoSize);
            
            if (isHigh) {
              await saveManager.addHighScore({
                score,
                level: currentState.stats.level,
                lines: currentState.stats.lines,
                time: Math.floor((Date.now() - currentState.stats.gameStartTime) / 1000),
                date: new Date().toISOString(),
                polyominoSize: polyominoSize,
              });
              
              if (score > currentHighScore) {
                setCurrentHighScore(score);
              }
            }
            
            await saveManager.updateStatistics({
              gamesPlayed: 1,
              scoreEarned: score,
              linesCleared: currentState.stats.lines,
              timePlayed: Math.floor((Date.now() - currentState.stats.gameStartTime) / 1000),
            });
          }
        },
        onPause: () => {
          console.log('Game paused');
          soundManager.pause();
        },
        onResume: () => {
          console.log('Game resumed');
          void soundManager.resume();
        },
        onLineClear: (lines) => {
          console.log('Lines cleared:', lines);
          void soundManager.playSound('lineClear');
          const currentState = newManager.getGameState();
          if (currentState) {
            effectsManager.addLineClearEffect(
              lines, 
              colorScheme, 
              currentState.config.boardDimensions.width,
              currentState.config.rendering.cellSize
            );
          }
        },
        onLevelUp: (level) => {
          console.log('Level up:', level);
          void soundManager.playSound('levelUp');
          soundManager.updateMusicTempo(level);
          const currentState = newManager.getGameState();
          if (currentState) {
            effectsManager.addLevelUpEffect(
              level,
              colorScheme,
              currentState.config.boardDimensions.width,
              currentState.config.boardDimensions.height,
              currentState.config.rendering.cellSize
            );
          }
        },
        onPiecePlace: () => {
          void soundManager.playSound('drop');
        },
        onPieceMove: () => {
          void soundManager.playSound('move');
        },
        onPieceRotate: () => {
          void soundManager.playSound('rotate');
        },
      });
      
      setGameManager(newManager);
      setGameLoop(createGameLoop({
        onUpdate: (deltaTime: number) => {
          newManager.update(deltaTime);
          setGameState(newManager.getGameState());
        },
        onRender: () => {},
      }));
    }
  }, [gameManager, gameLoop, polyominoSize, colorSchemeName, particleEffects, soundEnabled, musicEnabled, effectVolume, musicVolume, saveManager, currentHighScore, soundManager, effectsManager, colorScheme]);
  
  // Handle different screen states
  if (currentScreen === 'settings') {
    return (
      <SettingsScreen
        colorScheme={colorScheme}
        colorSchemeName={colorSchemeName}
        soundEnabled={soundEnabled}
        musicEnabled={musicEnabled}
        effectVolume={effectVolume}
        musicVolume={musicVolume}
        selectedMusicTrack={selectedMusicTrack}
        particleEffects={particleEffects}
        ghostPieceEnabled={ghostPieceEnabled}
        onColorSchemeChange={handleColorSchemeChange}
        onSoundToggle={(enabled: boolean) => {
          setSoundEnabled(enabled);
          soundManager.setEnabled(enabled);
        }}
        onMusicToggle={async (enabled: boolean) => {
          setMusicEnabled(enabled);
          soundManager.setMusicEnabled(enabled);
          
          // Resume music when enabled (only in game)
          if (enabled && gameState?.status === 'playing') {
            await soundManager.playGameMusic(gameState.stats.level);
          }
        }}
        onEffectVolumeChange={(volume: number) => {
          setEffectVolume(volume);
          soundManager.setVolume(volume);
        }}
        onMusicVolumeChange={(volume: number) => {
          setMusicVolume(volume);
          soundManager.setMusicVolume(volume);
        }}
        onMusicTrackChange={(trackId: string) => {
          setSelectedMusicTrack(trackId);
          soundManager.setSelectedTrack(trackId);
        }}
        onParticleToggle={(enabled: boolean) => {
          setParticleEffects(enabled);
          effectsManager.setEnabled(enabled);
        }}
        onGhostPieceToggle={handleGhostPieceToggle}
        onBack={goToMainMenu}
      />
    );
  }
  
  if (currentScreen === 'highScores') {
    return (
      <HighScoresScreen
        colorScheme={colorScheme}
        highScores={highScores}
        polyominoSize={highScoresSize}
        onBack={goToMainMenu}
        onClear={async () => {
          await saveManager.clearHighScores(highScoresSize);
          setHighScores([]);
          // Reset current high score if clearing current size
          if (highScoresSize === polyominoSize) {
            setCurrentHighScore(0);
          }
        }}
        onSizeChange={(size) => {
          setHighScoresSize(size);
        }}
      />
    );
  }

  if (!gameState) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        backgroundColor: colorScheme.colors.background,
        color: colorScheme.colors.text,
      }}>
        Loading...
      </div>
    );
  }

  // Render game UI based on state
  if (gameState.status === 'playing' || gameState.status === 'paused') {
    return (
      <GameLayout
        colorScheme={colorScheme}
        leftSidebar={
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <HoldDisplay
              heldPiece={gameState.heldPiece}
              colorScheme={colorScheme}
              canHold={gameState.status === 'playing'}
              showTitle
            />
            <ScoreDisplay
              stats={gameState.stats}
              colorScheme={colorScheme}
              highScore={currentHighScore}
              showExtendedStats
            />
            <PieceStats
              pieces={availablePieces}
              pieceCounts={gameState.stats.pieceCounts || {}}
              currentPieceType={gameState.currentPiece?.type || null}
              colorScheme={colorScheme}
              showTitle
            />
            <div style={{
              padding: '10px',
              backgroundColor: colorScheme.colors.ui.panel,
              border: `2px solid ${colorScheme.colors.ui.border}`,
              borderRadius: '8px',
              textAlign: 'center',
            }}>
              <div style={{
                color: colorScheme.colors.text,
                fontSize: '14px',
                fontFamily: 'monospace',
              }}>
                Polyomino Size
              </div>
              <div style={{
                color: colorScheme.colors.text,
                fontSize: '24px',
                fontWeight: 'bold',
                fontFamily: 'monospace',
              }}>
                {polyominoSize}
              </div>
            </div>
          </div>
        }
        rightSidebar={
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <NextPieceDisplay
              nextPieces={gameState.nextPieces}
              colorScheme={colorScheme}
              showTitle
            />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button
                style={{
                  backgroundColor: colorScheme.colors.ui.button,
                  color: colorScheme.colors.text,
                  border: `1px solid ${colorScheme.colors.ui.border}`,
                  borderRadius: '4px',
                  padding: '6px 12px',
                  fontSize: '12px',
                  fontFamily: 'monospace',
                  cursor: 'pointer',
                }}
                onClick={restartGame}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = colorScheme.colors.ui.buttonHover;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = colorScheme.colors.ui.button;
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Icon name="restart" size={14} />
                  <span>NEW GAME</span>
                </div>
              </button>
              <button
                style={{
                  backgroundColor: colorScheme.colors.ui.button,
                  color: colorScheme.colors.text,
                  border: `1px solid ${colorScheme.colors.ui.border}`,
                  borderRadius: '4px',
                  padding: '6px 12px',
                  fontSize: '12px',
                  fontFamily: 'monospace',
                  cursor: 'pointer',
                }}
                onClick={gameState.status === 'playing' ? pauseGame : resumeGame}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = colorScheme.colors.ui.buttonHover;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = colorScheme.colors.ui.button;
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Icon name={gameState.status === 'playing' ? 'pause' : 'play'} size={14} />
                  <span>{gameState.status === 'playing' ? 'PAUSE' : 'RESUME'}</span>
                </div>
              </button>
              <button
                style={{
                  backgroundColor: colorScheme.colors.ui.button,
                  color: colorScheme.colors.text,
                  border: `1px solid ${colorScheme.colors.ui.border}`,
                  borderRadius: '4px',
                  padding: '6px 12px',
                  fontSize: '12px',
                  fontFamily: 'monospace',
                  cursor: 'pointer',
                }}
                onClick={quitGame}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = colorScheme.colors.ui.buttonHover;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = colorScheme.colors.ui.button;
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Icon name="home" size={14} />
                  <span>MAIN MENU</span>
                </div>
              </button>
            </div>
            <KeyBindingsDisplay
              colorScheme={colorScheme}
              showTitle
            />
          </div>
        }
        fullscreen
      >
        <GameCanvas
          board={gameState.board}
          currentPiece={gameState.currentPiece}
          ghostPiece={ghostPieceEnabled ? gameState.ghostPiece : null}
          cellSize={30}
          colorScheme={colorScheme}
          effectsManager={effectsManager}
        />
        {gameState.status === 'paused' && (
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              color: colorScheme.colors.text,
              padding: '20px 40px',
              borderRadius: '8px',
              fontSize: '24px',
              fontFamily: 'monospace',
            }}
          >
            PAUSED
          </div>
        )}
      </GameLayout>
    );
  }

  // Render menu for non-playing states
  return (
    <GameLayout
      colorScheme={colorScheme}
      centerContent
      fullscreen
    >
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ 
          color: colorScheme.colors.text,
          fontSize: '48px',
          marginBottom: '40px',
          fontFamily: 'monospace',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '16px',
        }}>
          <FaviconIcon size={48} />
          Polyomino
        </h1>
        
        {gameState.status === 'gameover' && (
          <div style={{ 
            marginBottom: '30px',
            padding: '20px',
            backgroundColor: `${colorScheme.colors.ui.panel}cc`,
            borderRadius: '8px',
            border: `2px solid ${colorScheme.colors.ui.border}`,
          }}>
            <h2 style={{
              fontSize: '28px',
              color: colorScheme.colors.effects.gameOver,
              marginBottom: '16px',
              fontWeight: 'bold',
            }}>Game Over</h2>
            <p style={{
              fontSize: '24px',
              color: colorScheme.colors.text,
              marginBottom: '12px',
              fontWeight: 'bold',
            }}>Score: {gameState.stats.score.toLocaleString()}</p>
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '20px',
              fontSize: '16px',
              color: colorScheme.colors.textSecondary,
            }}>
              <span>Level: {gameState.stats.level}</span>
              <span>•</span>
              <span>Lines: {gameState.stats.lines}</span>
            </div>
          </div>
        )}

        <Menu
          items={getMenuItems()}
          colorScheme={colorScheme}
          title=""
        />
        
        {gameState?.status === 'ready' && (
          <div style={{ 
            marginTop: '30px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
          }}>
            <label style={{ 
              color: colorScheme.colors.text,
              fontSize: '16px',
            }}>
              Polyomino Size:
            </label>
            <select
              value={polyominoSize}
              onChange={(e) => setPolyominoSize(parseInt(e.target.value) as 4 | 5 | 6 | 7 | 8 | 9)}
              style={{
                backgroundColor: colorScheme.colors.ui.button,
                color: colorScheme.colors.text,
                border: `2px solid ${colorScheme.colors.ui.border}`,
                borderRadius: '4px',
                padding: '5px 10px',
                fontSize: '16px',
                fontFamily: 'monospace',
                cursor: 'pointer',
              }}
            >
              <option value="4">Tetromino (4)</option>
              <option value="5">Pentomino (5)</option>
              <option value="6">Hexomino (6)</option>
              <option value="7">Heptomino (7)</option>
              <option value="8">Octomino (8)</option>
              <option value="9">Nonomino (9)</option>
            </select>
          </div>
        )}
      </div>
    </GameLayout>
  );
};