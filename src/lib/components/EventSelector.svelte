<script lang="ts">
	import { Button, Dropdown, DropdownDivider, DropdownItem } from 'flowbite-svelte';
	import { ChevronDownOutline, ChevronRightOutline } from 'flowbite-svelte-icons';
	import * as m from '$msgs';
	export let selectedEvent = '';
	export let eventList;
	export let baseUrl = undefined;
	export let loadFunction: Function | undefined = undefined;
	export let showAllAndPublic = false;
	let dropdownHoveredActive = '';
	let eventDropdownOpen = false;

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

	const changeSelectedEvent = (newEvent: string) => {
		eventDropdownOpen = false;
		if (loadFunction !== undefined) loadFunction(newEvent);
		return undefined;
	};
</script>

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
	{#if showAllAndPublic === true}
		<DropdownItem
			href={baseUrl !== undefined ? baseUrl + '/all' : undefined}
			on:click={loadFunction !== undefined ? changeSelectedEvent('all') : undefined}
			>{m.events_all()}</DropdownItem
		>
		<DropdownItem
			href={baseUrl !== undefined ? baseUrl + '/public' : undefined}
			on:click={loadFunction !== undefined ? changeSelectedEvent('public') : undefined}
			>{m.events_public()}</DropdownItem
		>
		<DropdownDivider />
	{/if}
	{#each Object.entries(eventList) as [event_name, events_array], index}
		<li>
			<!-- svelte-ignore a11y-mouse-events-have-key-events -->
			<button
				id="doubleDropdownButton-{index}"
				data-dropdown-toggle="doubleDropdown-{index}"
				data-dropdown-placement="right-start"
				on:mouseover={() => {
					dropdownHoveredActive = 'doubleDropdown-' + index.toString();
				}}
				on:mouseleave={() => {
					dropdownHoveredActive = '';
				}}
				type="button"
				class="flex w-44 items-center justify-between px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
				>{prettifySelectedEvent(event_name)}<ChevronRightOutline
					class="ms-2 h-6 w-6 text-primary-700 dark:text-white"
				/></button
			>
			<!-- svelte-ignore a11y-no-static-element-interactions -->
			<!-- svelte-ignore a11y-mouse-events-have-key-events -->
			<div
				on:mouseover={() => {
					dropdownHoveredActive = 'doubleDropdown-' + index.toString();
				}}
				class="{dropdownHoveredActive === 'doubleDropdown-' + index.toString()
					? 'visible'
					: 'hidden'} absolute left-44 -mt-12"
			>
				<div
					id="doubleDropdown-{index}"
					class="z-10 ml-1 w-fit cursor-pointer divide-y divide-gray-100 whitespace-nowrap rounded-lg bg-white shadow dark:bg-gray-700"
				>
					<ul
						class="max-h-96 overflow-y-auto py-2 text-left text-sm text-gray-700 dark:text-gray-200"
						aria-labelledby="doubleDropdownButton"
					>
						{#if showAllAndPublic === true}
							<li>
								<a
									href={baseUrl !== undefined
										? baseUrl + '/' + event_name + '-' + 'all'
										: undefined}
									on:click={loadFunction !== undefined
										? changeSelectedEvent(event_name + '-' + 'all')
										: undefined}
									class="block w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
									>{m.events_all()}</a
								>
							</li>
							<DropdownDivider />
						{/if}

						{#each events_array as event}
							<li>
								<a
									href={baseUrl !== undefined
										? baseUrl + '/' + event_name + '-' + event.event_number
										: undefined}
									on:click={loadFunction !== undefined
										? changeSelectedEvent(event_name + '-' + event.event_number)
										: undefined}
									class="block w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
									>{prettifySelectedEvent(event_name) + ' ' + event.event_number}</a
								>
							</li>
						{/each}
					</ul>
				</div>
			</div>
		</li>
		<!-- version were onclick triggers the 2nd dropdown menu instead of onhover -->
		<!--<DropdownItem class="flex items-center justify-between">
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
    </Dropdown>-->
	{/each}
</Dropdown>
