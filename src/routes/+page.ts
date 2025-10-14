import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch }) => {
	const response = await fetch('/api/testimonials');
	const testimonials = await response.json();

	return {
		testimonials
	};
};
