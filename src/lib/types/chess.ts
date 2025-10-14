// Chess type definitions
import type { Move as ChessJSMove, Square, PieceSymbol, Color } from 'chess.js';

// Re-export chess.js types
export type { ChessJSMove as Move, Square, PieceSymbol, Color };

// Piece representation
export interface Piece {
	type: PieceSymbol;
	color: Color;
}

// Move history entry
export interface HistoryEntry {
	moveNumber: number;
	white?: MoveWithMetadata;
	black?: MoveWithMetadata;
}

// Move with additional metadata
export interface MoveWithMetadata {
	san: string; // Standard Algebraic Notation
	move: ChessJSMove;
	fen: string; // Position after move
	timestamp: number;
}

// Game status
export type GameStatus =
	| 'active'
	| 'check'
	| 'checkmate'
	| 'stalemate'
	| 'draw'
	| 'insufficient-material'
	| 'threefold-repetition'
	| 'fifty-move-rule';

// Game state
export interface GameState {
	fen: string;
	turn: Color;
	status: GameStatus;
	isGameOver: boolean;
	history: HistoryEntry[];
	currentMoveIndex: number;
}

// Legal moves destination map (for chessground)
export type DestsMap = Map<Square, Square[]>;
