import { redirect } from '@sveltejs/kit';

export async function load({ params, locals }) {
	// if the page is /profile and [login] is empty, use the username of the signed in user
	// or kick him out if he is not signed in
	if (params.login === undefined) {
		const session = await locals.auth();
		if (!session?.user)
			throw redirect(303, '/auth/signin'); // redirect to signin page
		else params.login = session.profile.login;
	}

	// TODO: check in the database if the player exists and if not show some <Alert>

	return {
		post: {
			login: params.login,
			title: `Example content`,
			content: ['array full of info']
		}
	};
}
