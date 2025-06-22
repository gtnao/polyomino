# Polyomino Gameplay Documentation

## Overview

Polyomino is a falling-block puzzle game that extends the classic concept with pieces of various sizes (3-7 blocks). The goal is to clear lines by filling horizontal rows completely while preventing the stack from reaching the top.

## Game Modes

### Polyomino Sizes
- **Triomino (3)**: 3-block pieces - Fastest pace, simplest patterns
- **Tetromino (4)**: 4-block pieces - Classic gameplay
- **Pentomino (5)**: 5-block pieces - More complex, strategic gameplay
- **Hexomino (6)**: 6-block pieces - Very challenging, requires planning
- **Heptomino (7)**: 7-block pieces - Maximum difficulty, expert level

## Core Mechanics

### Movement System
- **Left/Right Movement**: Instant response with DAS (Delayed Auto Shift)
  - Initial delay: 150ms
  - Repeat interval: 50ms
  - Allows for precise positioning and rapid movement

- **Rotation**: 
  - Clockwise (Up/X keys) and Counter-clockwise (Z/Ctrl keys)
  - SRS-like wall kick system with 5 test positions
  - Pieces can kick off walls and other blocks

- **Drop Mechanics**:
  - Soft Drop (Down): Accelerates fall by 20x
  - Hard Drop (Space): Instant placement with ghost piece preview
  - Gravity increases with level progression

### Hold System
- Store one piece for later use (C/Shift keys)
- Cannot hold again until placing the held piece
- Strategic element for managing difficult situations
- Visual indicator shows held piece

### Line Clearing
- Fill complete horizontal rows to clear them
- Multiple simultaneous clears award bonus points:
  - 1 line: 100 × level
  - 2 lines: 300 × level  
  - 3 lines: 500 × level
  - 4+ lines: 800 × level

### Scoring System
```
Base Points:
- Piece placement: 10 points
- Soft drop: 1 point per cell
- Hard drop: 2 points per cell
- Line clears: See above

Score multiplier increases with level
```

### Level Progression
- Start at level 1
- Every 10 lines cleared = level up
- Each level increases:
  - Drop speed (gravity)
  - Music tempo (2% per level, max 50% increase)
  - Scoring multiplier

### Gravity Formula
```
Drop interval (ms) = 1000 × (0.8 - (level-1) × 0.007)^(level-1)
Minimum interval: 50ms (level ~13+)
```

## Piece Generation

### Weighted Bag System
Ensures fair piece distribution while maintaining randomness:

1. **Base Weights**: Each piece type has a weight (0.8-1.5)
   - Simpler shapes: Higher weights
   - Complex shapes: Lower weights
   - I-pieces typically weighted higher

2. **History Tracking**: Recent pieces get reduced weights
   - Weight reduction: 0.7^n (n = occurrences in history)
   - History size: min(10, pieceCount/2)
   - Prevents piece droughts and clustering

3. **Selection Process**:
   - Calculate current weights based on history
   - Select piece using weighted random
   - Add to history, remove oldest if full

## Game States

### Main Menu
- New Game → Select polyomino size
- Continue (if game in progress)
- High Scores
- Settings
- Quit

### In-Game States
- **Playing**: Active gameplay
- **Paused**: Game frozen, menu overlay
- **Game Over**: Stack reached top
- **Line Clear**: Animation playing

### Game Over Conditions
- Any block placed in the invisible top rows (above row 20)
- No valid placement for the current piece

## Visual Features

### Ghost Piece
- Transparent preview showing where piece will land
- Updates in real-time with movement/rotation
- Critical for precise placement

### Next Piece Preview
- Shows upcoming piece
- Allows strategic planning
- Updates immediately after piece placement

### Effects System
- **Line Clear**: Gradient sweep animation
- **Level Up**: Firework particles
- **Piece Lock**: Impact particles
- **Game Over**: Screen fade effect

## Audio System

### Background Music
- 5 classical tracks with varying moods
- Dynamic tempo scaling with level
- Smooth transitions on level changes
- Volume controls in settings

### Sound Effects
- Movement: Subtle click
- Rotation: Mechanical sound
- Placement: Solid thud
- Line clear: Ascending tones (multi-line variants)
- Level up: Triumphant fanfare
- Game over: Descending melody

### Volume Balancing
- Music: Very subtle background (1.1% base volume)
- Effects: 33-66% base volume
- All independently adjustable

## Strategic Elements

### Triomino Strategy
- Fast-paced, reflex-based
- Focus on quick decisions
- Less room for complex setups

### Tetromino Strategy  
- Classic balanced gameplay
- T-spins and advanced techniques
- Well-documented strategies apply

### Pentomino Strategy
- Requires careful planning
- Many pieces don't tessellate easily
- Hold piece becomes crucial
- Focus on creating flat surfaces

### Hexomino/Heptomino Strategy
- Expert-level pattern recognition
- Extensive forward planning required
- Mastery of hold mechanic essential
- Patience and precise placement critical

## Tips for New Players

1. **Start with Tetromino** - Familiar mechanics, balanced difficulty
2. **Use the ghost piece** - Essential for accurate placement
3. **Plan ahead** - Watch the next piece preview
4. **Keep the stack low** - Don't build too high unnecessarily
5. **Practice rotation** - Learn how pieces kick off walls
6. **Use hold strategically** - Save difficult pieces for better moments
7. **Focus on singles** - Clearing one line at a time is often safer

## Advanced Techniques

### Stacking Patterns
- **9-0 Stacking**: Leave rightmost column empty for I-pieces
- **Skimming**: Clear problematic rows while building
- **Platforming**: Create flat surfaces for easier stacking

### Recovery Methods
- **Downstack**: Carefully clear high stacks
- **Burn**: Accept single clears to lower danger
- **Hold Cycling**: Use hold to skip problematic pieces

### Efficiency Tips
- Minimize piece rotations
- Use both rotation directions
- Plan placement during fall
- Maintain board balance