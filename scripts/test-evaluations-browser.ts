#!/usr/bin/env bun
/**
 * Browser-based automated evaluation testing using Playwright
 * Tests move evaluation correctness via the /test/evaluations route
 *
 * Usage: bun run test:eval
 */

import { chromium, type Browser, type Page } from 'playwright';

interface TestResult {
	testName: string;
	moveName: string;
	passed: boolean;
	message: string;
	reason: string;
}

async function runBrowserTests(): Promise<{ passed: number; total: number; failed: TestResult[] }> {
	let browser: Browser | null = null;
	let page: Page | null = null;

	try {
		console.log('🚀 Launching browser...');
		browser = await chromium.launch({ headless: true });
		page = await browser.newPage();

		// Navigate to test page (assumes dev server is running on port 5173)
		const testUrl = 'http://localhost:5173/test/evaluations';
		console.log(`📍 Navigating to ${testUrl}`);

		await page.goto(testUrl, { waitUntil: 'networkidle' });

		// Wait for test runner to be ready
		await page.waitForSelector('button:has-text("Run All Tests")', { timeout: 5000 });

		console.log('✅ Test page loaded\n');
		console.log('═'.repeat(80));
		console.log('\n🧪 Running tests...\n');

		// Click "Run All Tests" button
		await page.click('button:has-text("Run All Tests")');

		// Wait for tests to complete (button text changes back)
		await page.waitForSelector('button:has-text("Run All Tests")', { timeout: 120000 });

		// Extract test results from the page
		const results = await page.evaluate(() => {
			const resultElements = document.querySelectorAll('.move-result');
			const results: any[] = [];

			resultElements.forEach((el) => {
				const testCase = el.closest('.test-case');
				const testName = testCase?.querySelector('h3')?.textContent || 'Unknown';
				const moveName = el.querySelector('.font-mono')?.textContent || 'Unknown';
				const passFailBadge = el.querySelector('.text-xs');
				const passed = passFailBadge?.textContent?.includes('PASS') || false;
				const messageEl = Array.from(el.querySelectorAll('p')).find(p =>
					p.textContent?.includes('✓') || p.textContent?.includes('✗')
				);
				const message = messageEl?.textContent || '';
				const reasonEl = Array.from(el.querySelectorAll('p')).find(p =>
					!p.textContent?.includes('✓') && !p.textContent?.includes('✗')
				);
				const reason = reasonEl?.textContent || '';

				results.push({
					testName,
					moveName,
					passed,
					message,
					reason
				});
			});

			return results;
		});

		// Get summary statistics
		const summary = await page.evaluate(() => {
			const summaryText = document.querySelector('.summary')?.textContent || '';
			const match = summaryText.match(/(\d+)\s*\/\s*(\d+)/);
			return match ? { passed: parseInt(match[1]), total: parseInt(match[2]) } : null;
		});

		if (!summary) {
			throw new Error('Could not extract test summary');
		}

		// Print results
		console.log('📋 Test Results:\n');

		let currentTestCase = '';
		const failedTests: TestResult[] = [];

		for (const result of results) {
			if (result.testName !== currentTestCase) {
				currentTestCase = result.testName;
				console.log(`\n${currentTestCase}:`);
			}

			const icon = result.passed ? '✅' : '❌';
			console.log(`  ${icon} ${result.moveName}`);
			console.log(`     ${result.message}`);
			console.log(`     ${result.reason}`);

			if (!result.passed) {
				failedTests.push(result);
			}
		}

		return {
			passed: summary.passed,
			total: summary.total,
			failed: failedTests
		};

	} finally {
		if (page) await page.close();
		if (browser) await browser.close();
	}
}

async function main() {
	console.log('🧪 Automated Evaluation Tests (Browser)\n');
	console.log('═'.repeat(80));
	console.log('\n⚠️  This requires the dev server to be running on http://localhost:5173');
	console.log('   Run "bun run dev" in another terminal first.\n');

	try {
		const { passed, total, failed } = await runBrowserTests();

		console.log('\n' + '═'.repeat(80));
		console.log(`\n📊 Results: ${passed}/${total} tests passed (${((passed / total) * 100).toFixed(1)}%)`);

		if (passed === total) {
			console.log('✅ All tests passed!\n');
			process.exit(0);
		} else {
			console.log(`\n❌ ${total - passed} test(s) failed:`);
			failed.forEach(test => {
				console.log(`   - ${test.testName} - ${test.moveName}`);
				console.log(`     ${test.message}`);
			});
			console.log();
			process.exit(1);
		}
	} catch (error) {
		if (error instanceof Error && error.message.includes('net::ERR_CONNECTION_REFUSED')) {
			console.error('\n❌ Could not connect to dev server at http://localhost:5173');
			console.error('   Please run "bun run dev" in another terminal first.\n');
		} else {
			console.error('\n❌ Test execution failed:', error);
		}
		process.exit(1);
	}
}

main();
