// file initialized by the Paraglide-SvelteKit CLI - Feel free to edit it
import { sequence } from '@sveltejs/kit/hooks';
import { i18n } from '$lib/i18n';
import { handle as authHandle, authorizationAdminURLHandle } from './auth';

export const handle = sequence(authHandle, authorizationAdminURLHandle, i18n.handle());
