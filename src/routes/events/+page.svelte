<script lang="ts">
	import { DoubleElimination } from 'tournament-pairings';
	import { groupBy } from '$lib/groupBy';
	import TeamElement from './TeamElement.svelte';
	import { arrayContained } from 'drizzle-orm';
	import { onMount } from 'svelte';

	// hardcoded because I value my time
	const calculateChallongeIdsDoubleElimination = (amountOfTeams: number) => {
		switch (amountOfTeams) {
			case 4:
				return {
					'1-1': 1,
					'1-2': 2,
					'2-1': 4,
					'3-1': 6,
					'4-1': 3,
					'5-1': 5
				};
			case 5:
				return {
					'1-1': 1,
					'2-1': 3,
					'2-2': 2,
					'3-1': 6,
					'4-1': 8,
					'5-1': 4,
					'6-1': 5,
					'7-1': 7
				};
			case 6:
				return {
					'1-1': 1,
					'1-2': 2,
					'2-1': 3,
					'2-2': 4,
					'3-1': 8,
					'4-1': 10,
					'5-1': 6,
					'5-2': 5,
					'6-1': 7,
					'7-1': 9
				};
			case 7:
				return {
					'1-1': 1,
					'1-2': 2,
					'1-3': 3,
					'2-1': 5,
					'2-2': 6,
					'3-1': 10,
					'4-1': 12,
					'5-1': 4,
					'6-1': 8,
					'6-2': 7,
					'7-1': 9,
					'8-1': 11
				};
			case 8:
				return {
					'1-1': 1,
					'1-2': 2,
					'1-3': 3,
					'1-4': 4,
					'2-1': 7,
					'2-2': 8,
					'3-1': 12,
					'4-1': 14,
					'5-1': 5,
					'5-2': 6,
					'6-1': 10,
					'6-2': 9,
					'7-1': 11,
					'8-1': 13
				};
			default:
				console.error(`Sorry, we are out`);
		}
	};

	const calculateBoXDoubleElimination = (amountTeams: number, matchNumber: number) => {
		switch (amountTeams) {
			case 4:
				return 3;
			case 5:
				if (matchNumber === 7) return 1;
				return 3;
			case 6:
				if (matchNumber === 7 || matchNumber === 9) return 1;
				return 3;
			case 7:
				if (matchNumber === 9 || matchNumber === 11) return 1;
				return 3;
			case 8:
				if (matchNumber === 11 || matchNumber === 13) return 1;
				return 3;
		}
		return 3;
	};

	export let data;
	// $: console.log(JSON.stringify(data, null, '\t'));

	const lookupCID = calculateChallongeIdsDoubleElimination(data.teams.length);
	const getResultByElimIndex = (matchIndex: number) => {
		return data.groupedMatchesData[
			lookupCID[
				elimBracketWithResult[matchIndex]?.round + '-' + elimBracketWithResult[matchIndex]?.match
			].toString()
		];
	};

	let hoveredTeam = '';
	function changeHovered(newHovered: string) {
		hoveredTeam = newHovered;
	}

	const isInTeamAtLeast2 = (teamWeKnow: string, teamToCheck: string) => {
		return (
			(teamToCheck.toLowerCase() ?? '')
				.split(',')
				.filter((v) => teamWeKnow.toLowerCase().split(',').includes(v)).length >= 2
		);
	};

	// minimum of 4 teams
	// documentation at https://github.com/slashinfty/tournament-pairings#algorithms
	let elimBracket = DoubleElimination(data.teams, 1, true);
	let elimBracketWithResult = [];
	elimBracket.forEach((game) => {
		const cID = lookupCID[game.round.toString() + '-' + game.match.toString()];
		const newEntry = {
			round: game.round,
			match: game.match,
			team1: game.player1,
			team2: game.player2,
			win: game.win,
			loss: game.loss,
			results: data.groupedMatchesData[lookupCID[game.round + '-' + game.match].toString()],
			resultTeam1: 0,
			resultTeam2: 0,
			cID: cID,

			boX: calculateBoXDoubleElimination(data.teams.length, cID)
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
	console.log('elimBracketWithResult');
	console.log(elimBracketWithResult);
	// console.log(elimBracket);
	const finalIndex = elimBracketWithResult.findIndex((match) => match.win === undefined);
	const finalMatch = elimBracketWithResult[finalIndex];
	const lowerBracket = elimBracketWithResult.slice(finalIndex + 1, elimBracketWithResult.length);
	const upperBracket = elimBracketWithResult.slice(0, finalIndex);

	const maxRoundUpper = Math.max(...upperBracket.map((e) => e.round));
	const maxRoundLower = Math.max(...lowerBracket.map((e) => e.round));
	const minRoundLower = Math.min(...lowerBracket.map((e) => e.round));

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
				if (advancedMatch?.team1 === null) advancedMatch.team1 = team1;
				else if (advancedMatch?.team2 === null) advancedMatch.team2 = team1;
			} else if (mapWinsTeam2 >= mapWinsToWin) {
				if (advancedMatch?.team1 === null) advancedMatch.team1 = team2;
				else if (advancedMatch?.team2 === null) advancedMatch.team2 = team2;
			}
		}

		if (advancedLoserMatch !== undefined) {
			if (mapWinsTeam1 >= mapWinsToWin) {
				if (advancedLoserMatch?.team1 === null) advancedLoserMatch.team1 = team2;
				else if (advancedLoserMatch?.team2 === null) advancedLoserMatch.team2 = team2;
			} else if (mapWinsTeam2 >= mapWinsToWin) {
				if (advancedLoserMatch?.team1 === null) advancedLoserMatch.team1 = team1;
				else if (advancedLoserMatch?.team2 === null) advancedLoserMatch.team2 = team1;
			}
		}
		// hrWidth = scrollableDiv?.offsetWidth ?? '100%';
	});

	// result.team1.split(',').filter((v) => teamName.split(',').includes(v)).length >= 2
	// result.team1.split(',').every((v) => teamName.split(',').includes(v))

	/*
    
	{#each upperBracketGrouped as round}
		{(console.log(round), '')}
	{/each}
    */
	// console.log('ab');
	console.log('dada');
	console.log(data.groupedMatchesData);
	console.log('elimBracketWithResult2');
	console.log(elimBracketWithResult);

	// making the <hr> divider the width of the whole scrollable div (only doable in javascript)
	let scrollableBracketDiv: HTMLElement;
	let upperLowerBracketHrDivider = {};
	$: upperLowerBracketHrDivider.width = scrollableBracketDiv?.scrollWidth?.toString() ?? '100%';
</script>

<div class="overflow-auto rounded-lg bg-gray-600 p-4" bind:this={scrollableBracketDiv}>
	<div class="bracket">
		{#each Array(maxRoundUpper) as e, roundIndex}
			<span class="top-0 w-10 whitespace-nowrap text-lg text-white dark:text-white"
				>ROUND {roundIndex + 1}</span
			>
			<div class="round -ml-10 mt-5">
				{#each upperBracket.filter((match) => match.round === roundIndex + 1) as match}
					<div class="match">
						<div class="c-id float-left mt-[2.375rem] rounded-r px-1">
							{match.cID}
						</div>
						<TeamElement
							teamName={match.team1}
							results={match.results}
							{hoveredTeam}
							{changeHovered}
						/>
						<TeamElement
							teamName={match.team2}
							results={match.results}
							{hoveredTeam}
							{changeHovered}
						/>
					</div>
				{/each}
			</div>
		{/each}

		<!-- grand final -->
		<!-- teamName={elimBracket[finalIndex].player1?.toString()} -->
		<span class="top-0 w-10 whitespace-nowrap text-lg text-white dark:text-white">GRAND FINAL</span>
		<div class="round !mr-0 -ml-10 mt-5">
			<div class="match">
				<div class="c-id float-left mt-[2.375rem] rounded-r px-1">
					{finalMatch.cID}
				</div>
				<TeamElement
					teamName={finalMatch.team1}
					results={finalMatch.results}
					{hoveredTeam}
					{changeHovered}
				/>
				<TeamElement
					teamName={finalMatch.team2}
					results={finalMatch.results}
					{hoveredTeam}
					{changeHovered}
				/>
			</div>
		</div>
		<div class="ml-4 w-0">&nbsp;</div>
	</div>
	<!-- !ml-[-1rem] !mr-[-1rem] -->
	<hr
		bind:this={upperLowerBracketHrDivider}
		class="  solid mx-auto !ml-[-1rem] !mr-[-1rem] inline-block"
	/>
	<br />
	<div class="bracket">
		{#each Array(maxRoundLower - minRoundLower + 1) as e, roundIndex}
			<!--  {roundIndex > 0 ? '-ml-[1.5rem]' : ''} -->
			<div class="round">
				{#each lowerBracket.filter((match) => match.round === roundIndex + minRoundLower) as match}
					<div class="match">
						<div class="c-id float-left mt-[2.375rem] rounded-r px-1">
							{match.cID}
						</div>
						<TeamElement
							teamName={match.team1}
							results={getResultByElimIndex(roundIndex + minRoundLower)}
							{hoveredTeam}
							{changeHovered}
						/>
						<TeamElement
							teamName={match.team2}
							results={getResultByElimIndex(roundIndex + minRoundLower)}
							{hoveredTeam}
							{changeHovered}
						/>
					</div>
				{/each}
			</div>
		{/each}
	</div>
</div>

<!--
	<div class="round">
		<div class="match">
			<!-- svelte-ignore a11y-mouse-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<!--
			<div
				class="team"
				class:team-hover={hoveredTeam === '1'}
				on:mouseover={() => {
					hoveredTeam = '1';
				}}
				on:mouseleave={() => {
					hoveredTeam = '';
				}}
			>
				Team Red
			</div>
			<div class="team">Team Blue</div>
		</div>
-->

<style>
	.team-hover {
		background: green !important;
	}

	.bracket {
		display: flex;
	}

	.round {
		flex: 1;
		display: flex;
		margin-right: 2rem;
		flex-direction: column;
		justify-content: space-around;
		max-width: 20rem;
	}

	.match {
		margin: 15px 0;
		overflow: hidden;
		border-radius: 5px;
		max-width: 20rem;
		width: 20rem;
	}

	.team {
		color: #fff;
		padding: 10px 8px;
		background-color: #74b9ff;
	}

	.team:nth-child(odd) {
		border-bottom: 1px solid #8fc7ff;
	}

	.c-id {
		background-color: #23252d;
	}
</style>
