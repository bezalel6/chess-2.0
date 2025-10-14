# Chess 2.0

A minimal chess application. No fluff.

## Tech Stack

- SvelteKit 2.43.2 with Svelte 5.39.5 (using runes)
- TypeScript 5.9.2
- Tailwind CSS 4.1.14
- chess.js 1.0.0 (game logic)
- chessground 9.0.0 (board UI)

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
node build
```

## Features

- Full chess rules implementation with chess.js
- Interactive drag-and-drop board using chessground
- Lichess.org blue board theme
- Dark mode UI with cohesive color palette
- Real-time move history display
- Undo moves functionality
- New game / reset board
- FEN string import and export
- Legal move highlighting
- Check, checkmate, and stalemate detection
- Responsive design

## Notes

Built with Svelte 5's new runes system for reactive state management. Uses immutable update patterns to ensure proper reactivity with chess.js integration.
