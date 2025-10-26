# Changelog

All notable changes to Chess 2.0 will be documented in this file.

## [2.0.0] - 2025-01-26

### Major Release: Stable AI Opponent & Enhanced UX

This release marks Chess 2.0 as feature-complete with a stable, intelligent AI opponent powered by Stockfish 17.1 WASM and comprehensive user experience improvements.

### ✨ New Features

#### AI Opponent System
- **Stockfish 17.1 WASM Integration**: Full UCI protocol implementation with multi-threaded WebAssembly engine
- **Flexible AI Modes**: Play as White, Black, or watch AI vs AI games
- **Adaptive Difficulty**: Intelligent depth-based move selection for balanced gameplay
- **Continuous Analysis**: Real-time position evaluation with principal variation display

#### Enhanced Analysis Panel
- **Live Evaluation Display**: Real-time centipawn evaluation from current player's perspective
- **Best Move Suggestions**: Clickable move recommendations in SAN notation
- **Principal Variation**: Shows best line continuation up to 10 moves
- **Game-Over Visualization**: Clear display of checkmate, stalemate, and draw conditions

#### User Experience
- **Sound Effects**: Contextual audio for moves, captures, castling, check, promotion, and game end
- **Persistent Settings**: Remembers sound preferences, AI mode, and analysis state
- **Copy PGN**: One-click PGN export for game sharing and analysis
- **Visual Turn Indicator**: Clear display of whose turn it is with check warnings

### 🐛 Bug Fixes

#### Critical AI Stability Fix
- **Fixed AI Getting Stuck**: Resolved race condition where AI would stop playing after 3-10 moves
  - Added unique analysis session IDs to prevent stale callbacks
  - Fixed `hasPlayedMove` flag scope issues
  - Improved UCI stop command with proper bestmove waiting
  - Added comprehensive position validation before moves

#### Memory & Performance
- **Memory Leak Prevention**: Proper cleanup of analysis intervals and worker threads
- **Reduced CPU Usage**: Optimized polling interval from 100ms to 250ms
- **Resource Management**: Bounded buffers and proper worker lifecycle management

#### Game Logic
- **Fixed Hanging Queen Bug**: Corrected evaluation perspective issues
- **Draw Detection**: Proper handling of stalemate, insufficient material, and repetition
- **Promotion Handling**: Fixed pawn promotion dialog and validation

### 🔧 Technical Improvements

#### Architecture
- **Svelte 5 Runes**: Full migration to new reactivity system (`$state`, `$props`, `$derived`, `$effect`)
- **TypeScript Strict Mode**: Comprehensive type safety throughout the codebase
- **Tailwind CSS v4**: Modern styling with Vite plugin integration
- **Version Counter Pattern**: Efficient reactivity for non-reactive libraries like chess.js

#### Code Quality
- **Immutable Updates**: Proper array/object updates for Svelte 5 reactivity
- **Error Boundaries**: Graceful handling of engine failures
- **Debug Logging**: Comprehensive `[AI Debug]` logs for troubleshooting
- **Clean Separation**: Stores, components, and services properly organized

### 📦 Dependencies

- **Core**: SvelteKit 2.43.2, Svelte 5.39.5, TypeScript 5.9.2
- **Chess**: chess.js 1.0.0, chessground 9.0.0
- **Styling**: Tailwind CSS 4.1.14
- **Build**: Vite 7.1.7, Bun 1.3.0
- **Engine**: Stockfish 17.1 WASM (included in static assets)

### 🎮 How to Play

1. **Against AI**: Select White/Black in the AI Opponent section
2. **Watch Mode**: Select "Both" to watch AI vs AI games
3. **Analysis Only**: Keep AI "Off" but Analysis "On" for position evaluation
4. **Manual Play**: Drag pieces or click to move, with legal move highlighting

### 🔄 Migration Notes

For developers upgrading from v0.1.0:
- All components now use Svelte 5 runes syntax
- Replace old reactive statements (`$:`) with `$derived`
- Update event handlers to new syntax (`onclick` instead of `on:click`)
- Use spread operator for immutable updates

### 🙏 Acknowledgments

- Stockfish team for the powerful chess engine
- Chessground for the excellent board UI
- Chess.js for move validation and game logic

---

## [0.1.0] - 2025-01-20

### Initial Release
- Basic chess board with drag-and-drop
- Move validation and legal move highlighting
- Game state management
- Move history tracking
- Basic controls (new game, undo)