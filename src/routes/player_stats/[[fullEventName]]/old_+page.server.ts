import type { PageServerLoad } from './$types';
import { getData } from '$lib/api/player_stats_logic';

export const load: PageServerLoad = async (event) => {
	const result = await getData(event);
	return result;
};
