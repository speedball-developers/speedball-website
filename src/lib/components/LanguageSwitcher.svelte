<script lang="ts">
	import { i18n } from '$lib/i18n';
	import { setLanguageTag, languageTag, availableLanguageTags } from '$paraglide/runtime.js';
	import { Button, Dropdown, DropdownItem } from 'flowbite-svelte';
	import { ChevronDownOutline } from 'flowbite-svelte-icons';
	import { page } from '$app/stores';

	$: currentPathWithoutLanguage = i18n.route($page.url.pathname);
</script>

<Button class="w-18 mr-4 pr-3" color="light"
	>{languageTag().toLocaleUpperCase()}<ChevronDownOutline
		class=" h-6 w-6 text-white invert dark:text-white"
	/></Button
>
<Dropdown class="w-18">
	{#each availableLanguageTags as lang}
		<a href={currentPathWithoutLanguage} hreflang={lang}
			><DropdownItem class="w-18 {lang === languageTag() ? 'font-bold' : ''}"
				>{lang.toLocaleUpperCase()}</DropdownItem
			></a
		><br />
	{/each}
	<!--<DropdownItem on:click={() => changeLocale('fr')}>FR</DropdownItem>-->
</Dropdown>
