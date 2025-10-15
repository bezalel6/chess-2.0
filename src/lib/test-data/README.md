# Evaluation Testing

## Overview

This testing suite validates the correctness of move evaluation logic, ensuring:
- Evaluations are shown from the correct perspective (current player)
- Material wins are detected with appropriate signs
- Evaluation consistency across different positions

## Running Tests

1. Navigate to `/test/evaluations` in your browser
2. Click "Run All Tests"
3. Tests will execute sequentially, each taking ~5-10 seconds
4. Results show PASS/FAIL for each expected move

## Test Cases

### 1. White Wins Queen (Bxd8)
**Position**: `rnbqk2r/1ppp1ppp/7n/2b1p1BQ/p1B1P3/3P4/PPP2PPP/RN2K1NR w KQkq - 2 6`

Tests that when white captures the queen with Bxd8, evaluation is **highly positive** (+4.5 or more).

### 2. Black Wins Queen (Qxe5)
**Position**: `rnb1kbnr/ppp1pp1p/3q2p1/4Q3/4P3/8/PPPP1PPP/RNB1KBNR b KQkq - 2 4`

Tests that when black captures the queen with Qxe5, evaluation is **highly negative** (-4.5 or less).

This validates conditional negation based on whose turn it is.

### 3. Starting Position
**Position**: Initial chess position

Tests that opening moves show **near-zero** evaluations (±0.5), confirming neutral moves are handled correctly.

### 4. Mate in One
**Position**: Scholar's mate setup

Tests that checkmate positions show **mate score** or extremely high evaluation.

### 5. Simple Trade
**Position**: After e4 e5

Tests that pawn trades and equal exchanges show **neutral** evaluations.

## Validation Criteria

**Positive**: eval > +50 centipawns
**Negative**: eval < -50 centipawns
**Neutral**: eval within ±100 centipawns

## Adding New Tests

Edit `src/lib/test-data/evaluationTests.ts`:

```typescript
{
  id: 'your-test-id',
  name: 'Test Name',
  fen: 'position FEN string',
  testSquare: 'e2',
  expectedMoves: [
    {
      move: 'e2→e4',
      from: 'e2',
      to: 'e4',
      expectedSign: 'positive', // or 'negative' or 'neutral'
      reason: 'Why this evaluation is expected'
    }
  ]
}
```

## Console Debugging

When tests run, check the browser console for detailed logs:
- `👤 Side to move:` - Shows whose perspective
- `Raw Stockfish result:` - Engine's raw output
- `Transformed evaluation:` - After perspective conversion
- `✅ Final evaluation results:` - Summary table

## Known Issues

- Tests require ~1 second delay between cases to ensure clean state
- Stockfish depth 20 analysis takes 5-10 seconds per move
- Very tactical positions may have different evaluations than expected due to engine depth
