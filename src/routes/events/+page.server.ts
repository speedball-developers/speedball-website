import { db } from '$lib/server/db.js';
import {
	playerListTable,
	playerResultsTable,
	mapRoundsTable,
	mapResultsTable,
	playerStatsTotaled,
	teamsTable,
	teamsAssignmentTable,
	teamsMembershipTable
} from '$lib/server/schema.js';
import { eq, min, max, sum, count, sql, asc, desc, gt, lt, and, groupBy } from 'drizzle-orm';
import { event_number, map_results } from '$lib/server/drizzle/schema';
import { groupBy as myGroupby } from '$lib/groupBy';

export const load = async () => {
	const matchesOfEventPoints = await db
		.select({
			matchNumber: mapResultsTable.match_number,
			mapResultId: mapRoundsTable.map_result_id,
			// winner_team: mapResultsTable.winner_team,
			// map_name: mapResultsTable.map_name
			// SUM returns a VARCHAR/string so we convert it to INT
			scoreTeam1: sql`CONVERT(SUM(if(${mapRoundsTable.team_scores} = 1, 1, 0)), INT) `, // / COUNT(DISTINCT ${playerResultsTable.login})
			scoreTeam2: sql`CONVERT(SUM(if(${mapRoundsTable.team_scores} = 2, 1, 0)), INT)`
		})
		.from(mapResultsTable)
		.where(and(eq(map_results.event, 'funcup'), eq(map_results.event_number, 249)))
		.innerJoin(mapRoundsTable, eq(mapRoundsTable.map_result_id, mapResultsTable.id))
		.groupBy(mapResultsTable.id, mapResultsTable.match_number)
		.orderBy(asc(mapRoundsTable.map_result_id));

	const matchesOfEventTeams = await db
		.select({
			matchNumber: mapResultsTable.match_number,
			mapResultId: mapRoundsTable.map_result_id,
			team1: sql`GROUP_CONCAT(DISTINCT IF(${playerResultsTable.team} = 1,  ${playerResultsTable.login}, NULL) ORDER BY ${playerResultsTable.login})`,
			team2: sql`GROUP_CONCAT(DISTINCT IF(${playerResultsTable.team} = 2,  ${playerResultsTable.login}, NULL) ORDER BY ${playerResultsTable.login})`
		})
		.from(mapResultsTable)
		.where(
			and(
				eq(map_results.event, 'funcup'),
				eq(map_results.event_number, 249),
				eq(playerResultsTable.spectator, 0)
			)
		)
		.innerJoin(mapRoundsTable, eq(mapRoundsTable.map_result_id, mapResultsTable.id))
		.innerJoin(playerResultsTable, eq(playerResultsTable.round_id, mapRoundsTable.id))
		.groupBy(mapResultsTable.id, mapResultsTable.match_number)
		.orderBy(asc(mapRoundsTable.map_result_id));

	const matchesData = matchesOfEventPoints.map((currElement, index) => {
		return {
			...currElement,
			team1: matchesOfEventTeams[index].team1,
			team2: matchesOfEventTeams[index].team2
		}; //equivalent to list[index]
	});

	const mapOrderMap = new Map();
	matchesData.forEach((match) => {
		const matchNumber = match.matchNumber;
		if (mapOrderMap.get(matchNumber) === undefined) mapOrderMap.set(matchNumber, 0);
		else mapOrderMap.set(matchNumber, mapOrderMap.get(matchNumber) + 1);
		match.mapOrder = mapOrderMap.get(matchNumber);
	});

	const groupedMatchesData = myGroupby(matchesData, 'matchNumber');

	let teams = [
		'chairtic,enzo.junior,heimer-0r-afk',
		'edw4rd,nico79210,rsty',
		'der_rote_flitzer,ilevelin,samuel.de',
		'dan_h,grrrman,ryzhikpyzhik',
		'gamer0x,janfo,urinstein'
	];
	teams = [
		'dmark,ryzhikpyzhik,urinstein',
		'enzo.junior,rsty,samuel.de',
		'dan_h,edw4rd,ilevelin',
		'heimer-0r-afk,lonbertzend,nico79210',
		'der_rote_flitzer,lampskerm,n4tsu'
	];
	return {
		groupedMatchesData,
		teams
	};
};
