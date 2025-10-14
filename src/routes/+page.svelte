<script lang="ts">
	const testimonials = [
		{
			quote: "Can't believe we got Chess 2 before GTA 6",
			author: "— Gary, Professional Gamer"
		},
		{
			quote: "Finally, they fixed all the bugs from Chess 1",
			author: "— Magnus, Fashion Enthusiast"
		},
		{
			quote: "Chat, is this real? Chat? CHAT?!",
			author: "— Hikaru, Variety Streamer"
		},
		{
			quote: "This is the position. And in this position, we resign",
			author: "— Levy, New Yorker"
		},
		{
			quote: "Worst interface. Worst design. Worst game. But objectively, it's fine",
			author: "— Ben, Truth Teller"
		},
		{
			quote: "So yeah, pretty cool. Let's see if there's a better option here",
			author: "— Eric, Board Game Collector"
		},
		{
			quote: "Sorry about that. Now, let's pause the game and see what happens",
			author: "— Antonio, Dog Owner"
		},
		{
			quote: "We're going to calculate this exactly and find the only move",
			author: "— Daniel, Bedroom Streamer"
		},
		{
			quote: "I don't know, this looks kinda sus not gonna lie",
			author: "— Alexandra, Sister"
		},
		{
			quote: "The vibrations told me this version would be better",
			author: "— Hans, Analyst"
		}
	];
</script>

<svelte:head>
	<title>Chess 2.0</title>
</svelte:head>

<main class="max-w-4xl mx-auto px-4 py-16">
	<div class="text-center space-y-8">
		<h1 class="text-5xl font-bold text-[#e8e8e8]">Welcome to Chess 2.0</h1>

		<p class="text-xl text-[#a0a0a0] max-w-2xl mx-auto">
			A modern chess experience built with SvelteKit, featuring an interactive board,
			move validation, and full game controls.
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
						{#each [...testimonials, ...testimonials] as testimonial}
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
