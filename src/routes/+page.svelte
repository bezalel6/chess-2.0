<script lang="ts">
	import Header from '$lib/components/ui/Header.svelte';
</script>

<div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
	<Header />

	<!-- Hero Section -->
	<main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
		<div class="text-center space-y-8">
			<!-- Main Headline -->
			<div class="space-y-4">
				<h1 class="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900">
					The Long Awaited
					<span class="block text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-600">
						Sequel is Finally Here
					</span>
				</h1>
				<p class="text-xl sm:text-2xl text-gray-600 max-w-3xl mx-auto">
					Experience chess like never before. Reimagined for the modern era with cutting-edge
					technology and timeless strategy.
				</p>
			</div>

			<!-- CTA Buttons -->
			<div class="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
				<a
					href="/game"
					class="bg-gray-900 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-800 transition-all hover:scale-105"
				>
					Start Playing
				</a>
				<a
					href="/game"
					class="border-2 border-gray-900 text-gray-900 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-900 hover:text-white transition-all"
				>
					View Demo
				</a>
			</div>

			<!-- Chess Board Preview -->
			<div class="pt-12">
				<div
					class="relative max-w-2xl mx-auto bg-white rounded-2xl shadow-2xl p-8 border border-gray-200"
				>
					<div class="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
						<div class="text-center space-y-4">
							<div class="text-6xl">♔ ♕ ♖ ♗ ♘ ♙</div>
							<p class="text-gray-600 font-medium">Board Preview Coming Soon</p>
						</div>
					</div>
				</div>
			</div>

			<!-- Features Grid -->
			<div id="features" class="pt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
				<div class="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
					<div class="text-3xl mb-4">⚡</div>
					<h3 class="text-xl font-bold text-gray-900 mb-2">Lightning Fast</h3>
					<p class="text-gray-600">Blazing fast performance with modern web technologies</p>
				</div>
				<div class="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
					<div class="text-3xl mb-4">🎯</div>
					<h3 class="text-xl font-bold text-gray-900 mb-2">Smart AI</h3>
					<p class="text-gray-600">Challenge yourself against intelligent opponents</p>
				</div>
				<div class="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
					<div class="text-3xl mb-4">🌐</div>
					<h3 class="text-xl font-bold text-gray-900 mb-2">Play Anywhere</h3>
					<p class="text-gray-600">Seamless experience across all your devices</p>
				</div>
			</div>
		</div>
	</main>

	<!-- Footer -->
	<footer class="border-t border-gray-200 bg-white mt-20">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
			<p class="text-center text-gray-600">
				© 2025 Chess 2.0. Built with SvelteKit & Tailwind CSS.
			</p>
		</div>
	</footer>
</div>
