import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	const response = await resolve(event);

	// Enable SharedArrayBuffer for multi-threaded Stockfish
	// These headers create a cross-origin isolated environment required for SharedArrayBuffer
	response.headers.set('Cross-Origin-Embedder-Policy', 'require-corp');
	response.headers.set('Cross-Origin-Opener-Policy', 'same-origin');

	return response;
};
