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
	import NavBar from '$components/MyNavbar.svelte';
</script>

<ParaglideJS {i18n}>
	<!-- -mx.2 -mt-2.5 mb-2.5 -->
	<NavBar />

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
</style>
