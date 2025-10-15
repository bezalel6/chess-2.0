import { StockfishEngine } from '$lib/chess/engine/stockfish';
import type { AnalysisResult } from '$lib/types/stockfish';

interface AnalysisState {
	isAnalyzing: boolean;
	result: AnalysisResult | null;
	error: string | null;
}

class AnalysisStore {
	private engine: StockfishEngine | null = null;
	private state = $state<AnalysisState>({
		isAnalyzing: false,
		result: null,
		error: null
	});

	get isAnalyzing() {
		return this.state.isAnalyzing;
	}

	get result() {
		return this.state.result;
	}

	get error() {
		return this.state.error;
	}

	async initialize() {
		if (this.engine) return;

		try {
			this.engine = new StockfishEngine({
				depth: 20,
				// Multi-threaded lite version supports up to 4 threads
				threads: typeof navigator !== 'undefined'
					? Math.min(navigator.hardwareConcurrency || 2, 4)
					: 2,
				hash: 128 // 128MB hash table
			});
			await this.engine.initialize();
		} catch (error) {
			this.state.error = error instanceof Error ? error.message : 'Failed to initialize engine';
			throw error;
		}
	}

	async analyze(fen: string) {
		if (!this.engine) {
			await this.initialize();
		}

		if (!this.engine) {
			this.state.error = 'Engine not available';
			return;
		}

		this.state.isAnalyzing = true;
		this.state.error = null;

		try {
			const result = await this.engine.analyze(fen);
			this.state.result = result;
		} catch (error) {
			this.state.error = error instanceof Error ? error.message : 'Analysis failed';
			console.error('Analysis error:', error);
		} finally {
			this.state.isAnalyzing = false;
		}
	}

	stop() {
		this.engine?.stop();
		this.state.isAnalyzing = false;
	}

	cleanup() {
		this.engine?.quit();
		this.engine = null;
		this.state = {
			isAnalyzing: false,
			result: null,
			error: null
		};
	}
}

export const analysisStore = new AnalysisStore();
