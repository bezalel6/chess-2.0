# Chess 2.0 - Claude Code Guidelines

Project-specific instructions for working on the Chess 2.0 application.

## Project Overview

Chess 2.0 is a modern chess application built with SvelteKit 5 (using runes), TypeScript, and Tailwind CSS v4. The project uses Bun as the package manager and is configured for self-hosting via adapter-node.

## Tech Stack & Versions

- **SvelteKit**: 2.43.2
- **Svelte**: 5.39.5 (using new runes syntax: `$props()`, `$state()`, `$derived()`, `$effect()`)
- **TypeScript**: 5.9.2
- **Tailwind CSS**: 4.1.14 (v4 - uses `@import "tailwindcss"` not v3 directives)
- **Vite**: 7.1.7
- **Bun**: 1.3.0
- **Adapter**: @sveltejs/adapter-node 5.3.3

## Critical Framework Patterns

### Svelte 5 Runes (REQUIRED)

This project uses Svelte 5 with runes. **Never use old Svelte syntax.**

**Correct (Svelte 5 Runes):**
```svelte
<script lang="ts">
  let { title, count = 0 } = $props();
  let doubled = $derived(count * 2);
  let internal = $state(0);

  $effect(() => {
    console.log('count changed:', count);
  });
</script>
```

**Wrong (Old Svelte syntax - DO NOT USE):**
```svelte
<script lang="ts">
  export let title: string;
  export let count = 0;
  $: doubled = count * 2;
  let internal = 0;
</script>
```

### Tailwind CSS v4 (REQUIRED)

This project uses Tailwind CSS v4 with the Vite plugin. **Use Context7 for latest patterns.**

**Setup (already configured):**
- Import in `src/app.css`: `@import "tailwindcss";`
- Vite plugin in `vite.config.ts`: `tailwindcss()` before `sveltekit()`
- No `tailwind.config.js` needed for basic setup

**Correct usage:**
```svelte
<div class="flex items-center justify-center min-h-screen bg-gray-100">
  <h1 class="text-4xl font-bold text-gray-900">Chess 2.0</h1>
</div>
```

### SvelteKit File-Based Routing

- `+page.svelte` - Page components
- `+layout.svelte` - Layout wrappers
- `+page.ts` / `+page.server.ts` - Page data loading
- `+server.ts` - API endpoints
- `+error.svelte` - Error boundaries

## Development Workflow

### Always Check Context7 First

Before implementing features with external libraries or frameworks:

1. Use `resolve-library-id` to find the library
2. Use `get-library-docs` with specific topics
3. Follow official patterns from Context7, not assumptions

**Example:**
```
User: "Add form validation"
→ Use Context7 for sveltekit-superforms or latest validation patterns
→ Don't guess at API syntax from memory
```

### Type Safety Requirements

- All props must have TypeScript types
- Use strict type checking
- No `any` types unless absolutely necessary
- Leverage Svelte 5's type inference with runes

### Component Organization

```
src/
├── lib/
│   ├── components/     # Reusable UI components
│   │   ├── chess/     # Chess-specific components
│   │   └── ui/        # Generic UI components
│   ├── stores/        # Svelte stores (use $state for local, stores for global)
│   ├── utils/         # Utility functions
│   └── types/         # TypeScript type definitions
├── routes/            # File-based routing
└── app.css           # Global styles (Tailwind import)
```

### State Management Strategy

1. **Local component state**: Use `$state()` rune
2. **Derived values**: Use `$derived()` rune
3. **Props**: Use `$props()` rune
4. **Global state**: Use Svelte stores in `src/lib/stores/`
5. **Side effects**: Use `$effect()` rune

### Styling Guidelines

- Use Tailwind utility classes first
- Create component classes only when repeated patterns emerge
- Keep responsive design in mind (mobile-first)
- Use Tailwind's built-in color palette
- For chess board: Use grid system, not absolute positioning

## Chess-Specific Considerations

### Future Architecture (not yet implemented)

When implementing chess features, follow this structure:

```
src/lib/chess/
├── engine/           # Move validation, game logic
├── board/           # Board representation
├── pieces/          # Piece logic and rendering
├── notation/        # PGN, FEN parsing
└── types.ts         # Chess-specific types
```

### Chess Data Structures

Use efficient data structures:
- Board representation: Consider bitboards or 8x8 array
- Move validation: Pre-compute legal moves
- Game state: FEN notation for serialization

### Performance Requirements

- Board rendering: Should support 60fps animations
- Move validation: < 10ms for legal move generation
- State updates: Optimistic UI updates

## Commit Standards

Use conventional commits:
```
feat: add chess board component
fix: correct pawn promotion logic
refactor: optimize move validation
docs: update API documentation
style: format with prettier
test: add unit tests for move validation
```

## Testing Strategy (future)

When tests are added:
- Unit tests: Pure functions (move validation, notation parsing)
- Component tests: Svelte Testing Library
- E2E tests: Playwright for user flows
- Visual tests: Chromatic or similar

## Deployment

The project uses adapter-node for self-hosting:

```bash
bun run build      # Creates build/ directory
node build         # Runs the production server
```

Environment variables:
- `PORT` - Server port (default: 3000)
- `HOST` - Server host (default: 0.0.0.0)
- `ORIGIN` - Origin URL for CSRF protection

## Common Gotchas

1. **Svelte 5 Migration**: Always use runes, never old syntax
2. **Tailwind v4**: Uses `@import`, not `@tailwind` directives
3. **TypeScript**: Strict mode is enabled, handle all types properly
4. **Bun**: Use `bun` commands, not `npm` or `yarn`
5. **Adapter Node**: Remember to set environment variables in production

## Code Quality Standards

- Run `bun run check` before committing
- Follow TypeScript strict mode
- Use descriptive variable names
- Comment complex chess logic
- Keep components under 200 lines
- Extract reusable logic to utilities

## External Dependencies

**Current (installed):**
- Core SvelteKit packages
- Tailwind CSS v4
- TypeScript
- Vite

**Future considerations (not yet added):**
- chess.js or custom engine for move validation
- chessground for board interaction (if desired)
- Socket.io for multiplayer (if desired)
- Database client for game persistence (if desired)

**Always consult via Context7 before adding new dependencies.**

## Questions or Clarifications

When unclear about implementation details:
1. Ask the user for clarification on requirements
2. Use Context7 to check latest patterns
3. Propose architecture before implementing
4. Consider performance and maintainability

## Summary

- Use Svelte 5 runes exclusively
- Use Tailwind v4 patterns
- Check Context7 for official docs
- Type everything with TypeScript
- Use Bun for all commands
- Commit early and often
- Ask when uncertain
