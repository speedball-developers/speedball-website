// file initialized by the Paraglide-SvelteKit CLI - Feel free to edit it
import { createI18n } from '@inlang/paraglide-sveltekit';
import * as runtime from '$lib/paraglide/runtime.js';

// makse / path without locale ambigious
export const i18n = createI18n(runtime, {
	prefixDefaultLanguage: 'always',
	exclude: [
		'/api',
		/^\/api.*$/,
		'/auth/',
		/^\/auth.*$/,
		'/signin',
		'/signout'
		/*,'/auth/signout',
		'/auth/signin',
		'/auth/signin/maniaplanet',
		'/auth/callback/maniaplanet'*/
	]
});
