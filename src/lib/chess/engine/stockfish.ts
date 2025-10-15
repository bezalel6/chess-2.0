import type { AnalysisResult, EngineConfig } from '$lib/types/stockfish';

export class StockfishEngine {
	private worker: Worker | null = null;
	private ready = false;
	private messageHandlers: Array<(line: string) => void> = [];

	constructor(private config: EngineConfig = {}) {}

	async initialize(): Promise<void> {
		return new Promise((resolve, reject) => {
			try {
				// Create worker from full Stockfish (single-threaded version for reliability)
				// Note: Switched from lite version due to evaluation bugs
				this.worker = new Worker('/stockfish-17.1-single-a496a04.js');

				this.worker.onmessage = (event: MessageEvent<string>) => {
					const line = event.data;

					// Check for ready state
					if (line === 'uciok') {
						this.ready = true;
						this.configureEngine();
						resolve();
					}

					// Call all registered message handlers
					this.messageHandlers.forEach((handler) => handler(line));
				};

				this.worker.onerror = (error) => {
					console.error('Stockfish worker error:', error);
					reject(error);
				};

				// Initialize UCI protocol
				this.send('uci');
			} catch (error) {
				reject(error);
			}
		});
	}

	private configureEngine(): void {
		// Configure engine options
		if (this.config.threads !== undefined) {
			this.send(`setoption name Threads value ${this.config.threads}`);
		}
		if (this.config.hash !== undefined) {
			this.send(`setoption name Hash value ${this.config.hash}`);
		}
		if (this.config.multiPV !== undefined) {
			this.send(`setoption name MultiPV value ${this.config.multiPV}`);
		}

		// Always send isready to confirm engine is ready
		this.send('isready');
	}

	private send(command: string): void {
		if (!this.worker) {
			throw new Error('Stockfish engine not initialized');
		}
		this.worker.postMessage(command);
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

		// Multi-PV (line number when analyzing multiple lines)
		const multiPVMatch = line.match(/multipv (\d+)/);
		if (multiPVMatch) info.multiPV = parseInt(multiPVMatch[1]);

		return info;
	}

	async analyze(fen: string): Promise<AnalysisResult> {
		if (!this.ready) {
			throw new Error('Engine not ready');
		}

		return new Promise((resolve, reject) => {
			let result: Partial<AnalysisResult> = {
				bestMove: '',
				evaluation: 0,
				depth: 0,
				nodes: 0,
				nps: 0,
				time: 0,
				pv: []
			};

			const messageHandler = (line: string) => {
				// Parse UCI output
				if (line.startsWith('info')) {
					const parsedInfo = this.parseUCILine(line);
					// Update result with latest info (some fields may be undefined)
					result = { ...result, ...parsedInfo };
				}

				// Best move found
				if (line.startsWith('bestmove')) {
					const match = line.match(/bestmove ([a-h][1-8][a-h][1-8][qrbn]?)/);
					if (match) {
						result.bestMove = match[1];

						// Remove handler and resolve
						const index = this.messageHandlers.indexOf(messageHandler);
						if (index > -1) this.messageHandlers.splice(index, 1);

						resolve(result as AnalysisResult);
					}
				}
			};

			// Add message handler
			this.messageHandlers.push(messageHandler);

			// Send analysis commands
			this.send(`position fen ${fen}`);

			if (this.config.moveTime !== undefined) {
				this.send(`go movetime ${this.config.moveTime}`);
			} else {
				const depth = this.config.depth || 20;
				this.send(`go depth ${depth}`);
			}

			// Timeout after 30 seconds
			setTimeout(() => {
				const index = this.messageHandlers.indexOf(messageHandler);
				if (index > -1) {
					this.messageHandlers.splice(index, 1);
					reject(new Error('Analysis timeout'));
				}
			}, 30000);
		});
	}

	stop(): void {
		if (this.worker && this.ready) {
			this.send('stop');
		}
	}

	quit(): void {
		if (this.worker) {
			this.send('quit');
			this.worker.terminate();
			this.worker = null;
			this.ready = false;
			this.messageHandlers = [];
		}
	}
}
