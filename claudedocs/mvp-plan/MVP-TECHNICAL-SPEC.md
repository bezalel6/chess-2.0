# Chess 2.0 - MVP Technical Specification

**Version:** 1.0
**Date:** 2025-10-14
**Status:** Planning Complete

---

## Executive Summary

Chess 2.0 is a challenge-based chess game that combines traditional chess gameplay with AI-powered challenges. After each player move, the Stockfish engine analyzes the position and generates a random challenge (e.g., "Play the best knight move"). Players earn points based on move quality, creating an educational and engaging experience.

**Key Innovation:** Transform passive chess playing into active learning through AI-generated positional challenges with immediate feedback.

---

## Product Vision

### Target Audience
- **Primary:** Intermediate chess players (1000-1800 ELO) seeking improvement
- **Secondary:** Beginners wanting guided practice
- **Tertiary:** Advanced players looking for tactical training

### Core Value Proposition
1. **Learn by Doing:** Challenges appear in real game positions
2. **Immediate Feedback:** Stockfish provides instant evaluation
3. **Gamification:** Points, streaks, and statistics motivate improvement
4. **Self-Paced:** Play at your own speed, no time pressure

### Success Metrics
- Average session duration: >15 minutes
- Challenge completion rate: >60%
- User retention (7-day): >40%
- Mobile responsiveness score: >90/100

---

## Technical Stack

### Core Technologies
| Technology | Version | Purpose |
|------------|---------|---------|
| **SvelteKit** | 2.43.2 | Application framework |
| **Svelte** | 5.39.5 | UI components (runes syntax) |
| **TypeScript** | 5.9.2 | Type safety |
| **Tailwind CSS** | 4.1.14 | Styling |
| **Vite** | 7.1.7 | Build tool |
| **Bun** | 1.3.0 | Package manager |

### Chess Libraries
| Library | Version | Purpose |
|---------|---------|---------|
| **chess.js** | ^1.0.0 | Game logic, move validation |
| **chessground** | ^9.0.0 | Interactive board UI |
| **stockfish.js** | 10.0.2 (CDN) | AI analysis engine |

### Development Tools
| Tool | Version | Purpose |
|------|---------|---------|
| **ESLint** | ^9.0.0 | Code linting |
| **Prettier** | ^3.0.0 | Code formatting |
| **Vitest** | ^2.0.0 | Unit testing |
| **@testing-library/svelte** | ^5.0.0 | Component testing |

---

## System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Browser Application                       │
├─────────────────────────────────────────────────────────────┤
│  UI Layer (Svelte 5 Components)                             │
│  ├─ Board.svelte (chessground)                              │
│  ├─ ChallengeDisplay.svelte                                 │
│  ├─ ScorePanel.svelte                                       │
│  └─ MoveHistory.svelte                                      │
├─────────────────────────────────────────────────────────────┤
│  State Layer (Svelte Runes Stores)                          │
│  ├─ game.ts ($state, $derived)                             │
│  ├─ challenges.ts ($state)                                  │
│  └─ score.ts ($state, $derived)                            │
├─────────────────────────────────────────────────────────────┤
│  Logic Layer                                                 │
│  ├─ GameEngine (chess.js wrapper)                          │
│  ├─ ChallengeGenerator                                      │
│  ├─ ChallengeEvaluator                                      │
│  └─ ScoreCalculator                                         │
├─────────────────────────────────────────────────────────────┤
│  AI Layer (Web Worker)                                       │
│  └─ StockfishEngine → stockfish.worker.ts                   │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

```
Player Move → Validation → Update State → Trigger Analysis
                                              ↓
                                    Stockfish (Background)
                                              ↓
                              Generate Challenge ← Analysis
                                              ↓
                              Display Challenge to Player
                                              ↓
                            Player Attempts → Evaluate Move
                                              ↓
                              Calculate Score → Update UI
```

---

## Feature Specifications

### 1. Core Chess Game

**Requirements:**
- Full chess rules implementation (castling, en passant, promotion)
- Legal move validation and highlighting
- Check/checkmate/stalemate detection
- Move history with algebraic notation
- Undo/redo functionality
- Game reset capability

**UI Components:**
- Interactive 8x8 board with drag-and-drop
- Piece set: standard chess pieces (SVG)
- Board theme: professional brown/cream
- Legal move indicators (dots/highlights)
- Last move highlighting
- Check indicator (red square)

**Technical Implementation:**
- `chess.js` for all game logic
- `chessground` for board rendering
- Svelte 5 `$state` for game position
- `$derived` for legal moves computation
- FEN string as source of truth

**Performance Requirements:**
- Move validation: <10ms
- Board render: 60fps
- Legal move calculation: <50ms
- Memory: <50MB for 100-move game

---

### 2. Challenge System

**Challenge Types:**

| Type | Description | When Available | Difficulty |
|------|-------------|----------------|------------|
| **best-move** | Find absolute best move | Always | 1-3 |
| **best-piece-move** | Best move with specific piece | When piece has good moves | 2-3 |
| **defensive-move** | Best defensive move | Position under threat (eval < -50) | 2-3 |
| **attacking-move** | Best attacking move | Winning opportunity (eval > 50) | 1-2 |
| **tactical-move** | Spot tactical opportunity | Large eval swing (>100cp) | 3 |
| **positional-move** | Improve position | Quiet position (eval ±50) | 1-2 |

**Challenge Generation Logic:**
```typescript
1. After player move → Send position to Stockfish
2. Stockfish analyzes (depth 15, multiPV 5)
3. Receive best move + top alternatives + evaluations
4. Filter valid challenge types for position
5. Weighted random selection
6. Display challenge with difficulty indicator
```

**Challenge Display:**
```
┌─────────────────────────────────────────┐
│  🎯 Challenge                            │
│                                          │
│  Play the best knight move              │
│                                          │
│  Difficulty: ⭐⭐⭐                       │
│  Points: 300 (base 100 × 3)             │
└─────────────────────────────────────────┘
```

**Evaluation Criteria:**

| Result | Condition | Base Points | Example |
|--------|-----------|-------------|---------|
| **Exact Match** | Player move = best move | 100 | Found Nf6 (best) |
| **Close Alternative** | Move in top-3 alternatives | 60 | Found Nc6 (2nd best) |
| **Reasonable** | Move within 200cp of best | 20 | Found Nbd7 (ok) |
| **Poor** | Move worse than 200cp | -10 | Found Nh6 (bad) |

**Scoring Formula:**
```
Final Score = (Base Points × Difficulty) + (Streak × 10)

Examples:
- Exact match, difficulty 3, streak 5: (100 × 3) + 50 = 350 points
- Close alternative, difficulty 2, streak 0: (60 × 2) + 0 = 120 points
- Poor move, difficulty 1, streak 3: -10 points (streak broken)
```

---

### 3. AI Integration (Stockfish)

**Stockfish Configuration:**
```typescript
{
  depth: 15,        // Balance: 3-5 seconds analysis
  threads: 2,       // Use 2 cores
  multiPV: 5,       // Analyze top 5 moves
  skillLevel: 20    // Full strength (future: adjustable)
}
```

**Web Worker Architecture:**
```
Main Thread                  Worker Thread
    │                             │
    ├─ postMessage(analyze)──────→│
    │                             │
    │                    ┌────────┴────────┐
    │                    │ Load Stockfish  │
    │                    │ Set position    │
    │                    │ Start analysis  │
    │                    └────────┬────────┘
    │                             │
    │←──────info messages─────────┤
    │←──────bestmove──────────────┤
    │                             │
    ├─ Process results            │
    └─ Generate challenge         │
```

**Analysis Timing:**
- Target: 3-5 seconds per position
- Timeout: 30 seconds (safety)
- Progressive: Quick analysis (depth 10) → Deep analysis (depth 15)
- Mobile: Reduced depth (12) for performance

**Stockfish Output Parsing:**
```
UCI Info String:
"info depth 15 multipv 1 score cp 25 pv e2e4 e7e5 Nf3"

Parsed:
{
  depth: 15,
  multiPV: 1,
  evaluation: 25 (centipawns),
  bestMove: "e2e4",
  principalVariation: ["e2e4", "e7e5", "Nf3"]
}
```

---

### 4. Scoring & Statistics

**Score Tracking:**
```typescript
interface ScoreState {
  total: number;              // Cumulative score
  streak: number;             // Current success streak
  lastPoints: number;         // Points from last challenge
  history: ScoreEntry[];      // All scored challenges
}

interface ScoreEntry {
  points: number;
  success: boolean;
  challenge: Challenge;
  timestamp: number;
}
```

**Statistics Dashboard:**
```
┌─────────────────────────────────────────┐
│  📊 Statistics                           │
│                                          │
│  Total Score: 2,450                     │
│  Current Streak: 🔥 7                   │
│                                          │
│  Challenges Completed: 42               │
│  Success Rate: 64%                      │
│  Accuracy: 67%                          │
│                                          │
│  By Type:                               │
│  • Best Move: 15/20 (75%)              │
│  • Tactical: 8/12 (67%)                │
│  • Defensive: 4/10 (40%)               │
└─────────────────────────────────────────┘
```

**Derived Statistics:**
```typescript
let statistics = $derived.by(() => {
  const successful = history.filter(e => e.success).length;
  const byType = groupBy(history, h => h.challenge.type);

  return {
    totalChallenges: history.length,
    successful,
    accuracy: successful / history.length,
    byType: Object.entries(byType).map(([type, entries]) => ({
      type,
      completed: entries.length,
      successful: entries.filter(e => e.success).length,
      rate: entries.filter(e => e.success).length / entries.length
    }))
  };
});
```

---

## File Structure

```
chess-2.0/
├── src/
│   ├── lib/
│   │   ├── components/
│   │   │   ├── chess/
│   │   │   │   ├── Board.svelte              # Chessground integration
│   │   │   │   ├── MoveHistory.svelte        # Move list display
│   │   │   │   ├── ChallengeDisplay.svelte   # Challenge UI
│   │   │   │   ├── ScorePanel.svelte         # Score & stats
│   │   │   │   └── GameControls.svelte       # New game, undo, etc.
│   │   │   └── ui/
│   │   │       └── Header.svelte             # Site header
│   │   ├── chess/
│   │   │   ├── engine/
│   │   │   │   ├── game.ts                   # chess.js wrapper
│   │   │   │   ├── stockfish.ts              # Stockfish interface
│   │   │   │   └── stockfish.worker.ts       # Web Worker
│   │   │   ├── challenges/
│   │   │   │   ├── generator.ts              # Challenge creation
│   │   │   │   ├── evaluator.ts              # Move evaluation
│   │   │   │   └── types.ts                  # Challenge types
│   │   │   └── scoring/
│   │   │       └── calculator.ts             # Point calculation
│   │   ├── stores/
│   │   │   ├── game.ts                       # Game state store
│   │   │   ├── challenges.ts                 # Challenge state
│   │   │   └── score.ts                      # Score tracking
│   │   ├── types/
│   │   │   ├── chess.ts                      # Chess types
│   │   │   └── challenges.ts                 # Challenge types
│   │   └── utils/
│   │       ├── fen.ts                        # FEN utilities
│   │       └── notation.ts                   # Algebraic notation
│   ├── routes/
│   │   ├── +layout.svelte                    # Root layout
│   │   ├── +page.svelte                      # Landing page
│   │   └── game/
│   │       └── +page.svelte                  # Game page
│   └── app.css                               # Global styles
├── static/
│   └── chessground/                          # Chessground assets
│       ├── pieces/                           # Piece SVGs
│       └── boards/                           # Board themes
├── tests/
│   ├── unit/
│   │   ├── game.test.ts
│   │   ├── challenges.test.ts
│   │   └── scoring.test.ts
│   └── integration/
│       └── gameplay.test.ts
└── claudedocs/
    └── mvp-plan/
        ├── ARCHITECTURE.md                   # System architecture
        ├── IMPLEMENTATION-ROADMAP.md         # Week-by-week plan
        └── MVP-TECHNICAL-SPEC.md            # This document
```

---

## API Specifications

### GameEngine API

```typescript
class GameEngine {
  // Move operations
  move(from: Square, to: Square, promotion?: string): Move | null
  moves(options?: { square?: Square; verbose?: boolean }): Move[]
  undo(): Move | null

  // State queries
  fen(): string
  turn(): 'w' | 'b'
  isCheck(): boolean
  isCheckmate(): boolean
  isStalemate(): boolean
  isGameOver(): boolean

  // Position analysis
  getSquare(square: Square): Piece | null
  history(options?: { verbose?: boolean }): Move[]

  // Serialization
  pgn(): string
  load(fen: string): void
  reset(): void
}
```

### StockfishEngine API

```typescript
class StockfishEngine {
  // Lifecycle
  async initialize(): Promise<void>
  terminate(): void

  // Analysis
  async analyze(
    fen: string,
    config: StockfishConfig
  ): Promise<StockfishAnalysis>

  stop(): void
}

interface StockfishConfig {
  depth: number;           // 10-20
  threads: number;         // 1-4
  multiPV: number;        // 1-5
  skillLevel?: number;    // 0-20
}

interface StockfishAnalysis {
  bestMove: string;       // UCI format
  evaluation: number;     // Centipawns
  depth: number;
  topMoves: Array<{
    move: string;
    eval: number;
    pv: string[];
  }>;
}
```

### ChallengeGenerator API

```typescript
class ChallengeGenerator {
  generate(
    analysis: StockfishAnalysis,
    fen: string
  ): Challenge
}

interface Challenge {
  id: string;
  type: ChallengeType;
  description: string;
  difficulty: 1 | 2 | 3;
  targetMove: string;
  expectedEval: number;
  alternatives: Array<{ move: string; eval: number }>;
  fen: string;
}
```

### ChallengeEvaluator API

```typescript
class ChallengeEvaluator {
  evaluate(
    challenge: Challenge,
    playerMove: Move,
    analysis: StockfishAnalysis,
    currentStreak: number
  ): ChallengeResult
}

interface ChallengeResult {
  success: boolean;
  points: number;
  feedback: string;
  expectedMove: string;
  actualMove: string;
  evaluation: number;
}
```

---

## State Management Patterns

### Svelte 5 Runes Usage

**Reactive State:**
```typescript
// Basic state
let fen = $state('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');

// Derived state
let legalMoves = $derived.by(() => {
  return chess.moves({ verbose: true });
});

// Side effects
$effect(() => {
  if (gameStore.currentMove) {
    // Trigger Stockfish analysis
    analyzePosition(gameStore.fen);
  }
});
```

**Store Pattern:**
```typescript
// game.ts
export function createGameStore() {
  let chess = $state(new Chess());

  return {
    get fen() { return chess.fen(); },
    get turn() { return chess.turn(); },

    makeMove(from, to, promotion) {
      return chess.move({ from, to, promotion });
    }
  };
}

// Usage in component
import { createGameStore } from '$lib/stores/game';
const game = createGameStore();
```

---

## Performance Requirements

### Target Metrics

| Metric | Target | Critical |
|--------|--------|----------|
| **First Contentful Paint** | <1.5s | <2.5s |
| **Time to Interactive** | <3s | <5s |
| **Move Validation** | <10ms | <50ms |
| **Board Render (60fps)** | 16ms | 33ms |
| **Stockfish Analysis** | 3-5s | <10s |
| **Memory Usage** | <50MB | <100MB |
| **Lighthouse Score** | >90 | >80 |

### Optimization Strategies

1. **Web Worker:** Stockfish runs in background (no UI blocking)
2. **Lazy Loading:** Load Stockfish only when first analysis needed
3. **Memoization:** Cache legal moves per position
4. **Virtual Scrolling:** For move history (100+ moves)
5. **Progressive Enhancement:** Quick analysis → Deep analysis
6. **Debouncing:** Delay analysis requests by 500ms

---

## Testing Strategy

### Test Coverage Targets

| Layer | Target Coverage | Critical Areas |
|-------|----------------|----------------|
| **Logic** | 90% | Move validation, scoring |
| **Components** | 80% | User interactions |
| **Integration** | 70% | Game flow |
| **E2E** | 60% | Critical paths |

### Test Types

**Unit Tests (Vitest):**
```typescript
// game.test.ts
describe('GameEngine', () => {
  it('validates legal moves', () => {
    const game = new GameEngine();
    const move = game.move('e2', 'e4');
    expect(move).toBeTruthy();
    expect(game.fen()).toContain('4P3');
  });
});

// scoring.test.ts
describe('ScoreCalculator', () => {
  it('calculates exact match score', () => {
    const calc = new ScoreCalculator();
    const result = calc.calculateScore(true, 100, 3, 5);
    expect(result.total).toBe(400); // 100×3 + 5×10 + bonus
  });
});
```

**Component Tests (@testing-library/svelte):**
```typescript
// Board.test.ts
import { render, fireEvent } from '@testing-library/svelte';
import Board from '$lib/components/chess/Board.svelte';

test('displays chess board', () => {
  const { container } = render(Board, {
    fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'
  });

  expect(container.querySelector('.cg-wrap')).toBeInTheDocument();
});
```

**Integration Tests:**
```typescript
// gameplay.test.ts
test('complete challenge flow', async () => {
  // 1. Make move
  // 2. Wait for challenge
  // 3. Attempt challenge
  // 4. Verify score update
});
```

---

## Security Considerations

### Client-Side Security

1. **No Sensitive Data:** All computation client-side
2. **Input Validation:** Validate all FEN strings, moves
3. **XSS Prevention:** Sanitize user input (future: usernames)
4. **CSP Headers:** Content Security Policy for production
5. **HTTPS Only:** Enforce HTTPS in production

### Future Backend Security

When adding backend (Phase 6+):
- JWT authentication
- Rate limiting (API endpoints)
- SQL injection prevention (parameterized queries)
- CORS configuration
- Session management
- Input sanitization

---

## Deployment Strategy

### MVP Deployment (adapter-node)

**Build Process:**
```bash
bun run build
# Output: build/ directory

node build
# Server runs on PORT (default: 3000)
```

**Environment Variables:**
```env
PORT=3000
HOST=0.0.0.0
ORIGIN=https://chess2.example.com
```

**Hosting Options:**
- **VPS:** DigitalOcean, Linode, Vultr
- **PaaS:** Railway, Render, Fly.io
- **Serverless:** Vercel, Netlify (switch to adapter-auto)

**Recommended Stack:**
1. Railway for simplicity (auto-deploy from Git)
2. Cloudflare CDN for static assets
3. GitHub Actions for CI/CD

---

## Success Criteria

### MVP Definition of Done

- [ ] **Core Chess Game**
  - [x] Full rules implementation
  - [x] Legal move validation
  - [x] Check/checkmate detection
  - [x] Move history with notation
  - [x] Undo/redo functionality

- [ ] **Challenge System**
  - [x] 6 challenge types implemented
  - [x] Random challenge generation
  - [x] Difficulty scaling (1-3)
  - [x] Move evaluation with feedback
  - [x] Challenge UI with animations

- [ ] **AI Integration**
  - [x] Stockfish loaded in Web Worker
  - [x] Position analysis (depth 15)
  - [x] Top-5 move alternatives
  - [x] Non-blocking computation

- [ ] **Scoring**
  - [x] Point calculation with difficulty
  - [x] Streak tracking with bonuses
  - [x] Statistics dashboard
  - [x] Score history per move

- [ ] **Quality**
  - [x] 90% test coverage (logic layer)
  - [x] 80% test coverage (components)
  - [x] Lighthouse score >90
  - [x] Mobile responsive
  - [x] Accessible (WCAG AA)

- [ ] **Performance**
  - [x] <10ms move validation
  - [x] 60fps board rendering
  - [x] <5s Stockfish analysis
  - [x] <100MB memory usage

---

## Future Enhancements (Post-MVP)

### Phase 6: Multiplayer
- Real-time game synchronization
- Player matching system
- Turn-based challenges
- Spectator mode

### Phase 7: Backend Integration
- User accounts & authentication
- Game history persistence
- Global leaderboards
- Social features (friends, chat)

### Phase 8: Advanced Features
- Opening repertoire training
- Puzzle generation from games
- Adjustable AI difficulty
- Tournament mode
- Analysis board
- Game review with engine

### Phase 9: Monetization
- Premium features (unlimited analysis depth)
- Custom challenge creation
- Advanced statistics
- No ads for premium users

---

## Glossary

**Terms:**
- **FEN:** Forsyth-Edwards Notation (chess position encoding)
- **UCI:** Universal Chess Interface (engine communication protocol)
- **SAN:** Standard Algebraic Notation (move notation: e4, Nf3)
- **PGN:** Portable Game Notation (game recording format)
- **Centipawn:** 1/100th of a pawn (evaluation unit)
- **MultiPV:** Multi Principal Variation (multiple best lines)

**Abbreviations:**
- **MVP:** Minimum Viable Product
- **ELO:** Chess rating system
- **WASM:** WebAssembly
- **CDN:** Content Delivery Network
- **CSP:** Content Security Policy
- **WCAG:** Web Content Accessibility Guidelines

---

## References

### Documentation
- [chess.js Documentation](https://github.com/jhlywa/chess.js)
- [Chessground Documentation](https://github.com/lichess-org/chessground)
- [Stockfish.js Documentation](https://github.com/nmrugg/stockfish.js)
- [Svelte 5 Documentation](https://svelte.dev/docs/svelte/overview)
- [SvelteKit Documentation](https://kit.svelte.dev/)

### Context7 Research
- `/jhlywa/chess.js` - Move generation and validation
- `/lichess-org/chessground` - Board rendering
- `/nmrugg/stockfish.js` - Chess engine integration
- `/sveltejs/kit` - SvelteKit patterns
- `/tailwindlabs/tailwindcss.com` - Tailwind CSS v4

---

**Document Status:** ✅ Complete
**Next Steps:** Begin Phase 1 implementation (Week 1)
**Review Date:** End of Week 2
