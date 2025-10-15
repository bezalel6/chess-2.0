import type { Square } from '$lib/types/chess';

export interface EvaluationTestCase {
	id: string;
	name: string;
	fen: string;
	testSquare: Square;
	expectedMoves: {
		move: string; // e.g., "d6→e5"
		from: Square;
		to: Square;
		expectedSign: 'positive' | 'negative' | 'neutral';
		reason: string;
	}[];
}

/**
 * Test cases for move evaluation correctness
 */
export const evaluationTestCases: EvaluationTestCase[] = [
	{
		id: 'white-wins-queen',
		name: 'White Wins Queen (Bxd8)',
		fen: 'rnbqk2r/1ppp1ppp/7n/2b1p1BQ/p1B1P3/3P4/PPP2PPP/RN2K1NR w KQkq - 2 6',
		testSquare: 'g5',
		expectedMoves: [
			{
				move: 'g5→d8',
				from: 'g5',
				to: 'd8',
				expectedSign: 'positive',
				reason: 'Bxd8 wins black queen - should be highly positive for white'
			},
			{
				move: 'g5→e7',
				from: 'g5',
				to: 'e7',
				expectedSign: 'neutral',
				reason: 'Bishop to e7 is a neutral move - small eval'
			}
		]
	},
	{
		id: 'black-wins-queen',
		name: 'Black Wins Queen (Qxe5)',
		fen: 'rnb1kbnr/ppp1pp1p/3q2p1/4Q3/4P3/8/PPPP1PPP/RNB1KBNR b KQkq - 2 4',
		testSquare: 'd6',
		expectedMoves: [
			{
				move: 'd6→e5',
				from: 'd6',
				to: 'e5',
				expectedSign: 'negative',
				reason: 'Qxe5 wins white queen - should be highly negative (good for black)'
			},
			{
				move: 'd6→d7',
				from: 'd6',
				to: 'd7',
				expectedSign: 'positive',
				reason: 'Queen retreat - white keeps material advantage, positive for white'
			}
		]
	},
	{
		id: 'starting-position-white',
		name: 'Starting Position - e2 Pawn Moves',
		fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
		testSquare: 'e2',
		expectedMoves: [
			{
				move: 'e2→e4',
				from: 'e2',
				to: 'e4',
				expectedSign: 'neutral',
				reason: 'Standard opening move - evaluation should be close to 0'
			},
			{
				move: 'e2→e3',
				from: 'e2',
				to: 'e3',
				expectedSign: 'neutral',
				reason: 'Passive opening - evaluation close to 0 or slightly negative'
			}
		]
	},
	{
		id: 'mate-in-one-white',
		name: 'White Mate in 1 (Qxf7#)',
		fen: 'rnbqkbnr/pppp1Qpp/8/4p3/2B1P3/8/PPPP1PPP/RNB1K1NR w KQkq - 0 4',
		testSquare: 'f7',
		expectedMoves: [
			{
				move: 'f7→f8',
				from: 'f7',
				to: 'f8',
				expectedSign: 'positive',
				reason: 'Checkmate for white - should show M1 or huge positive'
			}
		]
	},
	{
		id: 'simple-trade-white',
		name: 'White Trades Pawns',
		fen: 'rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2',
		testSquare: 'e4',
		expectedMoves: [
			{
				move: 'e4→e5',
				from: 'e4',
				to: 'e5',
				expectedSign: 'neutral',
				reason: 'Pawn push - small eval change'
			}
		]
	}
];

/**
 * Helper to validate test results
 */
export function validateEvaluation(
	actualEval: number,
	expectedSign: 'positive' | 'negative' | 'neutral'
): {
	passed: boolean;
	message: string;
} {
	const NEUTRAL_THRESHOLD = 50; // centipawns

	switch (expectedSign) {
		case 'positive':
			if (actualEval > NEUTRAL_THRESHOLD) {
				return { passed: true, message: `✓ Correctly positive: ${actualEval}` };
			}
			return {
				passed: false,
				message: `✗ Expected positive, got ${actualEval} (should be > ${NEUTRAL_THRESHOLD})`
			};

		case 'negative':
			if (actualEval < -NEUTRAL_THRESHOLD) {
				return { passed: true, message: `✓ Correctly negative: ${actualEval}` };
			}
			return {
				passed: false,
				message: `✗ Expected negative, got ${actualEval} (should be < -${NEUTRAL_THRESHOLD})`
			};

		case 'neutral':
			if (Math.abs(actualEval) <= NEUTRAL_THRESHOLD * 2) {
				return { passed: true, message: `✓ Correctly neutral: ${actualEval}` };
			}
			return {
				passed: false,
				message: `✗ Expected neutral, got ${actualEval} (should be within ±${NEUTRAL_THRESHOLD * 2})`
			};
	}
}
