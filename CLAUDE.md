# Claude Development Guide for Polyomino

This guide contains essential information for continuing development on the Polyomino game project.

## Quick Start Commands

### Development
```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Quality Assurance
```bash
# Run all quality checks (recommended before commits)
npm run lint && npm run typecheck && npm test -- --run

# Individual checks
npm run lint          # ESLint
npm run typecheck     # TypeScript type checking
npm test -- --run     # Run all tests once
npm test             # Run tests in watch mode
```

### Code Formatting
```bash
npm run format        # Format all files
npm run format:check  # Check formatting without changes
```

### Testing Specific Files
```bash
# Test a specific file
npm test src/game/__tests__/board.test.ts -- --run

# Test with coverage
npm run coverage
```

## Project Structure Overview

```
src/
├── game/               # Core game logic
│   ├── gameManager.ts  # Main game state management
│   ├── board.ts        # Board operations
│   ├── piece.ts        # Piece manipulation
│   ├── collision.ts    # Collision detection
│   ├── scoring.ts      # Score calculation (line clears only)
│   ├── weightedBag.ts  # Weighted piece selection system
│   └── types.ts        # TypeScript type definitions
├── polyomino/          # Polyomino shape management
│   ├── hardcodedShapes.ts  # Hardcoded shapes for sizes 3-7
│   ├── generator.ts    # Dynamic shape generation (legacy)
│   └── shapes.ts       # Shape utilities
├── audio/              # Sound and music system
│   ├── soundManager.ts # Main audio controller
│   ├── musicPlayer.ts  # Music playback with tempo adjustment
│   ├── songs.ts        # Classical music definitions
│   └── improvedSoundEffects.ts # Enhanced sound effects
├── ui/                 # React UI components
│   ├── GameCanvas.tsx  # Main game rendering
│   ├── SettingsScreen.tsx # Settings interface
│   ├── HighScoresScreen.tsx # High score display
│   └── [other components]
├── effects/            # Visual effects
│   └── visualEffects.ts # Particle and animation effects
└── App.tsx            # Main React application

Tests are co-located with source files in __tests__ directories.
```

## Key Development Patterns

### 1. State Management
- Game state is centralized in `GameManager`
- State updates are performed through action functions
- React components receive state through props
- No global state or Redux - simple prop drilling is sufficient

### 2. Audio System
- Background music volume: 0.011x (very subtle)
- Sound effects: Various multipliers (0.333x - 0.667x)
- Music tempo increases with level (2% per level, max 1.5x)
- 5 classical tracks with automatic tempo adjustment

### 3. Piece Selection System
- Uses weighted bag system for fair randomness
- Tracks history to prevent repetition
- Different weights for different polyomino sizes
- Hardcoded shapes for sizes 3-7 (no dynamic generation)

### 4. Scoring System
- Points ONLY awarded for line clears (not drops)
- Score = base_score × level
- Line clear base scores: 1=100, 2=300, 3=500, 4=800

### 5. React Integration
- Canvas rendering for game board (performance)
- React for all UI elements (menus, scores, settings)
- Custom hooks for game state management
- TypeScript strict mode throughout

## Common Issues & Solutions

### Audio Not Playing Initially
- Music is set to ON by default but requires user interaction
- First click (game start, music toggle) initializes audio context
- This is a browser security feature, not a bug

### Piece Preview Mismatch
- Fixed by implementing piece queue system
- Pieces are pre-selected and stored in queue
- Next piece display shows actual upcoming pieces

### Build/Deploy Issues
- Base path must be set to '/polyomino/' in vite.config.ts
- GitHub Actions workflow handles automatic deployment
- Manual deploy: `npm run build && npm run deploy`

### Test Failures
- Always run `npm test -- --run` for CI/CD
- Mock all external dependencies properly
- Use `.toEqual()` for objects, `.toBe()` for primitives
- Check for TypeScript strict null checks

## Current Feature Set

### Implemented
- ✅ Polyomino sizes 3-7 (8-9 removed)
- ✅ Weighted piece selection with history
- ✅ Multiple color themes (6 themes)
- ✅ Classical music playlist (5 tracks)
- ✅ High score system per size
- ✅ Visual effects (particles, animations)
- ✅ Hold piece functionality
- ✅ Ghost piece display
- ✅ Pause/resume
- ✅ Lock delay system (300ms)
- ✅ DAS (Delayed Auto Shift)
- ✅ Sound effects with volume control
- ✅ Settings persistence
- ✅ GitHub Pages deployment

### Not Implemented Yet
- ❌ Touch/mobile controls
- ❌ Multiplayer
- ❌ Replay system
- ❌ Custom piece sets
- ❌ Statistics tracking
- ❌ Achievements
- ❌ Tutorial mode

## Code Quality Standards

### TypeScript
- Strict mode always enabled
- No `any` types (use `unknown` if needed)
- Explicit return types for functions
- Interfaces over type aliases for objects
- Readonly arrays where possible

### Testing
- Minimum 80% coverage for new code
- Test file naming: `*.test.ts` or `*.test.tsx`
- Mock external dependencies
- Test both happy path and edge cases
- Integration tests for complex flows

### React Components
- Functional components only (no classes)
- Props interfaces defined above component
- Memoization where beneficial
- Custom hooks for logic extraction
- Consistent naming: PascalCase for components

### Git Workflow
- Meaningful commit messages
- Include emoji in auto-generated commits: 🤖
- Test before committing
- Push to main branch (no PRs needed for solo development)

## Performance Considerations

### Rendering
- Canvas for game board (60 FPS target)
- React.memo for UI components
- Throttled state updates during gameplay
- Efficient particle system with object pooling

### Audio
- Web Audio API for low latency
- Pre-generated waveforms
- Efficient gain node management
- Proper cleanup on component unmount

### State Updates
- Immutable updates (spread operator)
- Batch related changes
- Avoid unnecessary re-renders
- Efficient collision detection

## Extension Points

### Adding New Polyomino Sizes
1. Update types in `game/types.ts`
2. Add shapes to `polyomino/hardcodedShapes.ts`
3. Update UI selectors
4. Add board size configuration
5. Test thoroughly

### Adding New Themes
1. Define color scheme in `rendering/colorSchemes.ts`
2. Add to ColorSchemeName type
3. Update settings UI
4. Test all game states

### Adding New Music
1. Create note sequences in `audio/songs.ts`
2. Add to track list in `audio/musicTracks.ts`
3. Test tempo scaling
4. Verify volume balance

### Adding New Game Modes
1. Extend GameConfig interface
2. Add mode logic to gameManager
3. Create UI for mode selection
4. Update scoring system if needed

## Debugging Tips

### Console Commands
```javascript
// In browser console during development
window.gameState // Current game state (if exposed)
window.debugMode = true // Enable debug logging
```

### Performance Profiling
- Use Chrome DevTools Performance tab
- Look for long tasks during gameplay
- Check for memory leaks in heap snapshots
- Monitor FPS with built-in meter

### Common Breakpoints
- `gameManager.ts`: processAction() - All game actions
- `board.ts`: checkCollision() - Collision issues  
- `weightedBag.ts`: getNextWeightedPiece() - Piece selection
- `musicPlayer.ts`: play() - Audio issues

## Deployment

### GitHub Pages (Automatic)
- Push to main branch triggers deployment
- GitHub Actions workflow handles build
- Available at: https://gtnao.github.io/polyomino/

### Manual Deployment
```bash
npm run build        # Build production bundle
npm run preview      # Test locally
npm run deploy       # Deploy to GitHub Pages
```

### Environment Variables
- No secrets needed for client-side app
- All configuration in code
- Settings stored in localStorage

## Final Notes

- Always run quality checks before commits
- Keep commits atomic and meaningful  
- Update this guide when adding major features
- Prioritize code readability over cleverness
- Have fun! 🎮