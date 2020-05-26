import fetch from 'node-fetch';
import { oauthRedditUrl } from '../../../consts';
import { AuthHeaders } from '../auth-headers';
import { RedditFeed } from '../reddit-types';

export async function listBest(after: string|null, token: string, username?: string): Promise<RedditFeed>
{
	return await
	(
		await fetch
		(
			`${oauthRedditUrl}/best${
				(after != null)
					? `?after=${after}`
					: ''
			}`,
			{
				headers: new AuthHeaders(token, {}, username)
			},
		)
	).json();
}