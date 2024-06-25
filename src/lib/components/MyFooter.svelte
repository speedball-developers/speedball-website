<script lang="ts">
	import * as m from '$msgs';
	import paypalLogo from '$lib/images/PayPalLogo.svg';
	import twitchLogo from '$lib/images/twitch-logo.svg';

	import {
		Footer,
		FooterCopyright,
		FooterIcon,
		FooterLink,
		FooterLinkGroup
	} from 'flowbite-svelte';
	import { YoutubeSolid, GithubSolid, DiscordSolid, TwitterSolid } from 'flowbite-svelte-icons';
</script>

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
						class="pt-0.5 opacity-80 grayscale hover:opacity-100 dark:opacity-50 dark:invert dark:hover:opacity-100"
						id="paypalLogo"
						alt="paypal logo"
					/>
				</FooterIcon>
				<FooterIcon href="https://www.twitch.tv/speedballtv">
					<img
						src={twitchLogo}
						class="h-4 pt-0.5 opacity-60 grayscale hover:opacity-100 dark:opacity-40 dark:invert dark:hover:opacity-100"
						id="twitchLogo"
						alt="twitch logo"
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
