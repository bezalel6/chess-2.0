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

## Template

Use Chess 2.0 as a base for your chess projects:

```bash
bun scripts/init-template.js
```

See [TEMPLATE_GUIDE.md](TEMPLATE_GUIDE.md) for customization options.

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
