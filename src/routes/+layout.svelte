<script lang="ts">
	import { ParaglideJS } from '@inlang/paraglide-sveltekit';
	import { i18n } from '$lib/i18n';
	import { setLanguageTag, languageTag, availableLanguageTags } from '$paraglide/runtime.js';
	// import { lang } from '$lib/lang';
	import * as m from '$msgs';
	import '../app.css';
	import { Navbar, NavBrand, NavLi, NavUl, NavHamburger, Button, DarkMode } from 'flowbite-svelte';
	import logo from '$lib/images/SpeedBall_LogoNoText.png';
	import headerImage from '$lib/images/PackImage.jpg';
	import paypalLogo from '$lib/images/PayPalLogo.svg';
	import MediaQuery from 'svelte-media-queries';

	import {
		Footer,
		FooterCopyright,
		FooterIcon,
		FooterLink,
		FooterLinkGroup
	} from 'flowbite-svelte';
	import { YoutubeSolid, GithubSolid, DiscordSolid, TwitterSolid } from 'flowbite-svelte-icons';
	import LanguageSwitcher from '$components/LanguageSwitcher.svelte';
</script>

<ParaglideJS {i18n}>
	<!-- -mx.2 -mt-2.5 mb-2.5 -->
	<img
		src={headerImage}
		class="absolute start-0 top-0 z-30 h-40 w-screen object-cover object-center"
		alt="Speedball Logo"
	/><br />
	<Navbar class="myNavBarImageFix sticky top-0 z-50 w-full border-b px-2 py-2.5 sm:px-4">
		<NavBrand href="/">
			<img src={logo} class="h-6 sm:h-9" alt="Speedball Logo" />
			<span class="self-center whitespace-nowrap text-xl font-semibold dark:text-white"
				>&nbsp;Speedball</span
			>
		</NavBrand>
		<div class="flex md:order-2">
			<DarkMode class="mr-4" />
			<LanguageSwitcher />
			<Button outline size="sm">
				<MediaQuery query="(max-width: 1024px)" let:matches>
					{#if matches}
						Login
					{:else}
						Login via Maniaplanet
					{/if}
				</MediaQuery>
			</Button>
			<NavHamburger />
		</div>
		<NavUl class="order-1">
			<NavLi href="/" active={true}>{m.navigation_home()}</NavLi>
			<NavLi href="/player_stats/latest">{m.navigation_playerstats()}</NavLi>
			<NavLi href="/funcups">{m.navigaton_matches()}</NavLi>
			<NavLi href="/history">{m.navigaton_events()}</NavLi>
			<NavLi href="/league">{m.navigaton_maps()}</NavLi>
		</NavUl>
	</Navbar>

	<slot></slot>

	<Footer footerType="socialmedia">
		<hr class="my-6 border-gray-200 dark:border-gray-700 sm:mx-auto lg:my-8" />
		<div class="sm:flex sm:items-center sm:justify-between">
			<FooterCopyright href="/" by="Speedball" />
			<div class="mt-4 flex space-x-6 sm:mt-0 sm:justify-center rtl:space-x-reverse">
				<FooterLinkGroup
					ulClass="flex flex-wrap items-center mb-6 text-sm text-gray-500 sm:mb-0 dark:text-gray-400"
				>
					<FooterLink href="/">Privacy Policy</FooterLink>
					<FooterLink href="/">Credits</FooterLink>
				</FooterLinkGroup>
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
	</Footer>
</ParaglideJS>

<style>
	:global(.myNavBarImageFix) {
		/* margin-top: 10.625rem; /*  pt-42.5  0.25rem*42.5 */
		margin-top: 8rem; /*  pt-42.5  0.25rem*42.5 */
	}
</style>
