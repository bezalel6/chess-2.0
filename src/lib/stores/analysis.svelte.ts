import { StockfishEngine } from '$lib/chess/engine/stockfish';
import { engineConfigStore } from '$lib/stores/engineConfig.svelte';
import type { AnalysisResult } from '$lib/types/stockfish';

interface AnalysisState {
	isAnalyzing: boolean;
	isEnabled: boolean;
	result: AnalysisResult | null;
	error: string | null;
}

class AnalysisStore {
	private engine: StockfishEngine | null = null;
	private currentConfigVersion = 0;
	private currentFen: string | null = null;
	private messageHandler: ((line: string) => void) | null = null;
	private storageKey = 'chess-analysis-enabled';
	private state = $state<AnalysisState>({
		isAnalyzing: false,
		isEnabled: this.loadEnabledState(),
		result: null,
		error: null
	});

	private loadEnabledState(): boolean {
		if (typeof window === 'undefined') return false;
		try {
			const stored = localStorage.getItem(this.storageKey);
			return stored === 'true';
		} catch {
			return false;
		}
	}

	private saveEnabledState(enabled: boolean): void {
		if (typeof window === 'undefined') return;
		try {
			localStorage.setItem(this.storageKey, String(enabled));
		} catch (error) {
			console.warn('Failed to save analysis state to localStorage:', error);
		}
	}

	get isAnalyzing() {
		return this.state.isAnalyzing;
	}

	get isEnabled() {
		return this.state.isEnabled;
	}

	get result() {
		return this.state.result;
	}

	get error() {
		return this.state.error;
	}

	async initialize() {
		if (this.engine && this.currentConfigVersion === engineConfigStore.version) {
			return;
		}

		if (this.engine) {
			await this.engine.quit();
			this.engine = null;
		}

		try {
			this.engine = new StockfishEngine(engineConfigStore.config);
			await this.engine.initialize();
			this.currentConfigVersion = engineConfigStore.version;
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
			const result = await this.engine.analyze(
				fen,
				(update) => {
					this.state.result = { ...this.state.result, ...update } as AnalysisResult;
				},
				engineConfigStore.config.moveTime
			);
			this.state.result = result;
		} catch (error) {
			this.state.error = error instanceof Error ? error.message : 'Analysis failed';
			console.error('Analysis error:', error);
		} finally {
			this.state.isAnalyzing = false;
		}
	}

	async startContinuousAnalysis(fen: string) {
		if (!this.engine) {
			await this.initialize();
		}

		if (!this.engine) {
			this.state.error = 'Engine not available';
			return;
		}

		this.stopContinuousAnalysis();

		this.currentFen = fen;
		this.state.isAnalyzing = true;
		this.state.isEnabled = true;
		this.state.error = null;

		this.engine
			.analyze(fen, (update) => {
				this.state.result = { ...this.state.result, ...update } as AnalysisResult;
			})
			.then((result) => {
				this.state.result = result;
			})
			.catch((error) => {
				if (error.message !== 'Analysis stopped') {
					this.state.error = error instanceof Error ? error.message : 'Analysis failed';
					console.error('Analysis error:', error);
				}
			})
			.finally(() => {
				this.state.isAnalyzing = false;
			});
	}

	updatePosition(fen: string) {
		if (this.state.isEnabled && fen !== this.currentFen) {
			this.startContinuousAnalysis(fen);
		}
	}

	async stopContinuousAnalysis() {
		if (this.engine) {
			try {
				await this.engine.stop();
			} catch (error) {
				console.error('Error stopping analysis:', error);
			}
		}
		this.state.isAnalyzing = false;
		this.currentFen = null;
	}

	toggle() {
		if (this.state.isEnabled) {
			this.disable();
		} else {
			this.state.isEnabled = true;
			this.saveEnabledState(true);
		}
	}

	enable() {
		this.state.isEnabled = true;
		this.saveEnabledState(true);
	}

	async disable() {
		await this.stopContinuousAnalysis();
		this.state.isEnabled = false;
		this.state.result = null;
		this.saveEnabledState(false);
	}

	async stop() {
		if (this.engine) {
			try {
				await this.engine.stop();
			} catch (error) {
				console.error('Error stopping engine:', error);
			}
		}
		this.state.isAnalyzing = false;
	}

	clear() {
		this.state.result = null;
	}

	async cleanup() {
		await this.stopContinuousAnalysis();
		if (this.engine) {
			try {
				await this.engine.quit();
			} catch (error) {
				console.error('Error during engine cleanup:', error);
			} finally {
				this.engine = null;
			}
		}
		this.state = {
			isAnalyzing: false,
			isEnabled: false,
			result: null,
			error: null
		};
	}
}

export const analysisStore = new AnalysisStore();
