import fetch, { Response, Body, Request } from 'node-fetch';
import { AuthHeaders } from '../auth-headers';
import { oauthRedditUrl } from '../../../consts';

export enum RedditVoteType
{
	up = 1,
	none = 0,
	down = -1,
}

export async function vote(post: string, type: RedditVoteType, token: string, username?: string): Promise<boolean>
{
	const res: Response = await fetch
	(
		`${oauthRedditUrl}/api/vote`,
		{
			method: 'POST',
			body: `id=${post}&dir=${type}`,
			headers: new AuthHeaders
			(
				token,
				{
					'Content-Type': 'application/x-www-form-urlencoded'
				},
				username
			)
		}
	);
	if (!res.ok) console.log(res);
	return res.ok;
}