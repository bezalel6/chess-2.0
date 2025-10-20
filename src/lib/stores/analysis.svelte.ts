import { StockfishEngine } from '$lib/chess/engine/stockfish';
import { engineConfigStore } from '$lib/stores/engineConfig.svelte';
import type { AnalysisResult } from '$lib/types/stockfish';

interface AnalysisState {
	isAnalyzing: boolean;
	isEnabled: boolean;
	isAIMode: boolean;
	result: AnalysisResult | null;
	error: string | null;
}

class AnalysisStore {
	private engine: StockfishEngine | null = null;
	private currentConfigVersion = 0;
	private currentFen: string | null = null;
	private messageHandler: ((line: string) => void) | null = null;
	private storageKey = 'chess-analysis-enabled';
	private aiModeStorageKey = 'chess-ai-mode-enabled';
	private onBestMoveCallback: ((uciMove: string) => void) | null = null;
	private state = $state<AnalysisState>({
		isAnalyzing: false,
		isEnabled: this.loadEnabledState(),
		isAIMode: this.loadAIModeState(),
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

	private loadAIModeState(): boolean {
		if (typeof window === 'undefined') return false;
		try {
			const stored = localStorage.getItem(this.aiModeStorageKey);
			return stored === 'true';
		} catch {
			return false;
		}
	}

	private saveAIModeState(enabled: boolean): void {
		if (typeof window === 'undefined') return;
		try {
			localStorage.setItem(this.aiModeStorageKey, String(enabled));
		} catch (error) {
			console.warn('Failed to save AI mode state to localStorage:', error);
		}
	}

	get isAnalyzing() {
		return this.state.isAnalyzing;
	}

	get isEnabled() {
		return this.state.isEnabled;
	}

	get isAIMode() {
		return this.state.isAIMode;
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
			this.engine = null;
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
		try {
			if (!this.engine) {
				await this.initialize();
			}

			if (!this.engine) {
				this.state.error = 'Engine not available';
				return;
			}

			await this.stopContinuousAnalysis();

			this.currentFen = fen;
			this.state.isAnalyzing = true;
			this.state.isEnabled = true;
			this.state.error = null;

			let hasPlayedMove = false; // Track if we've already played a move for this position

			this.engine
				.analyze(fen, (update) => {
					this.state.result = { ...this.state.result, ...update } as AnalysisResult;
					// Auto-play if AI mode is enabled and we have a best move with sufficient depth
					if (this.state.isAIMode && this.onBestMoveCallback && !hasPlayedMove) {
						const bestMove = update.bestMove || (update.pv && update.pv[0]);
						const depth = update.depth || 0;
						// Only play when we have a move and reached at least depth 10 for quality
						if (bestMove && bestMove.length >= 4 && depth >= 10) {
							hasPlayedMove = true; // Prevent multiple plays for same position
							// Small delay to make the move visible
							setTimeout(() => {
								if (this.state.isAIMode && this.onBestMoveCallback) {
									this.onBestMoveCallback(bestMove);
								}
							}, 300);
						}
					}
				})
				.then((result) => {
					this.state.result = result;
				})
				.catch((error) => {
					if (error.message !== 'Analysis stopped' && error.message !== 'Engine not initialized') {
						this.state.error = error instanceof Error ? error.message : 'Analysis failed';
						console.error('Analysis error:', error);
					}
				})
				.finally(() => {
					this.state.isAnalyzing = false;
				});
		} catch (error) {
			this.state.error = error instanceof Error ? error.message : 'Failed to start analysis';
			this.state.isAnalyzing = false;
			console.error('Failed to start continuous analysis:', error);
		}
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
		this.state.isAIMode = false; // Also disable AI mode when analysis is disabled
		this.state.result = null;
		this.saveEnabledState(false);
		this.saveAIModeState(false);
	}

	toggleAIMode() {
		this.state.isAIMode = !this.state.isAIMode;
		this.saveAIModeState(this.state.isAIMode);
	}

	enableAIMode() {
		this.state.isAIMode = true;
		this.saveAIModeState(true);
	}

	disableAIMode() {
		this.state.isAIMode = false;
		this.saveAIModeState(false);
	}

	setOnBestMoveCallback(callback: (uciMove: string) => void) {
		this.onBestMoveCallback = callback;
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
			isAIMode: false,
			result: null,
			error: null
		};
		this.onBestMoveCallback = null;
	}
}

export const analysisStore = new AnalysisStore();
