import type { PageLoad } from './$types';
import { testimonials } from '$lib/data/testimonials';

export const load: PageLoad = async () => {
	return {
		testimonials
	};
};
