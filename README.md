# Polyomino Game

A modern web-based puzzle game featuring various polyomino sizes (3-7 pieces). Built with React, TypeScript, and Vite.

## Play Online

[Play Polyomino Game](https://gtnao.github.io/polyomino/)

## Features

- **Multiple Polyomino Sizes**: Play with Triomino (3), Tetromino (4), Pentomino (5), Hexomino (6), or Heptomino (7)
- **Weighted Piece Selection**: Carefully balanced piece frequencies for optimal gameplay
- **Modern UI**: Clean, responsive design with multiple color themes
- **Music & Sound Effects**: 5 classical music tracks with dynamic tempo based on level
- **High Score System**: Track your best scores for each polyomino size
- **Smooth Controls**: Responsive keyboard controls with DAS (Delayed Auto Shift)
- **Visual Effects**: Particle effects, line clear animations, and level-up celebrations

## Controls

- **←/→**: Move piece left/right
- **↓**: Soft drop
- **Space**: Hard drop
- **↑/X**: Rotate clockwise
- **Z/Ctrl**: Rotate counter-clockwise
- **C/Shift**: Hold piece
- **P/Esc**: Pause game

## Local Development

### Prerequisites

- Node.js 20.x or higher
- npm 10.x or higher

### Setup

```bash
# Clone the repository
git clone https://github.com/gtnao/polyomino.git
cd polyomino

# Install dependencies
npm install

# Start development server
npm run dev
```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm test` - Run tests
- `npm run lint` - Run linter
- `npm run typecheck` - Check TypeScript types

## Deployment

The game is automatically deployed to GitHub Pages when pushing to the main branch.

To deploy manually:

```bash
npm run build
npm run deploy
```

## Documentation

- **[Documentation Index](docs/INDEX.md)** - Navigate all documentation
- **[Gameplay Guide](GAMEPLAY.md)** - Detailed mechanics and strategies
- **[Architecture](ARCHITECTURE.md)** - Technical design and structure
- **[Development Guide](CLAUDE.md)** - Setup, commands, and workflows

## Technologies

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Vitest** - Testing framework
- **Canvas API** - Game rendering
- **Web Audio API** - Dynamic music and sound effects

## License

MIT