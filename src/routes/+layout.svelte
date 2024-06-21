<script lang="ts">
	import { ParaglideJS } from '@inlang/paraglide-sveltekit';
	import { i18n } from '$lib/i18n';
	import { setLanguageTag, languageTag, availableLanguageTags } from '$paraglide/runtime.js';
	// import { lang } from '$lib/lang';
	import * as m from '$msgs';
	import '../app.css';
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
	import logo from '$lib/images/SpeedBall_LogoNoText.png';
	import headerImage from '$lib/images/PackImage.jpg';
	import paypalLogo from '$lib/images/PayPalLogo.svg';
	import MediaQuery from 'svelte-media-queries';
	import { SignIn, SignOut } from '@auth/sveltekit/components';
	import { page } from '$app/stores';
	import { signIn, signOut } from '@auth/sveltekit/client';

	import {
		Footer,
		FooterCopyright,
		FooterIcon,
		FooterLink,
		FooterLinkGroup
	} from 'flowbite-svelte';
	import { YoutubeSolid, GithubSolid, DiscordSolid, TwitterSolid } from 'flowbite-svelte-icons';
	import LanguageSwitcher from '$components/LanguageSwitcher.svelte';
	import colorParserToHtml from '$lib/color_parser';
</script>

<ParaglideJS {i18n}>
	<!-- -mx.2 -mt-2.5 mb-2.5 -->
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
				{(console.log($page.data.session), '')}
				<div class="flex items-center">
					<Avatar id="profileAvatar" class="cursor-pointer align-middle"
						>{$page.data.session?.profile?.login.slice(0, 2).toUpperCase()}</Avatar
					>
				</div>
				<Dropdown triggeredBy="#profileAvatar">
					<DropdownHeader>
						<span class="block text-sm italic">{$page.data.session?.profile?.login}</span>
						<span class="block truncate text-sm font-medium"
							>{@html colorParserToHtml($page.data.session?.profile?.nickname ?? '')}</span
						>
					</DropdownHeader><a href="/profile/{$page.data.session?.profile?.login}">
						<DropdownItem>Profile</DropdownItem></a
					>
					<a href="/profile/{$page.data.session?.profile?.login}#settings"
						><DropdownItem>Settings</DropdownItem></a
					>
					<DropdownDivider />
					<DropdownItem>
						<!-- data-no-translate -->
						<button on:click={() => signOut()}>Sign out</button></DropdownItem
					>
				</Dropdown>
			{:else}
				<Button outline size="sm" on:click={() => signIn('maniaplanet')}>
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
			<NavLi href="/player_stats/latest">{m.navigation_playerstats()}</NavLi>
			<NavLi href="/funcups">{m.navigaton_matches()}</NavLi>
			<NavLi href="/history">{m.navigaton_events()}</NavLi>
			<NavLi href="/league">{m.navigaton_maps()}</NavLi>
		</NavUl>
	</Navbar>

	<div style="flex: 1;" class="page-content mx-auto mt-4 px-4">
		<slot></slot>
	</div>

	<Footer footerType="socialmedia" class="w-full">
		<hr class="my-6 border-gray-200 dark:border-gray-700 sm:mx-auto lg:my-8" />
		<div class="sm:flex sm:items-center sm:justify-between">
			<FooterCopyright href="/" by="Speedball" />
			<div class="mt-4 flex flex-wrap space-x-6 sm:mt-0 sm:justify-center rtl:space-x-reverse">
				<FooterLinkGroup
					ulClass="flex flex-wrap items-center mb-6 text-sm text-gray-500 sm:mb-0 dark:text-gray-400 mr-6"
				>
					<FooterLink href="/">{m.navigation_privacy_policy()}</FooterLink>
					<FooterLink href="/">{m.navigation_credits()}</FooterLink>
				</FooterLinkGroup>
				<div class="!ml-0 flex space-x-6 sm:mt-0 sm:justify-center rtl:space-x-reverse">
					<FooterIcon href="https://www.youtube.com/watch?v=BNSCQ30Y8CU">
						<YoutubeSolid
							class="h-5 w-5 text-gray-500 hover:text-gray-900 dark:text-gray-500 dark:hover:text-white"
						/>
					</FooterIcon>
					<FooterIcon href="https://discord.gg/V2WrGHK">
						<DiscordSolid
							class="h-5 w-5 text-gray-500 hover:text-gray-900 dark:text-gray-500 dark:hover:text-white"
						/>
					</FooterIcon>
					<FooterIcon href="https://www.paypal.me/TheDmark">
						<img
							src={paypalLogo}
							class="pt-0.5 opacity-80 grayscale dark:opacity-50 dark:invert"
							id="paypalLogo"
							alt="paypal logo"
						/>
					</FooterIcon>
					<FooterIcon href="https://twitter.com/ShootmaniaS">
						<TwitterSolid
							class="h-5 w-5 text-gray-500 hover:text-gray-900 dark:text-gray-500 dark:hover:text-white"
						/>
					</FooterIcon>
					<FooterIcon href="/">
						<GithubSolid
							class="h-5 w-5 text-gray-500 hover:text-gray-900 dark:text-gray-500 dark:hover:text-white"
						/>
					</FooterIcon>
				</div>
			</div>
		</div>
	</Footer>
</ParaglideJS>

<style>
	.page-content {
		width: 80rem;
		max-width: 100vw;
	}

	:global(.myNavBarImageFix) {
		/* margin-top: 10.625rem; /*  pt-42.5  0.25rem*42.5 */
		margin-top: 8rem; /*  pt-42.5  0.25rem*42.5 */
	}
</style>
