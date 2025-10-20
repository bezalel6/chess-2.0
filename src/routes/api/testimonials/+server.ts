import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { testimonials } from '$lib/data/testimonials';

export const GET: RequestHandler = async () => {
	return json(testimonials);
};
