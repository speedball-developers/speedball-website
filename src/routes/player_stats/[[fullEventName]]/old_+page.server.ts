import type { PageServerLoad } from './$types';
import { getData } from '$lib/api/player_stats_logic';

export const load: PageServerLoad = async (event) => {
	event.depends('app:player_stats'); // so we can rerun data load via invalidate('app:events)
	const result = await getData(event);
	return result;
};
