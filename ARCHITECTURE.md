# Polyomino Architecture Documentation

## System Overview

The Polyomino game is built with a clear separation of concerns between game logic, rendering, UI, and auxiliary systems. The architecture follows a unidirectional data flow pattern without external state management libraries.

```
┌─────────────────────────────────────────────────────────────┐
│                        React App (App.tsx)                    │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │                    Game Manager                          │ │
│  │  ┌─────────────┐  ┌──────────────┐  ┌───────────────┐  │ │
│  │  │ Game State  │  │ Game Logic   │  │ Action Queue  │  │ │
│  │  └─────────────┘  └──────────────┘  └───────────────┘  │ │
│  └─────────────────────────────────────────────────────────┘ │
│                              │                                │
│  ┌───────────────────────────┴───────────────────────────┐   │
│  │                     UI Components                      │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐           │   │
│  │  │  Canvas  │  │  Menus   │  │ Settings │  ...      │   │
│  │  └──────────┘  └──────────┘  └──────────┘           │   │
│  └───────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌───────────────────────────────────────────────────────┐   │
│  │                  Support Systems                       │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐           │   │
│  │  │  Audio   │  │ Storage  │  │ Effects  │           │   │
│  │  └──────────┘  └──────────┘  └──────────┘           │   │
│  └───────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## Core Modules

### 1. Game Manager (`src/game/gameManager.ts`)

The central orchestrator of game logic. Manages all game state and provides a functional interface for state updates.

**Key Responsibilities:**
- Maintains immutable game state
- Processes all game actions
- Coordinates with other systems
- Handles game lifecycle (start, pause, end)

**Key Functions:**
```typescript
createGameManager(config, callbacks) → GameManager
processAction(action: GameAction) → void
getGameState() → GameState
update(deltaTime: number) → void
```

**Design Principles:**
- Immutable state updates
- Action-based state changes
- Callback-driven side effects
- No direct DOM manipulation

### 2. Board System (`src/game/board.ts`)

Pure functional module for board operations.

**Key Functions:**
```typescript
createEmptyBoard(width, height) → Board
placePiece(board, piece, position) → Board
clearLines(board, lines) → Board
getCompletedLines(board) → number[]
```

**Design Decisions:**
- Board is a 2D readonly array
- All operations return new board instances
- No side effects in any function
- Efficient line clearing with minimal allocations

### 3. Piece System (`src/game/piece.ts`)

Handles all piece-related operations.

**Key Functions:**
```typescript
createPiece(type, shape, position) → Piece
rotatePiece(piece, direction, board) → Piece | null
movePiece(piece, dx, dy) → Piece
getGhostPosition(piece, board) → Position
```

**Rotation System:**
- Implements SRS-like wall kicks
- 5-point kick table for flexibility
- Separate tables for clockwise/counter-clockwise

### 4. Weighted Bag System (`src/game/weightedBag.ts`)

Fair randomness with history tracking to prevent clustering.

**Algorithm:**
1. Each piece has a base weight
2. Recent pieces get reduced weights
3. Weight reduction: 0.7^n where n = occurrences in history
4. History size: min(10, pieceCount/2)

**Key Features:**
- Prevents piece droughts
- Maintains gameplay balance
- Configurable weights per piece
- I-pieces typically have higher weights

### 5. Collision Detection (`src/game/collision.ts`)

Efficient collision checking for piece placement.

**Key Functions:**
```typescript
checkCollision(board, piece, position) → boolean
getValidMoves(board, piece) → Position[]
findLandingPosition(board, piece) → Position
```

**Optimizations:**
- Early exit on boundary checks
- Cached board dimensions
- Minimal object allocations

## UI Architecture

### React Integration

The game uses React for UI with Canvas for game rendering:

```
App.tsx
├── GameLayout
│   ├── GameCanvas (Canvas rendering)
│   ├── ScoreDisplay
│   ├── NextPieceDisplay
│   ├── HoldDisplay
│   └── Controls
├── Menu
├── SettingsScreen
└── HighScoresScreen
```

**Key Patterns:**
- Functional components throughout
- Props drilling (no context needed)
- Memoization for performance
- Custom hooks for logic

### Canvas Rendering (`src/ui/GameCanvas.tsx`)

Optimized rendering pipeline:

1. **Clear previous frame**
2. **Draw board background**
3. **Draw placed pieces**
4. **Draw ghost piece**
5. **Draw active piece**
6. **Draw grid lines**
7. **Draw effects**

**Performance Optimizations:**
- Single canvas, no layering
- Batch similar draw calls
- Minimal state checks in render loop
- 60 FPS target with requestAnimationFrame

## Audio System

### Sound Manager (`src/audio/soundManager.ts`)

Centralized audio control with lazy initialization.

**Architecture:**
```
SoundManager
├── MusicPlayer (background music)
│   ├── Track management
│   ├── Tempo adjustment
│   └── Volume control
└── Sound Effects
    ├── Improved effects
    └── Basic oscillator sounds
```

**Key Features:**
- User interaction required for initialization
- Separate volume controls
- Dynamic tempo based on level
- Smooth transitions

### Music System (`src/audio/musicPlayer.ts`)

**Tempo Scaling:**
- Base tempo stored per track
- Speed multiplier: 1 + (level-1) × 0.02
- Maximum speed: 1.5x
- Smooth transitions on level change

**Volume Levels:**
- Master music volume: 0.011x (very subtle)
- Effect volumes: 0.333x - 0.667x
- All volumes user-adjustable

## Storage System

### Save Manager (`src/storage/saveManager.ts`)

Handles all persistent data with fallback to memory storage.

**Data Structure:**
```typescript
{
  config: GameConfig,
  highScores: Record<polyominoSize, HighScore[]>,
  statistics: LifetimeStats,
  settings: UserSettings
}
```

**Features:**
- Automatic localStorage detection
- Graceful fallback to memory
- Data validation on load
- Atomic updates

## Effects System

### Visual Effects Manager (`src/effects/visualEffects.ts`)

Particle system for visual feedback.

**Effect Types:**
- Line clear: Gradient sweep animation
- Level up: Fireworks particles
- Piece placement: Impact particles
- Game over: Screen fade

**Performance:**
- Object pooling for particles
- Maximum particle limits
- Automatic cleanup
- GPU-accelerated transforms

## Data Flow

### Game Loop
```
1. User Input → InputHandler
2. InputHandler → GameManager.processAction()
3. GameManager → Update State
4. State Change → React Re-render
5. React → Canvas Render
6. Side Effects → Audio/Effects/Storage
```

### State Updates
```
Current State + Action = New State

Example:
movePiece(state, 'left') → {
  ...state,
  currentPiece: {
    ...state.currentPiece,
    position: [x-1, y]
  }
}
```

## Performance Considerations

### Rendering Pipeline
1. **Dirty region tracking** (not implemented, but possible)
2. **Efficient redraw** - Only clear what changes
3. **Batch operations** - Group similar draws
4. **RAF scheduling** - Smooth 60 FPS

### Memory Management
1. **Object pooling** for particles
2. **Immutable updates** with structural sharing
3. **Lazy initialization** for heavy systems
4. **Proper cleanup** in useEffect

### Critical Paths
1. **Collision detection** - Most frequent operation
2. **Board rendering** - Every frame
3. **Input processing** - Must be responsive
4. **Line clearing** - Can cause frame drops

## Extension Points

### Adding Features
1. **New game modes**: Extend GameConfig and GameManager
2. **New pieces**: Add to hardcodedShapes.ts
3. **New effects**: Extend VisualEffectsManager
4. **New themes**: Add to colorSchemes.ts

### Module Boundaries
- Game logic modules don't know about React
- UI components don't directly modify game state
- Audio/Effects are triggered via callbacks
- Storage is accessed through SaveManager

### Testing Strategy
- Unit tests for pure functions
- Integration tests for systems
- Mock external dependencies
- Snapshot tests for UI components

## Technical Debt

### Known Issues
1. **No touch controls** - Desktop only currently
2. **No replay system** - State not serializable enough
3. **Limited statistics** - Basic tracking only
4. **No multiplayer** - Single player only

### Future Improvements
1. **WebGL renderer** - Better performance
2. **Service worker** - Offline play
3. **WebAssembly** - Core game logic
4. **Multiplayer** - WebRTC or WebSocket

## Security Considerations

### Client-Side Only
- No server communication
- No user data collection
- localStorage only for settings
- No external dependencies at runtime

### Input Validation
- All user inputs sanitized
- Config values clamped to valid ranges
- No eval() or dynamic code execution
- Content Security Policy friendly

## Conclusion

The architecture prioritizes:
1. **Simplicity** - Easy to understand and modify
2. **Performance** - Smooth gameplay experience
3. **Maintainability** - Clear module boundaries
4. **Extensibility** - Easy to add features

This design has proven effective for the current feature set while leaving room for future enhancements.