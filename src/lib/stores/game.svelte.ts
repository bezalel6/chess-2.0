// Game store using Svelte 5 runes for reactive state management
import { GameEngine } from '$lib/chess/engine/game';
import type {
	GameStatus,
	HistoryEntry,
	MoveWithMetadata,
	DestsMap,
	Square,
	Color
} from '$lib/types/chess';

export function createGameStore() {
	// Private reactive state
	let engine = $state(new GameEngine());
	let history = $state<HistoryEntry[]>([]);
	let currentMoveIndex = $state(0);

	// Derived state (auto-computed from engine state)
	let fen = $derived(engine.fen());
	let turn = $derived(engine.turn());
	let isCheck = $derived(engine.isCheck());
	let isCheckmate = $derived(engine.isCheckmate());
	let isStalemate = $derived(engine.isStalemate());
	let isDraw = $derived(engine.isDraw());
	let isGameOver = $derived(engine.isGameOver());

	// Game status derived from checks
	let status = $derived.by((): GameStatus => {
		if (engine.isCheckmate()) return 'checkmate';
		if (engine.isStalemate()) return 'stalemate';
		if (engine.isInsufficientMaterial()) return 'insufficient-material';
		if (engine.isThreefoldRepetition()) return 'threefold-repetition';
		if (engine.isDraw()) return 'draw';
		if (engine.isCheck()) return 'check';
		return 'active';
	});

	// Legal moves as a Map for chessground compatibility
	let legalMoves = $derived.by((): DestsMap => {
		const moves = engine.moves({ verbose: true });
		const dests = new Map<Square, Square[]>();

		if (typeof moves[0] === 'object') {
			moves.forEach((move: any) => {
				if (!dests.has(move.from)) {
					dests.set(move.from, []);
				}
				dests.get(move.from)!.push(move.to);
			});
		}

		return dests;
	});

	// Public API
	return {
		// Getters for reactive state
		get fen() {
			return fen;
		},
		get turn() {
			return turn;
		},
		get isCheck() {
			return isCheck;
		},
		get isCheckmate() {
			return isCheckmate;
		},
		get isStalemate() {
			return isStalemate;
		},
		get isDraw() {
			return isDraw;
		},
		get isGameOver() {
			return isGameOver;
		},
		get status() {
			return status;
		},
		get legalMoves() {
			return legalMoves;
		},
		get history() {
			return history;
		},
		get currentMoveIndex() {
			return currentMoveIndex;
		},

		// Actions
		makeMove(from: Square, to: Square, promotion?: string): boolean {
			const move = engine.move(from, to, promotion);

			if (move) {
				const moveNumber = Math.floor(history.length / 2) + 1;
				const isWhiteMove = move.color === 'w';

				const moveWithMetadata: MoveWithMetadata = {
					san: move.san,
					move,
					fen: engine.fen(),
					timestamp: Date.now()
				};

				// Add to history
				if (isWhiteMove) {
					// Start new entry for white's move
					history.push({
						moveNumber,
						white: moveWithMetadata
					});
				} else {
					// Add black's move to existing entry
					const lastEntry = history[history.length - 1];
					if (lastEntry) {
						lastEntry.black = moveWithMetadata;
					}
				}

				currentMoveIndex = history.length - 1;
				return true;
			}

			return false;
		},

		undo(): boolean {
			const move = engine.undo();

			if (move) {
				// Remove from history
				const lastEntry = history[history.length - 1];
				if (lastEntry) {
					if (lastEntry.black) {
						// Remove black's move
						delete lastEntry.black;
					} else if (lastEntry.white) {
						// Remove white's move (entire entry)
						history.pop();
					}
				}

				currentMoveIndex = Math.max(0, history.length - 1);
				return true;
			}

			return false;
		},

		reset(): void {
			engine.reset();
			history = [];
			currentMoveIndex = 0;
		},

		loadFen(fenString: string): boolean {
			const success = engine.load(fenString);
			if (success) {
				// Clear history when loading new position
				history = [];
				currentMoveIndex = 0;
			}
			return success;
		},

		loadPgn(pgn: string): boolean {
			return engine.loadPgn(pgn);
		},

		getPgn(): string {
			return engine.pgn();
		},

		// Access to engine for advanced operations
		getEngine(): GameEngine {
			return engine;
		}
	};
}

// Create and export singleton instance
export const gameStore = createGameStore();
