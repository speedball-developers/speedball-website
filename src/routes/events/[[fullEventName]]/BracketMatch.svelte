<script lang="ts">
	export let teamName1: string | undefined;
	export let teamName2: string | undefined;
	export let cID: number = -1;
	if (teamName1 === null || teamName1 === undefined) teamName1 = 'tbd';
	if (teamName2 === null || teamName2 === undefined) teamName2 = 'tbd';
	export let hoveredTeam = '';
	export let changeHovered;
	export let results: any[] = [];
</script>

<div class="match">
	<div class="c-id float-left mt-[2.375rem] rounded-r px-1">
		{cID}
	</div>
	{#each [teamName1, teamName2] as teamName}
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
								.filter((v) => (teamName ?? '').toLowerCase().split(',').includes(v)).length >= 2}
								{#if result.scoreTeam1 === 3}
									<span class="font-bold text-orange-500">{result.scoreTeam1}</span>
								{:else}
									{result.scoreTeam1}{/if}
							{:else if result.team2
								.toLowerCase()
								.split(',')
								.filter((v) => (teamName ?? '').toLowerCase().split(',').includes(v)).length >= 2}
								{#if result.scoreTeam2 === 3}
									<span class="font-bold text-orange-500">{result.scoreTeam2}</span>
								{:else}
									{result.scoreTeam2}{/if}
							{:else}
								0
							{/if}</span
						>
					{/each}
				</div>
			{/if}
		</div>
	{/each}
</div>

<style>
	.match {
		margin: 15px 0;
		overflow: hidden;
		border-radius: 5px;
		max-width: 20rem;
		width: 20rem;
	}

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

	.c-id {
		background-color: #23252d;
		color: white;
	}
</style>
