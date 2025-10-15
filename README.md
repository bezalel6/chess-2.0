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
```

Builds a static site in the `build/` directory for GitHub Pages deployment.

## Deployment

This project is configured for automatic deployment to GitHub Pages. Every push to the `master` branch triggers a GitHub Actions workflow that builds and deploys the site.

**Live site**: https://bezalel6.github.io/chess-2.0/

### Manual Deployment

To manually trigger a deployment, go to the Actions tab in GitHub and run the "Deploy to GitHub Pages" workflow.

### Local Preview

```bash
bun run build
bun run preview
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
- Stockfish 17.1 engine integration
- Position analysis with evaluation bar
- Move evaluation system (per-move analysis)
- Principal variation display
- Depth, nodes, and speed metrics

### UI & UX
- Dark mode UI with cohesive color palette
- Real-time move history display
- Enhanced sound system with simultaneous effects (capture + check, etc.)
- Responsive design for mobile and desktop
- Undo moves functionality
- New game / reset board
- FEN string import and export

### Deployment
- Automatic deployment to GitHub Pages
- Static site generation with SvelteKit

## Notes

Built with Svelte 5's new runes system for reactive state management. Uses immutable update patterns to ensure proper reactivity with chess.js integration.
