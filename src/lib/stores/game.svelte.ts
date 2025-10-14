// Game store using Svelte 5 runes for reactive state management
import { GameEngine } from '$lib/chess/engine/game';
import type {
	GameStatus,
	HistoryEntry,
	MoveWithMetadata,
	DestsMap,
	Square
} from '$lib/types/chess';

// Reactive state - using $state directly for proper Svelte 5 reactivity
let engine = $state(new GameEngine());
let history = $state<HistoryEntry[]>([]);
let version = $state(0); // Version counter to force reactivity

// Derived state (auto-computed reactively)
export const gameStore = {
	// Getters that depend on version to ensure reactivity
	get fen() {
		version; // Access version to trigger reactivity
		return engine.fen();
	},
	get turn() {
		version;
		return engine.turn();
	},
	get isCheck() {
		version;
		return engine.isCheck();
	},
	get isCheckmate() {
		version;
		return engine.isCheckmate();
	},
	get isStalemate() {
		version;
		return engine.isStalemate();
	},
	get isDraw() {
		version;
		return engine.isDraw();
	},
	get isGameOver() {
		version;
		return engine.isGameOver();
	},
	get status(): GameStatus {
		version;
		if (engine.isCheckmate()) return 'checkmate';
		if (engine.isStalemate()) return 'stalemate';
		if (engine.isInsufficientMaterial()) return 'insufficient-material';
		if (engine.isThreefoldRepetition()) return 'threefold-repetition';
		if (engine.isDraw()) return 'draw';
		if (engine.isCheck()) return 'check';
		return 'active';
	},
	get legalMoves(): DestsMap {
		version;
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
	},
	get history() {
		return history;
	},

	// Actions that increment version to trigger reactivity
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
				history.push({
					moveNumber,
					white: moveWithMetadata
				});
			} else {
				// Create new array to trigger reactivity
				const lastEntry = history[history.length - 1];
				if (lastEntry) {
					const updatedEntry = {
						...lastEntry,
						black: moveWithMetadata
					};
					history = [...history.slice(0, -1), updatedEntry];
				}
			}

			version++; // Trigger reactivity
			return true;
		}

		return false;
	},

	undo(): boolean {
		const move = engine.undo();

		if (move) {
			const lastEntry = history[history.length - 1];
			if (lastEntry) {
				if (lastEntry.black) {
					// Remove black's move - create new entry without black
					const updatedEntry = {
						moveNumber: lastEntry.moveNumber,
						white: lastEntry.white
					};
					history = [...history.slice(0, -1), updatedEntry];
				} else if (lastEntry.white) {
					// Remove entire entry (white's move)
					history = history.slice(0, -1);
				}
			}

			version++; // Trigger reactivity
			return true;
		}

		return false;
	},

	reset(): void {
		engine.reset();
		history = [];
		version++; // Trigger reactivity
	},

	loadFen(fenString: string): boolean {
		const success = engine.load(fenString);
		if (success) {
			history = [];
			version++; // Trigger reactivity
		}
		return success;
	},

	loadPgn(pgn: string): boolean {
		const result = engine.loadPgn(pgn);
		if (result) {
			version++; // Trigger reactivity
		}
		return result;
	},

	getPgn(): string {
		return engine.pgn();
	},

	getEngine(): GameEngine {
		return engine;
	}
};
