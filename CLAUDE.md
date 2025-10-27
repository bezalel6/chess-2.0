# Chess 2.0 - Claude Code Guidelines

Project-specific instructions for working on the Chess 2.0 application.

## Project Overview

Chess 2.0 is a modern chess application built with SvelteKit 5 (using runes), TypeScript, and Tailwind CSS v4. The project uses Bun as the package manager and is configured for self-hosting via adapter-node.

## Tech Stack & Versions

- **SvelteKit**: 2.43.2
- **Svelte**: 5.39.5 (using new runes syntax: `$props()`, `$state()`, `$derived()`, `$effect()`)
- **TypeScript**: 5.9.2
- **Tailwind CSS**: 4.1.14 (v4 - uses `@import "tailwindcss"` not v3 directives)
- **Vite**: 7.1.7
- **Bun**: 1.3.0
- **Adapter**: @sveltejs/adapter-node 5.3.3

## Critical Framework Patterns

### Svelte 5 Runes (REQUIRED)

This project uses Svelte 5 with runes. **Never use old Svelte syntax.**

**Correct (Svelte 5 Runes):**
```svelte
<script lang="ts">
  let { title, count = 0 } = $props();
  let doubled = $derived(count * 2);
  let internal = $state(0);

  $effect(() => {
    console.log('count changed:', count);
  });
</script>
```

**Wrong (Old Svelte syntax - DO NOT USE):**
```svelte
<script lang="ts">
  export let title: string;
  export let count = 0;
  $: doubled = count * 2;
  let internal = 0;
</script>
```

### Tailwind CSS v4 (REQUIRED)

This project uses Tailwind CSS v4 with the Vite plugin. **Use Context7 for latest patterns.**

**Setup (already configured):**
- Import in `src/app.css`: `@import "tailwindcss";`
- Vite plugin in `vite.config.ts`: `tailwindcss()` before `sveltekit()`
- No `tailwind.config.js` needed for basic setup

**Correct usage:**
```svelte
<div class="flex items-center justify-center min-h-screen bg-gray-100">
  <h1 class="text-4xl font-bold text-gray-900">Chess 2.0</h1>
</div>
```

### SvelteKit File-Based Routing

- `+page.svelte` - Page components
- `+layout.svelte` - Layout wrappers
- `+page.ts` / `+page.server.ts` - Page data loading
- `+server.ts` - API endpoints
- `+error.svelte` - Error boundaries

## Development Workflow

### Always Check Context7 First

Before implementing features with external libraries or frameworks:

1. Use `resolve-library-id` to find the library
2. Use `get-library-docs` with specific topics
3. Follow official patterns from Context7, not assumptions

**Example:**
```
User: "Add form validation"
→ Use Context7 for sveltekit-superforms or latest validation patterns
→ Don't guess at API syntax from memory
```

### Type Safety Requirements

- All props must have TypeScript types
- Use strict type checking
- No `any` types unless absolutely necessary
- Leverage Svelte 5's type inference with runes

### Component Organization

```
src/
├── lib/
│   ├── components/     # Reusable UI components
│   │   ├── chess/     # Chess-specific components
│   │   └── ui/        # Generic UI components
│   ├── stores/        # Svelte stores (use $state for local, stores for global)
│   ├── utils/         # Utility functions
│   └── types/         # TypeScript type definitions
├── routes/            # File-based routing
└── app.css           # Global styles (Tailwind import)
```

### State Management Strategy

1. **Local component state**: Use `$state()` rune
2. **Derived values**: Use `$derived()` rune
3. **Props**: Use `$props()` rune
4. **Global state**: Use Svelte stores in `src/lib/stores/`
5. **Side effects**: Use `$effect()` rune

### Styling Guidelines

- Use Tailwind utility classes first
- Create component classes only when repeated patterns emerge
- Keep responsive design in mind (mobile-first)
- Follow the established dark theme color palette
- For chess board: Use chessground's built-in layout system

### Dark Theme Color Palette (Current)

The application uses a cohesive dark theme:

```css
/* Background colors */
--bg-primary: #1e1e1e;     /* Main background */
--bg-secondary: #2d2d2d;   /* Cards, surfaces */
--bg-tertiary: #3d3d3d;    /* Hover states */

/* Border colors */
--border-primary: #404040;
--border-secondary: #505050;

/* Text colors */
--text-primary: #e8e8e8;   /* Headings, main text */
--text-secondary: #a0a0a0; /* Secondary text, labels */

/* Accent colors */
--accent-blue: #4a9eff;    /* Primary actions, links */
--accent-green: #4ade80;   /* Success, valid moves */
--accent-yellow: #facc15;  /* Warnings, undo */
--accent-red: #f87171;     /* Errors, danger */
--accent-purple: #c084fc;  /* Special actions */
```

### Board Theme

Uses lichess.org blue theme:
- Light squares: `#dee3e6`
- Dark squares: `#8ca2ad`

## Chess-Specific Considerations

### Current Architecture (Implemented)

The chess implementation uses:

```
src/lib/
├── chess/
│   └── engine/
│       └── game.ts          # Chess.js wrapper with TypeScript types
├── stores/
│   └── game.svelte.ts       # Reactive game state using Svelte 5 runes
├── components/chess/
│   ├── Board.svelte         # Chessground board integration
│   ├── MoveHistory.svelte   # Move list display
│   └── GameControls.svelte  # Game control buttons
└── types/
    └── chess.ts             # TypeScript type definitions
```

### Chess Libraries

**chess.js (1.0.0)**: Game logic and move validation
- Provides FEN/PGN support
- Legal move generation
- Game state detection (check, checkmate, stalemate)

**chessground (9.0.0)**: Interactive board UI
- Drag-and-drop piece movement
- Legal move highlighting
- Visual feedback for checks
- Animations and transitions

**Stockfish 17.1 WASM**: Chess analysis engine
- Multithreaded WebAssembly version
- UCI protocol implementation
- Real-time position evaluation
- Principal variation calculation
- Configurable depth, threads, and hash size

### Stockfish Engine Architecture

The Stockfish implementation consists of three main components:

```
src/lib/
├── chess/engine/
│   └── stockfish.ts         # UCI protocol wrapper for Stockfish WASM
├── stores/
│   ├── analysis.svelte.ts   # Analysis state management
│   └── engineConfig.svelte.ts  # Engine configuration store
└── components/chess/
    └── AnalysisPanel.svelte # UI component for analysis display
```

### UCI Protocol Implementation (CRITICAL)

The Universal Chess Interface (UCI) protocol is used for engine communication:

**Command/Response Pattern:**
```typescript
// Commands that expect responses
sendCommand('uci', 'uciok')           // Engine identification
sendCommand('isready', 'readyok')     // Ready check
sendCommand('go movetime 2000', /^bestmove/)  // Analysis

// Commands that DON'T expect responses
worker.postMessage('setoption name Threads value 4')  // Settings
worker.postMessage('position fen ...')                // Position
worker.postMessage('ucinewgame')                     // New game
worker.postMessage('stop')                           // Stop analysis
```

**Common UCI Pitfalls:**
1. **setoption doesn't respond**: Never wait for confirmation after setoption commands
2. **stop may not return bestmove**: If no search is active, stop won't trigger bestmove
3. **position doesn't confirm**: UCI doesn't acknowledge position commands
4. **Message order matters**: Always send uci → setoption → isready → position → go

### Analysis Store Architecture

The analysis store manages the engine lifecycle with proper state management:

```typescript
class AnalysisStore {
  private engine: StockfishEngine | null = null;
  private currentFen: string | null = null;
  private state = $state<AnalysisState>({
    isAnalyzing: boolean,
    isEnabled: boolean,
    result: AnalysisResult | null,
    error: string | null
  });

  // Key patterns:
  // 1. Persistent enable state via localStorage
  // 2. Engine initialization on first use
  // 3. Continuous analysis with position updates
  // 4. Proper async/await for all stop operations
}
```

**State Management Patterns:**
- **Initialization**: Lazy load engine only when analysis is enabled
- **Continuous Analysis**: Auto-restart on position changes
- **Error Recovery**: Graceful handling of engine failures
- **Cleanup**: Proper worker termination to prevent memory leaks

### Stockfish Worker Communication

**Message Flow:**
```typescript
// 1. Worker initialization (wait for first message)
worker = new Worker('/stockfish-17.1-8e4d048.js');
worker.onmessage = (event) => {
  // First message indicates worker ready
  // Then send UCI initialization
};

// 2. Command queue pattern
private commandQueue: Command[] = [];
private currentCommand: Command | null = null;
private isProcessing = false;

// 3. Separate analysis buffer (prevents data loss)
private analysisBuffer: string[] = [];  // Info lines
private messageBuffer: string[] = [];   // All messages
```

### Analysis Panel Integration

**Key UI Patterns:**
```typescript
// Initialize engine on mount
onMount(async () => {
  await analysisStore.initialize();
  engineInitialized = true;
});

// Track position changes with $effect
$effect(() => {
  if (engineInitialized && analysisStore.isEnabled) {
    const fen = gameStore.fen;
    analysisStore.updatePosition(fen);
  }
});

// Play best move on click
const playBestMove = () => {
  const uciMove = result.bestMove || result.pv?.[0];
  if (uciMove) {
    const from = uciMove.substring(0, 2);
    const to = uciMove.substring(2, 4);
    const promotion = uciMove[4];
    gameStore.makeMove(from, to, promotion);
  }
};
```

### Chessground CSS Import Order (CRITICAL)

Chessground requires specific CSS import order in `app.css`:

```css
/* 1. Base CSS (structure) - MUST BE FIRST */
@import "chessground/assets/chessground.base.css";

/* 2. Piece set CSS (piece images) */
@import "chessground/assets/chessground.cburnett.css";

/* 3. Custom color overrides (can go after) */
cg-board {
  background-color: #dee3e6;
  /* ... custom colors ... */
}
```

Breaking this order will prevent proper styling and theme customization.

### Svelte 5 Reactivity with Chess.js (CRITICAL)

Chess.js mutates its internal state, which doesn't trigger Svelte 5 reactivity. Use the **version counter pattern**:

```typescript
let engine = $state(new GameEngine());
let version = $state(0);  // Version counter

export const gameStore = {
  get fen() {
    version;  // Access version to trigger reactivity
    return engine.fen();
  },

  makeMove(from: Square, to: Square): boolean {
    const move = engine.move(from, to);
    if (move) {
      version++;  // Increment to trigger reactivity
      return true;
    }
    return false;
  }
};
```

### Immutable Update Pattern (CRITICAL)

Svelte 5 requires immutable updates for arrays and objects:

```typescript
// ❌ WRONG - Mutation doesn't trigger reactivity
history[index].black = newMove;
history.pop();

// ✅ CORRECT - Create new arrays/objects
const updatedEntry = { ...history[index], black: newMove };
history = [...history.slice(0, index), updatedEntry, ...history.slice(index + 1)];
history = history.slice(0, -1);
```

### $effect Placement (CRITICAL)

`$effect` must be at the top level of `<script>`, not inside `onMount()`:

```typescript
// ❌ WRONG - Effect won't track reactivity properly
onMount(() => {
  $effect(() => { /* ... */ });
});

// ✅ CORRECT - Effect at top level
$effect(() => {
  if (ground) {
    const fen = gameStore.fen;  // Extract values first
    ground.set({ fen });
  }
});

onMount(() => {
  // Only initialization here
  ground = Chessground(element, config);
});
```

### Performance Requirements

- Board rendering: 60fps animations with chessground
- Move validation: < 10ms via chess.js
- State updates: Version counter ensures minimal re-renders
- Analysis updates: 100ms interval for smooth feedback
- Engine initialization: ~3 seconds with fallback timeout

## Commit Standards

Use conventional commits:
```
feat: add chess board component
fix: correct pawn promotion logic
refactor: optimize move validation
docs: update API documentation
style: format with prettier
test: add unit tests for move validation
```

## Testing Strategy (future)

When tests are added:
- Unit tests: Pure functions (move validation, notation parsing)
- Component tests: Svelte Testing Library
- E2E tests: Playwright for user flows
- Visual tests: Chromatic or similar

## Deployment

The project uses adapter-node for self-hosting:

```bash
bun run build      # Creates build/ directory
node build         # Runs the production server
```

Environment variables:
- `PORT` - Server port (default: 3000)
- `HOST` - Server host (default: 0.0.0.0)
- `ORIGIN` - Origin URL for CSRF protection

## Common Gotchas

1. **Svelte 5 Migration**: Always use runes, never old syntax
2. **Svelte 5 Reactivity**: Use immutable updates (spread operator, slice) for arrays/objects
3. **Non-Reactive Libraries**: Use version counter pattern when wrapping chess.js or similar
4. **$effect Placement**: Must be at top level of `<script>`, not inside onMount()
5. **Chessground CSS**: Base CSS must be imported FIRST, before themes
6. **Each Block Keys**: Use stable unique keys; avoid duplicate keys (use index if needed)
7. **Tailwind v4**: Uses `@import`, not `@tailwind` directives
8. **TypeScript**: Strict mode is enabled, handle all types properly
9. **Bun**: Use `bun` commands, not `npm` or `yarn`
10. **Adapter Node**: Remember to set environment variables in production

## Stockfish-Specific Troubleshooting

### Common Issues and Solutions

1. **Infinite Loading / Analysis Never Starts**
   - **Cause**: Stop command waiting for bestmove when no search is active
   - **Solution**: Stop command should not wait for responses, just send and continue
   ```typescript
   // ❌ WRONG
   await sendCommand('stop', /^bestmove/);

   // ✅ CORRECT
   worker.postMessage('stop');
   await new Promise(resolve => setTimeout(resolve, 100));
   ```

2. **Race Condition on Initialization**
   - **Cause**: Analysis starting before engine fully initialized
   - **Solution**: Use initialization flag tracked with $state
   ```typescript
   let engineInitialized = $state(false);

   onMount(async () => {
     await analysisStore.initialize();
     engineInitialized = true;
   });

   $effect(() => {
     if (engineInitialized && analysisStore.isEnabled) {
       // Safe to use engine
     }
   });
   ```

3. **Best Move Not Displaying**
   - **Cause**: Only checking result.bestMove, not result.pv
   - **Solution**: Fallback to first PV move
   ```typescript
   const bestMoveUCI = result.bestMove || (result.pv && result.pv[0]);
   ```

4. **Analysis Info Lines Lost**
   - **Cause**: Single message buffer for all UCI output
   - **Solution**: Separate analysis buffer for info lines
   ```typescript
   private analysisBuffer: string[] = [];  // For info lines
   private messageBuffer: string[] = [];   // For command responses
   ```

5. **Worker Initialization Hangs**
   - **Cause**: Some environments don't send initial message
   - **Solution**: Timeout fallback after 3 seconds
   ```typescript
   setTimeout(() => {
     if (!workerReady) {
       workerReady = true;
       // Initialize anyway
     }
   }, 3000);
   ```

### UCI Protocol Debugging

**Enable logging for UCI commands:**
```typescript
// In stockfish.ts
private sendCommand(command: UCICommand, expectedResponse: string | RegExp) {
  console.log('UCI →', command);
  // ... rest of implementation
}

private handleMessage(line: string) {
  console.log('UCI ←', line);
  // ... rest of implementation
}
```

**Common UCI response patterns:**
- `info depth 20 seldepth 25 score cp 35 pv e2e4 e7e5`
- `bestmove e2e4 ponder e7e5`
- `readyok`
- `uciok`

### Memory Management

**Proper cleanup sequence:**
```typescript
async cleanup() {
  await this.stopContinuousAnalysis();  // Stop analysis first
  if (this.engine) {
    await this.engine.quit();           // Send quit command
    this.engine = null;                 // Clear reference
  }
  // Reset all state
}
```

## Code Quality Standards

- Run `bun run check` before committing
- Follow TypeScript strict mode
- Use descriptive variable names
- Comment complex chess logic
- Keep components under 200 lines
- Extract reusable logic to utilities

## External Dependencies

**Current (installed):**
- Core SvelteKit packages
- Tailwind CSS v4
- TypeScript
- Vite
- **chess.js 1.0.0**: Game logic and move validation
- **chessground 9.0.0**: Interactive chess board UI

**Stockfish Engine Files (in static/):**
- **stockfish-17.1-lite-51f59da.js**: Lite worker file (32KB) - Used for GitHub Pages deployment
- **stockfish-17.1-lite-51f59da.wasm**: Lite WebAssembly binary (7MB) - Single file for simplicity
- **stockfish-17.1-8e4d048.js**: Full worker file (32KB) - Available for local dev
- **stockfish-17.1-8e4d048-part-[0-5].wasm**: Full WASM split into 6 parts (78MB total)
- These files must be served from the same origin due to CORS restrictions
- The lite version is used by default for easier deployment and compatibility

**Future considerations:**
- Socket.io for multiplayer (if desired)
- Database client for game persistence (if desired)
- Authentication system (if desired)

**Always consult via Context7 before adding new dependencies.**

## Questions or Clarifications

When unclear about implementation details:
1. Ask the user for clarification on requirements
2. Use Context7 to check latest patterns
3. Propose architecture before implementing
4. Consider performance and maintainability

## Summary

- Use Svelte 5 runes exclusively
- Use Tailwind v4 patterns
- Check Context7 for official docs
- Type everything with TypeScript
- Use Bun for all commands
- Commit early and often
- Ask when uncertain

## Key Implementation Patterns

### Working with Non-Reactive Libraries
- **Chess.js**: Use version counter pattern for reactivity
- **Stockfish**: Use proper async/await and state management
- **Chessground**: Extract values before passing to avoid reactivity issues

### UCI Protocol Best Practices
- Never wait for responses from setoption, position, stop commands
- Always initialize with: uci → setoption → isready → position → go
- Use separate buffers for analysis info lines vs command responses
- Handle worker initialization with timeout fallback

### Analysis Feature Architecture
- Lazy load engine only when needed
- Persist enabled state in localStorage
- Auto-restart analysis on position changes
- Provide clickable best move suggestions
- Display evaluation from current player's perspective

### Performance Optimizations
- 100ms update interval for smooth analysis feedback
- Version counter pattern for minimal re-renders
- Proper cleanup to prevent memory leaks
- Efficient UCI message parsing with regex
