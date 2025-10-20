# Chess 2.0

A modern chess application with professional Stockfish analysis. Clean, minimal interface with powerful features.

## Tech Stack

- **Framework**: SvelteKit 2.43.2 with Svelte 5.39.5 (using new runes system)
- **Language**: TypeScript 5.9.2
- **Styling**: Tailwind CSS 4.1.14
- **Chess Logic**: chess.js 1.0.0
- **Board UI**: chessground 9.0.0
- **Analysis Engine**: Stockfish 17.1 (WASM multithreaded)

## Installation

```bash
bun install
```

## Development

```bash
bun run dev
```

Navigate to `http://localhost:5173`

## Build

```bash
bun run build
```

Builds the application using `@sveltejs/adapter-node` for self-hosting. Creates a production-ready Node.js server in the `build/` directory.

## Deployment

### Self-Hosting (Node.js)

The project is configured for self-hosting with adapter-node:

```bash
bun run build
node build  # Runs on port 3000 by default
```

Environment variables:
- `PORT` - Server port (default: 3000)
- `HOST` - Server host (default: 0.0.0.0)
- `ORIGIN` - Origin URL for CSRF protection

### GitHub Pages

For static deployment to GitHub Pages, switch to `@sveltejs/adapter-static` in `svelte.config.js`.

### Local Preview

```bash
bun run build
bun run preview  # Preview production build locally
```

## Features

### Core Chess
- Full chess rules implementation with chess.js
- Interactive drag-and-drop board using chessground
- Lichess.org blue board theme
- Legal move highlighting and validation
- Check, checkmate, and stalemate detection
- Pawn promotion dialog with piece selection

### Engine & Analysis
- **Stockfish 17.1 WASM** - Multithreaded engine running entirely in the browser
- **Real-time Position Analysis** - Continuous evaluation as you play
- **Interactive Best Move** - Click the suggested move to play it instantly
- **Evaluation Display** - Centipawn and mate evaluations from current player's perspective
- **Principal Variation** - Shows best continuation line with SAN notation
- **Analysis Metrics** - Depth, nodes searched, and nodes per second
- **Configurable Settings** - Adjustable search depth, threads, and hash size
- **Persistent State** - Analysis preferences saved to localStorage

### UI & UX
- **Modern Dark Theme** - Cohesive color palette optimized for long sessions
- **Responsive Layout** - Adapts seamlessly to desktop and mobile devices
- **Move History Panel** - Scrollable list with standard chess notation
- **Sound Effects** - Move, capture, and check sounds (can play simultaneously)
- **Game Controls** - New game, undo move, and position management
- **FEN Support** - Import and export positions using FEN notation
- **Turn Indicator** - Clear display of whose turn it is
- **Status Display** - Shows check, checkmate, stalemate, and draw states
- **Testimonials** - Rotating quotes from chess personalities (with humor)

## Usage & Interactions

### Playing Chess
- **Drag and Drop** - Click and drag pieces to make moves
- **Click-Click** - Click a piece, then click destination square
- **Legal Moves** - Highlighted automatically when you select a piece
- **Pawn Promotion** - Modal dialog appears for piece selection

### Analysis Features
- **Toggle Analysis** - Use the on/off switch in the Analysis panel
- **Play Best Move** - Click the green move suggestion to play it instantly
- **View Best Line** - See the engine's recommended continuation
- **Evaluation Bar** - Positive values favor White, negative favor Black

### Keyboard Shortcuts
- None currently implemented (all interactions are click/touch based)

## Technical Notes

- Built with **Svelte 5's new runes system** (`$state`, `$derived`, `$effect`) for reactive state management
- Uses **immutable update patterns** to ensure proper reactivity with chess.js
- **Version counter pattern** for triggering updates with non-reactive libraries
- **Web Workers** for Stockfish engine to prevent UI blocking
- **WASM multithreading** for maximum engine performance
- **UCI protocol** implementation for engine communication
