<script lang="ts">
	import { i18n } from '$lib/i18n';
	import { languageTag, availableLanguageTags } from '$paraglide/runtime.js';
	import { Button, Dropdown, DropdownItem } from 'flowbite-svelte';
	import { ChevronDownOutline } from 'flowbite-svelte-icons';
	import { page } from '$app/stores';

	// currentPathWithoutLanguage = i18n.route($page.url.pathname);
</script>

<Button class="w-18 mr-4 mt-2 pr-3" color="light"
	>{languageTag()?.toLocaleUpperCase()}
	<ChevronDownOutline class=" h-6 w-6 text-white invert dark:text-white" /></Button
>
<Dropdown class="w-18">
	{#each availableLanguageTags as langTag}
		<a
			href={i18n.route($page.url.pathname)}
			hreflang={langTag}
			aria-current={langTag === languageTag() ? 'page' : undefined}
		>
			<DropdownItem class="w-18 {langTag === languageTag() ? 'font-bold' : ''}"
				><span class="">{langTag.toLocaleUpperCase()}</span></DropdownItem
			></a
		><br />
	{/each}
</Dropdown>
