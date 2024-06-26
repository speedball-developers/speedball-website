import type { PageServerLoad } from '../../events/$types';

export const load: PageServerLoad = async ({ url }) => {
	const sortBy = url.searchParams.get('sortBy') ?? undefined;
	const pageNumber = url.searchParams.get('page') ?? undefined;
	const startDate = url.searchParams.get('start-date') ?? undefined;
	const endDate = url.searchParams.get('end-date') ?? undefined;
	return { sortBy, pageNumber, startDate, endDate };
};
