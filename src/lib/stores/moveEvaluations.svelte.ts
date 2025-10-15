import { StockfishEngine } from '$lib/chess/engine/stockfish';
import { GameEngine } from '$lib/chess/engine/game';
import type { Square } from '$lib/types/chess';

export interface MoveEvaluation {
	from: Square;
	to: Square;
	evaluation: number; // Centipawns
	mate?: number; // Mate in X moves
	depth: number;
	isCalculating: boolean;
}

interface MoveEvaluationsState {
	evaluations: Map<string, MoveEvaluation>; // Key: "from-to" (e.g., "e2-e4")
	isEvaluating: boolean;
	selectedSquare: Square | null;
	error: string | null;
}

class MoveEvaluationsStore {
	private engine: StockfishEngine | null = null;
	private state = $state<MoveEvaluationsState>({
		evaluations: new Map(),
		isEvaluating: false,
		selectedSquare: null,
		error: null
	});

	get evaluations() {
		return this.state.evaluations;
	}

	get isEvaluating() {
		return this.state.isEvaluating;
	}

	get selectedSquare() {
		return this.state.selectedSquare;
	}

	get error() {
		return this.state.error;
	}

	async initialize() {
		if (this.engine) return;

		try {
			this.engine = new StockfishEngine({
				depth: 15, // Lighter depth for faster multi-move analysis
				threads: typeof navigator !== 'undefined'
					? Math.min(navigator.hardwareConcurrency || 2, 4)
					: 2,
				hash: 64 // Smaller hash for faster analysis
			});
			await this.engine.initialize();
		} catch (error) {
			this.state.error = error instanceof Error ? error.message : 'Failed to initialize engine';
			throw error;
		}
	}

	setSelectedSquare(square: Square | null) {
		this.state.selectedSquare = square;
	}

	getMoveKey(from: Square, to: Square): string {
		return `${from}-${to}`;
	}

	getEvaluation(from: Square, to: Square): MoveEvaluation | undefined {
		return this.state.evaluations.get(this.getMoveKey(from, to));
	}

	/**
	 * Evaluate all legal moves from a specific square using chess.js patterns
	 */
	async evaluateMovesFromSquare(square: Square, currentFen: string) {
		if (!this.engine) {
			await this.initialize();
		}

		if (!this.engine) {
			return;
		}

		this.state.isEvaluating = true;
		this.state.error = null;
		this.state.selectedSquare = square;

		// Clear previous evaluations
		this.state.evaluations = new Map();

		try {
			// Use chess.js to get verbose moves from the selected square
			const tempEngine = new GameEngine();
			tempEngine.load(currentFen);

			// Get verbose moves for the selected square
			const legalMoves = tempEngine.moves({ square, verbose: true });

			if (legalMoves.length === 0) {
				this.state.isEvaluating = false;
				return;
			}

			// Initialize all moves as calculating
			legalMoves.forEach((move: any) => {
				const key = this.getMoveKey(move.from, move.to);
				this.state.evaluations.set(key, {
					from: move.from,
					to: move.to,
					evaluation: 0,
					depth: 0,
					isCalculating: true
				});
			});

			// Force reactivity update
			this.state.evaluations = new Map(this.state.evaluations);

			// Evaluate each move in parallel
			const evaluationPromises = legalMoves.map(async (move: any) => {
				const key = this.getMoveKey(move.from, move.to);

				try {
					// Use the 'after' field from verbose move to get resulting position
					const resultingFen = move.after;

					// Analyze the resulting position
					const result = await this.engine!.analyze(resultingFen);

					// Evaluation from opponent's perspective needs to be negated
					// to show the evaluation from the current player's perspective
					const evaluation = result.mate !== undefined
						? result.mate
						: -result.evaluation;

					const mate = result.mate !== undefined ? -result.mate : undefined;

					// Update evaluation
					this.state.evaluations.set(key, {
						from: move.from,
						to: move.to,
						evaluation,
						mate,
						depth: result.depth,
						isCalculating: false
					});

					// Force reactivity
					this.state.evaluations = new Map(this.state.evaluations);
				} catch (error) {
					console.error(`Failed to evaluate move ${move.from}-${move.to}:`, error);
					this.state.evaluations.set(key, {
						from: move.from,
						to: move.to,
						evaluation: 0,
						depth: 0,
						isCalculating: false
					});
					this.state.evaluations = new Map(this.state.evaluations);
				}
			});

			// Wait for all evaluations to complete
			await Promise.all(evaluationPromises);
		} catch (error) {
			this.state.error = error instanceof Error ? error.message : 'Evaluation failed';
			console.error('Move evaluation error:', error);
		} finally {
			this.state.isEvaluating = false;
		}
	}

	clear() {
		this.state.evaluations = new Map();
		this.state.selectedSquare = null;
	}

	stop() {
		this.engine?.stop();
		this.state.isEvaluating = false;
	}

	cleanup() {
		this.engine?.quit();
		this.engine = null;
		this.state = {
			evaluations: new Map(),
			isEvaluating: false,
			selectedSquare: null,
			error: null
		};
	}
}

export const moveEvaluationsStore = new MoveEvaluationsStore();
