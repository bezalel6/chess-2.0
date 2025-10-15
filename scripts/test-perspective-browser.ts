#!/usr/bin/env bun

/**
 * Browser-based test for evaluation perspective
 *
 * Tests that evaluations are correctly transformed based on whose turn it is:
 * - White to move: Stockfish values used directly (positive = good for white)
 * - Black to move: Stockfish values negated (positive = good for black)
 */

import { test, expect } from '@playwright/test';

test.describe('Evaluation Perspective Tests', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('http://localhost:5173/play');
		await page.waitForSelector('.chessground-container', { timeout: 10000 });
	});

	test('White to move: Material advantage shows positive', async ({ page }) => {
		console.log('🧪 Test 1: White wins queen (white to move)');

		// Set up position where white has won black's queen
		// FEN: rnb1kbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1
		const setupButton = page.locator('button:has-text("Set Position")');
		if (await setupButton.isVisible()) {
			await setupButton.click();
			await page.fill(
				'input[type="text"]',
				'rnb1kbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'
			);
			await page.click('button:has-text("Apply")');
		}

		// Start analysis
		await page.click('button:has-text("Analyze")');
		await page.waitForSelector('.analysis-result', { timeout: 30000 });

		// Check evaluation
		const evalText = await page.locator('.evaluation-score').textContent();
		const evalValue = parseFloat(evalText || '0');

		console.log(`   Evaluation: ${evalValue}`);
		console.log(`   Expected: Positive (white is winning)`);

		expect(evalValue).toBeGreaterThan(400); // At least +4.00 (queen advantage)
		console.log('   ✅ PASS: Evaluation is positive\n');
	});

	test('Black to move: Material advantage shows as positive FOR BLACK', async ({ page }) => {
		console.log('🧪 Test 2: Black wins queen (black to move)');

		// Set up position where black has won white's queen (black to move)
		// FEN: rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNB1KBNR b KQkq - 0 1
		const setupButton = page.locator('button:has-text("Set Position")');
		if (await setupButton.isVisible()) {
			await setupButton.click();
			await page.fill(
				'input[type="text"]',
				'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNB1KBNR b KQkq - 0 1'
			);
			await page.click('button:has-text("Apply")');
		}

		// Start analysis
		await page.click('button:has-text("Analyze")');
		await page.waitForSelector('.analysis-result', { timeout: 30000 });

		// Check evaluation - should be POSITIVE because it's black's perspective
		const evalText = await page.locator('.evaluation-score').textContent();
		const evalValue = parseFloat(evalText || '0');

		console.log(`   Evaluation: ${evalValue}`);
		console.log(`   Expected: Positive (black is winning, shown from black's perspective)`);

		// Since it's black to move and black is winning, the transformed eval should be positive
		expect(evalValue).toBeGreaterThan(400);
		console.log('   ✅ PASS: Evaluation correctly transformed to black\'s perspective\n');
	});

	test('Hanging queen shows large negative evaluation', async ({ page }) => {
		console.log('🧪 Test 3: Queen hangs (critical bug fix verification)');

		// The exact position from the bug report
		const fenWithHangingQueen = 'rnbqkbnr/ppp2p1p/4p1Q1/3pP3/8/8/PPPP1PPP/RNB1KBNR b KQkq - 0 4';

		const setupButton = page.locator('button:has-text("Set Position")');
		if (await setupButton.isVisible()) {
			await setupButton.click();
			await page.fill('input[type="text"]', fenWithHangingQueen);
			await page.click('button:has-text("Apply")');
		}

		// Start analysis
		await page.click('button:has-text("Analyze")');
		await page.waitForSelector('.analysis-result', { timeout: 30000 });

		// Check evaluation - should be large negative (black is winning, queen hangs)
		const evalText = await page.locator('.evaluation-score').textContent();
		const evalValue = parseFloat(evalText || '0');

		console.log(`   Evaluation: ${evalValue}`);
		console.log(`   Expected: Large negative (< -600, queen is hanging)`);
		console.log(`   Bug behavior: Would show positive (~+500)`);

		expect(evalValue).toBeLessThan(-600); // Queen worth ~900, so should be at least -600
		console.log('   ✅ PASS: Hanging queen correctly shows negative evaluation\n');
	});
});

// Run with: bun run test:eval:browser
