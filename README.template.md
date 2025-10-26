# Chess 2.0 Template

A production-ready chess application template built with SvelteKit 5, TypeScript, and Tailwind CSS v4. Features a powerful AI opponent powered by Stockfish WASM and a beautiful, responsive UI.

## 🎯 Use This Template

This repository serves as a template for building chess applications or games requiring:
- Complex state management with reactive UI
- Integration of WebAssembly engines
- Real-time game analysis
- Multiplayer-ready architecture
- Sound effects and animations
- Responsive, accessible design

## ⚡ Quick Start

```bash
# Clone the template
git clone https://github.com/yourusername/chess-2.0-template.git my-chess-app
cd my-chess-app

# Install dependencies with Bun
bun install

# Start development server
bun run dev

# Build for production
bun run build
```

## 🏗️ Template Structure

```
src/
├── lib/
│   ├── chess/
│   │   └── engine/        # Chess logic wrappers
│   │       ├── game.ts    # Chess.js integration
│   │       └── stockfish.ts # UCI protocol implementation
│   ├── components/
│   │   └── chess/         # Reusable chess components
│   │       ├── Board.svelte
│   │       ├── MoveHistory.svelte
│   │       ├── GameControls.svelte
│   │       └── AnalysisPanel.svelte
│   ├── stores/            # Reactive state management
│   │   ├── game.svelte.ts # Game state with Svelte 5 runes
│   │   ├── analysis.svelte.ts # Engine analysis state
│   │   └── engineConfig.svelte.ts # Engine configuration
│   ├── services/          # Business logic
│   │   └── sounds.svelte.ts # Sound effect management
│   └── types/             # TypeScript definitions
│       ├── chess.ts
│       └── stockfish.ts
├── routes/                # SvelteKit file-based routing
│   ├── +page.svelte      # Landing page
│   └── play/
│       └── +page.svelte  # Main chess game page
└── app.css               # Global styles with Tailwind v4
```

## 🎨 Customization Points

### 1. Styling & Theming

Edit the color palette in components or `app.css`:

```css
/* Dark theme colors - customize these */
--bg-primary: #1e1e1e;
--bg-secondary: #2d2d2d;
--accent-blue: #4a9eff;
--accent-green: #4ade80;
```

Board theme in `Board.svelte`:
```css
/* Lichess blue theme - replace with your preferred colors */
.light-square { background: #dee3e6; }
.dark-square { background: #8ca2ad; }
```

### 2. Chess Rules & Variants

Extend `GameEngine` class in `src/lib/chess/engine/game.ts`:

```typescript
// Add chess variants
export class CustomGameEngine extends GameEngine {
  // Implement Chess960, Three-check, etc.
}
```

### 3. AI Configuration

Modify engine settings in `src/lib/stores/engineConfig.svelte.ts`:

```typescript
export const defaultConfig: EngineConfig = {
  skill: 10,        // 0-20 (Elo ~1000-2800)
  depth: 15,        // Search depth
  threads: 4,       // CPU threads
  hash: 64,        // Hash table size (MB)
  multiPV: 1,      // Number of lines to analyze
  moveTime: 2000   // Time per move (ms)
};
```

### 4. Sound Effects

Replace audio files in `static/sounds/`:
- `move.mp3` - Regular moves
- `capture.mp3` - Captures
- `castle.mp3` - Castling
- `check.mp3` - Check
- `promote.mp3` - Pawn promotion
- `game-end.mp3` - Checkmate/Game over

### 5. Additional Features

Common extensions you can add:

#### Opening Book
```typescript
// src/lib/services/openings.ts
export class OpeningBook {
  getMove(fen: string): string | null {
    // Implement opening database lookup
  }
}
```

#### Online Multiplayer
```typescript
// src/lib/services/multiplayer.ts
import { io } from 'socket.io-client';

export class MultiplayerService {
  // Implement real-time multiplayer
}
```

#### Puzzle Mode
```typescript
// src/lib/stores/puzzles.svelte.ts
export class PuzzleStore {
  loadPuzzle(id: string) { /* ... */ }
  checkSolution(move: Move) { /* ... */ }
}
```

#### Game Database
```typescript
// src/lib/services/database.ts
export class GameDatabase {
  async saveGame(pgn: string) { /* ... */ }
  async loadGame(id: string) { /* ... */ }
}
```

## 🚀 Key Features

### Included Out-of-the-Box

- ✅ **Full Chess Rules**: Complete implementation via chess.js
- ✅ **AI Opponent**: Stockfish 17.1 WASM with adjustable strength
- ✅ **Real-time Analysis**: Live position evaluation with best moves
- ✅ **Responsive Design**: Mobile-first, touch-enabled interface
- ✅ **Sound Effects**: Contextual audio feedback
- ✅ **Move History**: Algebraic notation with navigation
- ✅ **PGN Support**: Import/export games in standard format
- ✅ **Persistent State**: Saves preferences and game state
- ✅ **Keyboard Shortcuts**: Undo, new game, copy PGN
- ✅ **Legal Move Highlighting**: Visual feedback for valid moves
- ✅ **Game Status Display**: Check, checkmate, stalemate indicators

### Architecture Highlights

- **Svelte 5 Runes**: Modern reactivity with `$state`, `$props`, `$derived`
- **TypeScript Strict Mode**: Full type safety
- **Tailwind CSS v4**: Modern utility-first styling
- **WebAssembly Integration**: High-performance chess engine
- **Component-Based**: Modular, reusable components
- **Store Pattern**: Centralized state management
- **Service Layer**: Separated business logic

## 📝 Development Guide

### Working with Non-Reactive Libraries

The template includes a version counter pattern for chess.js integration:

```typescript
let engine = $state(new GameEngine());
let version = $state(0);

export const gameStore = {
  get fen() {
    version; // Trigger reactivity
    return engine.fen();
  },

  makeMove(from: Square, to: Square): boolean {
    const move = engine.move(from, to);
    if (move) {
      version++; // Update version to trigger reactivity
      return true;
    }
    return false;
  }
};
```

### UCI Protocol Communication

The template includes complete UCI implementation for engine communication:

```typescript
// Sending commands
await engine.sendCommand('position fen ' + fen);
await engine.sendCommand('go movetime 2000');

// Handling responses
engine.on('info', (data) => {
  // Process analysis updates
});

engine.on('bestmove', (move) => {
  // Handle best move
});
```

### Adding New Components

Follow the established pattern:

```svelte
<script lang="ts">
  // Use Svelte 5 runes
  let { propName = defaultValue } = $props();
  let internalState = $state(initialValue);
  let computedValue = $derived(calculation);

  $effect(() => {
    // Side effects here
  });
</script>

<div class="component-name">
  <!-- Template here -->
</div>

<style>
  /* Component styles */
</style>
```

## 🧪 Testing

Run the included test suite:

```bash
# Run all tests
bun test:all

# Individual test suites
bun test:eval          # Evaluation logic
bun test:hanging       # Hanging piece detection
bun test:mate          # Checkmate detection
```

## 📦 Building for Production

```bash
# Build the application
bun run build

# Preview production build
bun run preview

# Deploy (adapter-node configured)
node build
```

Environment variables for production:
- `PORT` - Server port (default: 3000)
- `HOST` - Server host (default: 0.0.0.0)
- `ORIGIN` - Origin URL for CSRF protection

## 🤝 Contributing to the Template

1. Fork the repository
2. Create a feature branch
3. Make your improvements
4. Ensure all tests pass
5. Submit a pull request

### Template Improvement Ideas

- [ ] Add more chess variants (960, Three-check, Crazyhouse)
- [ ] Implement ELO rating system
- [ ] Add tournament mode
- [ ] Create puzzle generator
- [ ] Add endgame tablebase support
- [ ] Implement time controls
- [ ] Add game analysis annotations
- [ ] Create coaching/hint system

## 📄 License

MIT License - feel free to use this template for any purpose.

## 🙏 Credits

- **Stockfish Team** - Chess engine
- **Chessground** - Board UI library
- **Chess.js** - Game logic
- **SvelteKit Team** - Framework
- **Tailwind CSS** - Styling

## 🐛 Known Template Issues

- Stockfish WASM requires same-origin hosting (CORS)
- Safari may have issues with Web Workers
- Mobile browsers may limit engine threads

## 📚 Resources

- [SvelteKit 5 Documentation](https://kit.svelte.dev)
- [Chess.js API](https://github.com/jhlywa/chess.js)
- [Chessground Documentation](https://github.com/lichess-org/chessground)
- [UCI Protocol Specification](https://www.chessprogramming.org/UCI)
- [Stockfish Documentation](https://stockfishchess.org)

---

**Built with Chess 2.0 Template v2.0.0**