import { db } from '$lib/server/db.js';
import { playerResultsTable, mapRoundsTable, mapResultsTable } from '$lib/server/schema.js';
import { eq, sql, asc, and, max } from 'drizzle-orm';
import { map_results } from '$lib/server/drizzle/schema';
import { groupBy as myGroupby } from '$lib/groupBy';
import getEventList from '$lib/api/event_list';
import {
	calculateBoXDoubleElimination,
	calculateChallongeIdsDoubleElimination
} from '$lib/calculateBracketIDsBoX';
import { DoubleElimination } from 'tournament-pairings';
import type { bracketMatchInterface } from '$lib/customInterfaces/bracketMatchInterface';
import type { PageServerLoad } from '../$types';

export const load: PageServerLoad = async ({ params, depends }) => {
	depends('app:events'); // so we can rerun data load via invalidate('app:events)
	const eventListCalculated = await getEventList(db);
	const latestEvent = eventListCalculated.latestEvent;
	const eventList = eventListCalculated.eventList;

	let { fullEventName } = params;
	const fullEventNameSplitted = (fullEventName ?? '').split('-');
	let eventName = fullEventNameSplitted[0];
	let eventNumber = -1;
	if (!(fullEventNameSplitted.length === 1) && !isNaN(fullEventNameSplitted[1]))
		eventNumber = parseInt(fullEventNameSplitted[1]);
	// get latest event if no event specidfied
	if (eventName === 'latest' || eventName === '') {
		eventName = latestEvent.event;
		eventNumber = latestEvent.event_number ?? -1;
		fullEventName = eventName + '-' + eventNumber;
	}

	const lastMatchOfEventWasPlayedAtQuery = await db
		.select({
			date: max(mapResultsTable.date)
		})
		.from(mapResultsTable)
		.where(and(eq(map_results.event, eventName), eq(map_results.event_number, eventNumber)));
	const lastMatchOfEventWasPlayedAt = lastMatchOfEventWasPlayedAtQuery[0]?.date ?? undefined;

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
		.where(and(eq(map_results.event, eventName), eq(map_results.event_number, eventNumber)))
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
				eq(map_results.event, eventName),
				eq(map_results.event_number, eventNumber),
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

	let teams: string[] = [];
	if (eventNumber === 248)
		teams = [
			'chairtic,enzo.junior,heimer-0r-afk',
			'edw4rd,nico79210,rsty',
			'der_rote_flitzer,ilevelin,samuel.de',
			'dan_h,grrrman,ryzhikpyzhik',
			'gamer0x,janfo,urinstein'
		];
	else if (eventNumber === 249)
		teams = [
			'dmark,ryzhikpyzhik,urinstein',
			'enzo.junior,rsty,samuel.de',
			'dan_h,edw4rd,ilevelin',
			'heimer-0r-afk,lonbertzend,nico79210',
			'der_rote_flitzer,lampskerm,n4tsu'
		];
	else if (eventNumber === 247)
		teams = [
			'chairtic,edw4rd,rsty',
			'der_rote_flitzer,nico79210,urinstein',
			'lobavainqueur,janfo,samuel.de',
			'dan_h,ryzhikpyzhik,nymios',
			'chauvi666,gamer0x,heimer-0r-afk'
		];
	else if (eventNumber === 244)
		teams = [
			'chairtic,dmark,ilevelin',
			'janfo,lonbertzend,miaou_3',
			'ryzhikpyzhik,dan_h,edw4rd',
			'der_rote_flitzer,grrrman,heimer-0r-afk'
		];
	else if (eventNumber === 200)
		teams = [
			'sibsab,kamphare,ryzhikpyzhik',
			'fussas,dmark,samuel.de',
			'ilevelin,tom.k,diablox999',
			'heimer-0r-afk,mazer,rsty',
			'thejanni99,tony_b0zz,ga0u',
			'mikky6,der_rote_flitzer,jankot',
			'janfo,nico79210,bugiman1153',
			'chairtic,grrrman,darkblaze147'
		];
	else if (eventNumber === 190)
		teams = [
			'miaou_3,ryzhikpyzhik,di_nozzo',
			'dmark,mazer,der_rote_flitzer',
			'liannee,diablox999,grrrman',
			'chairtic,kamphare,rsty',
			'dan_h,tony_b0zz,ilevelin',
			'ali92,bugiman1153,darkblaze147',
			'enzo.junior,gamer0x,tom.k'
		];
	else if (eventNumber === 201)
		teams = [
			'miaou_3,gamer0x,samuel.de',
			'janfo,jankot,plebsm',
			'ryzhikpyzhik,mazer,dmark',
			'flagur1,der_rote_flitzer,iamq',
			'heimer-0r-afk,ilevelin,chairtic',
			'mikky6,kamphare,rsty'
		];
	else return {};

	// 5 teams: switch 4 and 5
	// 6 teams: chenge 4 and 5, change 3 and 6
	// 7 teams: switch 4 and 5, 2 and 6, 3 and 7
	// 4 & 8 teams everything ok

	const lookupCID = calculateChallongeIdsDoubleElimination(teams.length);

	const isInTeamAtLeast2 = (teamWeKnow: string | undefined, teamToCheck: string | undefined) => {
		// if (teamToCheck === undefined || teamWeKnow === undefined) return false;
		return (
			(teamToCheck?.toLowerCase() ?? '')
				.split(',')
				.filter((v) => (teamWeKnow?.toLowerCase() ?? '').split(',').includes(v)).length >= 2
		);
	};

	// minimum of 4 teams
	// documentation at https://github.com/slashinfty/tournament-pairings#algorithms
	const elimBracket = DoubleElimination(teams, 1, true);
	const elimBracketWithResult: bracketMatchInterface[] = [];
	elimBracket.forEach((game) => {
		const cID = lookupCID[game.round.toString() + '-' + game.match.toString()];
		const newEntry: bracketMatchInterface = {
			round: game.round,
			match: game.match,
			team1: game.player1?.toString(),
			team2: game.player2?.toString(),
			win: game.win,
			loss: game.loss,
			results: groupedMatchesData[lookupCID[game.round + '-' + game.match].toString()],
			resultTeam1: 0,
			resultTeam2: 0,
			cID: cID,
			boX: calculateBoXDoubleElimination(teams.length, cID)
		}; /*
			let mapWinTeam1 = 0;
			let mapWinTeam2 = 0;
			newEntry.results.forEach((result) => {
				if (isInTeamAtLeast2(newEntry.team1, result.team1)) {
					if (result.scoreTeam1 === 3) mapWinTeam1++;
					else if (result.scoreTeam2 === 3) mapWinTeam2++;
				}
				if (isInTeamAtLeast2(newEntry.team1, result.team2)) {
					if (result.scoreTeam2 === 3) mapWinTeam1++;
					else if (result.scoreTeam1 === 3) mapWinTeam2++;
				}
			});*/
		elimBracketWithResult.push(newEntry);
	});

	elimBracketWithResult.forEach((match, index) => {
		const results = match.results;
		const mapWinsToWin = Math.ceil(match.boX / 2);
		const team1 = match.team1;
		const team2 = match.team2;
		let mapWinsTeam1 = 0;
		let mapWinsTeam2 = 0;
		if (results !== undefined)
			results.forEach((result) => {
				if (isInTeamAtLeast2(team1, result.team1)) {
					if (result.scoreTeam1 === 3) mapWinsTeam1++;
					else if (result.scoreTeam2 === 3) mapWinsTeam2++;
				}
				if (isInTeamAtLeast2(team1, result.team2)) {
					if (result.scoreTeam2 === 3) mapWinsTeam1++;
					else if (result.scoreTeam1 === 3) mapWinsTeam2++;
				}
			});
		match.resultTeam1 = mapWinsTeam1;
		match.resultTeam2 = mapWinsTeam2;
		const roundAfterWin = match.win?.round;
		const matchAfterWin = match.win?.match;
		const roundAfterLoss = match.loss?.round;
		const matchAfterLoss = match.loss?.match;
		const advancedMatch = elimBracketWithResult.find(
			(match) => match.round === roundAfterWin && match.match === matchAfterWin
		);
		const advancedLoserMatch = elimBracketWithResult.find(
			(match) => match.round === roundAfterLoss && match.match === matchAfterLoss
		);
		// the final has no next match
		if (advancedMatch !== undefined) {
			// team 1 won!
			if (mapWinsTeam1 >= mapWinsToWin) {
				if (advancedMatch?.team1 === undefined) advancedMatch.team1 = team1;
				else if (advancedMatch?.team2 === undefined) advancedMatch.team2 = team1;
			} else if (mapWinsTeam2 >= mapWinsToWin) {
				if (advancedMatch?.team1 === undefined) advancedMatch.team1 = team2;
				else if (advancedMatch?.team2 === undefined) advancedMatch.team2 = team2;
			}
		}

		if (advancedLoserMatch !== undefined) {
			if (mapWinsTeam1 >= mapWinsToWin) {
				if (advancedLoserMatch?.team1 === undefined) advancedLoserMatch.team1 = team2;
				else if (advancedLoserMatch?.team2 === undefined) advancedLoserMatch.team2 = team2;
			} else if (mapWinsTeam2 >= mapWinsToWin) {
				if (advancedLoserMatch?.team1 === undefined) advancedLoserMatch.team1 = team1;
				else if (advancedLoserMatch?.team2 === undefined) advancedLoserMatch.team2 = team1;
			}
		}
		// hrWidth = scrollableDiv?.offsetWidth ?? '100%';
	});

	return {
		groupedMatchesData,
		elimBracketWithResult,
		teams,
		eventList,
		fullEventName,
		lastMatchOfEventWasPlayedAt
	};
};
