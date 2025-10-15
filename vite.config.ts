import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import type { Plugin } from 'vite';

// Plugin to enable SharedArrayBuffer by setting COOP/COEP headers
const crossOriginIsolation = (): Plugin => ({
	name: 'cross-origin-isolation',
	configureServer: (server) => {
		server.middlewares.use((_req, res, next) => {
			res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
			res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
			next();
		});
	}
});

export default defineConfig({
	plugins: [crossOriginIsolation(), tailwindcss(), sveltekit()],
	worker: {
		format: 'es'
	},
	optimizeDeps: {
		exclude: ['stockfish']
	}
});
