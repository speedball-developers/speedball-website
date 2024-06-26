<script>
	import { Button } from 'flowbite-svelte';

	export let data;
	// console.log(data);
	let showHiddenText = false;
</script>

hi {data?.post?.login}
<Button on:click={() => (showHiddenText = !showHiddenText)}>I am a button</Button>
{#if showHiddenText}
	You clicked the button
{/if}
