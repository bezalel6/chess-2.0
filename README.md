# Chess 2.0

A modern chess application built with SvelteKit, TypeScript, and Tailwind CSS.

## Tech Stack

- **Framework**: SvelteKit 2.43.2 with Svelte 5.39.5
- **Language**: TypeScript 5.9.2
- **Styling**: Tailwind CSS 4.1.14
- **Build Tool**: Vite 7.1.7
- **Package Manager**: Bun 1.3.0
- **Deployment**: adapter-node for self-hosting

## Prerequisites

- [Bun](https://bun.sh/) v1.3.0 or higher
- Node.js 18+ (for runtime)

## Getting Started

### Installation

```bash
# Install dependencies
bun install
```

### Development

```bash
# Start development server
bun run dev

# Start with auto-open in browser
bun run dev -- --open
```

The development server will start at `http://localhost:5173`

### Type Checking

```bash
# Run type checks
bun run check

# Run type checks in watch mode
bun run check:watch
```

## Building for Production

```bash
# Build the application
bun run build

# Preview the production build
bun run preview
```

The build output will be in the `build/` directory, ready to run as a standalone Node.js server:

```bash
# Run production server
node build
```

### Environment Variables

The production server respects these environment variables:

- `PORT` - Server port (default: 3000)
- `HOST` - Server host (default: 0.0.0.0)
- `ORIGIN` - The origin URL for CSRF protection
- `SOCKET_PATH` - Unix socket path (alternative to PORT/HOST)

Example:

```bash
PORT=8080 node build
```

## Project Structure

```
chess-2.0/
├── src/
│   ├── lib/              # Reusable components and utilities
│   ├── routes/           # SvelteKit file-based routing
│   │   ├── +layout.svelte   # Root layout
│   │   └── +page.svelte     # Landing page
│   ├── app.css           # Global Tailwind styles
│   ├── app.d.ts          # TypeScript declarations
│   └── app.html          # HTML template
├── static/               # Static assets
├── svelte.config.js      # SvelteKit configuration
├── vite.config.ts        # Vite configuration
├── tsconfig.json         # TypeScript configuration
└── package.json          # Project dependencies
```

## Development Roadmap

- [x] Project initialization
- [x] Tailwind CSS setup
- [x] adapter-node configuration
- [x] Simple landing page
- [ ] Chess board UI component
- [ ] Move validation logic
- [ ] Game state management
- [ ] Multiplayer support (planned)
- [ ] AI opponent (planned)

## License

Private project - All rights reserved
