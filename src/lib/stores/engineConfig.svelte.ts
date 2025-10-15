import type { EngineConfig } from '$lib/types/stockfish';

interface EngineConfigState extends EngineConfig {
	version: number; // Version counter to trigger reactivity
	parallelMoveEval: boolean; // Parallel or sequential move evaluation
}

class EngineConfigStore {
	private state = $state<EngineConfigState>({
		depth: 20,
		threads:
			typeof navigator !== 'undefined' ? Math.min(navigator.hardwareConcurrency || 2, 4) : 2,
		hash: 128,
		parallelMoveEval: false, // Default to sequential (one square at a time)
		version: 0
	});

	get depth() {
		return this.state.depth;
	}

	get threads() {
		return this.state.threads;
	}

	get hash() {
		return this.state.hash;
	}

	get version() {
		return this.state.version;
	}

	get parallelMoveEval() {
		return this.state.parallelMoveEval;
	}

	get config(): EngineConfig {
		return {
			depth: this.state.depth,
			threads: this.state.threads,
			hash: this.state.hash
		};
	}

	setDepth(depth: number) {
		if (depth >= 1 && depth <= 30) {
			this.state.depth = depth;
			this.state.version++;
			this.saveToLocalStorage();
		}
	}

	setThreads(threads: number) {
		const maxThreads =
			typeof navigator !== 'undefined' ? navigator.hardwareConcurrency || 2 : 2;
		if (threads >= 1 && threads <= Math.min(maxThreads, 4)) {
			this.state.threads = threads;
			this.state.version++;
			this.saveToLocalStorage();
		}
	}

	setHash(hash: number) {
		if (hash >= 16 && hash <= 512) {
			this.state.hash = hash;
			this.state.version++;
			this.saveToLocalStorage();
		}
	}

	setParallelMoveEval(enabled: boolean) {
		this.state.parallelMoveEval = enabled;
		this.saveToLocalStorage();
	}

	resetToDefaults() {
		this.state.depth = 20;
		this.state.threads =
			typeof navigator !== 'undefined' ? Math.min(navigator.hardwareConcurrency || 2, 4) : 2;
		this.state.hash = 128;
		this.state.parallelMoveEval = false;
		this.state.version++;
		this.saveToLocalStorage();
	}

	private saveToLocalStorage() {
		if (typeof localStorage !== 'undefined') {
			localStorage.setItem(
				'chess-engine-config',
				JSON.stringify({
					depth: this.state.depth,
					threads: this.state.threads,
					hash: this.state.hash,
					parallelMoveEval: this.state.parallelMoveEval
				})
			);
		}
	}

	loadFromLocalStorage() {
		if (typeof localStorage !== 'undefined') {
			const saved = localStorage.getItem('chess-engine-config');
			if (saved) {
				try {
					const config = JSON.parse(saved);
					if (config.depth) this.state.depth = config.depth;
					if (config.threads) this.state.threads = config.threads;
					if (config.hash) this.state.hash = config.hash;
					if (config.parallelMoveEval !== undefined) this.state.parallelMoveEval = config.parallelMoveEval;
					this.state.version++;
				} catch (error) {
					console.error('Failed to load engine config from localStorage:', error);
				}
			}
		}
	}
}

export const engineConfigStore = new EngineConfigStore();
