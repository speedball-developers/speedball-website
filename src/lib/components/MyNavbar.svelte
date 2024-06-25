<script lang="ts">
	import { i18n } from '$lib/i18n';
	// import { lang } from '$lib/lang';
	import * as m from '$msgs';
	import {
		Navbar,
		NavBrand,
		NavLi,
		NavUl,
		NavHamburger,
		Button,
		DarkMode,
		Avatar,
		Dropdown,
		DropdownHeader,
		DropdownItem,
		DropdownDivider
	} from 'flowbite-svelte';
	import logo from '$lib/images/SpeedBall_LogoNoText.webp';
	import headerImage from '$lib/images/PackImage.webp';
	import MediaQuery from 'svelte-media-queries';
	import { page } from '$app/stores';
	import { signIn, signOut } from '@auth/sveltekit/client';
	import LanguageSwitcher from '$components/LanguageSwitcher.svelte';
	import colorParserToHtml from '$lib/color_parser';
</script>

<img
	src={headerImage}
	class="absolute start-0 top-0 z-30 h-40 w-screen object-cover object-center"
	alt="SpeedBall Logo"
/><br />
<Navbar
	class="myNavBarImageFix border-gray sticky top-0 z-50 w-full border-b-2 bg-white px-2 py-2.5 dark:border-0 sm:px-4"
>
	<NavBrand href="/">
		<img src={logo} class="h-6 sm:h-9" alt="SpeedBall Logo" />

		<MediaQuery query="(min-width: 500px)" let:matches>
			{#if matches}
				<span class="self-center whitespace-nowrap text-xl font-semibold dark:text-white"
					>&nbsp;SpeedBall</span
				>
			{/if}
		</MediaQuery>
	</NavBrand>
	<div class="flex md:order-2">
		<DarkMode class="mr-4 mt-1" />
		<LanguageSwitcher />
		{#if $page.data.session}
			<div class="flex items-center">
				<Avatar id="profileAvatar" class="cursor-pointer align-middle"
					>{$page.data.session?.profile?.login.slice(0, 2).toUpperCase()}</Avatar
				>
			</div>
			<Dropdown triggeredBy="#profileAvatar">
				<DropdownHeader>
					<span class="block truncate text-sm font-medium"
						>{@html colorParserToHtml($page.data.session?.profile?.nickname ?? '')}</span
					>
					<span class="block text-sm italic">{$page.data.session?.profile?.login}</span>
				</DropdownHeader><a href="/profile/{$page.data.session?.profile?.login}">
					<DropdownItem>Profile</DropdownItem></a
				>
				<a href="/profile/{$page.data.session?.profile?.login}#settings"
					><DropdownItem>Settings</DropdownItem></a
				>
				<DropdownDivider />
				<DropdownItem>
					<!-- data-no-translate -->
					<button on:click={() => signOut({ callbackUrl: '/' })}>Sign out</button></DropdownItem
				>
			</Dropdown>
		{:else}
			<Button
				outline
				size="sm"
				on:click={() => signIn('maniaplanet', { callbackUrl: '/profile/' })}
			>
				<MediaQuery query="(max-width: 1024px)" let:matches>
					{#if matches}
						{m.navigation_login()}
					{:else}
						{m.navigation_login_with_maniaplanet()}
					{/if}
				</MediaQuery>
			</Button>
		{/if}

		<NavHamburger />
	</div>
	<NavUl
		activeUrl={i18n.route($page.url.pathname)}
		activeClass="dark:text-white text-black font-bold"
		class="order-1"
	>
		<NavLi href="/">{m.navigation_home()}</NavLi>
		<NavLi href="/player_stats/all">{m.navigation_playerstats()}</NavLi>
		<NavLi href="/matches">{m.navigaton_matches()}</NavLi>
		<NavLi href="/events">{m.navigaton_events()}</NavLi>
		<NavLi href="/maps">{m.navigaton_maps()}</NavLi>
	</NavUl>
</Navbar>

<style>
	:global(.myNavBarImageFix) {
		/* margin-top: 10.625rem; /*  pt-42.5  0.25rem*42.5 */
		margin-top: 8rem; /*  pt-42.5  0.25rem*42.5 */
	}
</style>
