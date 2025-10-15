# Testing Scripts

Automated testing scripts for the Chess 2.0 evaluation system.

## Quick Start

**Run the main tests (no dependencies required):**
```bash
bun scripts/test-perspective-logic.ts
```

## Test Scripts

### 1. Perspective Logic Tests (Recommended) ✅

**File**: `test-perspective-logic.ts`

**Purpose**: Unit tests for the core evaluation perspective transformation logic.

**What it tests**:
- White to move: keeps Stockfish values as-is (positive = good for white)
- Black to move: negates values (positive for white = negative for black)
- Mate scores with correct perspective transformation
- Various scenarios: material wins, neutral moves, advantage positions

**Run**:
```bash
bun scripts/test-perspective-logic.ts
```

**Requirements**: None (pure logic tests, no external dependencies)

**Output**:
```
🧪 Perspective Transformation Logic Tests
═══════════════════════════════════════
✅ White wins queen (white to move)
   Input: 483 | Side: WHITE
   Output: 483
   ✓ White to move, positive eval should stay positive

...

📊 Results: 9/9 tests passed (100.0%)
✅ All perspective transformation tests passed!
```

### 2. Browser-Based Tests (Advanced)

**File**: `test-evaluations-browser.ts`

**Purpose**: Full integration tests using Playwright to automate the GUI test suite.

**What it tests**:
- Complete evaluation flow with real Stockfish engine
- All test cases from `/test/evaluations` route
- Actual UI interaction and result extraction

**Requirements**:
- Dev server running on `http://localhost:5173`
- Playwright installed: `bun add -d playwright`

**Run**:
```bash
# Terminal 1: Start dev server
bun run dev

# Terminal 2: Run tests
bun scripts/test-evaluations-browser.ts
```

### 3. Node Stockfish Tests (Experimental)

**File**: `test-evaluations.ts`

**Purpose**: Attempt to run Stockfish directly in Node for testing.

**Status**: Experimental - Stockfish package is designed for browsers, not Node.

**Note**: Use the perspective logic tests or browser tests instead.

## Integration with CI/CD

The perspective logic tests can be integrated into CI/CD pipelines:

```yaml
# Example GitHub Actions workflow
- name: Run evaluation tests
  run: bun scripts/test-perspective-logic.ts
```

## Test Coverage

### Core Logic (Perspective Transformation)
✅ **Covered by**: `test-perspective-logic.ts`
- White to move scenarios
- Black to move scenarios
- Material win evaluations
- Neutral position evaluations
- Mate score transformations

### Full Integration (Stockfish + UI)
✅ **Covered by**: Browser GUI at `/test/evaluations`
🔄 **Automated by**: `test-evaluations-browser.ts` (requires Playwright)

## Adding New Tests

### To add perspective logic tests:

Edit `test-perspective-logic.ts` and add to the `testCases` array:

```typescript
{
    name: 'Test name',
    stockfishEval: 123,      // Raw Stockfish value
    stockfishMate: undefined, // Or mate score
    isWhiteToMove: true,      // Whose turn
    expectedEval: 123,        // What UI should show
    reason: 'Why this eval is expected'
}
```

### To add GUI test cases:

Edit `src/lib/test-data/evaluationTests.ts` and follow the existing pattern.
These tests will be visible in both the GUI and browser automation.

## Debugging

### If perspective tests fail:

1. Check the transformation logic in `src/lib/stores/moveEvaluations.svelte.ts`
2. Look for the conditional negation:
   ```typescript
   evaluation = isWhiteToMove ? result.evaluation : -result.evaluation;
   ```
3. Ensure FEN turn parsing is correct: `const turnToMove = currentFen.split(' ')[1]`

### If browser tests fail:

1. Ensure dev server is running
2. Check browser console for Stockfish errors
3. Verify test selectors match current UI

## Test Results

**Current Status**: ✅ All tests passing

- **Perspective Logic**: 9/9 tests passed (100%)
- **GUI Tests**: Available at `/test/evaluations`

## Related Documentation

- Main test documentation: `src/lib/test-data/README.md`
- Evaluation store: `src/lib/stores/moveEvaluations.svelte.ts`
- Test cases: `src/lib/test-data/evaluationTests.ts`
