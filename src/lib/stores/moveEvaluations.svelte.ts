import { StockfishEngine } from '$lib/chess/engine/stockfish';
import { GameEngine } from '$lib/chess/engine/game';
import { engineConfigStore } from '$lib/stores/engineConfig.svelte';
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
	private currentConfigVersion = 0;
	private evaluationGeneration = 0; // Track current evaluation cycle
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

		// Stop any ongoing evaluations
		this.engine.stop();

		// Increment generation to invalidate in-flight evaluations
		this.evaluationGeneration++;
		const currentGeneration = this.evaluationGeneration;

		this.state.isEvaluating = true;
		this.state.error = null;
		this.state.selectedSquare = square;

		// Clear previous evaluations
		this.state.evaluations = new Map();

		// Determine whose turn it is in the current position
		// FEN format: [pieces] [turn] [castling] [en passant] [halfmove] [fullmove]
		const turnToMove = currentFen.split(' ')[1]; // 'w' or 'b'
		const isWhiteToMove = turnToMove === 'w';

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

			console.log(`\n🔍 Analyzing ${legalMoves.length} moves from ${square}`);
			console.log(`📍 Current position: ${currentFen}`);
			console.log(`👤 Side to move: ${isWhiteToMove ? 'WHITE' : 'BLACK'}`);

			// Force reactivity update
			this.state.evaluations = new Map(this.state.evaluations);

			// Evaluate each move in parallel
			const evaluationPromises = legalMoves.map(async (move: any) => {
				const key = this.getMoveKey(move.from, move.to);

				try {
					// Use the 'after' field from verbose move to get resulting position
					const resultingFen = move.after;

					console.log(`\n📊 Evaluating move ${move.from}→${move.to}`);
					console.log(`  Resulting FEN: ${resultingFen}`);

					// Analyze the resulting position
					const result = await this.engine!.analyze(resultingFen);

					console.log(`  Raw Stockfish result:`, {
						evaluation: result.evaluation,
						mate: result.mate,
						depth: result.depth,
						bestMove: result.bestMove
					});

					// Check if this evaluation is still valid (not cancelled)
					if (currentGeneration !== this.evaluationGeneration) {
						// This evaluation was cancelled, discard results
						console.log(`  ❌ CANCELLED (generation mismatch: ${currentGeneration} !== ${this.evaluationGeneration})`);
						return;
					}

					// Stockfish returns evaluations from WHITE's perspective (UCI standard)
					// Positive = good for white, Negative = good for black
					// We need to show from the CURRENT PLAYER's perspective:
					// - If WHITE is moving: keep as-is (positive = good for white = good for player)
					// - If BLACK is moving: negate (positive for white = bad for black, so negate to show as negative = bad for player)
					let evaluation: number;
					let mate: number | undefined;

					if (result.mate !== undefined) {
						// Mate score
						mate = isWhiteToMove ? result.mate : -result.mate;
						evaluation = mate;
					} else {
						// Centipawn evaluation
						evaluation = isWhiteToMove ? result.evaluation : -result.evaluation;
						mate = undefined;
					}

					console.log(`  Transformed evaluation:`, {
						rawEval: result.evaluation,
						rawMate: result.mate,
						finalEval: evaluation,
						finalMate: mate,
						depth: result.depth,
						perspective: isWhiteToMove ? 'WHITE (no negate)' : 'BLACK (negated)'
					});

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
					// Check if this evaluation is still valid
					if (currentGeneration !== this.evaluationGeneration) {
						return;
					}

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

			// Print final results table
			const finalResults = Array.from(this.state.evaluations.values()).map(e => ({
				Move: `${e.from}→${e.to}`,
				Eval: e.mate !== undefined ? `M${Math.abs(e.mate)}` : (e.evaluation / 100).toFixed(2),
				Type: e.mate !== undefined ? (e.mate > 0 ? 'Mate (Us)' : 'Mate (Opp)') : 'CP',
				Depth: e.depth,
				Calculating: e.isCalculating
			}));

			console.log('\n✅ Final evaluation results:');
			console.table(finalResults);
		} catch (error) {
			this.state.error = error instanceof Error ? error.message : 'Evaluation failed';
			console.error('Move evaluation error:', error);
		} finally {
			this.state.isEvaluating = false;
		}
	}

	clear() {
		console.log(`\n🧹 Clearing evaluations (generation: ${this.evaluationGeneration} → ${this.evaluationGeneration + 1})`);
		console.log(`  Previous evaluations: ${this.state.evaluations.size}`);

		// Stop engine and invalidate in-flight evaluations
		this.engine?.stop();
		this.evaluationGeneration++;

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
