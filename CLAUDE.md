# Project Commands

## Linting
```bash
npm run lint
```

## Type Checking
```bash
npm run typecheck
```

## Testing
```bash
# Run all tests (without watch mode)
npm test -- --run

# Run specific test file
npm test src/game/__tests__/board.test.ts -- --run

# Run tests in watch mode (default)
npm test
```

## Development
```bash
# Start development server
npm run dev

# Build for production
npm run build
```

## Code Formatting
```bash
# Format all files
npm run format

# Check formatting without changing files
npm run format:check
```

## Quality Check (Run at end of each phase)
```bash
npm run lint && npm run typecheck && npm test -- --run
```

## Project Guidelines

1. **React for UI** - Use React for all UI components (settings, menus, scores) except real-time game rendering (Canvas)
2. **Test Execution** - Always use `npm test -- --run` to avoid watch mode
3. **Quality Checks** - Run lint and typecheck after each phase
4. **Error Analysis** - When tests fail multiple times, analyze the root cause before proceeding
5. **Deployment** - Only prepare GitHub Pages deployment steps, do not actually deploy