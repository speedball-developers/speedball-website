import { groupBy } from '$lib/groupBy';
import { map_results } from '$lib/server/drizzle/schema';
import { mapResultsTable } from '$lib/server/schema';
import { desc } from 'drizzle-orm';
import type { MySql2Database } from 'drizzle-orm/mysql2';

export default async function getEventList(db: MySql2Database<Record<string, never>>) {
	const eventList = await db
		.select({
			event: mapResultsTable.event,
			event_number: mapResultsTable.event_number,
			date: mapResultsTable.date
		})
		.from(map_results)
		.groupBy((t) => [t.event, t.event_number])
		.orderBy(desc(mapResultsTable.date));
	const latestEvent = eventList[0];
	const eventListOrganized = groupBy(
		(eventList ?? []).filter((event) => event.event != '' && event.event != 'public'),
		'event'
	);
	return { latestEvent, eventList: eventListOrganized };
}
