<script>
	import { Skeleton, ImagePlaceholder, TextPlaceholder } from 'flowbite-svelte';
	import colorParserToHtml from '$lib/color_parser';
</script>

<div>
	Welcome to speedball {@html colorParserToHtml('$z$F00our honored visitor $f00ツ')}
</div>
<div style="height:400px;" class="overflow-scroll pb-16">
	<Skeleton class="mb-8 mt-16" />
	<ImagePlaceholder class="my-8" />
	<TextPlaceholder class="my-8" />
</div>
