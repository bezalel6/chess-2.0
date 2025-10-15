<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>Chess 2.0</title>
</svelte:head>

<main class="max-w-4xl mx-auto px-4 py-16">
	<div class="text-center space-y-8">
		<h1 class="text-5xl font-bold text-[#e8e8e8]">Chess 2.0</h1>

		<p class="text-xl text-[#a0a0a0] max-w-2xl mx-auto">
		
		</p>

		<div class="pt-8">
			<a
				href="/play"
				class="inline-block px-8 py-4 bg-[#4a9eff] text-white text-lg font-semibold rounded-lg
					   hover:bg-[#3d8de6] transition-colors shadow-lg hover:shadow-xl"
			>
				Start Playing
			</a>
		</div>

		<!-- Testimonials Section -->
		<div class="pt-16 max-w-md mx-auto">
			<div class="bg-[#2d2d2d] rounded-lg border border-[#404040] p-6">
				<h2 class="text-xl font-bold text-[#e8e8e8] mb-4 text-center">What Players Are Saying</h2>

				<div class="relative h-32 w-full overflow-hidden rounded-lg border border-[#404040] bg-[#1e1e1e]">
					<div class="animate-scroll-vertical p-4">
						{#each [...data.testimonials, ...data.testimonials] as testimonial}
							<div class="mb-6">
								<p class="text-[#e8e8e8] italic text-sm mb-2">"{testimonial.quote}"</p>
								<p class="text-[#a0a0a0] text-xs">{testimonial.author}</p>
							</div>
						{/each}
					</div>
				</div>
			</div>
		</div>
	</div>
</main>
