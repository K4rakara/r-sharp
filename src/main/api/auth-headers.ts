import { Headers } from 'node-fetch';

export class AuthHeaders extends Headers
{
	constructor(token: string, headers: { [key: string]: string; }, username?: string)
	{
		super
		(
			{
				...headers,
				'Authorization': `Bearer ${token}`,
				'User-Agent': 
				`${
					(username != null)
						? `R# for Reddit -- Logged in as ${username}`
						: 'R# for Reddit -- Not logged in'
				}`,
				'x-internship': `I'm still in highschool, but an internship at Reddit would be awesome. See https://github.com/K4rakara.`
			}
		);
	}
}