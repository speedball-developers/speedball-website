import { json } from '@sveltejs/kit';
import { getData } from '$lib/api/player_stats_logic.js';

export const GET = async (event) => {
	const result = await getData(event);
	return json(result);
};
