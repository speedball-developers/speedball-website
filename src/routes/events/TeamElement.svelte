<script lang="ts">
	export let teamName: string | null | undefined;
	if (teamName === null || teamName === undefined) teamName = 'tbd';
	export let hoveredTeam = '';
	export let changeHovered;
	export let results: any[] = [];

	if (results.length === 2) {
		/*console.log('aaaaaa');
		console.log(results);
		console.log(teamName);*/
	}

	// if (results.length > 0) console.log(results);
	if (teamName.includes('dmark')) {
		console.log(results);
		console.log(results[0].team1);
		console.log(teamName);
	}
</script>

<!-- svelte-ignore a11y-mouse-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div
	class="team"
	class:team-hover={hoveredTeam === teamName}
	on:mouseover={() => {
		changeHovered(teamName);
	}}
	on:mouseleave={() => {
		changeHovered('');
	}}
>
	<!-- width:calc(100% - 20px); -->
	<div style="width:calc(100% - 6.5rem);" class="inline-block truncate">{teamName}</div>
	{#if results.length === 0}
		<span class="float-right pr-4">0</span>
	{:else}
		<div class="float-right">
			{#each results as result}
				<span class="pr-4"
					><!-- result.team1.split(',').every((v) => teamName.split(',').includes(v)) -->
					{#if result.team1
						.toLowerCase()
						.split(',')
						.filter((v) => teamName.toLowerCase().split(',').includes(v)).length >= 2}
						{#if result.scoreTeam1 === 3}
							<span class="font-bold text-orange-500">{result.scoreTeam1}</span>
						{:else}
							{result.scoreTeam1}{/if}
					{:else}
						{#if result.scoreTeam2 === 3}
							<span class="font-bold text-orange-500">{result.scoreTeam2}</span>
						{:else}
							{result.scoreTeam2}{/if}
					{/if}</span
				>
			{/each}
		</div>
	{/if}
</div>

<style>
	.team-hover {
		/*background: green !important; #272a33*/
		background-color: #23252d !important;
	}

	.team {
		color: #fff;
		padding: 10px 8px;
		/* background-color: #74b9ff; */
		background-color: #414655;
	}

	.team:nth-child(odd) {
		border-bottom: 1px solid #8fc7ff;
	}
</style>
