import fetch, { Response } from 'node-fetch';
import { AuthHeaders } from '../auth-headers';
import { oauthRedditUrl } from '../../../consts';

export async function save(link: string, save: boolean, token: string, username?: string): Promise<boolean>
{
	const res: Response = await fetch
	(
		(save)
			? `${oauthRedditUrl}/api/save`
			: `${oauthRedditUrl}/api/unsave`,
		{
			method: 'POST',
			body: `id=${link}`,
			headers: new AuthHeaders
			(
				token,
				{ 'Content-Type': 'application/x-www-form-urlencoded' },
				username,
			)
		}
	);
	if (!res.ok) console.log(res);
	return res.ok;
}
