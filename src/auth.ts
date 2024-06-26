import { i18n } from '$lib/i18n';
import { SvelteKitAuth } from '@auth/sveltekit';
import { redirect } from '@sveltejs/kit';
import 'dotenv/config';
import { PUBLIC_WEBSITE_ADMINS } from '$env/static/public';
// import type { Adapter } from '@auth/adapters';

const apiURL = 'https://prod.live.maniaplanet.com';

export const { handle, signIn, signOut } = SvelteKitAuth({
	providers: [
		{
			id: 'maniaplanet',
			name: 'ManiaPlanet', // optional, used on the default login page as the button text.
			type: 'oauth',
			authorization: {
				url: apiURL + '/login/oauth2/authorize',
				params: { scope: 'basic' } // Your desired scopes
			},

			// this is a dirty workaround where we asing nickname and path to email and image to retrieve it later
			/* async profile(profile) {
				return {
					name: profile.login,
					email: profile.nickname,
					image: profile.path
				};
			},*/

			token: apiURL + '/login/oauth2/access_token',
			userinfo: apiURL + '/webservices/me',
			clientId: process.env.MANIAPLANET_ID, // from the provider's dashboard
			clientSecret: process.env.MANIAPLANET_SECRET // from the provider's dashboard
		}
	],

	// retrieves login, nickname & path
	// thx to https://medium.com/@shrimalmadhur/get-additional-github-user-fields-using-authjs-library-897c67388a8a
	callbacks: {
		jwt({ token, user, profile }) {
			if (user) token.user = user;
			if (profile) token.profile = profile;
			return token;
		},
		session({ session, token, user }) {
			if (session.user) session.profile = token.profile;
			return session;
		}
	},
	// debug: true,
	secret: process.env.AUTH_SECRET,
	trustHost: true
});

/*
  "profile": {
    "login": "rsty",
    "nickname": "$o$fffR$7f1S$ffftyle$z",
    "path": "World|Europe|Germany|Rheinland-Pfalz|Mainz"
  },
*/

// every route that starty with /admin or starts with /api and contains /admin will be blocked if you are not an admin
export async function authorizationAdminURLHandle({ event, resolve }) {
	const listOfAdmin = PUBLIC_WEBSITE_ADMINS.split(',');
	const currentUrl = i18n.route(event.url.pathname);
	if (currentUrl.startsWith('/admin') || currentUrl.startsWith('/api/admin')) {
		const session = await event.locals.auth();
		if (!session || !listOfAdmin.includes(session?.profile?.login)) {
			// Redirect to the signin page
			throw redirect(303, '/auth/signin');
		}
	}

	// If the request is still here, just proceed as normally
	return resolve(event);
}
