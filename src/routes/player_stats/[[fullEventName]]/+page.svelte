<script lang="ts">
	import * as m from '$msgs';
	import { onMount } from 'svelte';
	import {
		Table,
		TableBody,
		TableBodyCell,
		TableBodyRow,
		TableHead,
		TableHeadCell,
		Tooltip,
		Popover,
		Checkbox,
		ButtonGroup,
		Search,
		ListPlaceholder,
		Alert,
		Toggle
	} from 'flowbite-svelte';
	import { persisted } from 'svelte-persisted-store';
	import { DateInput } from 'date-picker-svelte';
	import { goto } from '$app/navigation';
	import colorParserToHtml from '$lib/color_parser';
	import { Button, Dropdown, DropdownItem, DropdownDivider } from 'flowbite-svelte';
	import {
		ChevronDownOutline,
		ChevronRightOutline,
		ChevronDoubleRightOutline
	} from 'flowbite-svelte-icons';
	import MediaQuery from 'svelte-media-queries';
	import { page } from '$app/stores';
	import { pushState } from '$app/navigation';
	import { concat } from 'drizzle-orm/mysql-core/expressions';

	// export let data;
	let data = {};
	let dataHasLoaded = false;
	// $: console.log(data);

	async function fetchData(event = 'latest') {
		dataHasLoaded = false;
		if (event.includes('all') || event === 'public') {
			showTeamStats = false;
			showTeamStatsEnabled = false;
		} else {
			showTeamStatsEnabled = true;
		}
		const response = await fetch(
			'/api/player_stats/' +
				event +
				'?start-date=' +
				startDate.toISOString().split('T')[0] +
				'&end-date=' +
				endDate.toISOString().split('T')[0]
		);
		const result = await response.json();
		data = result;
		dataHasLoaded = true;
		return result;
	}

	// wanting to use Object.groupBy but it is too new for typescript so we use this implementation
	// code from https://stackoverflow.com/questions/14446511/most-efficient-method-to-groupby-on-an-array-of-objects/56877421
	const groupBy = (arr, k, fn = () => true) =>
		arr.reduce((r, c) => (fn(c[k]) ? (r[c[k]] = [...(r[c[k]] || []), c]) : null, r), {});
	// we exclude public and empty '' events as they are not numbered events
	let eventListOrganized = [];

	$: eventListOrganized = groupBy(
		(data.eventList ?? []).filter((event) => event.event != '' && event.event != 'public'),
		'event'
	);

	let selectedEvent = $page.params.fullEventName;
	$: if (Object.hasOwn(data, 'fullEventName') && data.fullEventName !== '')
		selectedEvent = data.fullEventName;
	const prettifySelectedEvent = (selectedEvent: string) =>
		selectedEvent[0] === undefined
			? ''
			: selectedEvent[0].toUpperCase() +
				selectedEvent
					.replaceAll('-', ' ')
					.replaceAll('_', ' ')
					.replaceAll('cup', 'Cup')
					.replaceAll(' time', ' Time')
					.replaceAll(' percent', ' Percent')
					.replaceAll('kd', 'KD')
					.replaceAll('points', 'Points')
					.substring(1);
	let searchTerm = '';
	const changeSelectedEvent = (newSelectedEvent: string) => {
		if (newSelectedEvent == selectedEvent) return;
		eventDropdownOpen = false;

		fetchData(newSelectedEvent);
		pushState('/player_stats/' + newSelectedEvent + '/?' + $page.url.searchParams.toString(), {});
		// goto(`/player_stats/${newSelectedEvent}`);
		selectedEvent = newSelectedEvent;
	};

	let showTeamStats = false;
	let showTeamStatsEnabled = true;

	const showedCategoriesDefault = {
		login: false,
		nickname: true,
		rank: false,
		ladder_points: false,
		points: true,
		damage: false,
		kills: true,
		deaths: false,
		kd_ratio: true,
		accuracy: true,
		passes_done: true,
		passes_received: false,
		ball_hits: false,
		backstabs: true,
		captures: true,
		captures_total_percent: false,
		captures_total_time: false,
		playtime: true,
		maps_played: false,
		maps_won: true
	};
	const categoriesLeftAligned = ['login', 'nickname'];

	// persisted means that we save the preferences of the user in the localstorage of the browser
	export const showedCategoriesPlayerStats = persisted(
		'storedShowedCategoriesPlayerStats',
		showedCategoriesDefault
	);

	const defaultStartDate = new Date('2013-04-10');
	const defaultEndDate = new Date();
	let startDate = defaultStartDate;
	let endDate = defaultEndDate;
	const categoriesWhichAreNonNumerical = ['login', 'nickname'];
	const sortArrowDownCharacter = '▼';
	const sortArrowUpCharacter = '▲'; //as
	const defaultLimitForTable = 30;
	export let limitForTable = persisted('storedLimitForTablePlayerStats', defaultLimitForTable);
	// let limitForTable = 30;
	let sortKey = Object.hasOwn(data, 'sortBy') ? data.sortBy.split('-')[0] : 'damage'; // default sort key
	let sortDirection = -1; // default sort direction (descending)
	if ((data.sortBy ?? '-').split('-')[1] === 'asc') sortDirection = 1;
	enum averageOrNotType {
		TotalValues,
		AvgPerMap,
		AvgPer10Min
	}
	let averageOrNot: averageOrNotType = averageOrNotType.TotalValues;
	let filteredAndSortedItems: any[];

	let amountOfPages = 1;
	let activePage = parseInt(data.pageNumber ?? '1') - 1;
	amountOfPages = Math.ceil((data.playerList ?? []).length / $limitForTable);
	if (activePage < 0 || activePage >= amountOfPages) activePage = 0;
	let visiblePaginationPages: number[];
	$: {
		visiblePaginationPages = Array(amountOfPages)
			.fill()
			.map((e, index) => index);
		if (amountOfPages > 5) {
			visiblePaginationPages = [0];
			if (activePage === 0 || activePage === 1) {
				visiblePaginationPages.push(1);
				visiblePaginationPages.push(2);
				visiblePaginationPages.push(3);
			} else if (activePage === amountOfPages - 2 || activePage === amountOfPages - 1) {
				visiblePaginationPages.push(amountOfPages - 4);
				visiblePaginationPages.push(amountOfPages - 3);
				visiblePaginationPages.push(amountOfPages - 2);
			} else {
				visiblePaginationPages.push(activePage - 1);
				visiblePaginationPages.push(activePage);
				visiblePaginationPages.push(activePage + 1);
			}
			visiblePaginationPages.push(amountOfPages - 1);
		}
	}

	$: {
		let key = '';
		// sort by login when nickname sorting is selected
		if (sortKey != 'nickname') key = sortKey;
		else key = 'login';
		const direction = sortDirection;
		let sorted = [];
		let filteredItems = [];
		if (showTeamStats) filteredItems = teamData ?? [];
		else filteredItems = data.playerList ?? [];
		filteredItems = filteredItems.filter(
			(item) =>
				item.login.toLowerCase().indexOf(searchTerm.toLowerCase()) !== -1 ||
				item.nickname.toLowerCase().indexOf(searchTerm.toLowerCase()) !== -1
		);

		// change values if Average per Map or Average per 10 Minutes has been selected instead of Total Values
		if (averageOrNot == averageOrNotType.AvgPerMap) {
			filteredItems = filteredItems.map((item) => {
				const newItem = {};
				Object.keys(item).forEach((key) => {
					if (['login', 'nickname', 'kd_ratio', 'accuracy'].includes(key)) newItem[key] = item[key];
					else newItem[key] = Math.round((item[key] / item.maps_played) * 100) / 100;
				});
				return newItem;
			});
		} else if (averageOrNot == averageOrNotType.AvgPer10Min) {
			filteredItems = filteredItems.map((item) => {
				const newItem = {};
				Object.keys(item).forEach((key) => {
					if (['login', 'nickname', 'kd_ratio', 'accuracy'].includes(key)) newItem[key] = item[key];
					else newItem[key] = Math.round((item[key] / item.playtime) * 600 * 100) / 100;
				});
				return newItem;
			});
		}

		filteredAndSortedItems = filteredItems.sort((a, b) => {
			let aVal;
			let bVal;
			if (categoriesWhichAreNonNumerical.includes(key)) {
				aVal = a[key];
				bVal = b[key];
			} else {
				aVal = parseFloat(a[key]);
				bVal = parseFloat(b[key]);
			}
			if (aVal < bVal) {
				return -direction;
			} else if (aVal > bVal) {
				return direction;
			}
			return 0;
		});

		// update amount of pages as the filter list can be smaller / bigger now
		amountOfPages = Math.ceil(filteredAndSortedItems.length / $limitForTable);
		if (activePage < 0 || activePage >= amountOfPages) activePage = 0;

		// we only need limitForTable amount of items to show at the UI
		filteredAndSortedItems = filteredAndSortedItems.slice(
			$limitForTable * activePage,
			$limitForTable * (activePage + 1)
		);
	}

	// Define a function to sort the items
	const sortTable = (key: string) => {
		// If the same key is clicked, reverse the sort direction
		if (sortKey === key) {
			sortDirection *= -1;
		} else {
			sortKey = key;
			sortDirection = -1;
		}

		const newUrlParams = $page.url.searchParams;
		newUrlParams.set('sortBy', sortKey + '-' + (sortDirection === 1 ? 'asc' : 'desc'));
		pushState('?' + newUrlParams.toString(), {});
	};

	const formatCellByCategory = (input: any, category: string) => {
		if (isNaN(input)) return input;
		let returnString = input.toString();

		if (averageOrNot === averageOrNotType.TotalValues && category !== 'kd_ratio')
			returnString = parseFloat(input).toFixed(0).toString();
		else returnString = parseFloat(input).toFixed(2).toString();

		if (category === 'playtime' || category === 'captures_total_time') {
			const totalSeconds = parseFloat(input);
			if (totalSeconds > 60) {
				let hours = Math.floor(totalSeconds / 3600).toString();
				if (hours.length < 2) hours = '0' + hours;
				let minutes = Math.floor((totalSeconds % 3600) / 60).toString();
				if (minutes.length < 2) minutes = '0' + minutes;
				let seconds = Math.floor(totalSeconds % 60).toString();
				if (seconds.length < 2) seconds = '0' + seconds;
				return hours + ':' + minutes + ':' + seconds;
			} else return totalSeconds.toFixed(2).toString() + 's';
		} else if (
			category === 'captures_total_percent' &&
			averageOrNot === averageOrNotType.TotalValues
		)
			returnString = input.toString();
		else if (category === 'accuracy')
			returnString = (Math.round(input * 10000) / 100).toFixed(2).toString();

		if (category === 'captures_total_percent' || category === 'accuracy') returnString += '%';
		return returnString;
	};

	const setPage = (newActivePage: number) => {
		if (newActivePage >= 0 && newActivePage < amountOfPages && newActivePage != activePage) {
			activePage = newActivePage;
			const newUrlParams = $page.url.searchParams;
			newUrlParams.set('page', (activePage + 1).toString());
			pushState('?' + newUrlParams.toString(), {});
		}
	};

	const clickShowAllCategories = () => {
		let showedCategoriesAllTrue = {};
		for (const [key, value] of Object.entries(showedCategoriesDefault)) {
			showedCategoriesAllTrue[key] = true;
		}
		let showedCategoriesAllFalse = {};
		for (const [key, value] of Object.entries(showedCategoriesDefault)) {
			showedCategoriesAllFalse[key] = false;
		}

		let areAllCategoriesSelected = Object.values($showedCategoriesPlayerStats).every(
			(v) => v === true
		);

		if (areAllCategoriesSelected === true)
			$showedCategoriesPlayerStats = { ...showedCategoriesAllFalse };
		else $showedCategoriesPlayerStats = { ...showedCategoriesAllTrue };
	};

	$: {
		if (startDate.getTime() !== defaultStartDate.getTime()) {
			fetchData(selectedEvent);
			const newUrlParams = $page.url.searchParams;
			newUrlParams.set('start-date', startDate.toISOString().split('T')[0]);
			pushState('?' + newUrlParams.toString(), {});
		}
	}

	$: {
		if (endDate.getTime() !== defaultEndDate.getTime()) {
			fetchData(selectedEvent);
			const newUrlParams = $page.url.searchParams;
			newUrlParams.set('end-date', endDate.toISOString().split('T')[0]);
			pushState('?' + newUrlParams.toString(), {});
		}
	}

	let isAverageButtonActive;
	$: isAverageButtonActive = (averageOrNotOfThisButton: averageOrNotType) => {
		if (averageOrNotOfThisButton === averageOrNot) return true;
		return false;
	};

	const changeNavigationBreadcrumb = (newUrl: string, newEvent: string) => {
		pushState(newUrl, {});
		if (newEvent !== selectedEvent) {
			selectedEvent = newEvent;
			fetchData(newEvent);
		}
	};

	// load the data
	onMount(async () => {
		fetchData(selectedEvent);
	});

	let eventDropdownOpen = false;
	let averageDropdownOpen = false;
	let showSummedEntry = false;
	let showAverageEntry = false;

	let summedEntry = {
		login: 'total-values',
		nickname: 'total-values',
		rank: 0,
		ladder_points: 0,
		points: 0,
		damage: 0,
		kills: 0,
		deaths: 0,
		kd_ratio: 0,
		accuracy: 0,
		passes_done: 0,
		passes_received: 0,
		ball_hits: 0,
		backstabs: 0,
		captures: 0,
		captures_total_percent: 0,
		captures_total_time: 0,
		playtime: 0,
		maps_played: 0,
		maps_won: 0
	};

	let averageEntry = { ...summedEntry };
	$: {
		if (showTeamStats) {
			averageEntry.login = 'average-team';
			averageEntry.nickname = 'average-team';
		} else {
			averageEntry.login = 'average-player';
			averageEntry.nickname = 'average-player';
		}
	}

	let summedAndAverageEntriesShownArray = [];
	$: {
		summedAndAverageEntriesShownArray = [];
		if (showSummedEntry === true) summedAndAverageEntriesShownArray = [summedEntry];
		if (showAverageEntry === true) summedAndAverageEntriesShownArray.push(averageEntry);
	}

	$: if (filteredAndSortedItems !== undefined && filteredAndSortedItems.length > 0) {
		Object.keys(summedEntry).forEach((category) => {
			if (category !== 'login' && category !== 'nickname') {
				summedEntry[category] = filteredAndSortedItems.reduce(
					(a, b) => a + parseFloat(b[category]),
					0
				);
				averageEntry[category] = summedEntry[category] / filteredAndSortedItems.length;
			}
		});
	}
	let teamData = [];
	const dontAddUpForTeams = ['accuracy', 'maps_won', 'maps_played', 'kd_ratio', 'playtime'];
	$: {
		teamData = [];
		if (data.teams === undefined) teamData = [];
		else {
			data.teams.forEach((team) => {
				let summedTeamEntry = {
					login: team.logins,
					nickname: team.logins,
					rank: 0,
					ladder_points: 0,
					points: 0,
					damage: 0,
					kills: 0,
					deaths: 0,
					kd_ratio: 0,
					accuracy: 0,
					passes_done: 0,
					passes_received: 0,
					ball_hits: 0,
					backstabs: 0,
					captures: 0,
					captures_total_percent: 0,
					captures_total_time: 0,
					playtime: 0,
					maps_played: 0,
					maps_won: 0
				};
				const players = data.playerList.filter((player) => team.logins.includes(player.login));
				summedTeamEntry.nickname = players.map((player) => player.nickname.toString()).join('$z, ');
				// assign the players player1,player2,player3 to a team if registered in the teams database
				if (data.formedTeamsAssignments !== undefined) {
					const teamAssignment = data.formedTeamsAssignments
						.filter((teamEntry) => teamEntry.event === selectedEvent)
						.filter((teamEntry) =>
							players.every((player) => teamEntry.login.includes(player.login))
						)
						.pop();
					if (teamAssignment !== undefined) {
						summedTeamEntry.nickname = teamAssignment.name;
						if (teamAssignment.custom_name !== null && teamAssignment.custom_name !== '')
							summedTeamEntry.nickname = teamAssignment.custom_name;
					}
				}
				Object.keys(summedTeamEntry).forEach((category) => {
					if (category !== 'login' && category !== 'nickname') {
						summedTeamEntry[category] = players.reduce(
							(a, b) =>
								a +
								parseFloat(b[category]) /
									(dontAddUpForTeams.includes(category) ? players.length : 1),
							0
						);
						// averageEntry[category] = summedEntry[category] / players.length;
					}
				});
				teamData.push(summedTeamEntry);
			});
		}
	}
</script>

<!-- class="mt-4 bg-opacity-75"
	style="background-image:url({headerImage}); filter: grayscale(100%)" -->
<div>
	<div>
		<Button class="w-40 whitespace-nowrap"
			>{selectedEvent !== 'all' && selectedEvent !== 'public'
				? prettifySelectedEvent(selectedEvent)
				: selectedEvent === 'all'
					? m.events_all()
					: m.events_public()}<ChevronDownOutline
				class="ms-2 h-6 w-6 text-white dark:text-white"
			/></Button
		>
		<Dropdown bind:open={eventDropdownOpen}>
			<DropdownItem on:click={() => changeSelectedEvent('all')}>{m.events_all()}</DropdownItem>
			<DropdownItem on:click={() => changeSelectedEvent('public')}>{m.events_public()}</DropdownItem
			>
			<DropdownDivider />
			{#each Object.entries(eventListOrganized) as [event_name, events_array]}
				<DropdownItem class="flex items-center justify-between">
					{prettifySelectedEvent(event_name)}<ChevronRightOutline
						class="ms-2 h-6 w-6 text-primary-700 dark:text-white"
					/>
				</DropdownItem>
				<Dropdown class="max-h-96 overflow-y-auto whitespace-nowrap" placement="right-start">
					<DropdownItem on:click={() => changeSelectedEvent(event_name + '-' + 'all')}
						>{m.events_all()}</DropdownItem
					>
					<DropdownDivider />
					{#each events_array as event}
						<DropdownItem
							on:click={() => changeSelectedEvent(event_name + '-' + event.event_number)}
							>{prettifySelectedEvent(event_name) + ' ' + event.event_number}</DropdownItem
						>
					{/each}
				</Dropdown>
			{/each}
		</Dropdown>

		<Button class="mx-2"
			>{m.table_shown_columns()}<ChevronDownOutline
				class="ms-2 h-6 w-6 text-white dark:text-white"
			/></Button
		>
		<Dropdown class="w-44 cursor-pointer space-y-3 p-3 text-sm">
			<DropdownItem
				on:click={() => {
					$showedCategoriesPlayerStats = { ...showedCategoriesDefault };
				}}>{m.table_reset_categories()}</DropdownItem
			>
			<Checkbox
				class="cursor-pointer"
				on:click={() => clickShowAllCategories()}
				checked={Object.values($showedCategoriesPlayerStats).every((v) => v === true)}
				>{m.table_all_categories()}</Checkbox
			>
			<DropdownDivider />
			{#each Object.keys($showedCategoriesPlayerStats) as category, i (category)}
				<li>
					<Checkbox
						class="cursor-pointer"
						on:click={() => {
							$showedCategoriesPlayerStats[category] = !$showedCategoriesPlayerStats[category];
							$showedCategoriesPlayerStats = $showedCategoriesPlayerStats;
						}}
						checked={$showedCategoriesPlayerStats[category]}
						>{prettifySelectedEvent(category)}</Checkbox
					>
				</li>
			{/each}
		</Dropdown>

		<MediaQuery query="(max-width: 1024px)" let:matches>
			{#if matches}
				<Button class="w-52"
					>{averageOrNot === averageOrNotType.TotalValues
						? m.table_total_values()
						: ''}{averageOrNot === averageOrNotType.AvgPerMap
						? m.table_average_per_map()
						: ''}{averageOrNot === averageOrNotType.AvgPer10Min
						? m.table_average_per_10min()
						: ''}<ChevronDownOutline class="ms-2 h-6 w-6 text-white dark:text-white" /></Button
				>
				<Dropdown bind:open={averageDropdownOpen}>
					<DropdownItem
						on:click={() => {
							averageDropdownOpen = false;
							averageOrNot = averageOrNotType.TotalValues;
						}}>{m.table_total_values()}</DropdownItem
					>
					<DropdownItem
						on:click={() => {
							averageDropdownOpen = false;
							averageOrNot = averageOrNotType.AvgPerMap;
						}}>{m.table_average_per_map()}</DropdownItem
					>
					<DropdownItem
						on:click={() => {
							averageDropdownOpen = false;
							averageOrNot = averageOrNotType.AvgPer10Min;
						}}>{m.table_average_per_10min()}</DropdownItem
					>
				</Dropdown>
			{:else}
				<ButtonGroup class="m-4 ml-0">
					<Button
						color={isAverageButtonActive(averageOrNotType.TotalValues) ? 'blue' : 'light'}
						class="mr-0 w-40 whitespace-nowrap py-3"
						on:click={() => (averageOrNot = averageOrNotType.TotalValues)}
						>{m.table_total_values()}</Button
					>
					<Button
						color={isAverageButtonActive(averageOrNotType.AvgPerMap) ? 'blue' : 'light'}
						class="m-0 w-40 whitespace-nowrap py-3"
						on:click={() => (averageOrNot = averageOrNotType.AvgPerMap)}
						>{m.table_average_per_map()}</Button
					><!-- ms-2  -->
					<Button
						color={isAverageButtonActive(averageOrNotType.AvgPer10Min) ? 'blue' : 'light'}
						class="ml-0 w-40 whitespace-nowrap py-3"
						on:click={() => (averageOrNot = averageOrNotType.AvgPer10Min)}
						>{m.table_average_per_10min()}</Button
					></ButtonGroup
				>
			{/if}
		</MediaQuery>
		<Toggle class="my-4 w-fit cursor-pointer" bind:checked={showSummedEntry}
			>Show totalled values</Toggle
		>
		<Toggle class="mb-4 w-fit cursor-pointer" bind:checked={showAverageEntry}
			>Show average player / team</Toggle
		>
		<Toggle
			class="mb-4 w-fit cursor-pointer"
			bind:checked={showTeamStats}
			disabled={!showTeamStatsEnabled}
			><span class={!showTeamStatsEnabled ? 'text-gray-400 dark:text-gray-500' : ''}
				>Show team stats</span
			></Toggle
		>
	</div>
	<div class="mb-4 max-w-80 whitespace-nowrap">
		start date
		<div class="relative inline">
			<div class="pointer-events-none absolute inset-y-0 start-0 z-40 flex items-center ps-3.5">
				<svg
					class="h-4 w-4 text-gray-500 dark:text-gray-400"
					aria-hidden="true"
					xmlns="http://www.w3.org/2000/svg"
					fill="currentColor"
					viewBox="0 0 20 20"
				>
					<path
						d="M20 4a2 2 0 0 0-2-2h-2V1a1 1 0 0 0-2 0v1h-3V1a1 1 0 0 0-2 0v1H6V1a1 1 0 0 0-2 0v1H2a2 2 0 0 0-2 2v2h20V4ZM0 18a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8H0v10Zm5-8h10a1 1 0 0 1 0 2H5a1 1 0 0 1 0-2Z"
					/>
				</svg>
			</div>
			<DateInput
				timePrecision={null}
				dynamicPositioning
				format="dd.MM.yyyy"
				class="z-30 inline-block"
				id="startDate"
				bind:value={startDate}
			/>
		</div>
		end date
		<div class="relative inline">
			<div class="pointer-events-none absolute inset-y-0 start-0 z-40 flex items-center ps-3.5">
				<svg
					class="h-4 w-4 text-gray-500 dark:text-gray-400"
					aria-hidden="true"
					xmlns="http://www.w3.org/2000/svg"
					fill="currentColor"
					viewBox="0 0 20 20"
				>
					<path
						d="M20 4a2 2 0 0 0-2-2h-2V1a1 1 0 0 0-2 0v1h-3V1a1 1 0 0 0-2 0v1H6V1a1 1 0 0 0-2 0v1H2a2 2 0 0 0-2 2v2h20V4ZM0 18a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8H0v10Zm5-8h10a1 1 0 0 1 0 2H5a1 1 0 0 1 0-2Z"
					/>
				</svg>
			</div>
			<DateInput
				timePrecision={null}
				dynamicPositioning={true}
				format="dd.MM.yyyy"
				class="date-picker z-30 inline-block"
				id="endDate"
				bind:value={endDate}
			/>
		</div>
	</div>
	<!--<Datepicker range />-->

	<div class="w-100 flex">
		<div class="flex-end w-80">
			<Search bind:value={searchTerm} placeholder={m.table_search_placeholder_login_nickname()} />
		</div>
	</div>
	{#if Object.values($showedCategoriesPlayerStats).every((v) => v === false)}
		<Alert color="red" class="m-4">
			<span class="font-medium">No categories!</span>
			Please select at least 1 category!
		</Alert>
	{:else}
		<Table class="w-6xl mt-2" hoverable={false} striped={true}>
			<caption
				class="bg-white py-5 text-left text-lg font-semibold text-gray-900 dark:bg-gray-800 dark:text-white"
			>
				{selectedEvent !== 'all' && selectedEvent !== 'public'
					? prettifySelectedEvent(selectedEvent)
					: selectedEvent === 'all'
						? m.events_all()
						: m.events_public()}
				<p class="mt-1 text-sm font-normal text-gray-500 dark:text-gray-400">
					{#if dataHasLoaded === true}
						{m.player_statistics_table_caption({
							selectedEvent:
								selectedEvent !== 'all' && selectedEvent !== 'public'
									? prettifySelectedEvent(selectedEvent)
									: selectedEvent === 'all'
										? m.events_all()
										: m.events_public(),
							amountPlayers: (data.playerList ?? []).length,
							amountMaps: Math.ceil(
								(data.playerList ?? []).reduce(
									(partialSum, playerItem) => partialSum + parseInt(playerItem.maps_played),
									0
								) / 6
							)
						})}
					{:else}
						<div
							class="h-2 w-1/2 animate-pulse rounded rounded-full border bg-gray-300 dark:border-slate-600 dark:bg-gray-500"
						></div>
					{/if}
				</p>
			</caption>
			<!-- class="sticky-table-wrapper" -->
			<div>
				<TableHead class="cursor-pointer ">
					<TableHeadCell class="sticky top-0  bg-sky-400 text-white dark:bg-sky-800 "
						>#</TableHeadCell
					>
					{#each Object.keys($showedCategoriesPlayerStats) as category, i (category)}
						{#if $showedCategoriesPlayerStats[category] === true}
							<TableHeadCell
								class="sticky top-0 bg-sky-400 text-white dark:bg-sky-800 {category === 'nickname'
									? 'left-0 top-0 z-20 '
									: 'z-10'} {!categoriesLeftAligned.includes(category) ? 'text-right' : ''}"
								on:click={() => {
									sortTable(category);
								}}
							>
								{#if sortKey == category && sortDirection == -1}
									{prettifySelectedEvent(category)}<span class="ml-1">{sortArrowDownCharacter}</span
									>
								{:else if sortKey == category && sortDirection == 1}
									{prettifySelectedEvent(category)}<span class="ml-1">{sortArrowUpCharacter}</span>
								{:else}
									{prettifySelectedEvent(category)}
								{/if}
							</TableHeadCell>
						{/if}
					{/each}
				</TableHead>
				{#if dataHasLoaded === false}
					<TableBody tableBodyClass="divide-y">
						{#each Array(9) as i9}
							<TableBodyRow>
								<TableBodyCell class="w-0 pr-0 italic"
									><div
										class="h-2.5 w-6 animate-pulse rounded rounded-full border bg-gray-300 dark:border-slate-600 dark:bg-gray-500"
									></div></TableBodyCell
								>
								{#each Object.keys($showedCategoriesPlayerStats) as category, i (category)}
									{#if $showedCategoriesPlayerStats[category] === true}
										<TableBodyCell class="w-0 pr-0 italic"
											><div
												class="h-2 {category === 'nickname'
													? 'w-48'
													: 'w-12'} animate-pulse rounded rounded-full border bg-gray-300 dark:border-slate-600 dark:bg-gray-500"
											></div></TableBodyCell
										>
									{/if}
								{/each}
							</TableBodyRow>
						{/each}
					</TableBody>
				{:else}
					<TableBody tableBodyClass="divide-y">
						{#each summedAndAverageEntriesShownArray.concat(filteredAndSortedItems) ?? [] as item, index (item.login)}
							<TableBodyRow>
								<TableBodyCell class="w-0 pr-0 italic"
									>{#if !['total-values', 'average-player', 'average-team'].includes(item.login)}
										{index +
											$limitForTable * activePage +
											1 -
											summedAndAverageEntriesShownArray.length}{/if}</TableBodyCell
								>
								{#each Object.keys($showedCategoriesPlayerStats) as category, i (category)}
									{#if $showedCategoriesPlayerStats[category] === true}
										{#if category == 'nickname' && !['total-values', 'average-player', 'average-team'].includes(item.login)}
											<!-- dark:hover:!bg-gray-60 hover:!bg-gray-50	hover:bg-slate-100	dark:hover:bg-slate-600-->
											<!-- hover:bg-slate-100 dark:bg-gray-800 hover:dark:bg-slate-600 [&:not(:hover)]:bg-white  [&:not(:hover)]:dark:bg-gray-800" -->
											<TableBodyCell
												class="sticky left-0 z-10 {showTeamStats
													? 'w-96 max-w-96'
													: 'w-48 max-w-48'} {index % 2 === 0
													? 'bg-white dark:bg-gray-800'
													: 'bg-gray-50 dark:bg-gray-700'}"
											>
												<!-- direction: rtl; text-ellipsis -->
												<a href="/profile/{item.login}" id={'cell-login-' + index.toString()}>
													<div
														class=" {showTeamStats
															? 'max-w-96'
															: 'max-w-48'} overflow-hidden text-ellipsis"
													>
														{@html colorParserToHtml(item[category])}
													</div>
												</a>
												<Popover
													class="ml-4 text-sm font-light"
													title="login: {item.login}"
													placement="right"
													triggeredBy={'#cell-login-' + index.toString()}
													>{@html colorParserToHtml(item[category])}</Popover
												>
												<!--<Tooltip
													placement="right"
													class=""
													triggeredBy={'#cell-login-' + index.toString()}
													>login: <span class="italic">{item.login}</span></Tooltip
											>-->
											</TableBodyCell>
										{:else if category === 'maps_won'}
											<TableBodyCell class="text-right">
												<!--{Number.parseFloat(entry).toFixed(2) + trailingSymbol(category)}-->
												{formatCellByCategory(item['maps_won'], category)}/{formatCellByCategory(
													item['maps_played'],
													category
												)}
											</TableBodyCell>
										{:else}
											<TableBodyCell
												class={!categoriesLeftAligned.includes(category) ? 'text-right' : ''}
											>
												<!--{Number.parseFloat(entry).toFixed(2) + trailingSymbol(category)}-->
												{formatCellByCategory(item[category], category)}
											</TableBodyCell>
										{/if}
									{/if}
								{/each}
							</TableBodyRow>
						{/each}
					</TableBody>
				{/if}
			</div></Table
		>
		<div class="item-center flex">
			<div class="{amountOfPages > 1 ? 'absolute' : ''} mr-4 inline">
				<Button color="light" class="mr-2 mt-4"
					>{$limitForTable}<ChevronDownOutline
						class="text-dark dark:text-dark ms-2 h-6 w-6"
					/></Button
				>
				<Dropdown>
					<DropdownItem on:click={() => ($limitForTable = 10)}>10</DropdownItem>
					<DropdownItem on:click={() => ($limitForTable = 30)}>30</DropdownItem>
					<DropdownItem on:click={() => ($limitForTable = 50)}>50</DropdownItem>
					<DropdownItem on:click={() => ($limitForTable = 100)}>100</DropdownItem>
					<DropdownItem on:click={() => ($limitForTable = 500)}>500</DropdownItem>
					<DropdownItem on:click={() => ($limitForTable = 1000)}>1000</DropdownItem>
				</Dropdown>
				<MediaQuery query="(max-width: 600px)" let:matches>
					{#if matches}
						{m.table_max_rows()}
					{:else}
						{m.table_entries_per_page()}
					{/if}
				</MediaQuery>
			</div>

			{#if amountOfPages > 1}
				<!--<Pagination
			We are not using <Pagination /> because it only works with href and not with on:click
			so we use the code from the official Flowbite documentation
		/>-->
				<div class="w-50 mt-5 flex-1 justify-center pt-0.5 text-center" style="max-width: 100svw">
					<MediaQuery query="(max-width: 50rem)" let:matches>
						{#if matches}
							<div class="h-8"></div>
							<br />
						{/if}
					</MediaQuery>
					<ul class="inline-flex -space-x-px text-sm">
						<li>
							<button
								on:click={() => setPage(activePage - 1)}
								class="ms-0 flex h-8 items-center justify-center rounded-s-lg border border-e-0 border-gray-300 bg-white px-3 leading-tight text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
								>{m.table_previous()}</button
							>
						</li>
						{#each visiblePaginationPages as i}
							<li>
								<button
									on:click={() => setPage(i)}
									class="{activePage === i
										? 'font-bold underline '
										: ''}flex h-8 items-center justify-center border border-gray-300 bg-white px-3 leading-tight text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
								>
									{i + 1}
								</button>
							</li>
						{/each}
						<li>
							<button
								on:click={() => setPage(activePage + 1)}
								class="flex h-8 items-center justify-center rounded-e-lg border border-gray-300 bg-white px-3 leading-tight text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
							>
								{m.table_next()}
							</button>
						</li>
					</ul>
				</div>
			{/if}
		</div>
	{/if}
</div>

<style>
	/*.sticky-table-wrapper {
		max-height: 80svh;
		max-width: 100svw;
	}*/
	:global(div[role='tooltip']) {
		z-index: 100 !important;
	}
</style>
