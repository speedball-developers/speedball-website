<script lang="ts">
	import { page } from '$app/stores';
</script>

{#if $page.params.fullEventName === undefined}
	hello
{:else}
	hi
{/if}
