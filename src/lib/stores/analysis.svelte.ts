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
		// Check if engine needs reinitialization due to config change
		if (this.engine && this.currentConfigVersion === engineConfigStore.version) {
			return;
		}

		// Cleanup old engine if config changed
		if (this.engine && this.currentConfigVersion !== engineConfigStore.version) {
			this.engine.quit();
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
			const result = await this.engine.analyze(fen);
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

		// Stop any existing analysis
		this.stopContinuousAnalysis();

		this.currentFen = fen;
		this.state.isAnalyzing = true;
		this.state.isEnabled = true;
		this.state.error = null;

		// Start infinite analysis with live updates
		this.startInfiniteAnalysis(fen);
	}

	private startInfiniteAnalysis(fen: string) {
		if (!this.engine) return;

		let result: Partial<AnalysisResult> = {
			bestMove: '',
			evaluation: 0,
			depth: 0,
			nodes: 0,
			nps: 0,
			time: 0,
			pv: []
		};

		// Create message handler for live updates
		this.messageHandler = (line: string) => {
			if (line.startsWith('info')) {
				const parsedInfo = this.parseUCILine(line);
				result = { ...result, ...parsedInfo };

				// Update state with latest analysis (reactive)
				this.state.result = { ...result } as AnalysisResult;
			}
		};

		// Get access to private worker through engine
		const engineAny = this.engine as any;
		if (engineAny.worker && engineAny.messageHandlers) {
			engineAny.messageHandlers.push(this.messageHandler);
		}

		// Send position and start infinite analysis
		(this.engine as any).send(`position fen ${fen}`);
		(this.engine as any).send('go infinite');
	}

	private parseUCILine(line: string): Partial<AnalysisResult> {
		const info: Partial<AnalysisResult> = {};

		if (!line.startsWith('info')) return info;

		// Depth
		const depthMatch = line.match(/depth (\d+)/);
		if (depthMatch) info.depth = parseInt(depthMatch[1]);

		// Selective depth
		const seldepthMatch = line.match(/seldepth (\d+)/);
		if (seldepthMatch) info.selectiveDepth = parseInt(seldepthMatch[1]);

		// Evaluation (centipawns)
		const cpMatch = line.match(/cp (-?\d+)/);
		if (cpMatch) info.evaluation = parseInt(cpMatch[1]);

		// Mate score
		const mateMatch = line.match(/mate (-?\d+)/);
		if (mateMatch) info.mate = parseInt(mateMatch[1]);

		// Nodes searched
		const nodesMatch = line.match(/nodes (\d+)/);
		if (nodesMatch) info.nodes = parseInt(nodesMatch[1]);

		// Nodes per second
		const npsMatch = line.match(/nps (\d+)/);
		if (npsMatch) info.nps = parseInt(npsMatch[1]);

		// Time spent (milliseconds)
		const timeMatch = line.match(/time (\d+)/);
		if (timeMatch) info.time = parseInt(timeMatch[1]);

		// Principal variation
		const pvMatch = line.match(/pv (.+)$/);
		if (pvMatch) info.pv = pvMatch[1].split(' ');

		// Best move (extract first move from PV)
		if (info.pv && info.pv.length > 0) {
			info.bestMove = info.pv[0];
		}

		return info;
	}

	updatePosition(fen: string) {
		// If continuous analysis is enabled and position changed, restart analysis
		if (this.state.isEnabled && fen !== this.currentFen) {
			this.startContinuousAnalysis(fen);
		}
	}

	stopContinuousAnalysis() {
		if (this.engine && this.messageHandler) {
			// Stop the engine
			(this.engine as any).send('stop');

			// Remove message handler
			const engineAny = this.engine as any;
			if (engineAny.messageHandlers) {
				const index = engineAny.messageHandlers.indexOf(this.messageHandler);
				if (index > -1) {
					engineAny.messageHandlers.splice(index, 1);
				}
			}

			this.messageHandler = null;
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

	disable() {
		this.stopContinuousAnalysis();
		this.state.isEnabled = false;
		this.state.result = null;
		this.saveEnabledState(false);
	}

	stop() {
		this.engine?.stop();
		this.state.isAnalyzing = false;
	}

	clear() {
		this.state.result = null;
	}

	cleanup() {
		this.stopContinuousAnalysis();
		this.engine?.quit();
		this.engine = null;
		this.state = {
			isAnalyzing: false,
			isEnabled: false,
			result: null,
			error: null
		};
	}
}

export const analysisStore = new AnalysisStore();
