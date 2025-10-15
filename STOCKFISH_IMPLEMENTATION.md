# Stockfish Analysis Implementation

## Overview

This document describes the Stockfish chess engine integration added to Chess 2.0, enabling real-time position analysis with best move suggestions.

## Implementation Details

### Technology Stack

- **Engine**: Stockfish 17.1 (Lite NNUE variant)
- **Bundle Size**: ~7MB (JavaScript + WASM)
- **Communication**: UCI Protocol via Web Workers
- **Integration**: Client-side (no server required)

### Architecture

```
┌─────────────────────────────────────────┐
│  AnalysisPanel.svelte (UI Component)    │
│  - Displays analysis results            │
│  - Start/Stop controls                  │
│  - Evaluation bar & statistics          │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│  analysisStore (Svelte 5 Store)         │
│  - Manages analysis state               │
│  - Coordinates engine lifecycle         │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│  StockfishEngine (Service Class)        │
│  - UCI protocol implementation          │
│  - Web Worker management                │
│  - Message parsing                      │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│  Stockfish Web Worker                   │
│  - Engine calculations (WASM)           │
│  - Runs in background thread            │
└─────────────────────────────────────────┘
```

### Files Created

#### 1. Type Definitions
**File**: `src/lib/types/stockfish.ts`
- `AnalysisResult`: Engine analysis output structure
- `EngineConfig`: Configuration options
- `UCICommand`: UCI protocol commands

#### 2. Stockfish Service
**File**: `src/lib/chess/engine/stockfish.ts`
- `StockfishEngine`: Main engine wrapper class
- Handles UCI protocol communication
- Manages Web Worker lifecycle
- Parses engine output (evaluation, depth, nodes, etc.)

#### 3. Analysis Store
**File**: `src/lib/stores/analysis.svelte.ts`
- Svelte 5 reactive store using `$state`
- Manages analysis state (analyzing, result, error)
- Engine initialization and cleanup
- Public API: `analyze()`, `stop()`, `cleanup()`

#### 4. UI Component
**File**: `src/lib/components/chess/AnalysisPanel.svelte`
- Evaluation bar (visual representation)
- Statistics display (depth, nodes, NPS)
- Best move highlighting
- Principal variation (best line of moves)
- Start/Stop analysis controls

#### 5. Static Assets
**Files**:
- `static/stockfish.js`: Stockfish engine JavaScript
- `static/stockfish.wasm`: Stockfish WASM binary (6.8MB)

### Configuration Changes

#### Vite Config
**File**: `vite.config.ts`
```typescript
{
  worker: { format: 'es' },
  optimizeDeps: { exclude: ['stockfish'] }
}
```

#### Play Route
**File**: `src/routes/play/+page.svelte`
- Added `AnalysisPanel` component
- Engine cleanup on component destroy
- Integrated into right sidebar with move history

## Features

### Core Functionality

1. **Position Analysis**
   - Analyzes current board position
   - Configurable search depth (default: 20)
   - Returns best move with evaluation

2. **Display Information**
   - **Evaluation**: Centipawn score or mate-in-X
   - **Best Move**: UCI notation (e.g., "e2e4")
   - **Depth**: Search depth reached
   - **Nodes**: Total positions evaluated
   - **NPS**: Nodes per second (performance metric)
   - **Principal Variation**: Best continuation (up to 10 moves)

3. **Visual Feedback**
   - Evaluation bar (white/black advantage)
   - Loading spinner during analysis
   - Error messages for failures
   - Responsive design for mobile/desktop

### Engine Configuration

Default settings:
- **Depth**: 20 (good balance of speed/strength)
- **Threads**: Auto-detected (uses `navigator.hardwareConcurrency`)
- **Hash**: 128MB (memory for position caching)

## Usage

### Starting Analysis

1. Navigate to `/play` route
2. Make some moves on the board
3. Click "Analyze" button in the Analysis Panel
4. Wait for analysis to complete (~5-15 seconds)
5. View results: evaluation, best move, best line

### Stopping Analysis

- Click "Stop" button during analysis
- Analysis will halt immediately
- Current results (if any) will be displayed

### Auto-Cleanup

- Engine automatically terminates when leaving the play page
- No memory leaks from Web Workers
- Proper cleanup in `onDestroy` lifecycle

## Performance

### Expected Analysis Speed

- **Desktop (8-core)**: ~2-5 million nodes/sec, depth 20 in 5-10 seconds
- **Laptop (4-core)**: ~1-3 million nodes/sec, depth 20 in 10-15 seconds
- **Mobile (4-core)**: ~500k-1M nodes/sec, depth 15-18 in 10-20 seconds

### Bundle Impact

- **Initial load**: +32KB (JavaScript wrapper)
- **WASM download**: +6.8MB (on first use)
- **Total**: ~7MB additional download

The WASM file is loaded lazily when the worker is created, not on page load.

## Future Enhancements

Potential improvements for v2:

1. **Multi-PV Analysis**: Show top 3 best moves
2. **Auto-Analysis**: Analyze automatically after each move
3. **Arrow Overlays**: Display best move arrows on the board
4. **Depth Selection**: User-configurable search depth
5. **Analysis Caching**: Cache analyzed positions
6. **Opening Book**: Display opening names
7. **Evaluation Graph**: Chart evaluation over the entire game
8. **Cloud Analysis**: Option for server-side deep analysis
9. **Tablebase Integration**: Perfect endgame play (Syzygy)

## Troubleshooting

### Engine Won't Initialize

- **Check console**: Look for Web Worker errors
- **Verify files**: Ensure `static/stockfish.js` and `static/stockfish.wasm` exist
- **Browser support**: Requires Web Worker and WebAssembly support

### Slow Analysis

- **Reduce depth**: Lower from 20 to 15 or 12
- **Check CPU**: Analysis is CPU-intensive
- **Close tabs**: Free up system resources

### Analysis Timeout

- Default timeout: 30 seconds
- Usually indicates very slow device or complex position
- Try reducing search depth in engine config

## Technical Notes

### UCI Protocol

Stockfish uses the Universal Chess Interface (UCI) protocol:

1. **Initialization**: `uci` → `uciok`
2. **Position**: `position fen <fen-string>`
3. **Analysis**: `go depth 20`
4. **Results**: `info depth X cp Y pv ...`
5. **Best Move**: `bestmove e2e4`
6. **Stop**: `stop`
7. **Quit**: `quit`

### Message Parsing

The engine parses UCI `info` lines to extract:
- `depth N`: Current search depth
- `cp N`: Centipawn evaluation (+100 = +1.00 pawns)
- `mate N`: Mate in N moves
- `nodes N`: Positions evaluated
- `nps N`: Nodes per second
- `pv ...`: Principal variation (best sequence)

### Web Worker Communication

```typescript
// Send command to engine
worker.postMessage('position fen rnbqkbnr/...');
worker.postMessage('go depth 20');

// Receive messages
worker.onmessage = (event) => {
  const line = event.data; // UCI output line
  // Parse and update UI
};
```

## Credits

- **Stockfish Engine**: https://stockfishchess.org/
- **npm Package**: https://github.com/nmrugg/stockfish.js (Chess.com)
- **Version**: Stockfish 17.1 (Lite NNUE)

## License

Stockfish is licensed under the GNU General Public License v3.0.
See the Stockfish repository for full license details.
