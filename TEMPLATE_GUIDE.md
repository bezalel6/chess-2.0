# Using Chess 2.0 as a Template

This guide explains how to use Chess 2.0 v2.0.0 as a template for your own chess application or game project.

## 🚀 Quick Start

### Option 1: GitHub Template (Recommended)

1. Click "Use this template" on GitHub
2. Clone your new repository
3. Run the initialization script:
```bash
bun install
bun scripts/init-template.js
```

### Option 2: Manual Clone

```bash
# Clone the repository
git clone https://github.com/original/chess-2.0.git my-chess-app
cd my-chess-app

# Remove original git history
rm -rf .git
git init

# Initialize template
bun install
bun scripts/init-template.js
```

## 📋 Template Features

### Core Components You Get

1. **Complete Chess Implementation**
   - Full rule enforcement via chess.js
   - Legal move validation
   - Game state management
   - PGN/FEN support

2. **AI Opponent System**
   - Stockfish 17.1 WASM engine
   - UCI protocol implementation
   - Configurable difficulty
   - Real-time analysis

3. **Modern UI/UX**
   - Responsive board with Chessground
   - Drag-and-drop + click-to-move
   - Move history with navigation
   - Sound effects system
   - Dark theme

4. **Architecture**
   - SvelteKit 5 with runes
   - TypeScript strict mode
   - Tailwind CSS v4
   - Component-based structure
   - Reactive stores pattern

## 🎨 Customization Guide

### 1. Visual Customization

#### Board Theme
Edit `src/lib/components/chess/Board.svelte`:
```css
/* Replace with your colors */
:global(.cg-wrap) {
  background-image: linear-gradient(to bottom, #yourcolor1, #yourcolor2);
}
```

#### Color Scheme
Update CSS variables in `src/app.css`:
```css
:root {
  --primary: #4a9eff;     /* Your primary color */
  --secondary: #4ade80;   /* Your secondary color */
  --background: #1e1e1e;  /* Your background */
  --surface: #2d2d2d;     /* Your surface color */
}
```

#### Piece Sets
Replace Chessground piece CSS in `app.css`:
```css
/* Use different piece set */
@import "chessground/assets/chessground.cburnett.css";
/* Available: cburnett, merida, alpha, pirouetti, chessnut, chess7, reillycraig, companion, dubrovny, fresca, gioco, governor, horsey, icpieces, kosal, leipzig, letter, libra, maestro, shapes, spatial, staunty, tatiana */
```

### 2. Extending Functionality

#### Add Opening Book
Create `src/lib/services/openings.ts`:
```typescript
export class OpeningBook {
  private book = new Map<string, string[]>();

  constructor() {
    // Load your opening database
    this.book.set('startpos', ['e2e4', 'd2d4', 'g1f3']);
    // Add more positions...
  }

  getMove(fen: string): string | null {
    const moves = this.book.get(fen);
    if (!moves) return null;
    return moves[Math.floor(Math.random() * moves.length)];
  }
}
```

#### Add Time Controls
Create `src/lib/stores/clock.svelte.ts`:
```typescript
class ChessClock {
  private whiteTime = $state(600000); // 10 minutes
  private blackTime = $state(600000);
  private activeColor = $state<'w' | 'b' | null>(null);
  private interval: number | null = null;

  start(color: 'w' | 'b') {
    this.activeColor = color;
    this.interval = setInterval(() => {
      if (color === 'w') {
        this.whiteTime -= 100;
      } else {
        this.blackTime -= 100;
      }
    }, 100);
  }

  stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }
}

export const clock = new ChessClock();
```

#### Add Multiplayer
Create `src/lib/services/multiplayer.ts`:
```typescript
import { io, Socket } from 'socket.io-client';

export class MultiplayerService {
  private socket: Socket;

  connect(serverUrl: string) {
    this.socket = io(serverUrl);

    this.socket.on('move', (move) => {
      // Handle opponent's move
      gameStore.makeMove(move.from, move.to);
    });
  }

  sendMove(from: string, to: string) {
    this.socket.emit('move', { from, to });
  }
}
```

#### Add Chess Variants
Extend `src/lib/chess/engine/game.ts`:
```typescript
export class Chess960Engine extends GameEngine {
  constructor() {
    super();
    this.setupChess960();
  }

  private setupChess960() {
    // Implement Fischer Random Chess rules
    const position = this.generateRandomPosition();
    this.load(position);
  }
}
```

### 3. Engine Configuration

#### Adjust AI Strength
Edit `src/lib/stores/engineConfig.svelte.ts`:
```typescript
// Beginner level
export const beginnerConfig: EngineConfig = {
  skill: 5,      // Lower skill (0-20)
  depth: 5,      // Shallow search
  moveTime: 500  // Quick moves
};

// Advanced level
export const advancedConfig: EngineConfig = {
  skill: 20,      // Maximum skill
  depth: 20,      // Deep search
  moveTime: 5000  // Think longer
};
```

#### Custom Evaluation
Add evaluation adjustments:
```typescript
class CustomAnalysis extends AnalysisStore {
  evaluatePosition(fen: string): number {
    const baseEval = super.evaluatePosition(fen);

    // Add your custom evaluation factors
    const mobilityBonus = this.calculateMobility(fen) * 10;
    const centerControl = this.evaluateCenterControl(fen) * 15;

    return baseEval + mobilityBonus + centerControl;
  }
}
```

### 4. Adding New Routes

Create new pages in `src/routes/`:

#### Puzzles Page
`src/routes/puzzles/+page.svelte`:
```svelte
<script lang="ts">
  import Board from '$lib/components/chess/Board.svelte';
  import { puzzleStore } from '$lib/stores/puzzles.svelte';

  let currentPuzzle = $state(puzzleStore.current);
</script>

<div class="puzzle-container">
  <Board fen={currentPuzzle.fen} />
  <div class="puzzle-info">
    <h2>{currentPuzzle.title}</h2>
    <p>{currentPuzzle.instruction}</p>
  </div>
</div>
```

#### Analysis Page
`src/routes/analyze/+page.svelte`:
```svelte
<script lang="ts">
  import Board from '$lib/components/chess/Board.svelte';
  import AnalysisPanel from '$lib/components/chess/AnalysisPanel.svelte';

  // Load game from URL params or localStorage
  let pgn = $state('');
</script>

<div class="analysis-layout">
  <Board />
  <AnalysisPanel enhanced={true} />
</div>
```

## 🏗️ Architecture Decisions

### Why These Choices?

1. **Svelte 5 Runes**: Latest reactive primitives for better performance
2. **Tailwind v4**: Modern CSS with better tree-shaking
3. **Stockfish WASM**: Client-side AI without server costs
4. **Chessground**: Battle-tested board UI from Lichess
5. **Chess.js**: Reliable move validation and game logic
6. **TypeScript Strict**: Catch errors at compile time

### State Management Pattern

The template uses a store pattern with Svelte 5 runes:

```typescript
// Centralized game state
class GameStore {
  private engine = $state(new GameEngine());
  private version = $state(0); // Version counter for reactivity

  // Getters trigger reactivity via version
  get fen() {
    this.version; // Access triggers reactivity
    return this.engine.fen();
  }

  // Mutations increment version
  makeMove(from: Square, to: Square) {
    const result = this.engine.move(from, to);
    if (result) this.version++;
    return result;
  }
}
```

### Component Communication

```
App
├── GameStore (global state)
├── Board (reads state, emits moves)
├── MoveHistory (reads state, emits navigation)
├── AnalysisPanel (reads state, controls AI)
└── GameControls (emits commands)
```

## 🚢 Deployment

### Static Hosting (Vercel, Netlify)

```bash
# Build for static hosting
bun run build

# Deploy the 'build' directory
```

### Node.js Server

```bash
# Build with node adapter
bun run build

# Run production server
PORT=3000 node build
```

### Docker

```dockerfile
FROM oven/bun:1.3.0

WORKDIR /app
COPY package.json bun.lockb ./
RUN bun install --frozen-lockfile

COPY . .
RUN bun run build

EXPOSE 3000
CMD ["bun", "run", "build/index.js"]
```

## 📦 What to Keep vs Remove

### Keep These Files
- `src/lib/` - All core components and logic
- `static/stockfish-*.js` - Chess engine files
- `static/sounds/` - Sound effects (replace if desired)
- Configuration files (`.gitignore`, `tsconfig.json`, etc.)

### Safe to Remove
- `CHANGELOG.md` - Start your own changelog
- `README.template.md` - After reading
- `.template.config.json` - After initialization
- `scripts/init-template.js` - After running

### Customize These
- `package.json` - Update name, version, author
- `README.md` - Replace with your project details
- `src/routes/+page.svelte` - Your landing page
- `src/app.html` - Update meta tags and title

## 🤝 Contributing Back

If you create useful extensions or improvements:

1. **Opening Books**: Share your opening database
2. **Themes**: Contribute board and piece themes
3. **Variants**: Submit chess variant implementations
4. **Features**: Share multiplayer, puzzles, or analysis tools

Submit PRs to help improve the template for everyone!

## ⚠️ Important Considerations

1. **WASM Browser Support**: Stockfish requires modern browsers with WebAssembly
2. **CORS for Workers**: Engine files must be served from same origin
3. **Mobile Performance**: Limit engine threads on mobile devices
4. **Sound Autoplay**: Some browsers block autoplay - handle gracefully
5. **Large Engine Files**: ~4MB total - consider CDN hosting

## 📚 Learning Resources

- [Svelte 5 Runes](https://svelte.dev/docs/svelte/runes) - New reactivity system
- [SvelteKit Docs](https://kit.svelte.dev) - Framework documentation
- [UCI Protocol](https://www.chessprogramming.org/UCI) - Engine communication
- [Chess.js Guide](https://github.com/jhlywa/chess.js) - Game logic library
- [Chessground API](https://github.com/lichess-org/chessground) - Board component

## 🎮 Example Projects Built with This Template

Share your projects built with Chess 2.0 template:
- (Your project here - submit a PR!)

## 🆘 Getting Help

1. **Template Issues**: Open issue on template repository
2. **Chess Rules**: Consult chess.js documentation
3. **UI/UX**: Check Chessground examples
4. **Engine**: See Stockfish UCI documentation
5. **Framework**: Visit SvelteKit Discord

---

**Happy coding! 🎮 May your chess app be bug-free and your games victorious!**