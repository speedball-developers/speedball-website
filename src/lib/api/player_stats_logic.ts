import { db } from '$lib/server/db.js';
import {
	playerListTable,
	playerResultsTable,
	mapRoundsTable,
	mapResultsTable,
	playerStatsTotaled
} from '$lib/server/schema.js';
import { eq, min, max, sum, count, sql, desc, gt, lt, and } from 'drizzle-orm';
import { event_number, map_results } from '$lib/server/drizzle/schema';
import { groupBy } from '$lib/groupyBy';

export const getData = async ({ cookies, fetch, params, url }) => {
	let { fullEventName } = params;
	const defaultStartDate = new Date('2013-04-10');
	let startDate = url.searchParams.get('start-date');
	if (startDate === undefined || startDate === null) startDate = defaultStartDate;
	else startDate = new Date(startDate);
	let endDate = url.searchParams.get('end-date');
	if (endDate === undefined || endDate === null) endDate = new Date();
	else endDate = new Date(endDate); // default is now (which is '')
	endDate.setDate(endDate.getDate() + 1); // endDate should end at 23:59 time, so we just add another day

	const pageNumber = url.searchParams.get('page') ?? '1';
	const sortBy = url.searchParams.get('sortBy') ?? 'points-asc';
	const fullEventNameSplitted = (fullEventName ?? '').split('-');
	let eventName = fullEventNameSplitted[0];
	let eventNumber = -1;
	if (!(fullEventNameSplitted.length === 1) && !isNaN(fullEventNameSplitted[1]))
		eventNumber = parseInt(fullEventNameSplitted[1]);

	// here we get a list of all events [funcup, speedcup, league, ...]
	// with all their instances [[funcup, 1], [funcup, 2], [funcup, 3], ...]
	const eventList = await db
		.select({
			event: mapResultsTable.event,
			event_number: mapResultsTable.event_number,
			date: mapResultsTable.date
		})
		.from(map_results)
		.groupBy((t) => [t.event, t.event_number])
		.orderBy(desc(mapResultsTable.date));

	// get latest event if no event specidfied
	if (eventName === '' || eventName === 'latest') {
		eventName = eventList[0].event ?? 'all';
		eventNumber = eventList[0].event_number ?? -1;
		fullEventName = eventName;
		if (eventNumber >= 0) fullEventName += '-' + eventNumber.toString();
	}

	/* const countedPlayerList = await db
		.select({ count: sql<number>`cast(count(distinct ${playerResultsTable.login}) as int)` })
		.from(playerResultsTable)
		.innerJoin(mapRoundsTable, eq(playerResultsTable.round_id, mapRoundsTable.id))
		.innerJoin(mapResultsTable, eq(mapRoundsTable.map_result_id, mapResultsTable.id));

		countedPlayerList: countedPlayerList[0].count
		*/

	const playerList = await db
		.select({
			login: playerResultsTable.login,
			nickname: playerResultsTable.nickname,
			rank: min(playerResultsTable.ladder_rank),
			ladder_points: max(playerResultsTable.ladder_points),
			points: sum(playerResultsTable.points),
			damage: sum(playerResultsTable.damage),
			shots: sum(playerResultsTable.shots),
			kills: sum(playerResultsTable.kills),
			deaths: sum(playerResultsTable.deaths)
		})
		.from(playerResultsTable)
		.orderBy(playerResultsTable.damage)
		.innerJoin(mapRoundsTable, eq(playerResultsTable.round_id, mapRoundsTable.id))
		.innerJoin(mapResultsTable, eq(mapRoundsTable.map_result_id, mapResultsTable.id))
		.groupBy(playerResultsTable.login);

	let teams = [];

	const playerStatsTotaledList = await db
		.select({
			login: playerStatsTotaled.login,
			nickname: playerStatsTotaled.nickname,
			rank: playerStatsTotaled.rank,
			ladder_points: playerStatsTotaled.ladder_points,
			points: playerStatsTotaled.points,
			damage: playerStatsTotaled.damage,
			shots: playerStatsTotaled.shots,
			kills: playerStatsTotaled.kills,
			deaths: playerStatsTotaled.deaths,
			kd_ratio: playerStatsTotaled.kd_ratio,
			accuracy: playerStatsTotaled.accuracy,
			passes_done: playerStatsTotaled.passes_done,
			passes_received: playerStatsTotaled.passes_received,
			ball_hits: playerStatsTotaled.ball_hits,
			backstabs: playerStatsTotaled.backstabs,
			captures: playerStatsTotaled.captures,
			captures_total_percent: playerStatsTotaled.capture_total_percent,
			captures_total_time: playerStatsTotaled.capture_total_time,
			playtime: playerStatsTotaled.playtime,
			maps_played: playerStatsTotaled.maps_played,
			maps_won: playerStatsTotaled.maps_won
		})
		.from(playerStatsTotaled);

	if (playerStatsTotaledList.length == 0) {
		let eventWhereCondition;
		if (eventName === 'all') eventWhereCondition = sql`${playerResultsTable.spectator} = 0`;
		else if (eventNumber >= 0)
			eventWhereCondition = sql`${playerResultsTable.spectator} = 0 AND ${mapResultsTable.event} = ${eventName} AND ${mapResultsTable.event_number} = ${eventNumber}`;
		else
			eventWhereCondition = sql`${playerResultsTable.spectator} = 0 AND ${mapResultsTable.event} = ${eventName}`;
		eventWhereCondition = and(
			eventWhereCondition,
			gt(mapResultsTable.date, startDate),
			lt(mapResultsTable.date, endDate)
		);
		const playerStatsTotaledList2 = await db
			.select({
				login: playerResultsTable.login,
				nickname: playerResultsTable.nickname,
				rank: min(playerResultsTable.ladder_rank),
				ladder_points: max(playerResultsTable.ladder_points),
				points: sum(playerResultsTable.points),
				damage: sum(playerResultsTable.damage),
				shots: sum(playerResultsTable.shots),
				kills: sum(playerResultsTable.kills),
				deaths: sum(playerResultsTable.deaths),
				kd_ratio: sql<number>`ROUND(IF(SUM(deaths) > 0, SUM(kills) / SUM(deaths), 0), 2)`,
				accuracy: sql<number>`IF(SUM(shots) > 0, ROUND(SUM(damage) / SUM(shots), 4), 0)`,
				passes_done: sum(playerResultsTable.passes_done),
				passes_received: sum(playerResultsTable.passes_received),
				ball_hits: sum(playerResultsTable.ball_hits),
				backstabs: sum(playerResultsTable.backstabs),
				captures: sum(playerResultsTable.captures),
				captures_total_percent: sum(playerResultsTable.capture_total_percent),
				captures_total_time: sum(playerResultsTable.capture_total_time),
				playtime: sum(mapRoundsTable.round_duration),
				maps_played: sql<number>`cast(count(distinct ${mapResultsTable.id}) as int)`,
				maps_won: sql<number>`cast(count(distinct if(${playerResultsTable.team} = ${mapResultsTable.winner_team}, ${mapResultsTable.id}, null)) as int)`
			})
			.from(playerResultsTable)
			// .where(eq(playerResultsTable.spectator, 0))
			.where(eventWhereCondition)
			.innerJoin(mapRoundsTable, eq(playerResultsTable.round_id, mapRoundsTable.id))
			.innerJoin(mapResultsTable, eq(mapRoundsTable.map_result_id, mapResultsTable.id))
			.groupBy(playerResultsTable.login);

		const teamsMap = new Map();
		if (eventName !== 'all' && eventName !== 'public') {
			teams = await db
				.select({
					login: playerResultsTable.login,
					match_team:
						sql`CONCAT(${mapResultsTable.match_number}, '-', ${max(playerResultsTable.team)})`.as(
							'match_team'
						)
				})
				.from(playerResultsTable)
				.where(eventWhereCondition)
				.innerJoin(mapRoundsTable, eq(playerResultsTable.round_id, mapRoundsTable.id))
				.innerJoin(mapResultsTable, eq(mapRoundsTable.map_result_id, mapResultsTable.id))
				.groupBy(playerResultsTable.login, mapResultsTable.match_number);

			teams = groupBy(teams, 'match_team');
			Object.keys(teams).forEach((team) => {
				const playersSorted = teams[team].map((player) => player.login);
				if (playersSorted.length === 3)
					teamsMap.set(
						playersSorted.sort().join('-'),
						teams[team].map((player) => player.login)
					);
			});
		}
		return {
			playerList: playerStatsTotaledList2,
			eventList,
			playerStatsTotaledList2,
			fullEventName,
			pageNumber,
			sortBy,
			// converts the Map to an object
			teams: Object.fromEntries(teamsMap.entries())
		};
	}

	return { playerList, eventList, playerStatsTotaledList };
};
