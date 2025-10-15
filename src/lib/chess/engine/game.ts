// GameEngine: chess.js wrapper with clean API
import { Chess } from 'chess.js';
import type { Move, Square, PieceSymbol, Color } from '$lib/types/chess';

export class GameEngine {
	private chess: Chess;

	constructor(fen?: string) {
		this.chess = new Chess(fen);
	}

	// ============================================
	// Move Operations
	// ============================================

	/**
	 * Make a move on the board
	 * @param from Starting square
	 * @param to Destination square
	 * @param promotion Piece to promote to (optional)
	 * @returns Move object if successful, null if invalid
	 */
	move(from: Square, to: Square, promotion?: string): Move | null {
		try {
			const move = this.chess.move({ from, to, promotion });
			return move;
		} catch {
			return null;
		}
	}

	/**
	 * Get all legal moves
	 * @param options Optional filtering by square or piece
	 * @returns Array of legal moves
	 */
	moves(options?: { square?: Square; verbose?: boolean }): Move[] | string[] {
		// Pass all options to chess.js (supports both square and verbose together)
		return this.chess.moves(options as any);
	}

	/**
	 * Undo the last move
	 * @returns The move that was undone, or null if no moves
	 */
	undo(): Move | null {
		return this.chess.undo();
	}

	// ============================================
	// State Queries
	// ============================================

	/**
	 * Get current position as FEN string
	 */
	fen(): string {
		return this.chess.fen();
	}

	/**
	 * Get current turn
	 * @returns 'w' for white, 'b' for black
	 */
	turn(): Color {
		return this.chess.turn();
	}

	/**
	 * Check if current position is in check
	 */
	isCheck(): boolean {
		return this.chess.isCheck();
	}

	/**
	 * Check if current position is checkmate
	 */
	isCheckmate(): boolean {
		return this.chess.isCheckmate();
	}

	/**
	 * Check if current position is stalemate
	 */
	isStalemate(): boolean {
		return this.chess.isStalemate();
	}

	/**
	 * Check if game is drawn (50-move rule, insufficient material, repetition)
	 */
	isDraw(): boolean {
		return this.chess.isDraw();
	}

	/**
	 * Check if insufficient material for checkmate
	 */
	isInsufficientMaterial(): boolean {
		return this.chess.isInsufficientMaterial();
	}

	/**
	 * Check if position is drawn by threefold repetition
	 */
	isThreefoldRepetition(): boolean {
		return this.chess.isThreefoldRepetition();
	}

	/**
	 * Check if game is over (checkmate, stalemate, or draw)
	 */
	isGameOver(): boolean {
		return this.chess.isGameOver();
	}

	// ============================================
	// Position Analysis
	// ============================================

	/**
	 * Get piece at a specific square
	 * @param square Square to check
	 * @returns Piece object or null if empty
	 */
	getSquare(square: Square): { type: PieceSymbol; color: Color } | null {
		const piece = this.chess.get(square);
		return piece || null;
	}

	/**
	 * Get move history
	 * @param options Verbose mode for detailed move info
	 * @returns Array of moves in SAN or verbose format
	 */
	history(options?: { verbose?: boolean }): Move[] | string[] {
		if (options?.verbose) {
			return this.chess.history({ verbose: true });
		}
		return this.chess.history({ verbose: false });
	}

	/**
	 * Get the current board position as a 2D array
	 */
	board(): (({ type: PieceSymbol; color: Color } | null)[])[] {
		return this.chess.board();
	}

	// ============================================
	// Game Control
	// ============================================

	/**
	 * Load a position from FEN string
	 * @param fen FEN string
	 * @returns True if successful, false if invalid FEN
	 */
	load(fen: string): boolean {
		try {
			this.chess.load(fen);
			return true;
		} catch {
			return false;
		}
	}

	/**
	 * Reset board to starting position
	 */
	reset(): void {
		this.chess.reset();
	}

	/**
	 * Load a game from PGN string
	 * @param pgn PGN string
	 * @returns True if successful, false if invalid PGN
	 */
	loadPgn(pgn: string): boolean {
		try {
			this.chess.loadPgn(pgn);
			return true;
		} catch {
			return false;
		}
	}

	/**
	 * Get game in PGN format
	 * @param options Optional PGN formatting options
	 * @returns PGN string
	 */
	pgn(options?: { maxWidth?: number; newline?: string }): string {
		return this.chess.pgn(options);
	}

	/**
	 * Get ASCII representation of the board (useful for debugging)
	 */
	ascii(): string {
		return this.chess.ascii();
	}

	/**
	 * Get the underlying chess.js instance (for advanced use)
	 * Use sparingly - prefer using GameEngine methods
	 */
	getInternalEngine(): Chess {
		return this.chess;
	}
}
