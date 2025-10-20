import { StockfishEngine } from '$lib/chess/engine/stockfish';
import { engineConfigStore } from '$lib/stores/engineConfig.svelte';
import type { AnalysisResult } from '$lib/types/stockfish';

export type AIPlayerSide = 'off' | 'black' | 'white' | 'both';

interface AnalysisState {
	isAnalyzing: boolean;
	isEnabled: boolean;
	aiPlaysAs: AIPlayerSide;
	result: AnalysisResult | null;
	error: string | null;
}

class AnalysisStore {
	private engine: StockfishEngine | null = null;
	private currentConfigVersion = 0;
	private currentFen: string | null = null;
	private messageHandler: ((line: string) => void) | null = null;
	private storageKey = 'chess-analysis-enabled';
	private aiSideStorageKey = 'chess-ai-player-side';
	private onBestMoveCallback: ((uciMove: string) => void) | null = null;
	private state = $state<AnalysisState>({
		isAnalyzing: false,
		isEnabled: this.loadEnabledState(),
		aiPlaysAs: this.loadAISide(),
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

	private loadAISide(): AIPlayerSide {
		if (typeof window === 'undefined') return 'off';
		try {
			const stored = localStorage.getItem(this.aiSideStorageKey);
			if (stored === 'black' || stored === 'white' || stored === 'both') {
				return stored;
			}
			// Migrate from old boolean AI mode
			const oldAIMode = localStorage.getItem('chess-ai-mode-enabled');
			if (oldAIMode === 'true') {
				return 'both'; // Default old AI mode to both sides
			}
			return 'off';
		} catch {
			return 'off';
		}
	}

	private saveAISide(side: AIPlayerSide): void {
		if (typeof window === 'undefined') return;
		try {
			localStorage.setItem(this.aiSideStorageKey, side);
			// Clean up old storage key
			localStorage.removeItem('chess-ai-mode-enabled');
		} catch (error) {
			console.warn('Failed to save AI side to localStorage:', error);
		}
	}

	get isAnalyzing() {
		return this.state.isAnalyzing;
	}

	get isEnabled() {
		return this.state.isEnabled;
	}

	get aiPlaysAs() {
		return this.state.aiPlaysAs;
	}

	get isAIActive() {
		return this.state.aiPlaysAs !== 'off';
	}

	get hasCallback() {
		return !!this.onBestMoveCallback;
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

					// Check if AI should play this position
					if (this.state.aiPlaysAs !== 'off' && this.onBestMoveCallback && !hasPlayedMove) {
						// Determine whose turn it is
						const isWhiteTurn = fen.split(' ')[1] === 'w';
						const shouldAIPlay =
							this.state.aiPlaysAs === 'both' ||
							(this.state.aiPlaysAs === 'white' && isWhiteTurn) ||
							(this.state.aiPlaysAs === 'black' && !isWhiteTurn);

						console.log('AI check - aiPlaysAs:', this.state.aiPlaysAs, 'isWhiteTurn:', isWhiteTurn, 'shouldAIPlay:', shouldAIPlay);

						if (shouldAIPlay) {
							const bestMove = update.bestMove || (update.pv && update.pv[0]);
							const depth = update.depth || 0;
							console.log('Best move:', bestMove, 'depth:', depth, 'PV:', update.pv);

							// Validate the move is in UCI format before trying to play it
							if (bestMove && /^[a-h][1-8][a-h][1-8][qrbnQRBN]?$/.test(bestMove)) {
								// Only play when we have a valid move and reached at least depth 10 for quality
								if (depth >= 10) {
									hasPlayedMove = true; // Prevent multiple plays for same position
									console.log('Playing move after delay...');
									// Small delay to make the move visible
									setTimeout(() => {
										if (this.state.aiPlaysAs !== 'off' && this.onBestMoveCallback) {
											console.log('Calling callback with move:', bestMove);
											this.onBestMoveCallback(bestMove);
										}
									}, 300);
								}
							} else if (bestMove) {
								console.error('Best move is not in valid UCI format:', bestMove);
							}
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
		this.state.aiPlaysAs = 'off'; // Also disable AI when analysis is disabled
		this.state.result = null;
		this.saveEnabledState(false);
		this.saveAISide('off');
	}

	async setAIPlayer(side: AIPlayerSide, fen?: string) {
		const wasOff = this.state.aiPlaysAs === 'off';
		this.state.aiPlaysAs = side;
		this.saveAISide(side);
		console.log('AI player set to:', side, 'was off:', wasOff, 'analysis enabled:', this.state.isEnabled);

		// Auto-enable analysis if turning AI on
		if (side !== 'off') {
			if (!this.state.isEnabled) {
				this.state.isEnabled = true;
				this.saveEnabledState(true);
				console.log('Enabled analysis for AI mode');
			}
			// Always restart analysis when AI is turned on or side changes to ensure it picks up the new setting
			if (fen) {
				console.log('Starting continuous analysis for AI play');
				await this.startContinuousAnalysis(fen);
			}
		} else if (side === 'off' && wasOff === false) {
			// Optionally keep analysis running even when AI is off
			// This allows users to see analysis without auto-play
			console.log('AI turned off, keeping analysis running for manual play');
		}
	}

	setOnBestMoveCallback(callback: (uciMove: string) => void) {
		this.onBestMoveCallback = callback;
		console.log('Best move callback set:', !!callback);
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
			aiPlaysAs: 'off',
			result: null,
			error: null
		};
		this.onBestMoveCallback = null;
	}
}

export const analysisStore = new AnalysisStore();
