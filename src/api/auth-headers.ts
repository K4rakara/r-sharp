import { Headers } from 'node-fetch';

export class AuthHeaders extends Headers
{
	constructor(token: string, headers: { [key: string]: string; }, username?: string)
	{
		super
		(
			{
				...headers,
				'Authorization': `bearer ${token}`,
				'User-Agent': 
				`${
					(username != null)
						? `R# for Reddit -- Logged in as ${username}`
						: 'R# for Reddit -- Not logged in'
				}`
			}
		);
	}
}