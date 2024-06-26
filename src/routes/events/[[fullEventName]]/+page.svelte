<script lang="ts">
	import BracketMatch from './BracketMatch.svelte';
	import EventSelector from '$components/EventSelector.svelte';
	import type { bracketMatchInterface } from '$lib/customInterfaces/bracketMatchInterface';
	import type { PageData } from '../$types';
	import { Button } from 'flowbite-svelte';
	import { invalidate, invalidateAll } from '$app/navigation';
	import { page } from '$app/stores';

	// data changes as soon as the user HOVERS over
	export let data: PageData;
	// $: console.log(JSON.stringify(data, null, '\t'));

	let hoveredTeam = '';
	function changeHovered(newHovered: string) {
		hoveredTeam = newHovered;
	}

	let finalIndex: number;
	let finalMatch: bracketMatchInterface;
	let lowerBracket: bracketMatchInterface[];
	let upperBracket: bracketMatchInterface[];
	let maxRoundLower: number;
	let maxRoundUpper: number;
	let minRoundLower: number;
	$: {
		finalIndex = data.elimBracketWithResult.findIndex((match) => match.win === undefined);
		finalMatch = data.elimBracketWithResult[finalIndex];
		lowerBracket = data.elimBracketWithResult.slice(
			finalIndex + 1,
			data.elimBracketWithResult.length
		);
		upperBracket = data.elimBracketWithResult.slice(0, finalIndex);

		maxRoundUpper = Math.max(...upperBracket.map((e) => e.round));
		maxRoundLower = Math.max(...lowerBracket.map((e) => e.round));
		minRoundLower = Math.min(...lowerBracket.map((e) => e.round));
	}

	// making the <hr> divider the width of the whole scrollable div (only doable in javascript)
	let scrollableBracketDiv: HTMLElement;
	let upperLowerBracketHrDivider: HTMLElement;
	$: if (upperLowerBracketHrDivider !== undefined)
		upperLowerBracketHrDivider.width = scrollableBracketDiv?.scrollWidth?.toString() ?? '100%';

	const hoursToAdd = 4;
	let lastMatchOfEventWasPlayedAt: Date;

	$: {
		lastMatchOfEventWasPlayedAt = new Date();
		// Add 7 days to the current date. if no game has been played yet we want to check for it until the browser closes
		lastMatchOfEventWasPlayedAt.setDate(lastMatchOfEventWasPlayedAt.getDate() + 7);
		if (data.lastMatchOfEventWasPlayedAt !== undefined) {
			lastMatchOfEventWasPlayedAt = new Date(data.lastMatchOfEventWasPlayedAt);
			// add 2 hours offset
			lastMatchOfEventWasPlayedAt.setTime(
				lastMatchOfEventWasPlayedAt.getTime() + 2 * 60 * 60 * 1000
			);
		}

		// 1 hour for a map to be finished
		// if the  lastgame is not longer than 1 hour in the past, we reload the bracket every 20sec
		setInterval(() => {
			console.log(new Date().getTime() - lastMatchOfEventWasPlayedAt.getTime());
			if (
				new Date().getTime() - lastMatchOfEventWasPlayedAt.getTime() < 1 * 60 * 60 * 1000 ||
				true
			) {
				console.log('bracket loads new data');
				// invalidate('app:events');
			}
		}, 20000);
	}
</script>

<EventSelector eventList={data.eventList} selectedEvent={data.fullEventName} baseUrl="/events" />
<Button
	on:click={() => {
		invalidate('app:events');
	}}>Lade Daten neu</Button
>
<div class="overflow-auto rounded-lg bg-gray-600 p-4" bind:this={scrollableBracketDiv}>
	<div class="bracket">
		{#each Array(maxRoundUpper) as e, roundIndex}
			<span class="top-0 w-10 whitespace-nowrap text-lg text-white dark:text-white"
				>ROUND {roundIndex + 1}</span
			>
			<div class="round -ml-10 mt-5">
				{#each upperBracket.filter((match) => match.round === roundIndex + 1) as match}
					<BracketMatch
						cID={match.cID}
						teamName1={match.team1}
						teamName2={match.team2}
						results={match.results}
						{hoveredTeam}
						{changeHovered}
					/>
				{/each}
			</div>
		{/each}

		<!-- grand final -->
		<!-- teamName={elimBracket[finalIndex].player1?.toString()} -->
		<span class="top-0 w-10 whitespace-nowrap text-lg text-white dark:text-white">GRAND FINAL</span>
		<div class="round !mr-0 -ml-10 mt-5">
			<BracketMatch
				cID={finalMatch.cID}
				teamName1={finalMatch.team1}
				teamName2={finalMatch.team2}
				results={finalMatch.results}
				{hoveredTeam}
				{changeHovered}
			/>
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
					<BracketMatch
						cID={match.cID}
						teamName1={match.team1}
						teamName2={match.team2}
						results={match.results}
						{hoveredTeam}
						{changeHovered}
					/>
				{/each}
			</div>
		{/each}
	</div>
</div>

<style>
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
</style>
