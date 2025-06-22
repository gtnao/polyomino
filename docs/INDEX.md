# Polyomino Documentation Index

This guide helps you navigate the project documentation based on your needs.

## 📚 Documentation Overview

### For Players
- **[README.md](../README.md)** - Game overview, features, and how to play
- **[GAMEPLAY.md](../GAMEPLAY.md)** - Detailed game mechanics, strategies, and tips

### For Developers
- **[CLAUDE.md](../CLAUDE.md)** - Development guide, commands, and common workflows
- **[ARCHITECTURE.md](../ARCHITECTURE.md)** - Technical architecture, system design, and module details

## 🎯 Quick Navigation

### "I want to..."

#### Play the Game
- Read the controls → [README.md#controls](../README.md#controls)
- Understand scoring → [GAMEPLAY.md#scoring-system](../GAMEPLAY.md#scoring-system)
- Learn strategies → [GAMEPLAY.md#strategic-elements](../GAMEPLAY.md#strategic-elements)

#### Set Up Development
- Install dependencies → [README.md#setup](../README.md#setup)
- Understand commands → [CLAUDE.md#project-commands](../CLAUDE.md#project-commands)
- Configure environment → [CLAUDE.md#development](../CLAUDE.md#development)

#### Add New Features
- Understand architecture → [ARCHITECTURE.md#system-overview](../ARCHITECTURE.md#system-overview)
- Find extension points → [ARCHITECTURE.md#extension-points](../ARCHITECTURE.md#extension-points)
- Follow patterns → [CLAUDE.md#code-patterns](../CLAUDE.md#code-patterns)

#### Fix Bugs
- Common issues → [CLAUDE.md#common-issues](../CLAUDE.md#common-issues)
- Debug workflows → [CLAUDE.md#debugging](../CLAUDE.md#debugging)
- Test strategies → [ARCHITECTURE.md#testing-strategy](../ARCHITECTURE.md#testing-strategy)

#### Modify Game Logic
- Game state management → [ARCHITECTURE.md#game-manager](../ARCHITECTURE.md#game-manager)
- Piece system → [ARCHITECTURE.md#piece-system](../ARCHITECTURE.md#piece-system)
- Collision detection → [ARCHITECTURE.md#collision-detection](../ARCHITECTURE.md#collision-detection)

#### Work with UI
- React components → [ARCHITECTURE.md#react-integration](../ARCHITECTURE.md#react-integration)
- Canvas rendering → [ARCHITECTURE.md#canvas-rendering](../ARCHITECTURE.md#canvas-rendering)
- Adding screens → [CLAUDE.md#ui-guidelines](../CLAUDE.md#ui-guidelines)

#### Customize Audio
- Music system → [ARCHITECTURE.md#music-system](../ARCHITECTURE.md#music-system)
- Sound effects → [ARCHITECTURE.md#sound-manager](../ARCHITECTURE.md#sound-manager)
- Volume balancing → [GAMEPLAY.md#volume-balancing](../GAMEPLAY.md#volume-balancing)

## 📁 Project Structure

```
polyomino/
├── docs/
│   └── INDEX.md (this file)
├── src/
│   ├── game/        → Core game logic
│   ├── ui/          → React components
│   ├── audio/       → Sound and music
│   ├── effects/     → Visual effects
│   └── storage/     → Save system
├── ARCHITECTURE.md  → Technical details
├── CLAUDE.md        → Development guide
├── GAMEPLAY.md      → Game mechanics
└── README.md        → Project overview
```

## 🔍 Key Concepts

### Architecture Principles
1. **Functional Core** - Pure functions for game logic
2. **Immutable State** - All state updates create new objects
3. **Action-Based** - State changes through discrete actions
4. **Clear Separation** - UI, logic, and effects are independent

### Development Workflow
1. **Read CLAUDE.md** first for setup and commands
2. **Check ARCHITECTURE.md** for system understanding
3. **Use quality checks** after changes: `npm run lint && npm run typecheck && npm test -- --run`
4. **Follow existing patterns** in the codebase

### Testing Approach
- Unit tests for pure functions (`__tests__` directories)
- Always run tests without watch mode: `npm test -- --run`
- Mock external dependencies (audio, storage)
- Test edge cases and error conditions

## 💡 Common Tasks

### Adding a New Polyomino Size
1. Add shapes to `src/game/pieces/hardcodedShapes.ts`
2. Update `SUPPORTED_SIZES` in `src/game/config.ts`
3. Test piece generation and collision detection
4. Update UI to show new option

### Creating New Visual Effects
1. Extend `VisualEffectsManager` in `src/effects/visualEffects.ts`
2. Add trigger in appropriate game callback
3. Use particle system for performance
4. Test with different game speeds

### Adding Game Modes
1. Extend `GameConfig` type in `src/game/types.ts`
2. Modify `GameManager` to handle new mode
3. Update UI components for mode selection
4. Ensure scoring and progression make sense

### Improving Performance
1. Check [Performance Considerations](../ARCHITECTURE.md#performance-considerations)
2. Profile with Chrome DevTools
3. Optimize render pipeline first
4. Consider WebGL for complex effects

## 📞 Getting Help

- **Build Errors**: Check [Common Issues](../CLAUDE.md#common-issues)
- **Game Bugs**: Review [Known Issues](../ARCHITECTURE.md#known-issues)
- **Feature Ideas**: See [Future Improvements](../ARCHITECTURE.md#future-improvements)
- **Code Questions**: Read relevant architecture section

## 🚀 Next Steps

1. **New to the project?** Start with README → GAMEPLAY → CLAUDE
2. **Ready to code?** Read CLAUDE → ARCHITECTURE → browse source
3. **Fixing bugs?** Check CLAUDE common issues → run tests → debug
4. **Adding features?** Study ARCHITECTURE → find extension points → follow patterns

Remember: The codebase prioritizes **simplicity**, **performance**, **maintainability**, and **extensibility**. When in doubt, follow existing patterns and keep it simple!