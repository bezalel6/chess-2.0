import type { AnalysisResult, EngineConfig } from '$lib/types/stockfish';

type UCICommand = 'uci' | 'isready' | 'ucinewgame' | 'stop' | 'quit' | string;

interface Command {
	command: UCICommand;
	resolve: (value: string | string[]) => void;
	reject: (reason?: any) => void;
	expectedResponse: string | RegExp;
}

export class StockfishEngine {
	private worker: Worker | null = null;
	private commandQueue: Command[] = [];
	private isProcessing = false;
	private currentCommand: Command | null = null;
	private messageBuffer: string[] = [];
	private analysisBuffer: string[] = []; // Separate buffer for analysis info lines
	private isInitialized = false;

	constructor(private config: EngineConfig = {}) {}

	async initialize(): Promise<void> {
		if (this.isInitialized) {
			return;
		}

		return new Promise((resolve, reject) => {
			try {
				// Stockfish.js needs to know where to find its WASM files
				// The worker will load them from the same path as the JS file
				this.worker = new Worker('/stockfish-17.1-8e4d048.js');

				let workerReady = false;

				this.worker.onmessage = (event: MessageEvent<string>) => {
					const line = event.data;

					// When worker is first loaded, Stockfish might send initial output
					// Once we get any message, we know the worker is ready
					if (!workerReady) {
						workerReady = true;

						// Now send the UCI command
						this.sendCommand('uci', 'uciok')
							.then(() => {
								return this.configureEngine();
							})
							.then(() => {
								return this.sendCommand('isready', 'readyok');
							})
							.then(() => {
								this.isInitialized = true;
								resolve();
							})
							.catch((error) => {
								console.error('Initialization error:', error);
								this.isInitialized = false;
								reject(error);
							});
					}

					this.handleMessage(line);
				};

				this.worker.onerror = (error) => {
					console.error('Stockfish worker error:', error);
					this.isInitialized = false;
					if (this.currentCommand) {
						this.currentCommand.reject(error);
						this.currentCommand = null;
						this.isProcessing = false;
					}
					reject(error);
				};

				// If no message received within 3 seconds, try sending UCI anyway
				setTimeout(() => {
					if (!workerReady) {
						workerReady = true;

						this.sendCommand('uci', 'uciok')
							.then(() => {
								return this.configureEngine();
							})
							.then(() => {
								return this.sendCommand('isready', 'readyok');
							})
							.then(() => {
								this.isInitialized = true;
								resolve();
							})
							.catch((error) => {
								console.error('Initialization error:', error);
								this.isInitialized = false;
								reject(error);
							});
					}
				}, 3000);
			} catch (error) {
				console.error('Failed to create worker:', error);
				this.isInitialized = false;
				reject(error);
			}
		});
	}

	private handleMessage(line: string): void {
		// Store analysis info lines separately to prevent data loss
		if (line.startsWith('info')) {
			this.analysisBuffer.push(line);
		}

		if (this.currentCommand) {
			this.messageBuffer.push(line);
			const { expectedResponse } = this.currentCommand;

			const isMatch =
				(typeof expectedResponse === 'string' && line.startsWith(expectedResponse)) ||
				(expectedResponse instanceof RegExp && expectedResponse.test(line));

			if (isMatch) {
				const response = this.messageBuffer.join('\n');
				this.currentCommand.resolve(response);
				this.messageBuffer = [];
				this.currentCommand = null;
				this.isProcessing = false;
				this.processNextCommand();
			}
		}
	}

	private processNextCommand(): void {
		if (this.isProcessing || this.commandQueue.length === 0) {
			return;
		}

		this.isProcessing = true;
		this.currentCommand = this.commandQueue.shift()!;

		if (!this.worker) {
			this.currentCommand.reject(new Error('Stockfish engine not initialized'));
			this.currentCommand = null;
			this.isProcessing = false;
			return;
		}

		this.worker.postMessage(this.currentCommand.command);
		// Keep isProcessing true until we get a response in handleMessage
	}

	private sendCommand(command: UCICommand, expectedResponse: string | RegExp): Promise<string> {
		return new Promise((resolve, reject) => {
			this.commandQueue.push({
				command,
				resolve: (value) => resolve(value as string),
				reject,
				expectedResponse
			});
			this.processNextCommand();
		});
	}

	private async configureEngine(): Promise<void> {
		// UCI setoption commands don't receive explicit confirmations
		// We send them directly without waiting for responses
		if (this.config.threads !== undefined) {
			this.worker?.postMessage(`setoption name Threads value ${this.config.threads}`);
		}
		if (this.config.hash !== undefined) {
			this.worker?.postMessage(`setoption name Hash value ${this.config.hash}`);
		}
		if (this.config.multiPV !== undefined) {
			this.worker?.postMessage(`setoption name MultiPV value ${this.config.multiPV}`);
		}

		// Add a small delay to ensure options are processed
		await new Promise(resolve => setTimeout(resolve, 100));
	}

	private parseUCILine(line: string): Partial<AnalysisResult> {
		const info: Partial<AnalysisResult> = {};
		const parts = line.split(' ');

		for (let i = 0; i < parts.length; i++) {
			const part = parts[i];

			switch (part) {
				case 'depth':
					if (i + 1 < parts.length) {
						info.depth = parseInt(parts[i + 1]);
						i++;
					}
					break;
				case 'seldepth':
					if (i + 1 < parts.length) {
						info.selectiveDepth = parseInt(parts[i + 1]);
						i++;
					}
					break;
				case 'multipv':
					if (i + 1 < parts.length) {
						info.multiPV = parseInt(parts[i + 1]);
						i++;
					}
					break;
				case 'score':
					// Score is followed by either 'cp' or 'mate'
					if (i + 2 < parts.length) {
						if (parts[i + 1] === 'cp') {
							info.evaluation = parseInt(parts[i + 2]);
							i += 2;
						} else if (parts[i + 1] === 'mate') {
							info.mate = parseInt(parts[i + 2]);
							i += 2;
						}
					}
					break;
				case 'nodes':
					if (i + 1 < parts.length) {
						info.nodes = parseInt(parts[i + 1]);
						i++;
					}
					break;
				case 'nps':
					if (i + 1 < parts.length) {
						info.nps = parseInt(parts[i + 1]);
						i++;
					}
					break;
				case 'time':
					if (i + 1 < parts.length) {
						info.time = parseInt(parts[i + 1]);
						i++;
					}
					break;
				case 'pv':
					// PV is all the moves from this point to the end of the line
					const moves = [];
					for (let j = i + 1; j < parts.length; j++) {
						const move = parts[j];
						// Validate UCI move format
						if (/^[a-h][1-8][a-h][1-8][qrbnQRBN]?$/.test(move)) {
							moves.push(move.toLowerCase());
						} else {
							break; // Stop at first non-move token
						}
					}
					if (moves.length > 0) {
						info.pv = moves;
					}
					i = parts.length; // Skip to end since we processed all moves
					break;
			}
		}

		return info;
	}


	async analyze(
		fen: string,
		onUpdate: (result: Partial<AnalysisResult>) => void,
		moveTime?: number,
		depth?: number
	): Promise<AnalysisResult> {
		if (!this.isInitialized) {
			throw new Error('Engine not initialized');
		}

		// Ensure engine is ready
		await this.sendCommand('isready', 'readyok');

		// Set position - UCI doesn't confirm position commands
		this.worker?.postMessage(`position fen ${fen}`);
		await new Promise(resolve => setTimeout(resolve, 50));

		const goCommand = moveTime ? `go movetime ${moveTime}` : `go depth ${depth || 20}`;

		// Clear analysis buffer before starting
		this.analysisBuffer = [];

		// Send go command and wait for bestmove
		const analysisPromise = this.sendCommand(goCommand, /^bestmove/);

		// Process analysis updates from the separate buffer
		const interval = setInterval(() => {
			if (this.analysisBuffer.length > 0) {
				const lines = [...this.analysisBuffer];
				this.analysisBuffer = []; // Clear after copying

				let result: Partial<AnalysisResult> = {};
				lines.forEach((line) => {
					const parsed = this.parseUCILine(line);
					if (parsed.multiPV === undefined || parsed.multiPV === 1) {
						result = { ...result, ...parsed };
					}
				});

				if (Object.keys(result).length > 0) {
					onUpdate(result);
				}
			}
		}, 100); // Update more frequently for smoother feedback

		try {
			const response = await analysisPromise;
			clearInterval(interval);

			// Process final response
			const lines = response.split('\n');
			const infoLines = lines.filter((line) => line.startsWith('info'));
			const bestMoveLine = lines.find((line) => line.startsWith('bestmove'));

			let result: Partial<AnalysisResult> = {};
			infoLines.forEach((line) => {
				const parsed = this.parseUCILine(line);
				if (parsed.multiPV === undefined || parsed.multiPV === 1) {
					result = { ...result, ...parsed };
				}
			});

			if (bestMoveLine) {
				const match = bestMoveLine.match(/bestmove ([a-h][1-8][a-h][1-8][qrbn]?)/);
				if (match) {
					result.bestMove = match[1];
				}
			}

			// Clear analysis buffer after analysis completes
			this.analysisBuffer = [];

			return result as AnalysisResult;
		} catch (error) {
			clearInterval(interval);
			this.analysisBuffer = [];
			throw error;
		}
	}

	async newGame(): Promise<void> {
		if (!this.isInitialized) {
			throw new Error('Engine not initialized');
		}

		// UCI newgame command doesn't receive confirmation
		this.worker?.postMessage('ucinewgame');

		// Wait for engine to be ready after new game
		await new Promise(resolve => setTimeout(resolve, 100));
		await this.sendCommand('isready', 'readyok');
	}

	async stop(): Promise<string | null> {
		if (!this.worker || !this.isInitialized) {
			return null;
		}

		try {
			// Clear any pending analysis
			this.analysisBuffer = [];

			// Send stop command directly - it may not always return bestmove
			// If there's no active search, Stockfish won't send anything
			this.worker.postMessage('stop');

			// Give it a moment to stop
			await new Promise(resolve => setTimeout(resolve, 100));

			// Clear any current command that might be waiting
			if (this.currentCommand && this.currentCommand.command.startsWith('go')) {
				this.currentCommand.resolve('stopped');
				this.currentCommand = null;
				this.isProcessing = false;
				this.processNextCommand();
			}

			return 'stopped';
		} catch (error) {
			console.error('Error stopping analysis:', error);
			return null;
		}
	}

	async quit(): Promise<void> {
		if (this.worker) {
			try {
				// Send quit command without waiting for response
				this.worker.postMessage('quit');

				// Give engine a moment to clean up
				await new Promise(resolve => setTimeout(resolve, 100));
			} catch (error) {
				console.error('Error sending quit command:', error);
			} finally {
				// Always terminate the worker
				this.worker.terminate();
				this.worker = null;
				this.isInitialized = false;
				this.currentCommand = null;
				this.isProcessing = false;
				this.commandQueue = [];
				this.messageBuffer = [];
				this.analysisBuffer = [];
			}
		}
	}
}
