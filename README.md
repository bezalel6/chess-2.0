# Chess 2.0

Modern chess application with AI opponent. Built with SvelteKit 5 and Stockfish engine.

🎮 **[Play Now](http://localhost:5173)** | 📦 **[Use as Template](#template)**

## Features

- **Play vs AI** - Stockfish 17.1 engine (White/Black/Both)
- **Real-time Analysis** - Best moves and evaluation
- **Complete Chess Rules** - Full implementation with legal moves
- **Modern UI** - Dark theme, sound effects, responsive design
- **PGN/FEN Support** - Import and export games

## Quick Start

```bash
# Install and run
bun install
bun run dev
```

## Use as Template

### GitHub Template (Recommended)
Use the **template** branch for a clean starting point:
```bash
git clone -b template https://github.com/bezalel6/chess-2.0.git my-chess-app
cd my-chess-app
bun install
bun run dev
```

### Current Version
This main branch contains the full Chess 2.0 application with all features and documentation.

## Tech Stack

- **SvelteKit 5** - With new runes (`$state`, `$props`, `$derived`)
- **TypeScript** - Strict mode
- **Tailwind CSS v4** - Modern styling
- **Chess.js** - Game logic
- **Chessground** - Board UI
- **Stockfish WASM** - Chess engine

## Commands

```bash
bun run dev      # Development
bun run build    # Production build
bun run preview  # Preview build
bun test:all     # Run tests
```

## Project Structure

```
src/
├── lib/
│   ├── chess/       # Engine wrappers
│   ├── components/  # UI components
│   ├── stores/      # State management
│   └── services/    # Sound, etc.
└── routes/          # Pages
```

## Deployment

```bash
# Node.js
bun run build
PORT=3000 node build

# Static (Vercel/Netlify)
bun run build
# Deploy 'build' folder
```

## Customization

### Board Colors
Edit `src/lib/components/chess/Board.svelte`

### AI Strength
Edit `src/lib/stores/engineConfig.svelte.ts`

### Sound Effects
Replace files in `static/sounds/`

## Contributing

1. Fork the repo
2. Create feature branch
3. Run tests
4. Submit PR

## License

MIT

---

Built with ❤️ using [Stockfish](https://stockfishchess.org), [Chessground](https://github.com/lichess-org/chessground), and [Chess.js](https://github.com/jhlywa/chess.js)
