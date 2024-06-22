<script lang="ts">
	import { ParaglideJS } from '@inlang/paraglide-sveltekit';
	import { i18n } from '$lib/i18n';
	import '../app.css';
	import NavBar from '$components/MyNavbar.svelte';
	import MyFooter from '$components/MyFooter.svelte';
</script>

<ParaglideJS {i18n}>
	<NavBar />
	<div style="flex: 1;" class="page-content mx-auto mt-4 px-4">
		<slot></slot>
	</div>
	<MyFooter />
</ParaglideJS>

<style>
	.page-content {
		/* 80rem is best practice. Because of px-4 the page has a padding of 1+1 so we give the site 82 width.  */
		width: 82rem;
		max-width: 100vw;
	}
</style>
