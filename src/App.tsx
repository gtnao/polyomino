import React, { useState, useEffect, useCallback, useRef } from 'react';
import type { GameState, GameAction, ColorScheme, AppScreen, ColorSchemeName } from './game/types';
import { createGameManager, GameManager } from './game/gameManager';
import { createGameLoop, GameLoop } from './game/gameLoop';
import { getColorScheme } from './rendering/colorSchemes';
import { createStorageAdapter } from './storage/storageAdapter';
import { SaveManager } from './storage/saveManager';
import { generatePolyominoes } from './polyomino/generator';
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
} from './ui';

// Default game configuration
const DEFAULT_GAME_CONFIG = {
  polyominoSize: 5 as const,
  boardWidth: 10,
  boardHeight: 20,
  startLevel: 1,
  enableAudio: true,
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
  const [currentHighScore, setCurrentHighScore] = useState<number>(0);
  
  // Sound manager
  const [soundManager] = useState(() => new SoundManager());
  
  // Visual effects manager
  const [effectsManager] = useState(() => new VisualEffectsManager());

  // Load high score on mount and when polyomino size changes
  useEffect(() => {
    saveManager.loadHighScores(polyominoSize).then(scores => {
      if (scores.length > 0) {
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
      boardWidth: width,
      boardHeight: height,
    };
    
    const manager = createGameManager(gameConfig, {
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
              date: new Date().toISOString().split('T')[0],
              polyominoSize: polyominoSize,
            });
            
            // Update current high score
            if (score > currentHighScore) {
              setCurrentHighScore(score);
            }
          }
          
          // Play game over sound
          void soundManager.playSound('gameOver');
          
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
        soundManager.setEnabled(soundEnabled);
      },
      onResume: () => {
        console.log('Game resumed');
        soundManager.resume();
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
    
    // Generate polyominoes to get available pieces
    // This is a temporary solution - ideally we'd get this from the game manager
    const polyominoShapes = generatePolyominoes(polyominoSize);
    const pieces = polyominoShapes.map((shape, index) => ({
      id: `piece_${index}`,
      cells: shape.map(coord => [coord[0], coord[1]]),
      rotations: 4,
      shape: shape,
      colorIndex: index,
    }));
    setAvailablePieces(pieces);

    return () => {
      loop.stop();
    };
  }, [polyominoSize, saveManager, currentHighScore, soundManager, soundEnabled]);

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
    }
  }, [gameManager, gameLoop]);

  const pauseGame = useCallback(() => {
    if (gameManager && gameLoop) {
      gameManager.pauseGame();
      gameLoop.pause();
    }
  }, [gameManager, gameLoop]);

  const resumeGame = useCallback(() => {
    if (gameManager && gameLoop) {
      gameManager.resumeGame();
      gameLoop.resume();
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
    }
  }, [gameManager, gameLoop]);

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
      if (!gameState || gameState.status !== 'playing') return;

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
        case 'Escape':
        case 'KeyP':
          event.preventDefault();
          if (gameState.status === 'playing') {
            pauseGame();
          } else if (gameState.status === 'paused') {
            resumeGame();
          }
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
    setCurrentScreen('highScores');
  }, []);

  const goToMainMenu = useCallback(() => {
    setCurrentScreen('main');
  }, []);

  // Menu items for different game states
  // Load high scores when showing high scores screen
  useEffect(() => {
    if (currentScreen === 'highScores') {
      saveManager.loadHighScores(polyominoSize).then(scores => {
        setHighScores(scores);
      });
    }
  }, [currentScreen, saveManager]);

  const getMenuItems = () => {
    if (!gameState) return [];

    switch (gameState.status) {
      case 'ready':
        return [
          { id: 'start', label: 'Start Game', action: startGame },
          { id: 'settings', label: 'Settings', action: goToSettings },
          { id: 'scores', label: 'High Scores', action: goToHighScores },
        ];
      case 'paused':
        return [
          { id: 'resume', label: 'Resume', action: resumeGame },
          { id: 'restart', label: 'Restart', action: restartGame },
          { id: 'quit', label: 'Quit to Menu', action: quitGame },
        ];
      case 'gameover':
        return [
          { id: 'restart', label: 'Play Again', action: restartGame },
          { id: 'menu', label: 'Main Menu', action: quitGame },
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
      gameLoop.stop();
      const newManager = createGameManager({
        ...DEFAULT_GAME_CONFIG,
        polyominoSize,
        theme: { colorScheme: scheme },
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
                date: new Date().toISOString().split('T')[0],
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
          soundManager.setEnabled(soundEnabled);
        },
        onResume: () => {
          console.log('Game resumed');
          soundManager.resume();
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
    // TODO: Update game config
  }, []);
  
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
        particleEffects={particleEffects}
        ghostPieceEnabled={ghostPieceEnabled}
        onColorSchemeChange={handleColorSchemeChange}
        onSoundToggle={(enabled: boolean) => {
          setSoundEnabled(enabled);
          soundManager.setEnabled(enabled);
        }}
        onMusicToggle={setMusicEnabled}
        onEffectVolumeChange={(volume: number) => {
          setEffectVolume(volume);
          soundManager.setVolume(volume);
        }}
        onMusicVolumeChange={setMusicVolume}
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
        polyominoSize={polyominoSize}
        onBack={goToMainMenu}
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
          </div>
        }
        rightSidebar={
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <NextPieceDisplay
              nextPieces={gameState.nextPieces}
              colorScheme={colorScheme}
              showTitle
            />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                style={{
                  backgroundColor: colorScheme.colors.ui.button,
                  color: colorScheme.colors.text,
                  border: `2px solid ${colorScheme.colors.ui.border}`,
                  borderRadius: '4px',
                  padding: '10px 20px',
                  fontSize: '16px',
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
                NEW GAME
              </button>
              <button
                style={{
                  backgroundColor: colorScheme.colors.ui.button,
                  color: colorScheme.colors.text,
                  border: `2px solid ${colorScheme.colors.ui.border}`,
                  borderRadius: '4px',
                  padding: '10px 20px',
                  fontSize: '16px',
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
                {gameState.status === 'playing' ? 'PAUSE' : 'RESUME'}
              </button>
            </div>
          </div>
        }
        fullscreen
      >
        <GameCanvas
          board={gameState.board}
          currentPiece={gameState.currentPiece}
          ghostPiece={gameState.ghostPiece}
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
        }}>
          Polyomino
        </h1>
        
        {gameState.status === 'gameover' && (
          <div style={{ 
            marginBottom: '30px',
            color: colorScheme.colors.ui.border,
          }}>
            <h2>Game Over</h2>
            <p>Final Score: {gameState.stats.score.toLocaleString()}</p>
            <p>Level: {gameState.stats.level}</p>
            <p>Lines: {gameState.stats.lines}</p>
          </div>
        )}

        <Menu
          items={getMenuItems()}
          colorScheme={colorScheme}
          title={gameState.status === 'paused' ? 'Paused' : ''}
        />
        
        {gameState.status === 'ready' && (
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
              <option value="4">4 - Tetromino</option>
              <option value="5">5 - Pentomino</option>
              <option value="6">6 - Hexomino</option>
              <option value="7">7 - Heptomino</option>
              <option value="8">8 - Octomino</option>
              <option value="9">9 - Nonomino</option>
            </select>
          </div>
        )}
      </div>
    </GameLayout>
  );
};