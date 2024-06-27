import { db } from '$lib/server/db.js';
import {
	playerResultsTable,
	mapRoundsTable,
	mapResultsTable,
	playerStatsTotaled,
	teamsTable,
	teamsAssignmentTable,
	teamsMembershipTable,
	playersTable
} from '$lib/server/schema.js';
import { eq, min, max, sum, count, sql, desc, gt, lt, and, ne, or, inArray } from 'drizzle-orm';
import type { ServerLoadEvent } from '@sveltejs/kit';
import type { RouteParams } from '../../routes/$types';
import getEventList from './event_list';

export const getData = async ({ cookies, fetch, params, url }) => {
	/* : ServerLoadEvent<
	RouteParams,
	{
		session: Session | null;
	},
	'/player_stats/[[fullEventName]]'
> */
	const eventListCalculated = await getEventList(db);
	const latestEvent = eventListCalculated.latestEvent;
	const eventList = eventListCalculated.eventList;

	let { fullEventName } = params;
	if (fullEventName === undefined) fullEventName = 'all';

	const defaultStartDate = new Date('2013-04-10');
	const defaultEndDate = new Date();
	let startDate = url.searchParams.get('start-date');
	if (startDate === undefined || startDate === null) startDate = defaultStartDate;
	else startDate = new Date(startDate);
	let endDate = url.searchParams.get('end-date');
	if (endDate === undefined || endDate === null) endDate = defaultEndDate;
	else endDate = new Date(endDate); // default is now (which is '')
	endDate.setDate(endDate.getDate() + 1); // endDate should end at 23:59 time, so we just add another day

	const pageNumber = url.searchParams.get('page') ?? '1';
	const sortBy = url.searchParams.get('sortBy') ?? 'points-asc';
	const fullEventNameSplitted = (fullEventName ?? '').split('-');
	let eventName = fullEventNameSplitted[0];
	let eventNumber = -1;
	if (!(fullEventNameSplitted.length === 1) && !isNaN(fullEventNameSplitted[1]))
		eventNumber = parseInt(fullEventNameSplitted[1]);

	// get latest event if no event specidfied
	if (eventName === 'latest') {
		eventName = latestEvent.event;
		eventNumber = latestEvent.event_number ?? -1;
		fullEventName = eventName;
		if (eventNumber >= 0) fullEventName += '-' + eventNumber.toString();
	}

	if (eventName === '' || eventName === undefined) {
		eventName = 'all';
	}

	let eventIsCachedInDatabase = false;
	let playerList;

	// only load cached data if no start and end date is set
	if (endDate === defaultEndDate && startDate === defaultStartDate) {
		playerList = await db
			.select({
				login: playerStatsTotaled.login,
				nickname: playerStatsTotaled.nickname,
				shortname: playersTable.shortname,
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
				capture_total_percent: playerStatsTotaled.capture_total_percent,
				capture_total_time: playerStatsTotaled.capture_total_time,
				playtime: playerStatsTotaled.playtime,
				maps_played: playerStatsTotaled.maps_played,
				maps_won: playerStatsTotaled.maps_won
			})
			.from(playerStatsTotaled)
			.innerJoin(playersTable, eq(playersTable.login, playerStatsTotaled.login))
			.where(
				and(
					eq(playerStatsTotaled.event, eventName),
					eq(playerStatsTotaled.event_number, eventNumber)
				)
			);
		if (playerList.length > 0) eventIsCachedInDatabase = true;
	}

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

	// load player list if not cached in database
	if (!eventIsCachedInDatabase) {
		playerList = await db
			.select({
				event: sql<string>`${eventName}`,
				event_number: sql<number>`${eventNumber}`,
				login: playerResultsTable.login,
				// nickname: playerResultsTable.nickname,
				nickname: sql<string>`substring_index(group_concat(cast(${playerResultsTable.nickname} as CHAR) order by ${playerResultsTable.id} desc), ',', 1 )`,
				// nickname: playersTable.nickname,
				shortname: playersTable.shortname,
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
				capture_total_percent: sum(playerResultsTable.capture_total_percent),
				capture_total_time: sum(playerResultsTable.capture_total_time),
				playtime: sum(mapRoundsTable.round_duration),
				maps_played: sql<number>`cast(count(distinct ${mapResultsTable.id}) as int)`,
				maps_won: sql<number>`cast(count(distinct if(${playerResultsTable.team} = ${mapResultsTable.winner_team}, ${mapResultsTable.id}, null)) as int)`
			})
			.from(playerResultsTable)
			.where(eventWhereCondition)
			.innerJoin(mapRoundsTable, eq(playerResultsTable.round_id, mapRoundsTable.id))
			.innerJoin(mapResultsTable, eq(mapRoundsTable.map_result_id, mapResultsTable.id))
			.innerJoin(playersTable, eq(playersTable.login, playerResultsTable.login))
			.groupBy(playerResultsTable.login);

		if (endDate === defaultEndDate && startDate === defaultStartDate && playerList.length > 0) {
			await db.insert(playerStatsTotaled).values(playerList);
			console.log('read with insert');
		} else console.log('read without insert');
	} else console.log('loaded from cache');
	/* returns: 
		[
			{
				name: 'Speedballerz',
				event: 'teamcup-1',
				login: 'dmark,janfo,rsty'
			}, ...
		] */
	const formedTeamsAssignments = await db
		.select({
			name: teamsTable.name,
			custom_name: teamsTable.custom_name,
			event:
				sql`CONCAT(${teamsAssignmentTable.event}, '-', ${teamsAssignmentTable.event_number})`.as(
					'event'
				),
			login: sql`GROUP_CONCAT(${teamsMembershipTable.login})` // ORDER BY ${teamsMembershipTable.login}
		})
		.from(teamsTable)
		.where(eq(teamsMembershipTable.enabled, 1))
		.innerJoin(teamsAssignmentTable, eq(teamsAssignmentTable.team_id, teamsTable.id))
		.innerJoin(
			teamsMembershipTable,
			eq(teamsMembershipTable.team_participation_id, teamsAssignmentTable.id)
		)
		.groupBy(teamsAssignmentTable.event, teamsAssignmentTable.event_number, teamsTable.name);

	let teams = [];
	if (eventName !== 'all' && eventName !== 'public') {
		teams = await db
			.select({
				logins:
					sql`DISTINCT GROUP_CONCAT(DISTINCT ${playerResultsTable.login} ORDER BY ${playerResultsTable.login} SEPARATOR ', ')`.as(
						'logins'
					)
			})
			.from(playerResultsTable)
			.where(eventWhereCondition)
			.innerJoin(mapRoundsTable, eq(playerResultsTable.round_id, mapRoundsTable.id))
			.innerJoin(mapResultsTable, eq(mapRoundsTable.map_result_id, mapResultsTable.id))
			.groupBy(mapResultsTable.match_number, playerResultsTable.team);
	}
	return {
		playerList,
		eventList,
		fullEventName,
		pageNumber,
		sortBy,
		formedTeamsAssignments,
		teams,
		startDate,
		endDate
	};
};
