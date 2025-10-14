// Challenge system type definitions

import type { Move } from './chess';

// Challenge types
export type ChallengeType =
	| 'best-move'           // Find the absolute best move
	| 'best-piece-move'     // Find best move with specific piece
	| 'defensive-move'      // Find best defensive move
	| 'attacking-move'      // Find best attacking move
	| 'tactical-move'       // Find tactical opportunity
	| 'positional-move';    // Find best positional move

// Challenge difficulty levels
export type ChallengeDifficulty = 1 | 2 | 3;

// Challenge interface
export interface Challenge {
	id: string;
	type: ChallengeType;
	description: string;
	difficulty: ChallengeDifficulty;
	targetMove: string;         // Expected best move (UCI format)
	expectedEval: number;        // Expected evaluation (centipawns)
	alternatives: Alternative[]; // Top alternative moves
	fen: string;                // Position FEN
	createdAt: number;          // Timestamp
}

// Alternative move
export interface Alternative {
	move: string;  // UCI format
	eval: number;  // Evaluation in centipawns
}

// Challenge result
export interface ChallengeResult {
	success: boolean;
	points: number;
	feedback: string;
	expectedMove: string;
	actualMove: string;
	evaluation: number;
}

// Challenge status
export type ChallengeStatus = 'idle' | 'generating' | 'active' | 'evaluating';

// Score entry
export interface ScoreEntry {
	points: number;
	success: boolean;
	challenge: Challenge;
	timestamp: number;
}

// Statistics
export interface Statistics {
	totalChallenges: number;
	successful: number;
	accuracy: number;
	byType: TypeStatistics[];
}

// Statistics by challenge type
export interface TypeStatistics {
	type: ChallengeType;
	completed: number;
	successful: number;
	rate: number;
}
