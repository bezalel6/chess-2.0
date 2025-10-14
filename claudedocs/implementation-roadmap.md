# Chess 2.0 MVP - Implementation Roadmap

**Version**: 1.0
**Created**: 2025-10-14
**Target Duration**: 5 weeks (175-200 hours)
**Project Type**: Challenge-based chess game with AI analysis

---

## Table of Contents

1. [Overview](#overview)
2. [Dependencies Installation Schedule](#dependencies-installation-schedule)
3. [Week 1: Foundation & Core Board](#week-1-foundation--core-board)
4. [Week 2: Chess Logic & Move Validation](#week-2-chess-logic--move-validation)
5. [Week 3: Challenge System & UI](#week-3-challenge-system--ui)
6. [Week 4: AI Integration & Scoring](#week-4-ai-integration--scoring)
7. [Week 5: Polish & Testing](#week-5-polish--testing)
8. [Git Workflow Strategy](#git-workflow-strategy)
9. [Quality Gates & Definition of Done](#quality-gates--definition-of-done)
10. [Critical Path Analysis](#critical-path-analysis)
11. [Risk Mitigation](#risk-mitigation)

---

## Overview

### Project Goals

Build an MVP chess application with:
- Interactive chess board using chessground
- Challenge-based gameplay system
- AI analysis via Stockfish.js
- Move validation with chess.js
- Scoring system based on challenge completion
- SvelteKit 5 with TypeScript

### Architecture Stack

**Frontend**:
- SvelteKit 5 (runes) + TypeScript
- Tailwind CSS v4
- chessground (board UI)

**Chess Logic**:
- chess.js (move validation, game rules)
- Stockfish.js (AI analysis)

**State Management**:
- Svelte 5 runes ($state, $derived, $effect)
- Svelte stores (global state)

### Success Metrics

- All chess piece movements work correctly
- Challenge system functional with 5+ challenge types
- Stockfish integration provides move analysis
- Scoring system tracks player progress
- 90%+ test coverage on chess logic
- <100ms move validation latency
- Accessible keyboard navigation

---

## Dependencies Installation Schedule

### Phase 1: Foundation (Day 1)

```bash
# Core chess libraries
bun add chess.js chessground

# Type definitions
bun add -d @types/chess.js

# Testing infrastructure
bun add -d vitest @vitest/ui
bun add -d @testing-library/svelte jsdom
```

**Package.json updates**:
```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage"
  }
}
```

### Phase 2: AI Integration (Week 4, Day 1)

```bash
# Stockfish integration
bun add stockfish.js

# Web Worker support (if needed)
bun add -d vite-plugin-worker
```

### Phase 3: Code Quality (Week 1, Day 5)

```bash
# Linting and formatting
bun add -d eslint prettier
bun add -d eslint-plugin-svelte prettier-plugin-svelte
bun add -d @typescript-eslint/parser @typescript-eslint/eslint-plugin
```

**Package.json updates**:
```json
{
  "scripts": {
    "lint": "eslint . --ext .ts,.svelte",
    "format": "prettier --write \"src/**/*.{ts,svelte,css}\""
  }
}
```

---

## Week 1: Foundation & Core Board

**Goal**: Establish project foundation, chess board rendering, basic piece display

**Total Hours**: 35-40 hours

---

### Day 1 (Monday): Project Setup & Dependencies

**Hours**: 6-8 hours

#### Task 1.1: Install Core Dependencies
**Priority**: CRITICAL
**Time**: 1 hour
**Prerequisites**: None

**Actions**:
```bash
# Install chess libraries
bun add chess.js chessground

# Install type definitions
bun add -d @types/chess.js

# Install testing
bun add -d vitest @vitest/ui @testing-library/svelte jsdom
```

**Files to Modify**:
- `package.json` - Add test scripts

**Success Criteria**:
- All dependencies install without errors
- `bun run check` passes
- Dev server starts successfully

**Testing**:
- Verify imports: `import { Chess } from 'chess.js'`
- Start dev server: `bun run dev`

**Git**: `git checkout -b setup/dependencies`

---

#### Task 1.2: Configure Vitest
**Priority**: HIGH
**Time**: 2 hours
**Prerequisites**: Task 1.1

**Actions**:
Create test configuration files

**Files to Create**:

`vitest.config.ts`:
```typescript
import { defineConfig } from 'vitest/config';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { svelteTesting } from '@testing-library/svelte/vite';

export default defineConfig({
  plugins: [svelte(), svelteTesting()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/tests/setup.ts'],
    include: ['src/**/*.{test,spec}.{js,ts}'],
    coverage: {
      reporter: ['text', 'json', 'html'],
      include: ['src/lib/**/*.{ts,svelte}']
    }
  }
});
```

`src/tests/setup.ts`:
```typescript
import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/svelte';
import '@testing-library/jest-dom/vitest';

afterEach(() => {
  cleanup();
});
```

**Success Criteria**:
- `bun run test` runs without errors
- Sample test passes
- Coverage report generates

**Testing**:
Create sample test in `src/tests/example.test.ts`:
```typescript
import { describe, it, expect } from 'vitest';

describe('Setup', () => {
  it('should run tests', () => {
    expect(true).toBe(true);
  });
});
```

**Git**: Commit to `setup/dependencies`

---

#### Task 1.3: Create Chess Type Definitions
**Priority**: CRITICAL
**Time**: 2 hours
**Prerequisites**: Task 1.1

**Actions**:
Define TypeScript types for chess domain

**Files to Create**:

`src/lib/chess/types.ts`:
```typescript
// Chess piece types
export type PieceType = 'p' | 'n' | 'b' | 'r' | 'q' | 'k';
export type PieceColor = 'w' | 'b';
export type Square = string; // e.g., 'e4', 'a1'

export interface ChessPiece {
  type: PieceType;
  color: PieceColor;
}

export interface ChessMove {
  from: Square;
  to: Square;
  promotion?: PieceType;
  flags?: string;
  san?: string; // Standard Algebraic Notation
  piece?: PieceType;
  captured?: PieceType;
}

export interface GameState {
  fen: string;
  turn: PieceColor;
  isCheck: boolean;
  isCheckmate: boolean;
  isDraw: boolean;
  moveHistory: ChessMove[];
}

export interface ChallengeConfig {
  id: string;
  title: string;
  description: string;
  initialFen: string;
  targetMove?: string;
  objectives: string[];
  pointValue: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

export interface PlayerProgress {
  challengeId: string;
  completed: boolean;
  score: number;
  attempts: number;
  bestMoveAccuracy: number;
}
```

**Success Criteria**:
- TypeScript compilation passes
- Types exported from `src/lib/chess/index.ts`
- No `any` types used

**Testing**:
- Run `bun run check` - should pass with no type errors

**Git**: Commit to `setup/dependencies`

---

#### Task 1.4: Create Project Directory Structure
**Priority**: HIGH
**Time**: 1 hour
**Prerequisites**: Task 1.3

**Actions**:
Create organized directory structure

**Directories to Create**:
```bash
mkdir -p src/lib/components/chess
mkdir -p src/lib/components/ui
mkdir -p src/lib/components/challenges
mkdir -p src/lib/chess/engine
mkdir -p src/lib/chess/ai
mkdir -p src/lib/stores
mkdir -p src/lib/utils
mkdir -p src/tests/unit
mkdir -p src/tests/integration
mkdir -p static/assets/audio
```

**Files to Create**:

`src/lib/chess/index.ts`:
```typescript
export * from './types';
```

`src/lib/components/ui/index.ts`:
```typescript
// UI component re-exports
export { default as Button } from './Button.svelte';
// ... more exports as components are created
```

`src/lib/stores/index.ts`:
```typescript
// Store re-exports
export { gameStore } from './gameStore';
// ... more exports as stores are created
```

**Success Criteria**:
- All directories exist
- Index files created for main modules
- Clean import paths work: `import { ChessMove } from '$lib/chess'`

**Testing**:
- Test import from routes: `import type { ChessMove } from '$lib/chess'`
- Verify path aliases resolve

**Git**: Commit to `setup/dependencies`, then merge to master

---

### Day 2 (Tuesday): Chessground Integration

**Hours**: 7-8 hours

#### Task 1.5: Create Board Component Shell
**Priority**: CRITICAL
**Time**: 2 hours
**Prerequisites**: Day 1 complete

**Actions**:
Create base board component with chessground

**Files to Create**:

`src/lib/components/chess/Board.svelte`:
```svelte
<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import type { Api } from 'chessground/api';
  import { Chessground } from 'chessground';
  import type { Config } from 'chessground/config';

  let {
    fen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
    orientation = 'white',
    onMove = (from: string, to: string) => {}
  }: {
    fen?: string;
    orientation?: 'white' | 'black';
    onMove?: (from: string, to: string) => void;
  } = $props();

  let boardElement: HTMLDivElement;
  let board: Api | undefined;

  const config: Config = {
    fen,
    orientation,
    movable: {
      free: false,
      color: 'both',
      events: {
        after: (orig, dest) => {
          onMove(orig, dest);
        }
      }
    },
    draggable: {
      enabled: true,
      showGhost: true
    }
  };

  onMount(() => {
    if (boardElement) {
      board = Chessground(boardElement, config);
    }
  });

  onDestroy(() => {
    board?.destroy();
  });

  // Expose methods to parent
  export function setPosition(newFen: string) {
    board?.set({ fen: newFen });
  }

  export function setOrientation(newOrientation: 'white' | 'black') {
    board?.set({ orientation: newOrientation });
  }
</script>

<div bind:this={boardElement} class="chess-board"></div>

<style>
  .chess-board {
    width: 100%;
    height: 100%;
    position: relative;
  }

  /* Import chessground CSS */
  @import 'chessground/assets/chessground.base.css';
  @import 'chessground/assets/chessground.brown.css';
  @import 'chessground/assets/chessground.cburnett.css';
</style>
```

**Success Criteria**:
- Component renders without errors
- Chessground initializes
- Board displays starting position

**Testing**:
- Render in `+page.svelte` temporarily
- Verify board appears in browser
- Check console for errors

**Git**: `git checkout -b feature/board-component`

---

#### Task 1.6: Add Chessground Styles
**Priority**: CRITICAL
**Time**: 1 hour
**Prerequisites**: Task 1.5

**Actions**:
Configure chessground CSS and assets

**Files to Modify**:

Copy chessground assets to static directory:
```bash
cp -r node_modules/chessground/assets static/chessground
```

Update `src/app.css`:
```css
@import "tailwindcss";

/* Chessground base styles */
@import '../static/chessground/chessground.base.css';
@import '../static/chessground/chessground.brown.css';
@import '../static/chessground/chessground.cburnett.css';
```

**Success Criteria**:
- Chess pieces display correctly
- Board colors render properly
- Piece images load

**Testing**:
- Visual inspection in browser
- Verify piece SVGs load
- Check network tab for 404s

**Git**: Commit to `feature/board-component`

---

#### Task 1.7: Create Board Container Component
**Priority**: HIGH
**Time**: 2 hours
**Prerequisites**: Task 1.6

**Actions**:
Create responsive container for board with proper sizing

**Files to Create**:

`src/lib/components/chess/BoardContainer.svelte`:
```svelte
<script lang="ts">
  import Board from './Board.svelte';

  let {
    fen,
    orientation = 'white',
    onMove
  }: {
    fen?: string;
    orientation?: 'white' | 'black';
    onMove?: (from: string, to: string) => void;
  } = $props();

  let boardRef: Board;
</script>

<div class="board-container">
  <div class="board-wrapper">
    <Board
      bind:this={boardRef}
      {fen}
      {orientation}
      {onMove}
    />
  </div>
</div>

<style>
  .board-container {
    @apply w-full max-w-2xl mx-auto p-4;
  }

  .board-wrapper {
    @apply aspect-square w-full;
  }
</style>
```

**Success Criteria**:
- Board maintains aspect ratio
- Responsive on mobile/desktop
- Centered on page

**Testing**:
- Test on different screen sizes
- Verify aspect ratio maintained
- Check responsive breakpoints

**Git**: Commit to `feature/board-component`

---

#### Task 1.8: Integrate Board into Landing Page
**Priority**: MEDIUM
**Time**: 2 hours
**Prerequisites**: Task 1.7

**Actions**:
Replace placeholder landing page with board

**Files to Modify**:

`src/routes/+page.svelte`:
```svelte
<script lang="ts">
  import BoardContainer from '$lib/components/chess/BoardContainer.svelte';

  function handleMove(from: string, to: string) {
    console.log('Move:', from, '->', to);
  }
</script>

<div class="min-h-screen bg-gray-100 py-8">
  <div class="container mx-auto">
    <header class="text-center mb-8">
      <h1 class="text-4xl font-bold text-gray-900 mb-2">Chess 2.0</h1>
      <p class="text-lg text-gray-600">Challenge-Based Chess Training</p>
    </header>

    <main>
      <BoardContainer onMove={handleMove} />
    </main>
  </div>
</div>
```

**Success Criteria**:
- Board renders on landing page
- Page layout looks clean
- Move callback fires in console

**Testing**:
- Drag a piece and verify console logs
- Check responsive layout
- Test on mobile viewport

**Git**: Commit to `feature/board-component`, create PR to master

---

### Day 3 (Wednesday): Chess.js Integration

**Hours**: 7-8 hours

#### Task 1.9: Create Chess Game Service
**Priority**: CRITICAL
**Time**: 3 hours
**Prerequisites**: Day 2 complete

**Actions**:
Create service to wrap chess.js functionality

**Files to Create**:

`src/lib/chess/engine/ChessGameService.ts`:
```typescript
import { Chess } from 'chess.js';
import type { ChessMove, GameState, Square } from '../types';

export class ChessGameService {
  private chess: Chess;

  constructor(fen?: string) {
    this.chess = fen ? new Chess(fen) : new Chess();
  }

  /**
   * Get current game state
   */
  getState(): GameState {
    return {
      fen: this.chess.fen(),
      turn: this.chess.turn() as 'w' | 'b',
      isCheck: this.chess.inCheck(),
      isCheckmate: this.chess.isCheckmate(),
      isDraw: this.chess.isDraw(),
      moveHistory: this.chess.history({ verbose: true }) as ChessMove[]
    };
  }

  /**
   * Get legal moves for a square
   */
  getLegalMoves(square?: Square): string[] {
    const moves = this.chess.moves({
      square,
      verbose: false
    }) as string[];
    return moves;
  }

  /**
   * Get legal move destinations for a square
   */
  getLegalDestinations(square: Square): Square[] {
    const moves = this.chess.moves({
      square,
      verbose: true
    });
    return moves.map(move => move.to);
  }

  /**
   * Make a move
   */
  makeMove(from: Square, to: Square, promotion?: string): ChessMove | null {
    try {
      const move = this.chess.move({
        from,
        to,
        promotion
      });
      return move as ChessMove;
    } catch (error) {
      console.error('Invalid move:', error);
      return null;
    }
  }

  /**
   * Undo last move
   */
  undoMove(): ChessMove | null {
    return this.chess.undo() as ChessMove | null;
  }

  /**
   * Load position from FEN
   */
  loadFen(fen: string): boolean {
    try {
      this.chess.load(fen);
      return true;
    } catch (error) {
      console.error('Invalid FEN:', error);
      return false;
    }
  }

  /**
   * Reset to starting position
   */
  reset(): void {
    this.chess.reset();
  }

  /**
   * Get current FEN
   */
  getFen(): string {
    return this.chess.fen();
  }

  /**
   * Check if game is over
   */
  isGameOver(): boolean {
    return this.chess.isGameOver();
  }

  /**
   * Get ASCII representation (for debugging)
   */
  getAscii(): string {
    return this.chess.ascii();
  }
}
```

**Success Criteria**:
- All methods work correctly
- TypeScript types match chess.js
- No runtime errors

**Testing**:
Create `src/tests/unit/ChessGameService.test.ts`:
```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { ChessGameService } from '$lib/chess/engine/ChessGameService';

describe('ChessGameService', () => {
  let service: ChessGameService;

  beforeEach(() => {
    service = new ChessGameService();
  });

  it('should initialize with starting position', () => {
    const state = service.getState();
    expect(state.fen).toContain('rnbqkbnr/pppppppp');
    expect(state.turn).toBe('w');
  });

  it('should make valid moves', () => {
    const move = service.makeMove('e2', 'e4');
    expect(move).not.toBeNull();
    expect(move?.from).toBe('e2');
    expect(move?.to).toBe('e4');
  });

  it('should reject invalid moves', () => {
    const move = service.makeMove('e2', 'e5');
    expect(move).toBeNull();
  });

  it('should get legal moves for a square', () => {
    const moves = service.getLegalDestinations('e2');
    expect(moves).toContain('e3');
    expect(moves).toContain('e4');
  });

  it('should undo moves', () => {
    service.makeMove('e2', 'e4');
    const undone = service.undoMove();
    expect(undone?.from).toBe('e2');
    const state = service.getState();
    expect(state.fen).toContain('rnbqkbnr/pppppppp');
  });
});
```

Run tests: `bun run test`

**Git**: `git checkout -b feature/chess-service`

---

#### Task 1.10: Create Game Store
**Priority**: CRITICAL
**Time**: 2 hours
**Prerequisites**: Task 1.9

**Actions**:
Create Svelte store for global game state

**Files to Create**:

`src/lib/stores/gameStore.ts`:
```typescript
import { writable, derived } from 'svelte/store';
import { ChessGameService } from '$lib/chess/engine/ChessGameService';
import type { GameState, ChessMove } from '$lib/chess/types';

function createGameStore() {
  const service = new ChessGameService();
  const { subscribe, set, update } = writable<GameState>(service.getState());

  return {
    subscribe,

    makeMove: (from: string, to: string, promotion?: string) => {
      const move = service.makeMove(from, to, promotion);
      if (move) {
        set(service.getState());
        return move;
      }
      return null;
    },

    undoMove: () => {
      const undone = service.undoMove();
      if (undone) {
        set(service.getState());
      }
      return undone;
    },

    reset: () => {
      service.reset();
      set(service.getState());
    },

    loadFen: (fen: string) => {
      const success = service.loadFen(fen);
      if (success) {
        set(service.getState());
      }
      return success;
    },

    getLegalMoves: (square: string) => {
      return service.getLegalDestinations(square);
    },

    getService: () => service
  };
}

export const gameStore = createGameStore();

// Derived stores
export const currentTurn = derived(gameStore, $game => $game.turn);
export const isCheck = derived(gameStore, $game => $game.isCheck);
export const isGameOver = derived(
  gameStore,
  $game => $game.isCheckmate || $game.isDraw
);
```

**Success Criteria**:
- Store updates on moves
- Derived stores work correctly
- No memory leaks

**Testing**:
Create `src/tests/unit/gameStore.test.ts`:
```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { get } from 'svelte/store';
import { gameStore } from '$lib/stores/gameStore';

describe('gameStore', () => {
  beforeEach(() => {
    gameStore.reset();
  });

  it('should make moves and update state', () => {
    gameStore.makeMove('e2', 'e4');
    const state = get(gameStore);
    expect(state.turn).toBe('b');
    expect(state.moveHistory).toHaveLength(1);
  });

  it('should undo moves', () => {
    gameStore.makeMove('e2', 'e4');
    gameStore.undoMove();
    const state = get(gameStore);
    expect(state.turn).toBe('w');
    expect(state.moveHistory).toHaveLength(0);
  });

  it('should load FEN positions', () => {
    const testFen = 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1';
    gameStore.loadFen(testFen);
    const state = get(gameStore);
    expect(state.fen).toBe(testFen);
  });
});
```

**Git**: Commit to `feature/chess-service`

---

#### Task 1.11: Connect Board to Store
**Priority**: CRITICAL
**Time**: 2 hours
**Prerequisites**: Task 1.10

**Actions**:
Wire up board component to game store with move validation

**Files to Modify**:

`src/lib/components/chess/Board.svelte`:
```svelte
<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import type { Api } from 'chessground/api';
  import { Chessground } from 'chessground';
  import type { Config } from 'chessground/config';
  import { gameStore } from '$lib/stores/gameStore';

  let {
    orientation = 'white'
  }: {
    orientation?: 'white' | 'black';
  } = $props();

  let boardElement: HTMLDivElement;
  let board: Api | undefined;

  // Subscribe to game state
  const unsubscribe = gameStore.subscribe(state => {
    if (board) {
      board.set({
        fen: state.fen,
        turnColor: state.turn === 'w' ? 'white' : 'black',
        check: state.isCheck
      });
    }
  });

  const config: Config = {
    orientation,
    movable: {
      free: false,
      color: 'both',
      showDests: true,
      events: {
        after: (orig, dest) => {
          // Attempt move through store
          const move = gameStore.makeMove(orig, dest);

          if (!move) {
            // Invalid move - reset position
            board?.set({
              fen: gameStore.getService().getFen()
            });
          }
        }
      },
      dests: new Map() // Will be populated dynamically
    },
    draggable: {
      enabled: true,
      showGhost: true
    },
    selectable: {
      enabled: true
    },
    events: {
      select: (square) => {
        // Show legal moves for selected piece
        const dests = gameStore.getLegalMoves(square);
        board?.set({
          movable: {
            dests: new Map([[square, dests]])
          }
        });
      }
    }
  };

  onMount(() => {
    if (boardElement) {
      board = Chessground(boardElement, config);
    }
  });

  onDestroy(() => {
    unsubscribe();
    board?.destroy();
  });
</script>

<div bind:this={boardElement} class="chess-board"></div>

<style>
  .chess-board {
    width: 100%;
    height: 100%;
    position: relative;
  }
</style>
```

**Success Criteria**:
- Only legal moves allowed
- Illegal moves rejected and board resets
- Legal move destinations highlighted
- Store updates on valid moves

**Testing**:
- Manual testing in browser
- Try legal moves (should work)
- Try illegal moves (should be rejected)
- Verify move history updates

**Git**: Commit to `feature/chess-service`, create PR to master

---

### Day 4 (Thursday): UI Components

**Hours**: 7-8 hours

#### Task 1.12: Create Move History Component
**Priority**: HIGH
**Time**: 3 hours
**Prerequisites**: Day 3 complete

**Actions**:
Display move history in algebraic notation

**Files to Create**:

`src/lib/components/chess/MoveHistory.svelte`:
```svelte
<script lang="ts">
  import { gameStore } from '$lib/stores/gameStore';
  import type { ChessMove } from '$lib/chess/types';

  let gameState = $derived($gameStore);

  // Group moves by move number (2 moves per row: white & black)
  let moveGroups = $derived(() => {
    const moves = gameState.moveHistory;
    const groups: Array<{ number: number; white: ChessMove; black?: ChessMove }> = [];

    for (let i = 0; i < moves.length; i += 2) {
      groups.push({
        number: Math.floor(i / 2) + 1,
        white: moves[i],
        black: moves[i + 1]
      });
    }

    return groups;
  });
</script>

<div class="move-history">
  <h3 class="text-lg font-semibold mb-3 text-gray-900">Move History</h3>

  {#if gameState.moveHistory.length === 0}
    <p class="text-gray-500 text-sm">No moves yet</p>
  {:else}
    <div class="move-list">
      {#each moveGroups() as group}
        <div class="move-row">
          <span class="move-number">{group.number}.</span>
          <span class="move white">{group.white.san}</span>
          {#if group.black}
            <span class="move black">{group.black.san}</span>
          {/if}
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
  .move-history {
    @apply bg-white rounded-lg shadow-md p-4;
  }

  .move-list {
    @apply space-y-1 max-h-96 overflow-y-auto;
  }

  .move-row {
    @apply flex items-center gap-3 text-sm font-mono;
  }

  .move-number {
    @apply text-gray-500 w-8 text-right;
  }

  .move {
    @apply px-2 py-1 rounded bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer;
  }

  .move.white {
    @apply w-16;
  }

  .move.black {
    @apply w-16;
  }
</style>
```

**Success Criteria**:
- Moves display in correct order
- Grouped by move number (1. e4 e5)
- Scrollable for long games
- Updates reactively

**Testing**:
- Make several moves and verify display
- Check move numbering
- Test scrolling with 20+ moves

**Git**: `git checkout -b feature/game-ui`

---

#### Task 1.13: Create Game Controls Component
**Priority**: HIGH
**Time**: 2 hours
**Prerequisites**: Task 1.12

**Actions**:
Add buttons for game control (reset, undo, flip board)

**Files to Create**:

`src/lib/components/ui/Button.svelte`:
```svelte
<script lang="ts">
  let {
    variant = 'primary',
    size = 'md',
    disabled = false,
    onclick,
    children
  }: {
    variant?: 'primary' | 'secondary' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    disabled?: boolean;
    onclick?: () => void;
    children: any;
  } = $props();

  const variantClasses = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-900',
    danger: 'bg-red-600 hover:bg-red-700 text-white'
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };

  const classes = $derived(
    `${variantClasses[variant]} ${sizeClasses[size]} rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed`
  );
</script>

<button
  class={classes}
  {disabled}
  {onclick}
>
  {@render children()}
</button>
```

`src/lib/components/chess/GameControls.svelte`:
```svelte
<script lang="ts">
  import Button from '$lib/components/ui/Button.svelte';
  import { gameStore } from '$lib/stores/gameStore';

  let {
    onFlipBoard
  }: {
    onFlipBoard?: () => void;
  } = $props();

  function handleReset() {
    if (confirm('Reset game?')) {
      gameStore.reset();
    }
  }

  function handleUndo() {
    gameStore.undoMove();
  }
</script>

<div class="game-controls">
  <Button variant="secondary" size="md" onclick={handleUndo}>
    ↶ Undo
  </Button>

  <Button variant="secondary" size="md" onclick={onFlipBoard}>
    ⇅ Flip Board
  </Button>

  <Button variant="danger" size="md" onclick={handleReset}>
    ⟲ Reset
  </Button>
</div>

<style>
  .game-controls {
    @apply flex gap-3 justify-center;
  }
</style>
```

**Success Criteria**:
- Buttons work correctly
- Undo restores previous position
- Reset confirms before clearing
- Flip board rotates view

**Testing**:
- Click each button and verify behavior
- Test undo multiple times
- Verify reset confirmation

**Git**: Commit to `feature/game-ui`

---

#### Task 1.14: Create Game Status Display
**Priority**: MEDIUM
**Time**: 2 hours
**Prerequisites**: Task 1.13

**Actions**:
Show game status (turn, check, checkmate, draw)

**Files to Create**:

`src/lib/components/chess/GameStatus.svelte`:
```svelte
<script lang="ts">
  import { gameStore, isCheck, isGameOver } from '$lib/stores/gameStore';

  let state = $derived($gameStore);

  let statusMessage = $derived(() => {
    if (state.isCheckmate) {
      const winner = state.turn === 'w' ? 'Black' : 'White';
      return `Checkmate! ${winner} wins!`;
    }

    if (state.isDraw) {
      return 'Game drawn';
    }

    if (state.isCheck) {
      const player = state.turn === 'w' ? 'White' : 'Black';
      return `${player} is in check!`;
    }

    const player = state.turn === 'w' ? 'White' : 'Black';
    return `${player} to move`;
  });

  let statusColor = $derived(() => {
    if (state.isCheckmate) return 'text-red-600';
    if (state.isDraw) return 'text-gray-600';
    if (state.isCheck) return 'text-orange-600';
    return 'text-gray-900';
  });
</script>

<div class="game-status">
  <div class="status-indicator {statusColor()}">
    {statusMessage()}
  </div>

  <div class="move-count text-sm text-gray-600">
    Move {state.moveHistory.length}
  </div>
</div>

<style>
  .game-status {
    @apply bg-white rounded-lg shadow-md p-4 text-center;
  }

  .status-indicator {
    @apply text-lg font-semibold mb-2;
  }
</style>
```

**Success Criteria**:
- Shows correct turn
- Highlights check state
- Announces checkmate/draw
- Updates reactively

**Testing**:
- Make moves and verify turn display
- Test check/checkmate positions
- Verify draw detection

**Git**: Commit to `feature/game-ui`, create PR to master

---

### Day 5 (Friday): Code Quality & Testing

**Hours**: 6-8 hours

#### Task 1.15: Add ESLint and Prettier
**Priority**: MEDIUM
**Time**: 2 hours
**Prerequisites**: Day 4 complete

**Actions**:
Configure linting and formatting

**Commands**:
```bash
bun add -d eslint prettier
bun add -d eslint-plugin-svelte prettier-plugin-svelte
bun add -d @typescript-eslint/parser @typescript-eslint/eslint-plugin
```

**Files to Create**:

`.eslintrc.cjs`:
```javascript
module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:svelte/recommended'
  ],
  plugins: ['@typescript-eslint'],
  parserOptions: {
    sourceType: 'module',
    ecmaVersion: 2020,
    extraFileExtensions: ['.svelte']
  },
  env: {
    browser: true,
    es2017: true,
    node: true
  },
  overrides: [
    {
      files: ['*.svelte'],
      parser: 'svelte-eslint-parser',
      parserOptions: {
        parser: '@typescript-eslint/parser'
      }
    }
  ],
  rules: {
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/explicit-function-return-type': 'off'
  }
};
```

`.prettierrc`:
```json
{
  "useTabs": true,
  "singleQuote": true,
  "trailingComma": "none",
  "printWidth": 100,
  "plugins": ["prettier-plugin-svelte"],
  "overrides": [
    {
      "files": "*.svelte",
      "options": {
        "parser": "svelte"
      }
    }
  ]
}
```

`.prettierignore`:
```
.DS_Store
node_modules
/build
/.svelte-kit
/package
.env
.env.*
!.env.example
pnpm-lock.yaml
package-lock.json
yarn.lock
```

**Success Criteria**:
- `bun run lint` runs without errors
- `bun run format` formats all files
- Code follows consistent style

**Testing**:
```bash
bun run lint
bun run format
bun run check
```

**Git**: `git checkout -b setup/code-quality`

---

#### Task 1.16: Add Component Tests
**Priority**: HIGH
**Time**: 3 hours
**Prerequisites**: Task 1.15

**Actions**:
Write tests for UI components

**Files to Create**:

`src/tests/unit/Board.test.ts`:
```typescript
import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/svelte';
import Board from '$lib/components/chess/Board.svelte';

describe('Board Component', () => {
  it('should render without crashing', () => {
    const { container } = render(Board);
    expect(container.querySelector('.chess-board')).toBeTruthy();
  });

  it('should initialize with default orientation', () => {
    const { container } = render(Board, {
      props: { orientation: 'white' }
    });
    expect(container).toBeTruthy();
  });
});
```

`src/tests/unit/MoveHistory.test.ts`:
```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import MoveHistory from '$lib/components/chess/MoveHistory.svelte';
import { gameStore } from '$lib/stores/gameStore';

describe('MoveHistory Component', () => {
  beforeEach(() => {
    gameStore.reset();
  });

  it('should show "No moves yet" when game starts', () => {
    render(MoveHistory);
    expect(screen.getByText('No moves yet')).toBeTruthy();
  });

  it('should display moves after they are made', async () => {
    gameStore.makeMove('e2', 'e4');
    render(MoveHistory);
    expect(screen.getByText('e4')).toBeTruthy();
  });
});
```

**Success Criteria**:
- All tests pass
- >80% component coverage
- Tests run in CI pipeline

**Testing**:
```bash
bun run test
bun run test:coverage
```

**Git**: Commit to `setup/code-quality`

---

#### Task 1.17: Integration Testing
**Priority**: MEDIUM
**Time**: 2 hours
**Prerequisites**: Task 1.16

**Actions**:
Create integration tests for full game flow

**Files to Create**:

`src/tests/integration/gameFlow.test.ts`:
```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { ChessGameService } from '$lib/chess/engine/ChessGameService';

describe('Game Flow Integration', () => {
  let service: ChessGameService;

  beforeEach(() => {
    service = new ChessGameService();
  });

  it('should complete a full game sequence', () => {
    // Scholar's Mate
    service.makeMove('e2', 'e4');
    service.makeMove('e7', 'e5');
    service.makeMove('f1', 'c4');
    service.makeMove('b8', 'c6');
    service.makeMove('d1', 'h5');
    service.makeMove('g8', 'f6');
    const mate = service.makeMove('h5', 'f7');

    expect(mate).not.toBeNull();
    const state = service.getState();
    expect(state.isCheckmate).toBe(true);
  });

  it('should handle castling', () => {
    // Set up castling position
    service.loadFen('r3k2r/pppppppp/8/8/8/8/PPPPPPPP/R3K2R w KQkq - 0 1');
    const castle = service.makeMove('e1', 'g1');
    expect(castle).not.toBeNull();
  });

  it('should detect stalemate', () => {
    // Stalemate position
    service.loadFen('k7/8/1Q6/8/8/8/8/7K b - - 0 1');
    const state = service.getState();
    expect(state.isDraw).toBe(true);
  });
});
```

**Success Criteria**:
- Integration tests pass
- Edge cases covered (castling, en passant, promotion)
- Test execution time <5 seconds

**Testing**:
```bash
bun run test integration
```

**Git**: Commit to `setup/code-quality`, create PR to master

---

### Week 1 Summary

**Deliverables**:
- ✅ Chess board rendering with chessground
- ✅ Move validation with chess.js
- ✅ Game state management with stores
- ✅ Move history display
- ✅ Game controls (undo, reset, flip)
- ✅ Testing infrastructure (80%+ coverage)
- ✅ Code quality tools (ESLint, Prettier)

**Git Branches Merged**:
- `setup/dependencies`
- `feature/board-component`
- `feature/chess-service`
- `feature/game-ui`
- `setup/code-quality`

**Lines of Code**: ~2,000-2,500
**Test Coverage**: 80%+
**Performance**: <100ms move validation

**Blockers**: None expected
**Risks**: Chessground CSS integration may need tweaking

---

## Week 2: Chess Logic & Move Validation

**Goal**: Complete chess logic, special moves, game rules

**Total Hours**: 35-40 hours

### Day 6 (Monday): Special Moves

**Hours**: 7-8 hours

#### Task 2.1: Implement Pawn Promotion
**Priority**: CRITICAL
**Time**: 3 hours
**Prerequisites**: Week 1 complete

**Actions**:
Add UI for pawn promotion selection

**Files to Create**:

`src/lib/components/chess/PromotionModal.svelte`:
```svelte
<script lang="ts">
  import type { PieceType } from '$lib/chess/types';

  let {
    show = false,
    color,
    onSelect,
    onCancel
  }: {
    show: boolean;
    color: 'w' | 'b';
    onSelect: (piece: PieceType) => void;
    onCancel: () => void;
  } = $props();

  const pieces: PieceType[] = ['q', 'r', 'b', 'n'];
  const pieceNames = {
    q: 'Queen',
    r: 'Rook',
    b: 'Bishop',
    n: 'Knight'
  };
</script>

{#if show}
  <div class="modal-overlay" onclick={onCancel}>
    <div class="modal-content" onclick={(e) => e.stopPropagation()}>
      <h3 class="text-lg font-semibold mb-4">Promote Pawn</h3>

      <div class="piece-selection">
        {#each pieces as piece}
          <button
            class="piece-button"
            onclick={() => onSelect(piece)}
          >
            <img
              src="/chessground/{color}{piece}.svg"
              alt={pieceNames[piece]}
              class="piece-image"
            />
            <span class="piece-name">{pieceNames[piece]}</span>
          </button>
        {/each}
      </div>
    </div>
  </div>
{/if}

<style>
  .modal-overlay {
    @apply fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50;
  }

  .modal-content {
    @apply bg-white rounded-lg p-6 shadow-xl;
  }

  .piece-selection {
    @apply grid grid-cols-2 gap-4;
  }

  .piece-button {
    @apply flex flex-col items-center gap-2 p-4 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors;
  }

  .piece-image {
    @apply w-16 h-16;
  }

  .piece-name {
    @apply text-sm font-medium text-gray-700;
  }
</style>
```

**Files to Modify**:

`src/lib/components/chess/Board.svelte` - Add promotion handling:
```typescript
let showPromotion = $state(false);
let pendingPromotion = $state<{ from: string; to: string } | null>(null);

function handleMove(from: string, to: string) {
  // Check if move is a pawn promotion
  const piece = gameStore.getService().get(from);
  const isPromotion =
    piece?.type === 'p' &&
    (to[1] === '8' || to[1] === '1');

  if (isPromotion) {
    pendingPromotion = { from, to };
    showPromotion = true;
  } else {
    const move = gameStore.makeMove(from, to);
    if (!move) {
      // Reset board on invalid move
      board?.set({ fen: gameStore.getService().getFen() });
    }
  }
}

function handlePromotionSelect(piece: PieceType) {
  if (pendingPromotion) {
    const move = gameStore.makeMove(
      pendingPromotion.from,
      pendingPromotion.to,
      piece
    );

    if (!move) {
      board?.set({ fen: gameStore.getService().getFen() });
    }
  }

  showPromotion = false;
  pendingPromotion = null;
}

function handlePromotionCancel() {
  if (pendingPromotion) {
    board?.set({ fen: gameStore.getService().getFen() });
  }
  showPromotion = false;
  pendingPromotion = null;
}
```

**Success Criteria**:
- Promotion modal appears on 8th/1st rank
- Piece selection works correctly
- Cancel restores board position
- All promotions validated

**Testing**:
```typescript
// src/tests/unit/promotion.test.ts
describe('Pawn Promotion', () => {
  it('should promote pawn to queen', () => {
    const service = new ChessGameService('8/P7/8/8/8/8/8/k6K w - - 0 1');
    const move = service.makeMove('a7', 'a8', 'q');
    expect(move?.promotion).toBe('q');
  });
});
```

**Git**: `git checkout -b feature/special-moves`

---

#### Task 2.2: En Passant Support
**Priority**: MEDIUM
**Time**: 2 hours
**Prerequisites**: Task 2.1

**Actions**:
Verify en passant works correctly with chess.js

**Files to Create**:

`src/tests/unit/enPassant.test.ts`:
```typescript
import { describe, it, expect } from 'vitest';
import { ChessGameService } from '$lib/chess/engine/ChessGameService';

describe('En Passant', () => {
  it('should allow en passant capture', () => {
    const service = new ChessGameService();

    // Set up en passant opportunity
    service.makeMove('e2', 'e4');
    service.makeMove('a7', 'a6'); // Random black move
    service.makeMove('e4', 'e5');
    service.makeMove('d7', 'd5'); // Black pawn advances two squares

    // White captures en passant
    const capture = service.makeMove('e5', 'd6');
    expect(capture).not.toBeNull();
    expect(capture?.flags).toContain('e'); // en passant flag
  });

  it('should only allow en passant on next move', () => {
    const service = new ChessGameService();

    service.makeMove('e2', 'e4');
    service.makeMove('a7', 'a6');
    service.makeMove('e4', 'e5');
    service.makeMove('d7', 'd5');
    service.makeMove('g1', 'f3'); // White makes different move
    service.makeMove('a6', 'a5');

    // En passant opportunity expired
    const legalMoves = service.getLegalDestinations('e5');
    expect(legalMoves).not.toContain('d6');
  });
});
```

**Success Criteria**:
- En passant captures work
- Opportunity expires after one move
- Tests pass

**Testing**:
```bash
bun run test enPassant
```

**Git**: Commit to `feature/special-moves`

---

#### Task 2.3: Castling Validation
**Priority**: HIGH
**Time**: 2 hours
**Prerequisites**: Task 2.2

**Actions**:
Test castling edge cases

**Files to Create**:

`src/tests/unit/castling.test.ts`:
```typescript
import { describe, it, expect } from 'vitest';
import { ChessGameService } from '$lib/chess/engine/ChessGameService';

describe('Castling', () => {
  it('should allow kingside castling', () => {
    const service = new ChessGameService('r3k2r/pppppppp/8/8/8/8/PPPPPPPP/R3K2R w KQkq - 0 1');
    const castle = service.makeMove('e1', 'g1');
    expect(castle).not.toBeNull();
    expect(castle?.flags).toContain('k'); // kingside castle flag
  });

  it('should allow queenside castling', () => {
    const service = new ChessGameService('r3k2r/pppppppp/8/8/8/8/PPPPPPPP/R3K2R w KQkq - 0 1');
    const castle = service.makeMove('e1', 'c1');
    expect(castle).not.toBeNull();
    expect(castle?.flags).toContain('q'); // queenside castle flag
  });

  it('should prevent castling through check', () => {
    const service = new ChessGameService('r3k2r/pppppppp/8/8/4q3/8/PPPPPPPP/R3K2R w KQkq - 0 1');
    const castle = service.makeMove('e1', 'g1');
    expect(castle).toBeNull(); // Can't castle through attacked square
  });

  it('should prevent castling while in check', () => {
    const service = new ChessGameService('r3k2r/pppppppp/8/8/8/4q3/PPPPPPPP/R3K2R w KQkq - 0 1');
    const state = service.getState();
    expect(state.isCheck).toBe(true);

    const castle = service.makeMove('e1', 'g1');
    expect(castle).toBeNull();
  });

  it('should lose castling rights after king moves', () => {
    const service = new ChessGameService('r3k2r/pppppppp/8/8/8/8/PPPPPPPP/R3K2R w KQkq - 0 1');
    service.makeMove('e1', 'e2');
    service.makeMove('a7', 'a6');
    service.makeMove('e2', 'e1');
    service.makeMove('a6', 'a5');

    // Try to castle (should fail)
    const castle = service.makeMove('e1', 'g1');
    expect(castle).toBeNull();
  });
});
```

**Success Criteria**:
- All castling rules enforced
- Tests cover edge cases
- No illegal castling possible

**Testing**:
```bash
bun run test castling
```

**Git**: Commit to `feature/special-moves`, create PR to master

---

### Day 7 (Tuesday): Game State & Check Detection

**Hours**: 7-8 hours

#### Task 2.4: Check Highlighting
**Priority**: HIGH
**Time**: 3 hours
**Prerequisites**: Day 6 complete

**Actions**:
Highlight king when in check

**Files to Modify**:

`src/lib/components/chess/Board.svelte` - Add check highlighting:
```typescript
// Add to reactive updates
$effect(() => {
  const state = $gameStore;

  if (board && state.isCheck) {
    // Find king square
    const fen = state.fen;
    const color = state.turn;
    const kingSquare = findKingSquare(fen, color);

    if (kingSquare) {
      board.set({
        check: kingSquare
      });
    }
  }
});

function findKingSquare(fen: string, color: 'w' | 'b'): string | null {
  const service = gameStore.getService();
  const board = service.board();

  for (let rank = 0; rank < 8; rank++) {
    for (let file = 0; file < 8; file++) {
      const square = String.fromCharCode(97 + file) + (8 - rank);
      const piece = board[rank][file];
      if (piece && piece.type === 'k' && piece.color === color) {
        return square;
      }
    }
  }

  return null;
}
```

**Success Criteria**:
- King highlighted in red when in check
- Highlight clears after check resolved
- Works for both colors

**Testing**:
- Manually test check positions
- Verify highlight appears/disappears
- Test with Scholar's Mate sequence

**Git**: `git checkout -b feature/check-detection`

---

#### Task 2.5: Checkmate Detection & UI
**Priority**: CRITICAL
**Time**: 2 hours
**Prerequisites**: Task 2.4

**Actions**:
Show game over modal on checkmate/stalemate

**Files to Create**:

`src/lib/components/chess/GameOverModal.svelte`:
```svelte
<script lang="ts">
  let {
    show = false,
    result,
    onNewGame
  }: {
    show: boolean;
    result: 'checkmate' | 'stalemate' | 'draw';
    onNewGame: () => void;
  } = $props();

  let message = $derived(() => {
    switch (result) {
      case 'checkmate':
        return 'Checkmate!';
      case 'stalemate':
        return 'Stalemate';
      case 'draw':
        return 'Draw';
      default:
        return '';
    }
  });

  let description = $derived(() => {
    switch (result) {
      case 'checkmate':
        return 'Game over - one side is victorious!';
      case 'stalemate':
        return 'No legal moves available';
      case 'draw':
        return 'Game ended in a draw';
      default:
        return '';
    }
  });
</script>

{#if show}
  <div class="modal-overlay">
    <div class="modal-content">
      <div class="modal-icon">
        {#if result === 'checkmate'}
          <span class="text-6xl">👑</span>
        {:else}
          <span class="text-6xl">🤝</span>
        {/if}
      </div>

      <h2 class="text-3xl font-bold mb-2">{message()}</h2>
      <p class="text-gray-600 mb-6">{description()}</p>

      <button
        class="btn-primary"
        onclick={onNewGame}
      >
        New Game
      </button>
    </div>
  </div>
{/if}

<style>
  .modal-overlay {
    @apply fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50;
  }

  .modal-content {
    @apply bg-white rounded-xl p-8 shadow-2xl text-center max-w-md;
  }

  .modal-icon {
    @apply mb-4;
  }

  .btn-primary {
    @apply px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors;
  }
</style>
```

**Files to Modify**:

`src/routes/+page.svelte` - Add game over detection:
```svelte
<script lang="ts">
  import BoardContainer from '$lib/components/chess/BoardContainer.svelte';
  import GameOverModal from '$lib/components/chess/GameOverModal.svelte';
  import { gameStore } from '$lib/stores/gameStore';

  let gameState = $derived($gameStore);

  let showGameOver = $derived(
    gameState.isCheckmate || gameState.isDraw
  );

  let gameResult = $derived(() => {
    if (gameState.isCheckmate) return 'checkmate';
    if (gameState.isDraw) return 'stalemate';
    return 'draw';
  });

  function handleNewGame() {
    gameStore.reset();
  }
</script>

<GameOverModal
  show={showGameOver}
  result={gameResult()}
  onNewGame={handleNewGame}
/>

<!-- Rest of page -->
```

**Success Criteria**:
- Modal appears on checkmate
- Modal appears on stalemate/draw
- New game button resets board

**Testing**:
- Test Scholar's Mate (checkmate)
- Test stalemate position
- Verify modal appearance

**Git**: Commit to `feature/check-detection`

---

#### Task 2.6: Draw Conditions
**Priority**: MEDIUM
**Time**: 2 hours
**Prerequisites**: Task 2.5

**Actions**:
Test all draw conditions (50-move rule, threefold repetition, insufficient material)

**Files to Create**:

`src/tests/unit/drawConditions.test.ts`:
```typescript
import { describe, it, expect } from 'vitest';
import { ChessGameService } from '$lib/chess/engine/ChessGameService';

describe('Draw Conditions', () => {
  it('should detect stalemate', () => {
    const service = new ChessGameService('k7/8/1Q6/8/8/8/8/7K b - - 0 1');
    const state = service.getState();
    expect(state.isDraw).toBe(true);
    expect(state.isCheckmate).toBe(false);
  });

  it('should detect insufficient material (K vs K)', () => {
    const service = new ChessGameService('k7/8/8/8/8/8/8/7K w - - 0 1');
    const state = service.getState();
    expect(state.isDraw).toBe(true);
  });

  it('should detect insufficient material (K+B vs K)', () => {
    const service = new ChessGameService('k7/8/8/8/8/8/B7/7K w - - 0 1');
    const state = service.getState();
    expect(state.isDraw).toBe(true);
  });

  it('should detect insufficient material (K+N vs K)', () => {
    const service = new ChessGameService('k7/8/8/8/8/8/N7/7K w - - 0 1');
    const state = service.getState();
    expect(state.isDraw).toBe(true);
  });

  // Note: 50-move rule and threefold repetition are handled by chess.js
  // but typically require explicit claim in real games
});
```

**Success Criteria**:
- All draw types detected
- Tests cover edge cases
- UI displays correct draw reason

**Testing**:
```bash
bun run test drawConditions
```

**Git**: Commit to `feature/check-detection`, create PR to master

---

### Day 8 (Wednesday): FEN & PGN Support

**Hours**: 7-8 hours

#### Task 2.7: FEN Import/Export UI
**Priority**: HIGH
**Time**: 3 hours
**Prerequisites**: Day 7 complete

**Actions**:
Add UI for loading/saving FEN positions

**Files to Create**:

`src/lib/components/chess/FenInput.svelte`:
```svelte
<script lang="ts">
  import { gameStore } from '$lib/stores/gameStore';

  let fenInput = $state('');
  let error = $state('');
  let showInput = $state(false);

  function handleLoadFen() {
    if (!fenInput.trim()) {
      error = 'Please enter a FEN string';
      return;
    }

    const success = gameStore.loadFen(fenInput);

    if (success) {
      error = '';
      showInput = false;
      fenInput = '';
    } else {
      error = 'Invalid FEN string';
    }
  }

  function handleExportFen() {
    const fen = gameStore.getService().getFen();
    navigator.clipboard.writeText(fen);
    alert('FEN copied to clipboard!');
  }
</script>

<div class="fen-controls">
  <button
    class="btn-secondary"
    onclick={() => showInput = !showInput}
  >
    Load Position
  </button>

  <button
    class="btn-secondary"
    onclick={handleExportFen}
  >
    Copy FEN
  </button>
</div>

{#if showInput}
  <div class="fen-input-container">
    <input
      type="text"
      bind:value={fenInput}
      placeholder="Paste FEN string here..."
      class="fen-input"
    />

    {#if error}
      <p class="error-message">{error}</p>
    {/if}

    <div class="fen-actions">
      <button class="btn-primary" onclick={handleLoadFen}>
        Load
      </button>
      <button class="btn-secondary" onclick={() => showInput = false}>
        Cancel
      </button>
    </div>
  </div>
{/if}

<style>
  .fen-controls {
    @apply flex gap-2 mb-4;
  }

  .fen-input-container {
    @apply bg-white rounded-lg shadow-md p-4 mb-4;
  }

  .fen-input {
    @apply w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm;
  }

  .error-message {
    @apply text-red-600 text-sm mt-2;
  }

  .fen-actions {
    @apply flex gap-2 mt-3;
  }

  .btn-primary {
    @apply px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors;
  }

  .btn-secondary {
    @apply px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-900 rounded-lg font-medium transition-colors;
  }
</style>
```

**Success Criteria**:
- Load FEN string and update board
- Export current position as FEN
- Copy to clipboard works
- Error handling for invalid FEN

**Testing**:
- Test with valid FEN strings
- Test with invalid FEN strings
- Verify clipboard copy
- Test on mobile

**Git**: `git checkout -b feature/fen-pgn`

---

#### Task 2.8: PGN Export
**Priority**: MEDIUM
**Time**: 2 hours
**Prerequisites**: Task 2.7

**Actions**:
Add PGN export functionality

**Files to Create**:

`src/lib/chess/notation/pgn.ts`:
```typescript
import type { ChessMove } from '../types';

export interface PgnMetadata {
  event?: string;
  site?: string;
  date?: string;
  round?: string;
  white?: string;
  black?: string;
  result?: string;
}

export function generatePgn(
  moves: ChessMove[],
  metadata?: PgnMetadata
): string {
  let pgn = '';

  // Add metadata headers
  if (metadata) {
    pgn += `[Event "${metadata.event || 'Casual Game'}"]\n`;
    pgn += `[Site "${metadata.site || 'Chess 2.0'}"]\n`;
    pgn += `[Date "${metadata.date || new Date().toISOString().split('T')[0]}"]\n`;
    pgn += `[Round "${metadata.round || '1'}"]\n`;
    pgn += `[White "${metadata.white || 'Player 1'}"]\n`;
    pgn += `[Black "${metadata.black || 'Player 2'}"]\n`;
    pgn += `[Result "${metadata.result || '*'}"]\n\n`;
  }

  // Add moves
  let moveText = '';
  for (let i = 0; i < moves.length; i += 2) {
    const moveNumber = Math.floor(i / 2) + 1;
    moveText += `${moveNumber}. ${moves[i].san}`;

    if (moves[i + 1]) {
      moveText += ` ${moves[i + 1].san} `;
    }
  }

  pgn += moveText.trim();
  return pgn;
}

export function downloadPgn(pgn: string, filename = 'game.pgn'): void {
  const blob = new Blob([pgn], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
```

`src/lib/components/chess/PgnExport.svelte`:
```svelte
<script lang="ts">
  import { gameStore } from '$lib/stores/gameStore';
  import { generatePgn, downloadPgn } from '$lib/chess/notation/pgn';

  function handleExport() {
    const state = $gameStore;
    const pgn = generatePgn(state.moveHistory, {
      event: 'Chess 2.0 Game',
      site: 'https://chess2.example.com',
      date: new Date().toISOString().split('T')[0]
    });

    downloadPgn(pgn);
  }

  function handleCopyPgn() {
    const state = $gameStore;
    const pgn = generatePgn(state.moveHistory);
    navigator.clipboard.writeText(pgn);
    alert('PGN copied to clipboard!');
  }
</script>

<div class="pgn-controls">
  <button class="btn-secondary" onclick={handleExport}>
    Download PGN
  </button>

  <button class="btn-secondary" onclick={handleCopyPgn}>
    Copy PGN
  </button>
</div>

<style>
  .pgn-controls {
    @apply flex gap-2;
  }

  .btn-secondary {
    @apply px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-900 rounded-lg font-medium transition-colors;
  }
</style>
```

**Success Criteria**:
- PGN generates correctly
- Download works
- Clipboard copy works
- Metadata included

**Testing**:
- Export after several moves
- Verify PGN format valid
- Test download on different browsers
- Validate with PGN checker

**Git**: Commit to `feature/fen-pgn`

---

#### Task 2.9: PGN Import (Optional)
**Priority**: LOW
**Time**: 2 hours
**Prerequisites**: Task 2.8

**Actions**:
Add basic PGN import (if time permits)

**Files to Modify**:

`src/lib/chess/notation/pgn.ts` - Add parser:
```typescript
export function parsePgn(pgn: string): ChessMove[] | null {
  try {
    // Use chess.js built-in PGN parser
    const chess = new Chess();
    const loaded = chess.loadPgn(pgn);

    if (!loaded) return null;

    return chess.history({ verbose: true }) as ChessMove[];
  } catch (error) {
    console.error('PGN parse error:', error);
    return null;
  }
}
```

**Success Criteria**:
- Parse valid PGN strings
- Load moves into game
- Handle errors gracefully

**Testing**:
- Test with various PGN formats
- Test with invalid PGN
- Verify move replay

**Git**: Commit to `feature/fen-pgn`, create PR to master

---

### Day 9 (Thursday): Performance & Optimization

**Hours**: 7-8 hours

#### Task 2.10: Move Validation Performance Test
**Priority**: HIGH
**Time**: 3 hours
**Prerequisites**: Day 8 complete

**Actions**:
Benchmark and optimize move validation

**Files to Create**:

`src/tests/performance/moveValidation.bench.ts`:
```typescript
import { bench, describe } from 'vitest';
import { ChessGameService } from '$lib/chess/engine/ChessGameService';

describe('Move Validation Performance', () => {
  bench('getLegalMoves - starting position', () => {
    const service = new ChessGameService();
    service.getLegalMoves();
  });

  bench('getLegalDestinations - pawn', () => {
    const service = new ChessGameService();
    service.getLegalDestinations('e2');
  });

  bench('makeMove - simple pawn move', () => {
    const service = new ChessGameService();
    service.makeMove('e2', 'e4');
  });

  bench('complex position - middle game', () => {
    const service = new ChessGameService(
      'r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/3P1N2/PPP2PPP/RNBQK2R w KQkq - 0 1'
    );
    service.getLegalMoves();
  });

  bench('100 random moves', () => {
    const service = new ChessGameService();

    for (let i = 0; i < 100; i++) {
      const moves = service.getLegalMoves();
      if (moves.length === 0) break;

      // Make random move
      const randomMove = moves[Math.floor(Math.random() * moves.length)];
      // Parse move and make it (simplified)
    }
  });
});
```

**Package.json update**:
```json
{
  "scripts": {
    "bench": "vitest bench"
  }
}
```

**Success Criteria**:
- getLegalMoves < 10ms
- makeMove < 5ms
- Benchmarks run successfully

**Testing**:
```bash
bun run bench
```

**Git**: `git checkout -b perf/optimization`

---

#### Task 2.11: Board Rendering Optimization
**Priority**: MEDIUM
**Time**: 2 hours
**Prerequisites**: Task 2.10

**Actions**:
Optimize chessground rendering and updates

**Files to Modify**:

`src/lib/components/chess/Board.svelte` - Add optimizations:
```typescript
import { onMount, onDestroy, untrack } from 'svelte';

// Debounce position updates to prevent excessive re-renders
let updateTimeout: ReturnType<typeof setTimeout> | null = null;

function scheduleUpdate(fen: string) {
  if (updateTimeout) {
    clearTimeout(updateTimeout);
  }

  updateTimeout = setTimeout(() => {
    board?.set({ fen });
  }, 16); // ~60fps
}

// Use untrack for non-reactive reads
const unsubscribe = gameStore.subscribe(state => {
  if (board) {
    untrack(() => {
      board.set({
        fen: state.fen,
        turnColor: state.turn === 'w' ? 'white' : 'black',
        check: state.isCheck
      });
    });
  }
});
```

**Success Criteria**:
- Smooth piece animations (60fps)
- No jank during moves
- Low CPU usage

**Testing**:
- Performance profiler in browser
- Make 20+ quick moves
- Monitor frame rate

**Git**: Commit to `perf/optimization`

---

#### Task 2.12: Memory Leak Prevention
**Priority**: HIGH
**Time**: 2 hours
**Prerequisites**: Task 2.11

**Actions**:
Ensure proper cleanup and no memory leaks

**Files to Modify**:

Check all components for proper cleanup:

`src/lib/components/chess/Board.svelte`:
```typescript
onDestroy(() => {
  // Clear timeouts
  if (updateTimeout) {
    clearTimeout(updateTimeout);
  }

  // Unsubscribe from stores
  unsubscribe();

  // Destroy chessground instance
  board?.destroy();
  board = undefined;
});
```

**Files to Create**:

`src/tests/integration/memoryLeaks.test.ts`:
```typescript
import { describe, it, expect } from 'vitest';
import { render, cleanup } from '@testing-library/svelte';
import Board from '$lib/components/chess/Board.svelte';

describe('Memory Leak Prevention', () => {
  it('should cleanup board component properly', () => {
    const { component } = render(Board);

    // Re-render multiple times
    for (let i = 0; i < 10; i++) {
      cleanup();
      render(Board);
    }

    cleanup();

    // If we get here without errors, cleanup is working
    expect(true).toBe(true);
  });
});
```

**Success Criteria**:
- No memory leaks in dev tools
- Proper cleanup on component destroy
- Tests pass

**Testing**:
- Use Chrome DevTools Memory profiler
- Take heap snapshots before/after
- Verify memory usage stable

**Git**: Commit to `perf/optimization`, create PR to master

---

### Day 10 (Friday): Testing & Documentation

**Hours**: 6-8 hours

#### Task 2.13: Comprehensive Unit Tests
**Priority**: CRITICAL
**Time**: 3 hours
**Prerequisites**: Day 9 complete

**Actions**:
Achieve 90%+ test coverage

**Files to Create**:

Add missing tests for all components and services:

`src/tests/unit/GameStatus.test.ts`
`src/tests/unit/GameControls.test.ts`
`src/tests/unit/BoardContainer.test.ts`
`src/tests/unit/pgn.test.ts`
`src/tests/unit/fen.test.ts`

**Success Criteria**:
- 90%+ code coverage
- All critical paths tested
- Edge cases covered

**Testing**:
```bash
bun run test:coverage
```

**Git**: `git checkout -b test/comprehensive`

---

#### Task 2.14: Integration Tests
**Priority**: HIGH
**Time**: 2 hours
**Prerequisites**: Task 2.13

**Actions**:
Test full user flows

**Files to Create**:

`src/tests/integration/fullGame.test.ts`:
```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { render, fireEvent, screen } from '@testing-library/svelte';
import GamePage from '$src/routes/+page.svelte';
import { gameStore } from '$lib/stores/gameStore';

describe('Full Game Flow', () => {
  beforeEach(() => {
    gameStore.reset();
  });

  it('should complete a full game', async () => {
    render(GamePage);

    // Make moves programmatically
    gameStore.makeMove('e2', 'e4');
    gameStore.makeMove('e7', 'e5');

    // Verify move history updates
    expect(screen.getByText('e4')).toBeTruthy();
    expect(screen.getByText('e5')).toBeTruthy();
  });

  it('should handle undo and reset', async () => {
    render(GamePage);

    gameStore.makeMove('e2', 'e4');
    const undoBtn = screen.getByText('↶ Undo');
    await fireEvent.click(undoBtn);

    expect(screen.getByText('No moves yet')).toBeTruthy();
  });
});
```

**Success Criteria**:
- All user flows tested
- Tests run reliably
- Good coverage of interactions

**Testing**:
```bash
bun run test integration
```

**Git**: Commit to `test/comprehensive`

---

#### Task 2.15: Update Documentation
**Priority**: MEDIUM
**Time**: 2 hours
**Prerequisites**: Task 2.14

**Actions**:
Document chess features and API

**Files to Create**:

`claudedocs/chess-api.md`:
```markdown
# Chess API Documentation

## ChessGameService

Main service for chess game logic.

### Methods

#### `getState(): GameState`
Returns current game state including FEN, turn, check status, etc.

#### `makeMove(from: Square, to: Square, promotion?: string): ChessMove | null`
Attempts to make a move. Returns move object or null if invalid.

... (continue documenting all methods)
```

**Files to Modify**:

`README.md` - Update roadmap:
```markdown
## Development Roadmap

- [x] Project initialization
- [x] Tailwind CSS setup
- [x] Chess board UI component
- [x] Move validation logic
- [x] Game state management
- [x] Special moves (castling, en passant, promotion)
- [x] FEN/PGN support
- [x] Comprehensive testing (90%+ coverage)
- [ ] Challenge system (Week 3)
- [ ] AI integration (Week 4)
...
```

**Success Criteria**:
- All features documented
- API reference complete
- README up to date

**Git**: Commit to `test/comprehensive`, create PR to master

---

### Week 2 Summary

**Deliverables**:
- ✅ Special moves (castling, en passant, promotion)
- ✅ Check/checkmate/stalemate detection
- ✅ FEN import/export
- ✅ PGN export (import optional)
- ✅ Performance optimization (<10ms moves)
- ✅ 90%+ test coverage
- ✅ Updated documentation

**Git Branches Merged**:
- `feature/special-moves`
- `feature/check-detection`
- `feature/fen-pgn`
- `perf/optimization`
- `test/comprehensive`

**Lines of Code**: ~3,000-3,500 (cumulative: ~5,500)
**Test Coverage**: 90%+
**Performance**: <10ms move validation, 60fps rendering

**Blockers**: None expected
**Risks**: PGN import may be complex, can defer to Week 5

---

## Week 3: Challenge System & UI

**Goal**: Implement challenge-based gameplay system

**Total Hours**: 35-40 hours

*(Continue with Week 3-5 in next section...)*

---

## Git Workflow Strategy

### Branch Naming Convention

```
feature/   - New features (feature/board-component)
fix/       - Bug fixes (fix/move-validation)
perf/      - Performance improvements (perf/optimization)
test/      - Testing additions (test/comprehensive)
setup/     - Configuration (setup/dependencies)
docs/      - Documentation only (docs/api-reference)
```

### Commit Message Format

```
<type>: <short summary> (<scope>)

<optional body>

<optional footer>
```

**Types**: feat, fix, perf, test, docs, style, refactor

**Examples**:
```
feat: add pawn promotion modal (chess)
fix: prevent castling through check (validation)
perf: optimize board rendering to 60fps (ui)
test: add castling edge case tests (chess)
docs: update README with FEN/PGN support (readme)
```

### PR Strategy

**Small PRs**: 1-2 days of work maximum
**Review before merge**: All PRs require passing tests
**Merge frequency**: Merge to master 2-3 times per week

### Branch Lifecycle

```
Day 1: Create feature branch
Day 1-2: Develop and commit
Day 2-3: Create PR, address feedback
Day 3: Merge to master
```

---

## Quality Gates & Definition of Done

### Definition of Done (DoD)

A task is DONE when:

1. ✅ **Code Complete**: All planned functionality implemented
2. ✅ **Tests Pass**: All existing and new tests pass (`bun run test`)
3. ✅ **Type Safe**: No TypeScript errors (`bun run check`)
4. ✅ **Linted**: Code follows style guide (`bun run lint`)
5. ✅ **Coverage**: New code has 80%+ test coverage
6. ✅ **Documented**: Public APIs documented in code comments
7. ✅ **Manual Test**: Feature verified manually in browser
8. ✅ **Performance**: Meets performance targets (where applicable)
9. ✅ **Accessible**: Keyboard navigation works (where applicable)
10. ✅ **Committed**: Changes committed with descriptive message

### Quality Checkpoints

**Before starting day**:
- Pull latest master
- Run `bun run check` to ensure no errors
- Run `bun run test` to ensure tests pass

**Before committing**:
```bash
bun run check   # TypeScript validation
bun run lint    # Code style
bun run test    # Run tests
```

**Before PR**:
```bash
bun run test:coverage  # Verify coverage
bun run build          # Ensure builds successfully
```

**Before merging**:
- All tests pass
- PR reviewed (if team collaboration)
- Documentation updated
- README updated (if needed)

---

## Critical Path Analysis

### Blocking Dependencies

**Critical Path (must complete in order)**:

```
Week 1 → Week 2 → Week 3 → Week 4 → Week 5
  ↓        ↓        ↓        ↓        ↓
Board → Validation → Challenges → AI → Polish
```

**Week 1 Blockers**:
- Task 1.1-1.4: MUST complete Day 1 (foundation)
- Task 1.5-1.8: Board rendering blocks everything
- Task 1.9-1.11: Chess logic blocks Week 2

**Week 2 Blockers**:
- Task 2.1-2.3: Special moves block complete gameplay
- Task 2.4-2.6: Game state blocks challenge system

**Week 3 Blockers**:
- Challenge system blocks AI integration
- UI components block Week 4

**Week 4 Blockers**:
- Stockfish integration blocks scoring system
- AI analysis blocks challenge completion

**Week 5 Blockers**:
- None - polish and testing can be parallel

### Parallel Work Opportunities

**Week 1**:
- Day 4: UI components can be built in parallel with chess service
- Day 5: Testing can start while UI is being polished

**Week 2**:
- Day 7-8: FEN/PGN can be developed in parallel with check detection
- Day 9: Performance testing parallel with feature completion

**Week 3**:
- Challenge data can be created while UI is being developed
- Multiple challenge types can be built in parallel

**Week 4**:
- AI integration and scoring system can be parallel
- UI polish can happen while AI is integrating

**Week 5**:
- All polish tasks are parallelizable
- Testing and bug fixes can overlap

---

## Risk Mitigation

### High Risk Areas

#### 1. Chessground CSS Integration (Week 1)
**Risk**: CSS conflicts, missing assets, styling issues
**Probability**: Medium
**Impact**: High (blocks board rendering)
**Mitigation**:
- Copy assets to static directory early
- Test on multiple browsers immediately
- Have fallback: build custom board if needed

#### 2. Stockfish.js Performance (Week 4)
**Risk**: Slow analysis, browser hangs, memory issues
**Probability**: Medium
**Impact**: High (blocks AI features)
**Mitigation**:
- Use Web Workers for analysis
- Set timeout limits (5 seconds max)
- Fallback: reduce analysis depth
- Test early in Week 4, Day 1

#### 3. Test Coverage Target (Week 2)
**Risk**: Can't reach 90% coverage in time
**Probability**: Low
**Impact**: Medium
**Mitigation**:
- Write tests as features are built (not after)
- Focus on critical paths first
- Accept 80% coverage if time runs short

#### 4. Chessground Learning Curve (Week 1)
**Risk**: API unfamiliar, poor documentation
**Probability**: Low
**Impact**: Medium
**Mitigation**:
- Use Context7 for official docs
- Reference chessground examples
- Budget extra time Day 2-3

### Medium Risk Areas

#### 5. PGN Import Complexity (Week 2)
**Risk**: PGN parsing is complex
**Probability**: Medium
**Impact**: Low (feature is optional for MVP)
**Mitigation**:
- Use chess.js built-in parser
- Make import optional
- Defer to Week 5 if needed

#### 6. Mobile Responsiveness (Week 3)
**Risk**: Touch interactions don't work well
**Probability**: Low
**Impact**: Medium
**Mitigation**:
- Test mobile early and often
- Chessground has touch support built-in
- Fallback: click-to-move on mobile

#### 7. Challenge Difficulty Balancing (Week 3)
**Risk**: Challenges too easy/hard
**Probability**: Low
**Impact**: Low (can adjust in Week 5)
**Mitigation**:
- Start with clear difficulty labels
- Get user feedback early
- Iterate in Week 5

### Contingency Plans

**If Week 1 behind schedule**:
- Simplify UI components (basic buttons, minimal styling)
- Defer code quality tools to Week 2
- Focus on core board + validation

**If Week 2 behind schedule**:
- Defer PGN import to Week 5
- Reduce performance optimization scope
- Focus on correctness over speed

**If Week 3 behind schedule**:
- Reduce initial challenge count (3-4 instead of 10)
- Simplify challenge UI
- Defer challenge editor to post-MVP

**If Week 4 behind schedule**:
- Reduce Stockfish analysis depth
- Simplify scoring algorithm
- Make AI analysis optional feature

**If Week 5 behind schedule**:
- Focus on critical bugs only
- Defer accessibility enhancements
- Skip animations/polish

---

## Success Criteria

### MVP Completion Checklist

**Core Chess Functionality**:
- [ ] Board renders correctly on desktop/mobile
- [ ] All piece movements work (pawns, knights, bishops, rooks, queens, kings)
- [ ] Special moves work (castling, en passant, promotion)
- [ ] Check/checkmate/stalemate detection accurate
- [ ] Move validation prevents illegal moves
- [ ] FEN import/export functional
- [ ] PGN export functional
- [ ] Move history displays correctly

**Challenge System**:
- [ ] 5+ unique challenge types implemented
- [ ] Challenge selection UI functional
- [ ] Challenge progress tracked
- [ ] Challenge completion detected
- [ ] Scoring system works
- [ ] Leaderboard displays (if multiplayer)

**AI Integration**:
- [ ] Stockfish analyzes positions (<5 seconds)
- [ ] Move suggestions provided
- [ ] Position evaluation shown
- [ ] Analysis doesn't block UI

**Quality**:
- [ ] 80%+ test coverage (target: 90%)
- [ ] No TypeScript errors
- [ ] No ESLint errors
- [ ] <100ms move validation latency
- [ ] 60fps board rendering
- [ ] Works on Chrome, Firefox, Safari
- [ ] Mobile responsive

**Documentation**:
- [ ] README up to date
- [ ] API documented
- [ ] User guide created (basic)
- [ ] Known issues documented

### Launch Readiness

**Before production deployment**:
- [ ] All MVP features complete
- [ ] All tests passing
- [ ] Performance benchmarks met
- [ ] Accessibility basics implemented
- [ ] Error handling robust
- [ ] Loading states added
- [ ] Production build tested
- [ ] Environment variables configured

---

## Appendix: Useful Commands

### Development
```bash
bun run dev              # Start dev server
bun run dev -- --open    # Start and open browser
bun run build            # Production build
bun run preview          # Preview production build
```

### Testing
```bash
bun run test             # Run tests
bun run test:ui          # Run tests with UI
bun run test:coverage    # Generate coverage report
bun run bench            # Run performance benchmarks
```

### Quality
```bash
bun run check            # TypeScript validation
bun run check:watch      # TypeScript watch mode
bun run lint             # Run ESLint
bun run format           # Format with Prettier
```

### Git
```bash
git checkout -b feature/name    # Create feature branch
git add .                       # Stage changes
git commit -m "type: message"   # Commit with message
git push -u origin feature/name # Push and track
gh pr create                    # Create PR (GitHub CLI)
```

---

## End of Roadmap - Weeks 1-2

*(Weeks 3-5 detailed implementation continues in next document or section)*

**Document Version**: 1.0
**Last Updated**: 2025-10-14
**Status**: Ready for Implementation
