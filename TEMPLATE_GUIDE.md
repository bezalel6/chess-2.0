# Chess 2.0 Template Guide

Quick guide to using Chess 2.0 as a template for your chess projects.

## Getting Started

```bash
# 1. Clone and initialize
git clone https://github.com/bezalel6/chess-2.0.git my-chess-app
cd my-chess-app
rm -rf .git && git init

# 2. Install and setup
bun install
bun scripts/init-template.js

# 3. Start developing
bun run dev
```

## What You Get

✅ **Working chess game** with all rules
✅ **AI opponent** (Stockfish 17.1 WASM)
✅ **Modern UI** with drag-and-drop
✅ **Sound effects** and animations
✅ **Analysis panel** with best moves
✅ **Clean architecture** ready to extend

## Common Customizations

### 1. Change Colors/Theme

```css
/* src/app.css - Update these */
--bg-primary: #1e1e1e;    /* Background */
--accent-blue: #4a9eff;   /* Primary color */

/* Board colors in Board.svelte */
.light-square { background: #f0d9b5; }
.dark-square { background: #b58863; }
```

### 2. Adjust AI Difficulty

```typescript
// src/lib/stores/engineConfig.svelte.ts
export const engineConfig = {
  depth: 5,        // Lower = easier (1-20)
  moveTime: 500    // Faster = weaker
};
```

### 3. Add Features

#### Time Controls
```typescript
// Create src/lib/stores/clock.svelte.ts
class ChessClock {
  whiteTime = $state(600000); // 10 min
  blackTime = $state(600000);

  tick() {
    // Decrement active player's time
  }
}
```

#### Opening Book
```typescript
// Create src/lib/services/openings.ts
const openings = {
  'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1': ['e2e4', 'd2d4']
};
```

#### Multiplayer
```typescript
// Add socket.io for real-time play
import { io } from 'socket.io-client';
const socket = io('your-server');
```

## File Structure

```
Keep these:
├── src/lib/          # Core logic
├── static/stockfish-* # Engine files
└── static/sounds/    # Audio files

Customize these:
├── src/routes/       # Your pages
├── src/app.css      # Your styles
└── package.json     # Your project info

Remove these:
├── CHANGELOG.md
├── TEMPLATE_GUIDE.md (after reading)
└── scripts/init-template.js (after running)
```

## Adding Chess Variants

```typescript
// Extend src/lib/chess/engine/game.ts
export class Chess960Engine extends GameEngine {
  setupRandomPosition() {
    // Fischer Random logic
  }
}
```

## Deployment

### Static Hosting
```bash
bun run build
# Upload 'build' folder to Vercel/Netlify
```

### Node Server
```bash
bun run build
PORT=3000 node build
```

### Docker
```dockerfile
FROM oven/bun:1.3.0
WORKDIR /app
COPY . .
RUN bun install
RUN bun run build
EXPOSE 3000
CMD ["node", "build"]
```

## Tips

1. **Reactivity**: Use Svelte 5 runes (`$state`, `$derived`)
2. **Chess.js**: Wrap with version counter for reactivity
3. **Stockfish**: Requires same-origin hosting (CORS)
4. **Mobile**: Limit engine threads for performance
5. **Sound**: Handle autoplay restrictions gracefully

## Examples

### Custom Evaluation
```typescript
// Add position scoring
const pieceValues = { p: 1, n: 3, b: 3, r: 5, q: 9 };
const materialScore = calculateMaterial(position);
```

### Save Games
```typescript
// Add localStorage persistence
localStorage.setItem('game', gameStore.getPgn());
```

### Puzzles
```typescript
// Create puzzle mode
const puzzle = {
  fen: 'position',
  solution: ['e2e4', 'e7e5'],
  hint: 'Find the winning move'
};
```

## Need Help?

- **Chess logic**: See chess.js docs
- **Board UI**: Check Chessground examples
- **Engine**: Read UCI protocol spec
- **Framework**: Visit SvelteKit docs

---

**Ready to build? Start customizing!** 🎮