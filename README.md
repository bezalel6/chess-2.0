# Chess App Template

A production-ready chess application template with AI opponent powered by Stockfish.

## 🚀 Quick Start

Click **"Use this template"** button above, then:

```bash
# Clone your new repository
git clone https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
cd YOUR_REPO_NAME

# Install and run
bun install
bun run dev
```

## ✨ Features

Out of the box, you get:

- ♟️ **Complete chess implementation** with all rules
- 🤖 **AI opponent** using Stockfish 17.1 WASM
- 🎨 **Modern dark UI** with responsive design
- 🔊 **Sound effects** for all move types
- 📊 **Real-time analysis** with best moves
- 📝 **PGN/FEN** import and export

## 🛠️ Tech Stack

- **SvelteKit 5** - Modern web framework with runes
- **TypeScript** - Type safety throughout
- **Tailwind CSS v4** - Utility-first styling
- **Chess.js** - Move validation and game logic
- **Chessground** - Interactive board from Lichess
- **Stockfish WASM** - Chess engine in the browser

## 📁 Project Structure

```
src/
├── lib/
│   ├── chess/       # Chess engine integration
│   ├── components/  # Reusable UI components
│   ├── stores/      # State management
│   └── services/    # Sound and utilities
└── routes/          # App pages
```

## 🎨 Customization

### Change Colors

Edit theme in `src/app.css` or component styles:

```css
/* Your brand colors */
--primary: #your-color;
--background: #your-bg;
```

### Adjust AI Difficulty

Edit `src/lib/stores/engineConfig.svelte.ts`:

```typescript
export const engineConfig = {
  depth: 10,      // 1-20 (higher = stronger)
  moveTime: 2000  // milliseconds per move
};
```

### Add Features

Common extensions:

- **Multiplayer**: Add WebSocket/WebRTC support
- **Puzzles**: Create puzzle mode with positions
- **Time Controls**: Add chess clocks
- **Variants**: Implement Chess960, etc.
- **Database**: Save games to backend

## 📦 Build & Deploy

```bash
# Build for production
bun run build

# Deploy to Node.js
PORT=3000 node build

# Or deploy to Vercel/Netlify (static)
# Upload the 'build' folder
```

## 🤝 Contributing

This is a template repository. Feel free to:

1. Use it for any purpose (MIT license)
2. Modify without attribution
3. Share your improvements

## 📝 Notes

- Stockfish requires same-origin hosting (CORS)
- Minimum browser: Chrome 90+, Firefox 88+, Safari 15+
- Mobile performance: Limit engine threads

## 🚦 Getting Started Checklist

After using this template:

- [ ] Update `package.json` with your project name
- [ ] Customize the color theme
- [ ] Adjust AI difficulty settings
- [ ] Add your own features
- [ ] Update this README for your project

## 📄 License

MIT - Use freely for any purpose

---

*Built with SvelteKit, Stockfish, and ❤️*